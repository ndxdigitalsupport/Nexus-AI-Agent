// Creates a Stripe Checkout session for NEXUS PRO subscription.
// Auto-creates the Product + Price on first use if STRIPE_PRICE_ID is not set.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const config = { runtime: 'nodejs' };

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const SITE_URL = process.env.SITE_URL || 'https://nexus-ai-agent-beta.vercel.app';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dabzjdeswxdhfcczprup.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3T2sWbwkD_jZDI8CQ9QgCw_u0edN5a-';

async function verifySessionToken(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return typeof data?.id === 'string' ? data.id : null;
  } catch {
    return null;
  }
}

// Auto-create NEXUS PRO product + monthly price if not already configured.
async function getOrCreatePriceId(stripe: any): Promise<string> {
  const configured = process.env.STRIPE_PRICE_ID || '';
  if (configured) return configured;

  // Search for existing product
  const existing = await stripe.products.search({
    query: 'active:"true" AND name:"NEXUS PRO"',
    limit: 1
  });

  let productId: string;

  if (existing.data.length > 0) {
    productId = existing.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: 'NEXUS PRO',
      description: 'NEXUS PRO Tier — unlock premium AI models, 4K image generation, 1M context window, and priority execution.',
      metadata: { app: 'nexus-ai-agent' }
    });
    productId = product.id;
  }

  // Check for existing monthly price on this product
  const prices = await stripe.prices.list({ product: productId, limit: 10 });
  const monthly = prices.data.find((p: any) =>
    p.recurring?.interval === 'month' && p.currency === 'sgd'
  );

  if (monthly) return monthly.id;

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: 1900, // $19.00 in cents
    currency: 'sgd',
    recurring: { interval: 'month' },
    metadata: { app: 'nexus-ai-agent', tier: 'pro' }
  });

  return price.id;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' });
  }

  // Authenticate the user
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const userId = await verifySessionToken(token);

  if (!userId) {
    return res.status(401).json({ error: 'Please sign in to upgrade to PRO.' });
  }

  // Get user email for Stripe customer info
  const userEmail = req.body?.email || '';

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });

    // Auto-create product + price if needed
    const priceId = await getOrCreatePriceId(stripe);

    // Look for existing Stripe customer by Supabase user ID
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string;

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${SITE_URL}/settings?upgraded=true`,
      cancel_url: `${SITE_URL}/settings?upgrade_cancelled=true`,
      metadata: {
        supabase_user_id: userId
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId
        }
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session.';
    console.error('Checkout error:', message);
    return res.status(500).json({ error: message });
  }
}
