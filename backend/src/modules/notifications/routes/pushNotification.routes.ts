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

router.get('/vapid-key', getVapidPublicKey);

// All routes below require authentication
router.use(authenticate);

router.post('/subscribe', saveSubscription);
router.delete('/subscribe/:subscriptionId', deleteSubscription);
router.get('/subscriptions', getSubscriptions);
router.post('/test', sendTestNotification);

export default router;
