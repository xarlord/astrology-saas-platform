/**
 * Push Notification Service Tests
 */

// Set test environment before importing anything
process.env.NODE_ENV = 'test';

// Mock logger before any imports
const mockLogger = {
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock('../../utils/logger', () => ({
  default: mockLogger,
  __esModule: true,
}));

// Mock web-push
const mockWebpush = {
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
  generateVAPIDKeys: jest.fn(() => ({
    publicKey: 'test-public-key',
    privateKey: 'test-private-key',
  })),
};

jest.mock('web-push', () => ({
  default: mockWebpush,
  __esModule: true,
}));

// Mock the model
const mockPushSubscriptionModel = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByEndpoint: jest.fn(),
  delete: jest.fn(),
  deleteByEndpoint: jest.fn(),
};

jest.mock('../../modules/notifications/models/pushSubscription.model', () => ({
  default: mockPushSubscriptionModel,
  __esModule: true,
}));

import { describe, it, expect, beforeEach } from '@jest/globals';
import pushNotificationService from '../../modules/notifications/services/pushNotification.service';

describe('Push Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save push subscription', async () => {
    const subscriptionData = {
      userId: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    };

    const mockSubscription = {
      id: 'sub-123',
      user_id: subscriptionData.userId,
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByEndpoint.mockResolvedValue(null);
    mockPushSubscriptionModel.create.mockResolvedValue(mockSubscription);

    const subscription = await pushNotificationService.saveSubscription(subscriptionData);

    expect(subscription).toHaveProperty('id');
    expect(subscription.endpoint).toBe(subscriptionData.endpoint);
    expect(subscription.user_id).toBe(subscriptionData.userId);
    expect(subscription.keys).toEqual(subscriptionData.keys);
    expect(mockPushSubscriptionModel.findByEndpoint).toHaveBeenCalledWith(subscriptionData.endpoint);
    expect(mockPushSubscriptionModel.create).toHaveBeenCalledWith(subscriptionData);
  });

  it('should update existing subscription if endpoint already exists for different user', async () => {
    const subscriptionData = {
      userId: 'user-456',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    };

    const existingSubscription = {
      id: 'sub-123',
      user_id: 'user-123',
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newSubscription = {
      id: 'sub-456',
      user_id: subscriptionData.userId,
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByEndpoint.mockResolvedValue(existingSubscription);
    mockPushSubscriptionModel.deleteByEndpoint.mockResolvedValue(true);
    mockPushSubscriptionModel.create.mockResolvedValue(newSubscription);

    const result = await pushNotificationService.saveSubscription(subscriptionData);

    expect(result).toHaveProperty('id');
    expect(result.user_id).toBe(subscriptionData.userId);
    expect(mockPushSubscriptionModel.deleteByEndpoint).toHaveBeenCalledWith(subscriptionData.endpoint);
    expect(mockPushSubscriptionModel.create).toHaveBeenCalledWith(subscriptionData);
  });

  it('should return existing subscription if endpoint and user match', async () => {
    const subscriptionData = {
      userId: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    };

    const existingSubscription = {
      id: 'sub-123',
      user_id: subscriptionData.userId,
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByEndpoint.mockResolvedValue(existingSubscription);

    const result = await pushNotificationService.saveSubscription(subscriptionData);

    expect(result).toEqual(existingSubscription);
    expect(mockPushSubscriptionModel.create).not.toHaveBeenCalled();
  });

  it('should send push notification to user', async () => {
    const subscriptions = [
      {
        id: 'sub-123',
        user_id: 'user-123',
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockPushSubscriptionModel.findByUserId.mockResolvedValue(subscriptions);
    mockWebpush.sendNotification.mockResolvedValue({} as any);

    const notification = {
      title: 'Test Notification',
      body: 'Test body',
      icon: '/pwa-192x192.png',
      data: { url: '/test' },
    };

    const result = await pushNotificationService.sendNotification('user-123', notification);

    expect(result.success).toBe(true);
    expect(result.sentCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(mockWebpush.sendNotification).toHaveBeenCalled();
  });

  it('should handle sending to user with no subscriptions', async () => {
    mockPushSubscriptionModel.findByUserId.mockResolvedValue([]);

    const notification = {
      title: 'Test Notification',
      body: 'Test body',
    };

    const result = await pushNotificationService.sendNotification('user-nonexistent', notification);

    expect(result.success).toBe(false);
    expect(result.sentCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });

  it('should delete push subscription', async () => {
    mockPushSubscriptionModel.delete.mockResolvedValue(true);

    const result = await pushNotificationService.deleteSubscription('sub-123');

    expect(result).toBe(true);
    expect(mockPushSubscriptionModel.delete).toHaveBeenCalledWith('sub-123');
  });

  it('should return false when deleting non-existent subscription', async () => {
    mockPushSubscriptionModel.delete.mockResolvedValue(false);

    const result = await pushNotificationService.deleteSubscription('non-existent-id');

    expect(result).toBe(false);
  });

  it('should get all subscriptions for user', async () => {
    const userId = 'user-123';
    const subscriptions = [
      {
        id: 'sub-1',
        user_id: userId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/test1',
        keys: { p256dh: 'key1', auth: 'auth1' },
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'sub-2',
        user_id: userId,
        endpoint: 'https://fcm.googleapis.com/fcm/send/test2',
        keys: { p256dh: 'key2', auth: 'auth2' },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockPushSubscriptionModel.findByUserId.mockResolvedValue(subscriptions);

    const result = await pushNotificationService.getUserSubscriptions(userId);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].user_id).toBe(userId);
    expect(mockPushSubscriptionModel.findByUserId).toHaveBeenCalledWith(userId);
  });

  it('should send notification to multiple users', async () => {
    const user1Subscriptions = [
      {
        id: 'sub-1',
        user_id: 'user-1',
        endpoint: 'https://fcm.googleapis.com/fcm/send/user1',
        keys: { p256dh: 'key1', auth: 'auth1' },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const user2Subscriptions = [
      {
        id: 'sub-2',
        user_id: 'user-2',
        endpoint: 'https://fcm.googleapis.com/fcm/send/user2',
        keys: { p256dh: 'key2', auth: 'auth2' },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockPushSubscriptionModel.findByUserId
      .mockResolvedValueOnce(user1Subscriptions)
      .mockResolvedValueOnce(user2Subscriptions);
    mockWebpush.sendNotification.mockResolvedValue({} as any);

    const notification = {
      title: 'Broadcast Test',
      body: 'Test broadcast',
    };

    const result = await pushNotificationService.sendToUsers(['user-1', 'user-2'], notification);

    expect(result.success).toBe(true);
    expect(result.sentCount).toBe(2);
    expect(result.failedCount).toBe(0);
  });

  it('should generate VAPID keys', () => {
    const expectedKeys = {
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
    };

    mockWebpush.generateVAPIDKeys.mockReturnValue(expectedKeys);

    const keys = pushNotificationService.generateVapidKeys();

    expect(keys).toHaveProperty('publicKey');
    expect(keys).toHaveProperty('privateKey');
    expect(typeof keys.publicKey).toBe('string');
    expect(typeof keys.privateKey).toBe('string');
    expect(keys.publicKey.length).toBeGreaterThan(0);
    expect(keys.privateKey.length).toBeGreaterThan(0);
    expect(mockWebpush.generateVAPIDKeys).toHaveBeenCalled();
    expect(keys).toEqual(expectedKeys);
  });

  it('should handle invalid subscriptions (404) and delete them', async () => {
    const subscription = {
      id: 'sub-123',
      user_id: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'key', auth: 'auth' },
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByUserId.mockResolvedValue([subscription]);

    const error: any = new Error('Subscription expired');
    error.statusCode = 404;
    mockWebpush.sendNotification.mockRejectedValue(error);
    mockPushSubscriptionModel.delete.mockResolvedValue(true);

    const result = await pushNotificationService.sendNotification('user-123', {
      title: 'Test',
      body: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.sentCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].endpoint).toBe(subscription.endpoint);
    expect(mockPushSubscriptionModel.delete).toHaveBeenCalledWith(subscription.id);
  });

  it('should handle invalid subscriptions (410) and delete them', async () => {
    const subscription = {
      id: 'sub-123',
      user_id: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'key', auth: 'auth' },
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByUserId.mockResolvedValue([subscription]);

    const error: any = new Error('Gone');
    error.statusCode = 410;
    mockWebpush.sendNotification.mockRejectedValue(error);
    mockPushSubscriptionModel.delete.mockResolvedValue(true);

    const result = await pushNotificationService.sendNotification('user-123', {
      title: 'Test',
      body: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.failedCount).toBe(1);
    expect(mockPushSubscriptionModel.delete).toHaveBeenCalledWith(subscription.id);
  });

  it('should handle other errors without deleting subscription', async () => {
    const subscription = {
      id: 'sub-123',
      user_id: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'key', auth: 'auth' },
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPushSubscriptionModel.findByUserId.mockResolvedValue([subscription]);

    const error = new Error('Network error');
    mockWebpush.sendNotification.mockRejectedValue(error);

    const result = await pushNotificationService.sendNotification('user-123', {
      title: 'Test',
      body: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.failedCount).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(mockPushSubscriptionModel.delete).not.toHaveBeenCalled();
  });
});
