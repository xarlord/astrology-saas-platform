/**
 * Monitoring / observability — Sentry integration
 *
 * When SENTRY_DSN is set and @sentry/node is installed, this module initialises
 * the Sentry SDK.  Otherwise all calls are safe no-ops so the app runs fine
 * without the package.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/** Shape shared across the app for the Sentry wrapper */
export interface SentryWrapper {
  isEnabled: boolean;
  captureException(err: unknown, context?: Record<string, unknown>): void;
  startSpan<T>(opts: Record<string, unknown>, fn: () => T): T;
  setUser(user: { id: string; email?: string } | null): void;
  addBreadcrumb(breadcrumb: Record<string, unknown>): void;
}

/* -------------------------------------------------------------------------- */
/*  No-op fallback                                                            */
/* -------------------------------------------------------------------------- */

function createNoopWrapper(): SentryWrapper {
  return {
    isEnabled: false,
    captureException() {},
    startSpan<T>(_opts: Record<string, unknown>, fn: () => T): T {
      return fn();
    },
    setUser() {},
    addBreadcrumb() {},
  };
}

/* -------------------------------------------------------------------------- */
/*  Lazy-initialised singleton                                                */
/* -------------------------------------------------------------------------- */

let _sentry: SentryWrapper | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SentryModule = any;

async function loadSentry(): Promise<SentryWrapper> {
  if (_sentry) return _sentry;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    _sentry = createNoopWrapper();
    return _sentry;
  }

  try {
    // Dynamic import — @sentry/node is an optional dep; the catch block
    // handles the case where the package is not installed.
    // @ts-expect-error — optional dependency, not installed until SENTRY_DSN is set
    const Sentry: SentryModule = await import('@sentry/node');

    const initOptions = {
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
        ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
        : 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      ...(process.env.SENTRY_RELEASE && { release: process.env.SENTRY_RELEASE }),
    };

    Sentry.init(initOptions);

    _sentry = {
      isEnabled: true,
      captureException(err: unknown, context?: Record<string, unknown>) {
        Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
          extra: context,
        });
      },
      startSpan<T>(opts: Record<string, unknown>, fn: () => T): T {
        return Sentry.startSpan(opts, fn);
      },
      setUser(user: { id: string; email?: string } | null) {
        Sentry.setUser(user);
      },
      addBreadcrumb(breadcrumb: Record<string, unknown>) {
        Sentry.addBreadcrumb(breadcrumb);
      },
    };

    // eslint-disable-next-line no-console
    console.log(`[monitoring] Sentry initialised (env=${process.env.NODE_ENV})`);
  } catch {
    // @sentry/node not installed — fall back to no-op
    _sentry = createNoopWrapper();
  }

  return _sentry;
}

/* -------------------------------------------------------------------------- */
/*  Synchronous proxy — calls are safe even before lazy-init completes        */
/* -------------------------------------------------------------------------- */

/**
 * Sentry wrapper used throughout the backend.
 *
 * On first use it triggers the lazy init; until then calls are queued or
 * simply no-op'd (the current design drops them — acceptable for early-startup
 * errors). If you need guaranteed capture during startup, `await initSentry()`
 * first.
 */
export const sentry: SentryWrapper = new Proxy(createNoopWrapper(), {
  get(_target, prop: keyof SentryWrapper) {
    // Return the real value once initialised
    if (_sentry) return _sentry[prop];

    // Trigger init in the background — next call will find _sentry set
    void loadSentry();

    // While loading, return no-op defaults
    const noop = createNoopWrapper();
    return noop[prop];
  },
});

/**
 * Explicitly initialise Sentry. Call early (e.g. in server.ts) if you want to
 * ensure the SDK is ready before the first request.
 */
export async function initSentry(): Promise<SentryWrapper> {
  return loadSentry();
}
