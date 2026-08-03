// Stripe billing configuration for NEXUS PRO.
// Product + Price are auto-created on first checkout if STRIPE_PRICE_ID env var is not set.

export const BILLING_CONFIG = {
  // Checkout endpoint URL (same-origin serverless function).
  checkoutUrl: '/api/billing/checkout',

  // Customer portal endpoint URL.
  portalUrl: '/api/billing/portal',

  // Plan details (display only — actual pricing is in Stripe).
  planName: 'NEXUS PRO',
  planPrice: '$19/mo',
  planCurrency: 'SGD',
} as const;
