/**
 * Stripe Service - Wraps Stripe SDK for billing operations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Stripe from 'stripe';
import config from '../../../config';

let _stripe: any = null;

function getStripe(): any {
  if (!_stripe) {
    if (!config.stripe.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _stripe = Stripe.default(config.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }
  return _stripe;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface PortalSessionResult {
  url: string;
}

export interface PlanDefinition {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'none';
  features: string[];
  maxCharts: number;
  maxAIMonthly: number;
  highlighted?: boolean;
  priceId?: string;
}

const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'none',
    features: [
      '3 natal charts',
      'Basic personality analysis',
      'Daily horoscope',
      'Lunar calendar (limited)',
    ],
    maxCharts: 3,
    maxAIMonthly: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 25 natal charts',
      'Full personality analysis',
      'Transit forecasts',
      'Synastry reports',
      'Lunar calendar (full)',
      'Priority support',
      'Unlimited AI interpretations',
    ],
    maxCharts: 25,
    maxAIMonthly: -1,
    highlighted: true,
    priceId: config.stripe.proPriceId,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited natal charts',
      'AI-powered interpretations',
      'Solar & lunar return charts',
      'Monthly forecasts',
      'Birth chart sharing',
      'Early access to new features',
    ],
    maxCharts: -1,
    maxAIMonthly: -1,
    priceId: config.stripe.premiumPriceId,
  },
];

/**
 * Create a Stripe Checkout session for a subscription
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<CheckoutSessionResult> {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
  });

  return {
    sessionId: session.id,
    url: session.url ?? '',
  };
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<PortalSessionResult> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

/**
 * Get the plan definitions
 */
export function getPlans(): PlanDefinition[] {
  return PLANS;
}

/**
 * Map a Stripe price ID to our internal plan ID
 */
export function priceIdToPlan(priceId: string): 'pro' | 'premium' | null {
  if (priceId === config.stripe.proPriceId) return 'pro';
  if (priceId === config.stripe.premiumPriceId) return 'premium';
  return null;
}

/**
 * Verify a Stripe webhook signature and return the parsed event
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string) {
  return getStripe().webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
}

/**
 * Retrieve a Checkout session with line items
 */
export async function getCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });
}

/**
 * Retrieve a Stripe customer by email
 */
export async function getCustomerByEmail(email: string) {
  const customers = await getStripe().customers.list({ email, limit: 1 });
  return customers.data[0] ?? null;
}

export { getStripe };
