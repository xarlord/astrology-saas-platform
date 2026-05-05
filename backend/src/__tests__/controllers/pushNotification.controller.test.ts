/**
 * Push Notification Controller Unit Tests
 * Tests all 5 exported functions:
 *   saveSubscription, deleteSubscription, getSubscriptions,
 *   sendTestNotification, getVapidPublicKey
 */

 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

// ---------------------------------------------------------------------------
// Mock Registry — mutable object so the jest.mock factories can delegate to
// jest.fn() instances created after module setup.
// ---------------------------------------------------------------------------

const mockRegistry = {
  saveSubscription: null as jest.Mock<any, any> | null,
  deleteSubscription: null as jest.Mock<any, any> | null,
  getUserSubscriptions: null as jest.Mock<any, any> | null,
  sendNotification: null as jest.Mock<any, any> | null,
};

jest.mock('../../modules/notifications/services/pushNotification.service', () => ({
  __esModule: true,
  default: {
    saveSubscription: (...args: any[]) => (mockRegistry.saveSubscription as any)(...args),
    deleteSubscription: (...args: any[]) => (mockRegistry.deleteSubscription as any)(...args),
    getUserSubscriptions: (...args: any[]) => (mockRegistry.getUserSubscriptions as any)(...args),
    sendNotification: (...args: any[]) => (mockRegistry.sendNotification as any)(...args),
  },
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------

import { Response } from 'express';
import {
  saveSubscription,
  deleteSubscription,
  getSubscriptions,
  sendTestNotification,
  getVapidPublicKey,
} from '../../modules/notifications/controllers/pushNotification.controller';

// ---------------------------------------------------------------------------
// Wire up registry to real jest.fn() instances
// ---------------------------------------------------------------------------

mockRegistry.saveSubscription = jest.fn();
mockRegistry.deleteSubscription = jest.fn();
mockRegistry.getUserSubscriptions = jest.fn();
mockRegistry.sendNotification = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    params: {},
    query: {},
    body: {},
    headers: {},
    method: 'POST',
    path: '/api/notifications/push',
    ...overrides,
  };
}

function createMockResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

const mockNext = jest.fn();

const sampleSubscription = {
  id: 'sub-1',
  user_id: 'user-123',
  endpoint: 'https://push.example.com/subscribe/abc123',
  keys: { p256dh: 'key123', auth: 'auth456' },
  user_agent: 'Mozilla/5.0',
  created_at: new Date('2026-01-15'),
  updated_at: new Date('2026-01-15'),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Push Notification Controller', () => {
  let mockRequest: Partial<any>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext.mockClear();
  });

  // =========================================================================
  // saveSubscription
  // =========================================================================
  describe('saveSubscription', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = {
        endpoint: 'https://push.example.com/sub',
        keys: { p256dh: 'k', auth: 'a' },
      };

      await saveSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should save subscription and return 201', async () => {
      mockRequest.body = {
        endpoint: 'https://push.example.com/subscribe/abc123',
        keys: { p256dh: 'key123', auth: 'auth456' },
      };
      mockRequest.headers = { 'user-agent': 'Mozilla/5.0' };

      mockRegistry.saveSubscription!.mockResolvedValue(sampleSubscription);

      await saveSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.saveSubscription).toHaveBeenCalledWith({
        userId: 'user-123',
        endpoint: 'https://push.example.com/subscribe/abc123',
        keys: { p256dh: 'key123', auth: 'auth456' },
        userAgent: 'Mozilla/5.0',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: sampleSubscription,
      });
    });

    it('should pass undefined userAgent when header not present', async () => {
      mockRequest.body = {
        endpoint: 'https://push.example.com/sub',
        keys: { p256dh: 'k', auth: 'a' },
      };
      // headers exist but no user-agent key
      mockRequest.headers = {};

      mockRegistry.saveSubscription!.mockResolvedValue(sampleSubscription);

      await saveSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.saveSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ userAgent: undefined }),
      );
    });

    it('should call next on service error', async () => {
      mockRequest.body = {
        endpoint: 'https://push.example.com/sub',
        keys: { p256dh: 'k', auth: 'a' },
      };

      const error = new Error('DB write failed');
      mockRegistry.saveSubscription!.mockRejectedValue(error);

      await saveSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // deleteSubscription
  // =========================================================================
  describe('deleteSubscription', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { subscriptionId: 'sub-1' };

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(401);
    });

    it('should return 404 if subscription not found for user', async () => {
      mockRequest.params = { subscriptionId: 'sub-nonexistent' };
      mockRegistry.getUserSubscriptions!.mockResolvedValue([]);

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.getUserSubscriptions).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Subscription not found' },
      });
      expect(mockRegistry.deleteSubscription).not.toHaveBeenCalled();
    });

    it('should return 404 if subscription belongs to another user', async () => {
      mockRequest.params = { subscriptionId: 'sub-other-user' };
      mockRegistry.getUserSubscriptions!.mockResolvedValue([
        { ...sampleSubscription, id: 'sub-1' }, // different id
      ]);

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockRegistry.deleteSubscription).not.toHaveBeenCalled();
    });

    it('should delete subscription and return success', async () => {
      mockRequest.params = { subscriptionId: 'sub-1' };
      mockRegistry.getUserSubscriptions!.mockResolvedValue([sampleSubscription]);
      mockRegistry.deleteSubscription!.mockResolvedValue(true);

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.deleteSubscription).toHaveBeenCalledWith('sub-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Subscription deleted successfully',
      });
    });

    it('should call next on getUserSubscriptions error', async () => {
      mockRequest.params = { subscriptionId: 'sub-1' };
      const error = new Error('DB read failed');
      mockRegistry.getUserSubscriptions!.mockRejectedValue(error);

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next on deleteSubscription error', async () => {
      mockRequest.params = { subscriptionId: 'sub-1' };
      mockRegistry.getUserSubscriptions!.mockResolvedValue([sampleSubscription]);
      const error = new Error('DB delete failed');
      mockRegistry.deleteSubscription!.mockRejectedValue(error);

      await deleteSubscription(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getSubscriptions
  // =========================================================================
  describe('getSubscriptions', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getSubscriptions(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(401);
    });

    it('should return subscriptions for authenticated user', async () => {
      const subs = [
        sampleSubscription,
        { ...sampleSubscription, id: 'sub-2', endpoint: 'https://push.example.com/sub2' },
      ];
      mockRegistry.getUserSubscriptions!.mockResolvedValue(subs);

      await getSubscriptions(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.getUserSubscriptions).toHaveBeenCalledWith('user-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: subs,
      });
    });

    it('should return empty array when user has no subscriptions', async () => {
      mockRegistry.getUserSubscriptions!.mockResolvedValue([]);

      await getSubscriptions(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should call next on service error', async () => {
      const error = new Error('Service failure');
      mockRegistry.getUserSubscriptions!.mockRejectedValue(error);

      await getSubscriptions(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // sendTestNotification
  // =========================================================================
  describe('sendTestNotification', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await sendTestNotification(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(401);
    });

    it('should send test notification and return result', async () => {
      const sendResult = {
        success: true,
        sentCount: 1,
        failedCount: 0,
        errors: [],
      };
      mockRegistry.sendNotification!.mockResolvedValue(sendResult);

      await sendTestNotification(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.sendNotification).toHaveBeenCalledWith('user-123', {
        title: 'Test Notification',
        body: 'This is a test notification from Astrology SaaS Platform',
        icon: '/pwa-192x192.png',
        data: { url: '/dashboard' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: sendResult,
      });
    });

    it('should call next on service error', async () => {
      const error = new Error('Push failed');
      mockRegistry.sendNotification!.mockRejectedValue(error);

      await sendTestNotification(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getVapidPublicKey
  // =========================================================================
  describe('getVapidPublicKey', () => {
    const originalEnv = process.env.VAPID_PUBLIC_KEY;

    afterEach(() => {
      // Restore original env
      if (originalEnv !== undefined) {
        process.env.VAPID_PUBLIC_KEY = originalEnv;
      } else {
        delete process.env.VAPID_PUBLIC_KEY;
      }
    });

    it('should return 500 if VAPID_PUBLIC_KEY is not configured', async () => {
      delete process.env.VAPID_PUBLIC_KEY;

      await getVapidPublicKey(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'VAPID public key not configured' },
      });
    });

    it('should return the VAPID public key when configured', async () => {
      process.env.VAPID_PUBLIC_KEY = 'test-public-key-abc123';

      await getVapidPublicKey(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { publicKey: 'test-public-key-abc123' },
      });
    });
  });
});
