/**
 * Unit Tests for Billing Controller
 * Tests Stripe checkout, portal, subscription, plans, and webhook handling
 *
 * NOTE: The billing controller uses `throw new AppError(...)` rather than
 * `next(error)`, so errors propagate as thrown exceptions. Tests use
 * try/catch wrappers to assert on the thrown error properties.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Response } from 'express';
import {
  createCheckout,
  createPortal,
  getSubscription,
  getPlanList,
  handleWebhook,
} from '../../modules/billing/controllers/billing.controller';
import {
  createCheckoutSession,
  createPortalSession,
  getPlans,
  priceIdToPlan,
  verifyWebhookSignature,
  getCheckoutSession,
  getCustomerByEmail,
} from '../../modules/billing/services/stripe.service';

// ---------------------------------------------------------------------------
// Mock knex (chainable mock — same pattern as synastry controller tests)
// ---------------------------------------------------------------------------

var mockKnexChain: any;
var mockKnex: jest.Mock;

jest.mock('../../config/database', () => {
  let _resolveValue: any = undefined;

  mockKnexChain = {
    where: jest.fn().mockReturnThis(),
    whereNull: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),

    first: jest.fn(),
    returning: jest.fn(),
    del: jest.fn(),
    update: jest.fn().mockReturnThis(), // must chain to .returning()

    then(resolve: any, reject?: any) {
      return Promise.resolve(_resolveValue).then(resolve, reject);
    },

    _setResolveValue(val: any) {
      _resolveValue = val;
    },
  };

  mockKnex = jest.fn().mockReturnValue(mockKnexChain);
  return mockKnex;
});

// ---------------------------------------------------------------------------
// Mock stripe service
// ---------------------------------------------------------------------------

jest.mock('../../modules/billing/services/stripe.service', () => ({
  __esModule: true,
  createCheckoutSession: jest.fn(),
  createPortalSession: jest.fn(),
  getPlans: jest.fn(),
  priceIdToPlan: jest.fn(),
  verifyWebhookSignature: jest.fn(),
  getCheckoutSession: jest.fn(),
  getCustomerByEmail: jest.fn(),
  getStripe: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Mock logger (billing controller imports { logger } as named export)
// The global setup.ts mock uses default export; we override with named export.
// ---------------------------------------------------------------------------

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Mock email service
// ---------------------------------------------------------------------------

jest.mock('../../services/email.service', () => ({
  sendSubscriptionConfirmationEmail: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sampleUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password_hash: 'hash',
  timezone: 'UTC',
  plan: 'free' as const,
  subscription_status: 'active' as const,
  subscription_renews_at: null,
  preferences: {},
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
};

const sampleCheckoutResult = {
  sessionId: 'cs_test_123',
  url: 'https://checkout.stripe.com/test',
};

const samplePortalResult = {
  url: 'https://billing.stripe.com/portal/test',
};

/**
 * Helper to invoke an async controller function and capture thrown AppError.
 * Returns the error (or null if none was thrown) so tests can assert on it.
 */
