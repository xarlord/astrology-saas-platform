/**
 * Push Notification Service
 * Manages push subscriptions and sends notifications using Web Push Protocol
 */

import webpush from 'web-push';
import pushSubscriptionModel from '../models/pushSubscription.model';
import logger from '../../../utils/logger';

// Configure Web Push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@astrology-saas.com';

let vapidConfigured = false;

try {
  if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
    vapidConfigured = true;
  } else if (process.env.NODE_ENV !== 'test') {
    logger.warn('VAPID keys not configured. Push notifications will not work.');
  }
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    logger.error('Failed to configure VAPID keys:', error);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface SendNotificationResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: Array<{
    endpoint: string;
    error: string;
  }>;
}

class PushNotificationService {
  /**
   * Save push subscription
   */
  async saveSubscription(data: {
    userId: string;
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }): Promise<any> {
    // Check if subscription already exists
    const existing = await pushSubscriptionModel.findByEndpoint(data.endpoint);

    if (existing) {
      // Update existing subscription if user changed
      if (existing.user_id !== data.userId) {
        // Delete old and create new
        await pushSubscriptionModel.deleteByEndpoint(data.endpoint);
        return pushSubscriptionModel.create(data);
      }
      // Return existing if same user
      return existing;
    }

    // Create new subscription
    return pushSubscriptionModel.create(data);
  }

  /**
   * Send notification to a single subscription
   */
  async sendToSubscription(
    subscription: any,
    payload: PushNotificationPayload
  ): Promise<void> {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
  }

  /**
   * Send notification to user (all their subscriptions)
   */
  async sendNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<SendNotificationResult> {
    const subscriptions = await pushSubscriptionModel.findByUserId(userId);

    if (subscriptions.length === 0) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    const errors: SendNotificationResult['errors'] = [];
    let sentCount = 0;

    for (const subscription of subscriptions) {
      try {
        await this.sendToSubscription(subscription, payload);
        sentCount++;
      } catch (error: any) {
        // If subscription is invalid, delete it
        if (error.statusCode === 404 || error.statusCode === 410) {
          await pushSubscriptionModel.delete(subscription.id);
        }

        errors.push({
          endpoint: subscription.endpoint,
          error: error.message,
        });

        logger.error('Failed to send push notification:', error);
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      failedCount: errors.length,
      errors,
    };
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<SendNotificationResult> {
    const results = await Promise.all(
      userIds.map((userId) => this.sendNotification(userId, payload))
    );

    return results.reduce(
      (acc, result) => ({
        success: acc.success || result.success,
        sentCount: acc.sentCount + result.sentCount,
        failedCount: acc.failedCount + result.failedCount,
        errors: [...acc.errors, ...result.errors],
      }),
      { success: false, sentCount: 0, failedCount: 0, errors: [] }
    );
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    return pushSubscriptionModel.delete(subscriptionId);
  }

  /**
   * Get all subscriptions for user
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    return pushSubscriptionModel.findByUserId(userId);
  }

  /**
   * Generate VAPID keys (for development)
   */
  generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}

export default new PushNotificationService();
