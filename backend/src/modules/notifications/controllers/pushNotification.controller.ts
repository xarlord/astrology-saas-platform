/**
 * Push Notification Controller
 */

import { asyncHandler } from '../../../middleware/errorHandler';
import pushNotificationService from '../services/pushNotification.service';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';

export const saveSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { endpoint, keys } = req.body;
  const userId = (req as AuthenticatedRequest).user.id;

  const subscription = await pushNotificationService.saveSubscription({
    userId,
    endpoint,
    keys,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

export const deleteSubscription = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { subscriptionId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Verify subscription belongs to user
    const subscriptions = await pushNotificationService.getUserSubscriptions(userId);
    const subscription = subscriptions.find((s) => s.id === subscriptionId);

    if (!subscription) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Subscription not found',
        },
      });
      return;
    }

    await pushNotificationService.deleteSubscription(subscriptionId);

    res.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  },
);

export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = (req as AuthenticatedRequest).user.id;

  const subscriptions = await pushNotificationService.getUserSubscriptions(userId);

  res.json({
    success: true,
    data: subscriptions,
  });
});

export const sendTestNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = (req as AuthenticatedRequest).user.id;

  const result = await pushNotificationService.sendNotification(userId, {
    title: 'Test Notification',
    body: 'This is a test notification from Astrology SaaS Platform',
    icon: '/pwa-192x192.png',
    data: { url: '/dashboard' },
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getVapidPublicKey = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      res.status(500).json({
        success: false,
        error: {
          message: 'VAPID public key not configured',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { publicKey },
    });
  },
);
