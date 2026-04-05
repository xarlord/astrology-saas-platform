/**
 * Unit Tests for Stripe Service
 * Tests Stripe SDK wrapper functions: checkout, portal, plans, webhook, customer lookup
 *
 * Strategy: We use jest.isolateModules to get a fresh module instance per test
 * to avoid the cached singleton from other test files interfering.
 * For getPlans/priceIdToPlan (pure functions), we can test them directly.
 * For functions that call getStripe(), we mock the stripe package and test
 * in isolateModules to get a fresh _stripe singleton.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

describe('Stripe Service', () => {
  // =========================================================================
  // getPlans — pure function, no Stripe SDK needed
  // =========================================================================
  describe('getPlans', () => {
    it('should return an array of 3 plan definitions', () => {
      jest.isolateModules(() => {
        const { getPlans } = require('../../modules/billing/services/stripe.service');
        const plans = getPlans();
        expect(Array.isArray(plans)).toBe(true);
        expect(plans.length).toBe(3);
      });
    });

    it('should include the free plan with correct properties', () => {
      jest.isolateModules(() => {
        const { getPlans } = require('../../modules/billing/services/stripe.service');
        const plans = getPlans();
        const freePlan = plans.find((p: any) => p.id === 'free');

        expect(freePlan).toBeDefined();
        expect(freePlan.name).toBe('Free');
        expect(freePlan.price).toBe(0);
        expect(freePlan.interval).toBe('none');
        expect(freePlan.maxCharts).toBe(3);
        expect(freePlan.maxAIMonthly).toBe(5);
        expect(freePlan.features.length).toBeGreaterThan(0);
      });
    });

    it('should include the pro plan with a priceId', () => {
      jest.isolateModules(() => {
        const { getPlans } = require('../../modules/billing/services/stripe.service');
        const plans = getPlans();
        const proPlan = plans.find((p: any) => p.id === 'pro');

        expect(proPlan).toBeDefined();
        expect(proPlan.price).toBe(9.99);
        expect(proPlan.interval).toBe('month');
        expect(proPlan.maxAIMonthly).toBe(-1);
      });
    });

    it('should include the premium plan with a priceId', () => {
      jest.isolateModules(() => {
        const { getPlans } = require('../../modules/billing/services/stripe.service');
        const plans = getPlans();
        const premiumPlan = plans.find((p: any) => p.id === 'premium');

        expect(premiumPlan).toBeDefined();
        expect(premiumPlan.price).toBe(19.99);
        expect(premiumPlan.interval).toBe('month');
        expect(premiumPlan.maxCharts).toBe(-1);
        expect(premiumPlan.maxAIMonthly).toBe(-1);
      });
    });
  });

  // =========================================================================
  // priceIdToPlan — pure function using config mock
  // =========================================================================
  describe('priceIdToPlan', () => {
    it('should map pro price ID to "pro"', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () => jest.fn());
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test', proPriceId: 'price_pro_test', premiumPriceId: 'price_premium_test' },
          },
        }));
        const { priceIdToPlan } = require('../../modules/billing/services/stripe.service');
        expect(priceIdToPlan('price_pro_test')).toBe('pro');
      });
    });

    it('should map premium price ID to "premium"', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () => jest.fn());
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test', proPriceId: 'price_pro_test', premiumPriceId: 'price_premium_test' },
          },
        }));
        const { priceIdToPlan } = require('../../modules/billing/services/stripe.service');
        expect(priceIdToPlan('price_premium_test')).toBe('premium');
      });
    });

    it('should return null for an unknown price ID', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () => jest.fn());
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test', proPriceId: 'price_pro_test', premiumPriceId: 'price_premium_test' },
          },
        }));
        const { priceIdToPlan } = require('../../modules/billing/services/stripe.service');
        expect(priceIdToPlan('price_unknown')).toBeNull();
      });
    });

    it('should return null for an empty string', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () => jest.fn());
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test', proPriceId: 'price_pro_test', premiumPriceId: 'price_premium_test' },
          },
        }));
        const { priceIdToPlan } = require('../../modules/billing/services/stripe.service');
        expect(priceIdToPlan('')).toBeNull();
      });
    });
  });

  // =========================================================================
  // getStripe — singleton lazy init with mock Stripe constructor
  // =========================================================================
  describe('getStripe', () => {
    it('should lazily create and cache a Stripe instance', () => {
      const mockConstructor = jest.fn(() => ({
        checkout: { sessions: {} },
        billingPortal: { sessions: {} },
        webhooks: {},
        customers: {},
      }));

      jest.isolateModules(() => {
        jest.doMock('stripe', () => mockConstructor);
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test_123', webhookSecret: 'whsec_test' },
          },
        }));

        const { getStripe } = require('../../modules/billing/services/stripe.service');
        const instance1 = getStripe();
        const instance2 = getStripe();

        expect(mockConstructor).toHaveBeenCalledTimes(1);
        expect(instance1).toBe(instance2);
      });
    });

    it('should throw when STRIPE_SECRET_KEY is not configured', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () => jest.fn());
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: '' },
          },
        }));

        const { getStripe } = require('../../modules/billing/services/stripe.service');

        expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not configured');
      });
    });
  });

  // =========================================================================
  // createCheckoutSession
  // =========================================================================
  describe('createCheckoutSession', () => {
    it('should create a checkout session and return sessionId and url', async () => {
      jest.isolateModules(() => {
        const mockCreate = jest.fn().mockResolvedValue({
          id: 'cs_test_abc',
          url: 'https://checkout.stripe.com/pay/cs_test_abc',
        });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: mockCreate, retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: {
            stripe: { secretKey: 'sk_test_123', proPriceId: 'price_pro', premiumPriceId: 'price_premium' },
          },
        }));

        const { createCheckoutSession } = require('../../modules/billing/services/stripe.service');

        return createCheckoutSession(
          'user-1',
          'test@example.com',
          'price_pro',
          'http://success',
          'http://cancel'
        ).then((result: any) => {
          expect(result).toEqual({
            sessionId: 'cs_test_abc',
            url: 'https://checkout.stripe.com/pay/cs_test_abc',
          });
          expect(mockCreate).toHaveBeenCalledWith({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: 'test@example.com',
            line_items: [{ price: 'price_pro', quantity: 1 }],
            success_url: 'http://success',
            cancel_url: 'http://cancel',
            metadata: { userId: 'user-1' },
          });
        });
      });
    });

    it('should return empty string when session.url is null', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn().mockResolvedValue({ id: 'cs_null', url: null }), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { createCheckoutSession } = require('../../modules/billing/services/stripe.service');

        return createCheckoutSession('u1', 'e@e.com', 'p1', '/s', '/c').then((r: any) => {
          expect(r.url).toBe('');
          expect(r.sessionId).toBe('cs_null');
        });
      });
    });

    it('should propagate errors from Stripe SDK', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn().mockRejectedValue(new Error('Stripe API error')), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { createCheckoutSession } = require('../../modules/billing/services/stripe.service');

        return expect(createCheckoutSession('u1', 'e@e.com', 'p1', '/s', '/c')).rejects.toThrow('Stripe API error');
      });
    });
  });

  // =========================================================================
  // createPortalSession
  // =========================================================================
  describe('createPortalSession', () => {
    it('should create a portal session and return the url', async () => {
      jest.isolateModules(() => {
        const mockCreate = jest.fn().mockResolvedValue({ url: 'https://billing.stripe.com/portal/s' });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: mockCreate } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { createPortalSession } = require('../../modules/billing/services/stripe.service');

        return createPortalSession('cus_123', 'http://return').then((result: any) => {
          expect(result).toEqual({ url: 'https://billing.stripe.com/portal/s' });
          expect(mockCreate).toHaveBeenCalledWith({
            customer: 'cus_123',
            return_url: 'http://return',
          });
        });
      });
    });

    it('should propagate errors from Stripe SDK', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn().mockRejectedValue(new Error('Portal failed')) } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { createPortalSession } = require('../../modules/billing/services/stripe.service');

        return expect(createPortalSession('cus_123', 'http://return')).rejects.toThrow('Portal failed');
      });
    });
  });

  // =========================================================================
  // verifyWebhookSignature
  // =========================================================================
  describe('verifyWebhookSignature', () => {
    it('should call constructEvent with correct arguments', () => {
      jest.isolateModules(() => {
        const mockConstruct = jest.fn().mockReturnValue({ type: 'test.event', data: {} });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: mockConstruct },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test', webhookSecret: 'whsec_test' } },
        }));

        const { verifyWebhookSignature } = require('../../modules/billing/services/stripe.service');

        const result = verifyWebhookSignature('payload', 'sig_123');

        expect(result).toEqual({ type: 'test.event', data: {} });
        expect(mockConstruct).toHaveBeenCalledWith('payload', 'sig_123', 'whsec_test');
      });
    });

    it('should propagate errors when verification fails', () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn(() => { throw new Error('Bad sig'); }) },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test', webhookSecret: 'whsec_test' } },
        }));

        const { verifyWebhookSignature } = require('../../modules/billing/services/stripe.service');

        expect(() => verifyWebhookSignature('p', 's')).toThrow('Bad sig');
      });
    });

    it('should handle Buffer payloads', () => {
      jest.isolateModules(() => {
        const mockConstruct = jest.fn().mockReturnValue({ type: 'buf.event' });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: mockConstruct },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test', webhookSecret: 'whsec_test' } },
        }));

        const { verifyWebhookSignature } = require('../../modules/billing/services/stripe.service');

        const buf = Buffer.from('data');
        verifyWebhookSignature(buf, 'sig');

        expect(mockConstruct).toHaveBeenCalledWith(buf, 'sig', 'whsec_test');
      });
    });
  });

  // =========================================================================
  // getCheckoutSession
  // =========================================================================
  describe('getCheckoutSession', () => {
    it('should retrieve a session with expanded line items', async () => {
      jest.isolateModules(() => {
        const mockRetrieve = jest.fn().mockResolvedValue({
          id: 'cs_ret',
          line_items: { data: [{ price: { id: 'price_pro' } }] },
        });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: mockRetrieve } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { getCheckoutSession } = require('../../modules/billing/services/stripe.service');

        return getCheckoutSession('cs_ret').then((result: any) => {
          expect(result.id).toBe('cs_ret');
          expect(mockRetrieve).toHaveBeenCalledWith('cs_ret', { expand: ['line_items'] });
        });
      });
    });

    it('should propagate errors from the Stripe SDK', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn().mockRejectedValue(new Error('Not found')) } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn() },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { getCheckoutSession } = require('../../modules/billing/services/stripe.service');

        return expect(getCheckoutSession('cs_missing')).rejects.toThrow('Not found');
      });
    });
  });

  // =========================================================================
  // getCustomerByEmail
  // =========================================================================
  describe('getCustomerByEmail', () => {
    it('should return the first matching customer', async () => {
      jest.isolateModules(() => {
        const mockList = jest.fn().mockResolvedValue({ data: [{ id: 'cus_abc' }] });

        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: mockList },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { getCustomerByEmail } = require('../../modules/billing/services/stripe.service');

        return getCustomerByEmail('test@example.com').then((result: any) => {
          expect(result).toEqual({ id: 'cus_abc' });
          expect(mockList).toHaveBeenCalledWith({ email: 'test@example.com', limit: 1 });
        });
      });
    });

    it('should return null when no customers found', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn().mockResolvedValue({ data: [] }) },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { getCustomerByEmail } = require('../../modules/billing/services/stripe.service');

        return getCustomerByEmail('none@example.com').then((result: any) => {
          expect(result).toBeNull();
        });
      });
    });

    it('should propagate errors from the Stripe SDK', async () => {
      jest.isolateModules(() => {
        jest.doMock('stripe', () =>
          jest.fn(() => ({
            checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
            billingPortal: { sessions: { create: jest.fn() } },
            webhooks: { constructEvent: jest.fn() },
            customers: { list: jest.fn().mockRejectedValue(new Error('List failed')) },
          }))
        );
        jest.doMock('../../config', () => ({
          __esModule: true,
          default: { stripe: { secretKey: 'sk_test' } },
        }));

        const { getCustomerByEmail } = require('../../modules/billing/services/stripe.service');

        return expect(getCustomerByEmail('err@example.com')).rejects.toThrow('List failed');
      });
    });
  });
});
