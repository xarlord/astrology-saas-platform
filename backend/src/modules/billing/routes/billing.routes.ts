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
/**
 * @openapi
 * /api/v1/billing/plans:
 *   get:
 *     tags: [Billing]
 *     summary: Get available subscription plans
 *     security: []
 *     responses:
 *       200:
 *         description: List of available subscription plans
 */
router.get('/plans', asyncHandler(async (req, res) => {
  await BillingController.getPlanList(req, res);
}));

/**
 * @route   POST /api/v1/billing/webhook
 * @desc    Handle Stripe webhook events (raw body required)
 * @access  Public (verified via Stripe signature)
 */
/**
 * @openapi
 * /api/v1/billing/webhook:
 *   post:
 *     tags: [Billing]
 *     summary: Handle Stripe webhook events
 *     description: Receives and processes Stripe webhook events. Verified via Stripe signature header.
 *     security: []
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature or payload
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  await BillingController.handleWebhook(req, res);
}));

/**
 * @route   POST /api/v1/billing/checkout
 * @desc    Create a Stripe Checkout session
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/billing/checkout:
 *   post:
 *     tags: [Billing]
 *     summary: Create a Stripe Checkout session
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Checkout session created
 *       401:
 *         description: Unauthorized
 */
router.post('/checkout', authenticate, asyncHandler(async (req, res) => {
  await BillingController.createCheckout(req as AuthenticatedRequest, res);
}));

/**
 * @route   POST /api/v1/billing/portal
 * @desc    Create a Stripe Customer Portal session
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/billing/portal:
 *   post:
 *     tags: [Billing]
 *     summary: Create a Stripe Customer Portal session
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Portal session created
 *       401:
 *         description: Unauthorized
 */
router.post('/portal', authenticate, asyncHandler(async (req, res) => {
  await BillingController.createPortal(req as AuthenticatedRequest, res);
}));

/**
 * @route   GET /api/v1/billing/subscription
 * @desc    Get current user's subscription info
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/billing/subscription:
 *   get:
 *     tags: [Billing]
 *     summary: Get current user's subscription info
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current subscription details
 *       401:
 *         description: Unauthorized
 */
router.get('/subscription', authenticate, asyncHandler(async (req, res) => {
  await BillingController.getSubscription(req as AuthenticatedRequest, res);
}));

export { router as BillingRoutes };
