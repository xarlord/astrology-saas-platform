/**
 * Push Notifications Hook
 * Manages push notification subscription and permissions
 */

import { useState, useEffect } from 'react';
import pushNotificationService from '../services/pushNotification.service';
import { getSWRegistration } from '../utils/serviceWorkerRegistration';

interface UsePushNotificationsResult {
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribing: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: (subscriptionId: string) => Promise<void>;
  sendTest: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscriptions = await pushNotificationService.getSubscriptions();
      setIsSubscribed(subscriptions.length > 0);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  const subscribe = async () => {
    setSubscribing(true);

    try {
      // Request permission
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);

      if (newPermission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await getSWRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      // Get VAPID public key
      const vapidPublicKey = await pushNotificationService.getVapidPublicKey();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      await pushNotificationService.subscribe({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
            : '',
          auth: subscription.getKey('auth')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
            : '',
        },
      });

      setIsSubscribed(true);
    } catch (error: any) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribe = async (subscriptionId: string) => {
    try {
      await pushNotificationService.unsubscribe(subscriptionId);
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  };

  const sendTest = async () => {
    try {
      await pushNotificationService.sendTest();
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  };

  return {
    permission,
    isSubscribed,
    subscribing,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
