/**
 * Tests for Email Service
 *
 * Tests focus on exported function signatures, DEFAULT_EMAIL_PREFS,
 * and dev-mode behavior (no RESEND_API_KEY → logs instead of sending).
 * Resend integration is tested via integration tests.
 */

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  DEFAULT_EMAIL_PREFS,
} from '../../services/email.service';
import logger from '../../utils/logger';

// Helper to wait for async queue processing
function waitForQueue(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dev mode (no RESEND_API_KEY)', () => {
    it('sendPasswordResetEmail should log in dev mode instead of sending', async () => {
      sendPasswordResetEmail({
        to: 'test@example.com',
        resetToken: 'token-abc',
        userName: 'Alice',
      });

      await waitForQueue();

      expect(logger.info).toHaveBeenCalledWith(
        'Email (dev mode — no RESEND_API_KEY)',
        expect.objectContaining({ to: 'test@example.com' }),
      );
    });

    it('sendWelcomeEmail should log in dev mode', async () => {
      sendWelcomeEmail('new@example.com', 'NewUser');

      await waitForQueue();

      expect(logger.info).toHaveBeenCalledWith(
        'Email (dev mode — no RESEND_API_KEY)',
        expect.objectContaining({ to: 'new@example.com' }),
      );
    });

    it('sendSubscriptionConfirmationEmail should log in dev mode', async () => {
      sendSubscriptionConfirmationEmail('sub@example.com', 'Sub', 'Pro');

      await waitForQueue();

      expect(logger.info).toHaveBeenCalledWith(
        'Email (dev mode — no RESEND_API_KEY)',
        expect.objectContaining({ to: 'sub@example.com' }),
      );
    });
  });

  describe('queue behavior', () => {
    it('should process multiple queued emails sequentially', async () => {
      sendWelcomeEmail('a@test.com', 'A');
      sendWelcomeEmail('b@test.com', 'B');
      sendSubscriptionConfirmationEmail('c@test.com', 'C', 'Premium');

      await waitForQueue(200);

      // All three should have been logged
      const infoCalls = (logger.info as jest.Mock).mock.calls.filter(
        (call: string[]) => call[0] === 'Email (dev mode — no RESEND_API_KEY)',
      );
      expect(infoCalls).toHaveLength(3);
    });
  });

  describe('DEFAULT_EMAIL_PREFS', () => {
    it('should have marketing enabled by default', () => {
      expect(DEFAULT_EMAIL_PREFS.marketing).toBe(true);
    });

    it('should have transactional enabled by default', () => {
      expect(DEFAULT_EMAIL_PREFS.transactional).toBe(true);
    });
  });

  describe('function signatures', () => {
    it('sendPasswordResetEmail should accept correct params', () => {
      expect(() =>
        sendPasswordResetEmail({
          to: 'test@example.com',
          resetToken: 'abc',
          userName: 'Test',
        }),
      ).not.toThrow();
    });

    it('sendWelcomeEmail should accept to and userName', () => {
      expect(() => sendWelcomeEmail('test@example.com', 'Test')).not.toThrow();
    });

    it('sendSubscriptionConfirmationEmail should accept to, userName, planName', () => {
      expect(() =>
        sendSubscriptionConfirmationEmail('test@example.com', 'Test', 'Pro'),
      ).not.toThrow();
    });
  });
});
