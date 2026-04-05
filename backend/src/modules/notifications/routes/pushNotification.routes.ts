/**
 * Push Notification Routes
 */

import express from 'express';
import {
  saveSubscription,
  deleteSubscription,
  getSubscriptions,
  sendTestNotification,
  getVapidPublicKey,
} from '../controllers/pushNotification.controller';
import { authenticate } from '../../../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/v1/notifications/vapid-key
 * @desc    Get VAPID public key
 * @access  Public
 *
 * @openapi
 * /api/v1/notifications/vapid-key:
 *   get:
 *     tags: [Notifications]
 *     summary: Get VAPID public key for push notifications
 *     security: []
 *     responses:
 *       200:
 *         description: VAPID public key
 */
router.get('/vapid-key', getVapidPublicKey);

// All routes below require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/notifications/subscribe
 * @desc    Save push notification subscription
 * @access  Private
 *
 * @openapi
 * /api/v1/notifications/subscribe:
 *   post:
 *     tags: [Notifications]
 *     summary: Save a push notification subscription
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Subscription saved
 *       400:
 *         description: Invalid subscription data
 */
router.post('/subscribe', saveSubscription);

/**
 * @route   DELETE /api/v1/notifications/subscribe/:subscriptionId
 * @desc    Delete push notification subscription
 * @access  Private
 *
 * @openapi
 * /api/v1/notifications/subscribe/{subscriptionId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a push notification subscription
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: subscriptionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription deleted
 *       404:
 *         description: Subscription not found
 */
router.delete('/subscribe/:subscriptionId', deleteSubscription);

/**
 * @route   GET /api/v1/notifications/subscriptions
 * @desc    Get user push subscriptions
 * @access  Private
 *
 * @openapi
 * /api/v1/notifications/subscriptions:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all subscriptions for the authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get('/subscriptions', getSubscriptions);

/**
 * @route   POST /api/v1/notifications/test
 * @desc    Send test push notification
 * @access  Private
 *
 * @openapi
 * /api/v1/notifications/test:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a test push notification
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Test notification sent
 */
router.post('/test', sendTestNotification);

export { router as PushNotificationRoutes };
