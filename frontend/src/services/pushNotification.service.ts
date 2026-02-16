/**
 * Push Notification Service
 * Manages push subscriptions
 */

import api from './api';

export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  /**
   * Get VAPID public key
   */
  async getVapidPublicKey(): Promise<string> {
    const response = await api.get('/notifications/vapid-key');
    return response.data.data.publicKey;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(subscription: SubscribePayload): Promise<PushSubscription> {
    const response = await api.post('/notifications/subscribe', subscription);
    return response.data.data;
  }

  /**
   * Get all user subscriptions
   */
  async getSubscriptions(): Promise<PushSubscription[]> {
    const response = await api.get('/notifications/subscriptions');
    return response.data.data;
  }

  /**
   * Delete subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    await api.delete(`/notifications/subscribe/${subscriptionId}`);
  }

  /**
   * Send test notification
   */
  async sendTest(): Promise<void> {
    await api.post('/notifications/test');
  }
}

export default new PushNotificationService();
