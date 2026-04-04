/**
 * Billing Routes
 */

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as BillingController from '../controllers/billing.controller';

const router = Router();

/**
 * @route   GET /api/v1/billing/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', asyncHandler(async (req, res) => {
  await BillingController.getPlanList(req, res);
}));

/**
 * @route   POST /api/v1/billing/webhook
 * @desc    Handle Stripe webhook events (raw body required)
 * @access  Public (verified via Stripe signature)
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  await BillingController.handleWebhook(req, res);
}));

/**
 * @route   POST /api/v1/billing/checkout
 * @desc    Create a Stripe Checkout session
 * @access  Private
 */
router.post('/checkout', authenticate, asyncHandler(async (req, res) => {
  await BillingController.createCheckout(req as AuthenticatedRequest, res);
}));

/**
 * @route   POST /api/v1/billing/portal
 * @desc    Create a Stripe Customer Portal session
 * @access  Private
 */
router.post('/portal', authenticate, asyncHandler(async (req, res) => {
  await BillingController.createPortal(req as AuthenticatedRequest, res);
}));

/**
 * @route   GET /api/v1/billing/subscription
 * @desc    Get current user's subscription info
 * @access  Private
 */
router.get('/subscription', authenticate, asyncHandler(async (req, res) => {
  await BillingController.getSubscription(req as AuthenticatedRequest, res);
}));

export { router as BillingRoutes };