async function invoke(
  fn: (req: any, res: any, next: any) => Promise<void>,
  req: any,
  res: any,
  next: any,
): Promise<Error | null> {
  try {
    await fn(req, res, next);
    return null;
  } catch (err) {
    return err as Error;
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Billing Controller', () => {
  let mockRequest: Record<string, unknown>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-establish the mockKnex return value since clearAllMocks resets it
    mockKnex.mockReturnValue(mockKnexChain);

    // Reset chain methods that return `this` for chaining
    mockKnexChain.where.mockReturnThis();
    mockKnexChain.whereNull.mockReturnThis();
    mockKnexChain.orderBy.mockReturnThis();
    mockKnexChain.limit.mockReturnThis();
    mockKnexChain.offset.mockReturnThis();
    mockKnexChain.insert.mockReturnThis();
    mockKnexChain.count.mockReturnThis();
    mockKnexChain.update.mockReturnThis();

    // Default: chain resolves to undefined when awaited
    mockKnexChain._setResolveValue(undefined);

    mockRequest = {
      user: { id: 'user-1', email: 'test@example.com' },
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  // =========================================================================
  // createCheckout
  // =========================================================================
  describe('createCheckout', () => {
    it('should throw AppError 401 when req.user is undefined', async () => {
      mockRequest.user = undefined;

      const err = await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(401);
      expect((err as any).message).toBe('Unauthorized');
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should throw AppError 400 when priceId is missing', async () => {
      mockRequest.body = { successUrl: 'http://example.com/success' };

      const err = await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(400);
      expect((err as any).message).toBe('priceId is required');
    });

    it('should throw AppError 404 when user is not found in DB', async () => {
      mockRequest.body = { priceId: 'price_pro' };

      // UserModel.findById uses knex('users').where({id}).whereNull('deleted_at').first()
      mockKnexChain.first.mockResolvedValueOnce(null);

      const err = await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(404);
      expect((err as any).message).toBe('User not found');
    });

    it('should create a checkout session and return 200', async () => {
      mockRequest.body = {
        priceId: 'price_pro',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      };

      // UserModel.findById -> returns user
      mockKnexChain.first.mockResolvedValueOnce(sampleUser);

      (createCheckoutSession as jest.Mock).mockResolvedValueOnce(sampleCheckoutResult);

      await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      expect(createCheckoutSession).toHaveBeenCalledWith(
        'user-1',
        'test@example.com',
        'price_pro',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          sessionId: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        },
      });
    });

    it('should use default URLs when successUrl and cancelUrl are omitted', async () => {
      mockRequest.body = { priceId: 'price_pro' };

      mockKnexChain.first.mockResolvedValueOnce(sampleUser);
      (createCheckoutSession as jest.Mock).mockResolvedValueOnce(sampleCheckoutResult);

      await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      // Verify default URLs are passed (from config.frontendUrl)
      expect(createCheckoutSession).toHaveBeenCalledWith(
        'user-1',
        'test@example.com',
        'price_pro',
        expect.stringContaining('/subscription?status=success'),
        expect.stringContaining('/subscription?status=cancel'),
      );
    });

    it('should throw when an unexpected error occurs in DB call', async () => {
      mockRequest.body = { priceId: 'price_pro' };

      const error = new Error('DB connection lost');
      mockKnexChain.first.mockRejectedValueOnce(error);

      const err = await invoke(createCheckout, mockRequest, mockResponse, mockNext);

      expect(err).toBe(error);
    });
  });

  // =========================================================================
  // createPortal
  // =========================================================================
  describe('createPortal', () => {
    it('should throw AppError 401 when req.user is undefined', async () => {
      mockRequest.user = undefined;

      const err = await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(401);
    });

    it('should throw AppError 404 when user is not found in DB', async () => {
      mockKnexChain.first.mockResolvedValueOnce(null);

      const err = await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(404);
      expect((err as any).message).toBe('User not found');
    });

    it('should throw AppError 404 when no Stripe customer exists', async () => {
      // UserModel.findById -> returns user
      mockKnexChain.first.mockResolvedValueOnce(sampleUser);

      // getCustomerByEmail -> returns null (no Stripe customer)
      (getCustomerByEmail as jest.Mock).mockResolvedValueOnce(null);

      const err = await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(404);
      expect((err as any).message).toBe('No Stripe customer found. Subscribe first.');
    });

    it('should create a portal session and return 200', async () => {
      mockRequest.body = { returnUrl: 'http://localhost:3000/subscription' };

      mockKnexChain.first.mockResolvedValueOnce(sampleUser);
      (getCustomerByEmail as jest.Mock).mockResolvedValueOnce({ id: 'cus_123' });
      (createPortalSession as jest.Mock).mockResolvedValueOnce(samplePortalResult);

      await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(createPortalSession).toHaveBeenCalledWith(
        'cus_123',
        'http://localhost:3000/subscription',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          url: 'https://billing.stripe.com/portal/test',
        },
      });
    });

    it('should use default return URL when returnUrl is omitted', async () => {
      mockRequest.body = {};

      mockKnexChain.first.mockResolvedValueOnce(sampleUser);
      (getCustomerByEmail as jest.Mock).mockResolvedValueOnce({ id: 'cus_123' });
      (createPortalSession as jest.Mock).mockResolvedValueOnce(samplePortalResult);

      await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(createPortalSession).toHaveBeenCalledWith(
        'cus_123',
        expect.stringContaining('/subscription'),
      );
    });

    it('should throw when an unexpected error occurs', async () => {
      const error = new Error('Stripe API down');
      mockKnexChain.first.mockRejectedValueOnce(error);

      const err = await invoke(createPortal, mockRequest, mockResponse, mockNext);

      expect(err).toBe(error);
    });
  });

  // =========================================================================
  // getSubscription
  // =========================================================================
  describe('getSubscription', () => {
    it('should throw AppError 401 when req.user is undefined', async () => {
      mockRequest.user = undefined;

      const err = await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(401);
    });

    it('should throw AppError 404 when user is not found in DB', async () => {
      mockKnexChain.first.mockResolvedValueOnce(null);

      const err = await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(404);
      expect((err as any).message).toBe('User not found');
    });

    it('should return subscription info for an active user', async () => {
      const activeUser = {
        ...sampleUser,
        plan: 'pro' as const,
        subscription_status: 'active' as const,
        subscription_renews_at: new Date('2026-05-01'),
      };

      mockKnexChain.first.mockResolvedValueOnce(activeUser);

      await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          plan: 'pro',
          status: 'active',
          currentPeriodEnd: expect.any(Date),
          cancelAtPeriodEnd: false,
        },
      });
    });

    it('should show cancelAtPeriodEnd as true when status is canceled', async () => {
      const canceledUser = {
        ...sampleUser,
        plan: 'pro' as const,
        subscription_status: 'canceled' as const,
        subscription_renews_at: new Date('2026-04-15'),
      };

      mockKnexChain.first.mockResolvedValueOnce(canceledUser);

      await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          cancelAtPeriodEnd: true,
        }),
      });
    });

    it('should omit currentPeriodEnd when subscription_renews_at is null', async () => {
      mockKnexChain.first.mockResolvedValueOnce(sampleUser);

      await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.currentPeriodEnd).toBeUndefined();
    });

    it('should throw when an unexpected error occurs', async () => {
      const error = new Error('DB error');
      mockKnexChain.first.mockRejectedValueOnce(error);

      const err = await invoke(getSubscription, mockRequest, mockResponse, mockNext);

      expect(err).toBe(error);
    });
  });

  // =========================================================================
  // getPlanList
  // =========================================================================
  describe('getPlanList', () => {
    it('should return available plans', async () => {
      const mockPlans = [
        { id: 'free', name: 'Free', price: 0 },
        { id: 'pro', name: 'Pro', price: 9.99 },
        { id: 'premium', name: 'Premium', price: 19.99 },
      ];
      (getPlans as jest.Mock).mockReturnValueOnce(mockPlans);

      await invoke(getPlanList, mockRequest, mockResponse, mockNext);

      expect(getPlans).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlans,
      });
    });

    it('should return empty array when no plans are configured', async () => {
      (getPlans as jest.Mock).mockReturnValueOnce([]);

      await invoke(getPlanList, mockRequest, mockResponse, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  // =========================================================================
  // handleWebhook
  // =========================================================================
  describe('handleWebhook', () => {
    it('should throw AppError 400 when stripe-signature header is missing', async () => {
      mockRequest.headers = {};

      const err = await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(400);
      expect((err as any).message).toBe('Missing stripe-signature header');
    });

    it('should throw AppError 400 when webhook signature verification fails', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_123' };
      mockRequest.body = '{}';

      (verifyWebhookSignature as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const err = await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(err).not.toBeNull();
      expect((err as any).statusCode).toBe(400);
      expect((err as any).message).toBe('Invalid signature');
    });

    it('should handle checkout.session.completed event and update user plan', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_completed',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      (getCheckoutSession as jest.Mock).mockResolvedValueOnce({
        line_items: {
          data: [{ price: { id: 'price_pro' } }],
        },
      });
      (priceIdToPlan as jest.Mock).mockReturnValueOnce('pro');

      // UserModel.updatePlan uses knex('users').where(...).whereNull(...).update(...).returning('*')
      mockKnexChain.returning.mockResolvedValueOnce([{ ...sampleUser, plan: 'pro' }]);
      // UserModel.findById for sending confirmation email
      mockKnexChain.first.mockResolvedValueOnce({ ...sampleUser, plan: 'pro' });

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      // Verify the plan was updated
      expect(mockKnexChain.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle checkout.session.completed with missing userId metadata gracefully', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_nouserid',
            metadata: {},
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      // Should still return 200 without crashing
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
      // updatePlan should NOT have been called
      expect(mockKnexChain.update).not.toHaveBeenCalled();
    });

    it('should handle checkout.session.completed when priceId cannot be determined', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_noprice',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      (getCheckoutSession as jest.Mock).mockResolvedValueOnce({
        line_items: {
          data: [],
        },
      });

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
      expect(mockKnexChain.update).not.toHaveBeenCalled();
    });

    it('should handle checkout.session.completed when priceId is unknown', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_unknown_price',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      (getCheckoutSession as jest.Mock).mockResolvedValueOnce({
        line_items: {
          data: [{ price: { id: 'price_unknown' } }],
        },
      });
      (priceIdToPlan as jest.Mock).mockReturnValueOnce(null);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockKnexChain.update).not.toHaveBeenCalled();
    });

    it('should handle customer.subscription.updated with canceled status', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            status: 'canceled',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      mockKnexChain.returning.mockResolvedValueOnce([{ ...sampleUser, plan: 'free' }]);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockKnexChain.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle customer.subscription.updated with non-canceled status without updating', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            status: 'active',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockKnexChain.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle customer.subscription.deleted event', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      mockKnexChain.returning.mockResolvedValueOnce([{ ...sampleUser, plan: 'free' }]);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockKnexChain.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle customer.subscription.deleted with no userId gracefully', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            metadata: {},
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockKnexChain.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle invoice.payment_failed event', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_123',
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      // Should not throw, should return 200
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle unknown event types gracefully', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'product.created',
        data: {
          object: { id: 'prod_123' },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);

      await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should throw when an unexpected error occurs during webhook handling', async () => {
      mockRequest.headers = { 'stripe-signature': 'sig_valid' };
      mockRequest.body = '{}';

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_err',
            metadata: { userId: 'user-1' },
          },
        },
      };

      (verifyWebhookSignature as jest.Mock).mockReturnValueOnce(event);
      const error = new Error('Stripe API failure');
      (getCheckoutSession as jest.Mock).mockRejectedValueOnce(error);

      const err = await invoke(handleWebhook, mockRequest, mockResponse, mockNext);

      expect(err).toBe(error);
    });
  });
});
