/**
 * Monitoring / observability stub
 *
 * Replace with real Sentry (or other APM) integration when ready.
 */

export const sentry = {
  /** Whether Sentry is enabled (always false for stub) */
  isEnabled: false,

  /** Capture an exception in Sentry (no-op until configured) */
  captureException(_err: unknown): void {
    // no-op — replace with Sentry.captureException(err) when wired up
  },

  /** Start a performance span (no-op until configured) */
  startSpan<T>(_opts: Record<string, unknown>, fn: () => T): T {
    return fn();
  },
};
