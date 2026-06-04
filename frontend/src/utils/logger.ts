/**
 * Frontend Logger Utility
 *
 * Wraps console methods so all error/warn calls flow through a single module.
 * When Sentry (@sentry/react) is wired up later, these methods can forward
 * errors to Sentry without changing call-sites.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.error('Something broke:', error);
 *   logger.warn('Deprecated call');
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface Logger {
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

/* -------------------------------------------------------------------------- */
/*  Sentry forward (lazy, conditional)                                        */
/* -------------------------------------------------------------------------- */

let _captureException: ((err: unknown, extras?: Record<string, unknown>) => void) | null = null;

/**
 * Called from main.tsx once Sentry is initialised (or skipped).  Allows the
 * logger to forward errors without a hard dependency on @sentry/react.
 */
export function setSentryCapture(
  fn: ((err: unknown, extras?: Record<string, unknown>) => void) | null,
): void {
  _captureException = fn;
}

/* -------------------------------------------------------------------------- */
/*  Implementation                                                            */
/* -------------------------------------------------------------------------- */

const IS_DEV = import.meta.env.DEV;

function extractError(args: unknown[]): { error: unknown; rest: unknown[] } {
  // Find the first Error instance in the args
  const error = args.find((a): a is Error => a instanceof Error);
  return { error: error ?? args[0], rest: args };
}

export const logger: Logger = {
  error(...args: unknown[]) {
    // Always log to console
    console.error(...args);

    // Forward to Sentry (if configured)
    if (_captureException) {
      const { error } = extractError(args);
      _captureException(error);
    }
  },

  warn(...args: unknown[]) {
    console.warn(...args);
    // Warnings are typically not sent to Sentry, but the hook is here if needed
  },

  info(...args: unknown[]) {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log('[info]', ...args);
    }
  },

  debug(...args: unknown[]) {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log('[debug]', ...args);
    }
  },
};

export default logger;
