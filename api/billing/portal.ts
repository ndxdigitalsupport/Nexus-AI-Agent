// Creates a Stripe Customer Portal session for managing subscriptions.
// Lets users update payment method, cancel, or view invoices.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const config = { runtime: 'nodejs' };

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL || 'nexus-ai-agent-beta.vercel.app'}`
  : 'https://nexus-ai-agent-beta.vercel.app';

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

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const userId = await verifySessionToken(token);

  if (!userId) {
    return res.status(401).json({ error: 'Please sign in to manage your subscription.' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });

    // Find Stripe customer by metadata search
    const customers = await stripe.customers.search({
      query: `metadata["supabase_user_id"]:"${userId}"`,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found. Upgrade to PRO first.' });
    }

    const customerId = customers.data[0].id;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${SITE_URL}/settings`
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create portal session.';
    console.error('Portal error:', message);
    return res.status(500).json({ error: message });
  }
}
