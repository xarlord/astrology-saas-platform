/**
 * Stripe configuration — mock for local development
 */
export const stripe = {
  customers: { create: async () => ({ id: 'cus_mock' }) },
  subscriptions: { create: async () => ({ id: 'sub_mock' }) },
  checkout: { sessions: { create: async () => ({ url: 'https://mock-stripe.test' }) } },
} as Record<string, unknown>;

export const STRIPE_PLANS = {
  free: { priceId: 'price_free', name: 'Free' },
  pro: { priceId: 'price_pro', name: 'Pro' },
  premium: { priceId: 'price_premium', name: 'Premium' },
};
