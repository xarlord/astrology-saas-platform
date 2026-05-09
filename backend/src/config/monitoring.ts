/**
 * Monitoring Configuration
 *
 * Sentry for error tracking + request performance monitoring.
 * PostHog for product analytics.
 *
 * Both services are optional — if packages aren't installed or
 * keys aren't configured, no-ops are used.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SentryLib: any = null;
try {
  SentryLib = require('@sentry/node');
} catch {
  // @sentry/node not installed — monitoring will be no-op
}

const isSentryConfigured = !!process.env.SENTRY_DSN && !!SentryLib;

if (isSentryConfigured && SentryLib) {
  SentryLib.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export const sentry = {
  captureException: (error: Error, context?: Record<string, unknown>) => {
    if (!isSentryConfigured || !SentryLib) return;
    SentryLib.withScope((scope: { setExtra: (key: string, value: unknown) => void }) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      SentryLib.captureException(error);
    });
  },
  captureMessage: (message: string, level: string = 'info') => {
    if (!isSentryConfigured || !SentryLib) return;
    SentryLib.captureMessage(message, level);
  },
  isEnabled: isSentryConfigured,
};

/**
 * PostHog analytics client.
 * Calls are no-ops when POSTHOG_KEY is not set.
 */
const isPostHogConfigured = !!process.env.POSTHOG_KEY;

export const analytics = {
  trackEvent: (_event: string, _properties?: Record<string, unknown>) => {
    if (!isPostHogConfigured) return;
    // PostHog SDK calls would go here when package is installed
  },
  identifyUser: (_userId: string, _traits?: Record<string, unknown>) => {
    if (!isPostHogConfigured) return;
  },
  isEnabled: isPostHogConfigured,
};
