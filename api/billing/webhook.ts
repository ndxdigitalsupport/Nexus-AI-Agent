// Stripe webhook handler — receives payment events and updates Supabase profiles.
// Verifies the webhook signature to ensure events come from Stripe.
// IMPORTANT: body parsing is disabled so we get the exact raw bytes for signature verification.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const config = {
  runtime: 'nodejs',
  api: { bodyParser: false }
};

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dabzjdeswxdhfcczprup.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Read the exact raw body bytes — required for Stripe signature verification.
function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Direct Supabase update using service-role key (bypasses RLS).
async function updateProfilePlan(userId: string, plan: string): Promise<void> {
  if (!SUPABASE_SERVICE_KEY) {
    console.error('Webhook: SUPABASE_SERVICE_ROLE_KEY not set — cannot update profile plan.');
    return;
  }
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ plan })
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Webhook: Failed to update profile plan:', resp.status, text);
    } else {
      console.log(`Webhook: Successfully updated user ${userId} plan to ${plan}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Webhook: Profile update error:', msg);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Stripe webhook not configured.' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header.' });
  }

  // Read the RAW body — critical for signature verification.
  const rawBody = await getRawBody(req);
  const bodyString = rawBody.toString();

  let event: any;

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    console.log(`Webhook: Signature verified. Event type: ${event.type}, id: ${event.id}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Webhook: Signature verification FAILED:', msg);
    console.error('Webhook: Body length:', bodyString.length, 'Sig:', sig?.substring(0, 20));
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id
          || session.subscription_details?.metadata?.supabase_user_id;
        console.log(`Webhook: checkout.session.completed — userId=${userId}, customer=${session.customer}`);
        if (userId) {
          await updateProfilePlan(userId, 'pro');
        } else {
          console.warn('Webhook: checkout.session.completed — no supabase_user_id found in metadata');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        console.log(`Webhook: invoice.paid — subscription=${subscriptionId}`);
        if (subscriptionId) {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.supabase_user_id;
          if (userId) {
            await updateProfilePlan(userId, 'pro');
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.supabase_user_id;
          if (userId) {
            await updateProfilePlan(userId, 'free');
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) {
          await updateProfilePlan(userId, 'free');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId && subscription.status === 'active') {
          await updateProfilePlan(userId, 'pro');
        } else if (userId && subscription.status !== 'active') {
          await updateProfilePlan(userId, 'free');
        }
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Webhook handler error:', msg);
    return res.status(500).json({ error: msg });
  }
}
