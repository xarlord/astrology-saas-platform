/**
 * Billing Controller - Handles Stripe checkout, portal, subscription, and plans
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import UserModel from '../../users/models/user.model';
import {
  createCheckoutSession,
  createPortalSession,
  getPlans,
  priceIdToPlan,
  verifyWebhookSignature,
  getCheckoutSession,
  getCustomerByEmail,
} from '../services/stripe.service';
import config from '../../../config';
import { logger } from '../../../utils/logger';
import { sendSubscriptionConfirmationEmail } from '../../../services/email.service';

/**
 * POST /api/v1/billing/checkout
 * Create a Stripe Checkout session
 */
export async function createCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { priceId, successUrl, cancelUrl } = req.body;
  if (!priceId) throw new AppError('priceId is required', 400);

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404);

  const success = successUrl || `${config.frontendUrl}/subscription?status=success`;
  const cancel = cancelUrl || `${config.frontendUrl}/subscription?status=cancel`;

  const session = await createCheckoutSession(user.id, user.email, priceId, success, cancel);

  res.status(200).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      url: session.url,
    },
  });
}

/**
 * POST /api/v1/billing/portal
 * Create a Stripe Customer Portal session
 */
export async function createPortal(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { returnUrl } = req.body;
  const returnTo = returnUrl || `${config.frontendUrl}/subscription`;

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404);

  const customer = await getCustomerByEmail(user.email);
  if (!customer) {
    throw new AppError('No Stripe customer found. Subscribe first.', 404);
  }

  const session = await createPortalSession(customer.id, returnTo);

  res.status(200).json({
    success: true,
    data: {
      url: session.url,
    },
  });
}

/**
 * GET /api/v1/billing/subscription
 * Get current user's subscription info
 */
export async function getSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({
    success: true,
    data: {
      plan: user.plan,
      status: user.subscription_status,
      currentPeriodEnd: user.subscription_renews_at ?? undefined,
      cancelAtPeriodEnd: user.subscription_status === 'canceled',
    },
  });
}

/**
 * GET /api/v1/billing/plans
 * Get available subscription plans
 */
export async function getPlanList(_req: Request, res: Response): Promise<void> {
  const plans = getPlans();

  res.status(200).json({
    success: true,
    data: plans,
  });
}

/**
 * POST /api/v1/billing/webhook
 * Handle Stripe webhook events
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    throw new AppError('Missing stripe-signature header', 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = verifyWebhookSignature(req.body, signature);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', { error: err });
    throw new AppError('Invalid signature', 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      if (!userId) {
        logger.error('Stripe webhook: checkout.session.completed missing userId metadata');
        break;
      }

      const fullSession = await getCheckoutSession(session.id);
      const priceId = fullSession.line_items?.data[0]?.price?.id;
      if (!priceId) {
        logger.error('Stripe webhook: could not determine price from checkout session', {
          sessionId: session.id,
        });
        break;
      }

      const plan = priceIdToPlan(priceId);
      if (!plan) {
        logger.error('Stripe webhook: unknown priceId', { priceId });
        break;
      }

      const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await UserModel.updatePlan(userId, plan, 'active', renewsAt);
      logger.info('User plan updated via Stripe checkout', { userId, plan });

      // Send subscription confirmation email (non-blocking)
      const subUser = await UserModel.findById(userId);
      if (subUser) {
        const planLabel = plan === 'pro' ? 'Pro' : 'Premium';
        sendSubscriptionConfirmationEmail(subUser.email, subUser.name, planLabel);
      }
      break;
    }

    case 'customer.subscription.updated': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.userId;

      if (subscription.status === 'canceled' && userId) {
        await UserModel.updatePlan(userId, 'free', 'canceled');
        logger.info('User subscription canceled', { userId });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await UserModel.updatePlan(userId, 'free', 'expired');
        logger.info('User subscription expired', { userId });
      }
      break;
    }

    case 'invoice.payment_failed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const customerId = invoice.customer as string;
      logger.warn('Stripe payment failed', { customerId });
      break;
    }

    default:
      logger.info('Stripe webhook unhandled event type', { type: event.type });
  }

  res.status(200).json({ received: true });
}
