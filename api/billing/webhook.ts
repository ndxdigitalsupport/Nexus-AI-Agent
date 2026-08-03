// Stripe webhook handler — receives payment events and updates Supabase profiles.
// Verifies the webhook signature to ensure events come from Stripe.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const config = { runtime: 'nodejs' };

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dabzjdeswxdhfcczprup.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Direct Supabase update using service-role key (bypasses RLS).
// Only called from this serverless function, never exposed to the client.
async function updateProfilePlan(userId: string, plan: string): Promise<void> {
  if (!SUPABASE_SERVICE_KEY) {
    console.warn('Webhook: SUPABASE_SERVICE_ROLE_KEY not set — cannot update profile plan.');
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
    }
  } catch (err: any) {
    console.error('Webhook: Profile update error:', err?.message || err);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook not configured.' });
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header.' });
  }

  let event: any;

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message || err);
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id
          || session.subscription_details?.metadata?.supabase_user_id;
        if (userId) {
          await updateProfilePlan(userId, 'pro');
          console.log(`Webhook: User ${userId} upgraded to PRO (checkout.session.completed)`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
          // Retrieve subscription to get user metadata
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' as any });
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.supabase_user_id;
          if (userId) {
            await updateProfilePlan(userId, 'pro');
            console.log(`Webhook: User ${userId} confirmed PRO (invoice.paid)`);
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
            console.log(`Webhook: User ${userId} downgraded to FREE (invoice.payment_failed)`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) {
          await updateProfilePlan(userId, 'free');
          console.log(`Webhook: User ${userId} downgraded to FREE (subscription deleted)`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId && subscription.status === 'active') {
          await updateProfilePlan(userId, 'pro');
          console.log(`Webhook: User ${userId} confirmed PRO (subscription updated)`);
        } else if (userId && subscription.status !== 'active') {
          await updateProfilePlan(userId, 'free');
          console.log(`Webhook: User ${userId} downgraded to FREE (subscription ${subscription.status})`);
        }
        break;
      }

      default:
        // Unhandled event type — ignore gracefully
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Webhook handler failed.' });
  }
}
