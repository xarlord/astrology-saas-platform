/**
 * Mock for the 'stripe' npm package
 * Used in integration tests where Stripe SDK is not installed
 */

const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test-session',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        line_items: {
          data: [{ price: { id: 'price_test' } }],
        },
      }),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        url: 'https://billing.stripe.com/test-portal',
      }),
    },
  },
  customers: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
  webhooks: {
    constructEvent: jest.fn().mockImplementation(() => {
      throw new Error('No Stripe webhook secret configured');
    }),
  },
};

export default jest.fn(() => mockStripe);
