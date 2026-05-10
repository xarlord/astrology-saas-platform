/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for error monitoring in production.
 * Requires VITE_SENTRY_DSN environment variable to be set.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */

import * as Sentry from '@sentry/react';

let sentryInitialized = false;

/**
 * Initialize Sentry error tracking.
 * Only initializes if VITE_SENTRY_DSN is configured.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.info('[Sentry] No DSN configured — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION ?? 'unknown',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    enabled: import.meta.env.PROD,
  });

  sentryInitialized = true;
  console.info('[Sentry] Error tracking initialized');
}

/**
 * Capture an exception in Sentry.
 * No-op if Sentry is not initialized.
 */
export function captureException(error: unknown, tags?: Record<string, string>, extra?: Record<string, unknown>): void {
  if (!sentryInitialized) return;
  Sentry.captureException(error, {
    tags: tags ?? {},
    extra: extra ?? {},
  });
}

/**
 * Add a breadcrumb to Sentry for tracing.
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
  if (!sentryInitialized) return;
  Sentry.addBreadcrumb({ category, message, data, level: 'info' });
}

/**
 * Set user context in Sentry for error attribution.
 */
export function setUserContext(id: string, email?: string): void {
  if (!sentryInitialized) return;
  Sentry.setUser({ id, email });
}

/**
 * Clear user context (on logout).
 */
export function clearUserContext(): void {
  if (!sentryInitialized) return;
  Sentry.setUser(null);
}
