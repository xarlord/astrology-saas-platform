/**
 * Application Entry Point
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './assets/styles/globals.css';
import { logger, setSentryCapture } from './utils/logger';

/* -------------------------------------------------------------------------- */
/*  Sentry initialisation (conditional — only when DSN is set)                */
/* -------------------------------------------------------------------------- */

async function initSentry(): Promise<void> {
  const dsn = String(import.meta.env.VITE_SENTRY_DSN ?? '');
  if (!dsn) return;

  try {
    // Dynamic import via variable prevents Vite from statically resolving @sentry/react
    // during dependency scanning. @sentry/react is an optional dependency — not installed in CI.
    const sentryModule = '@sentry/react';
    const Sentry = await import(/* @vite-ignore */ sentryModule);

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
        ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string)
        : 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });

    setSentryCapture((err, extras) => {
      Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
        extra: extras,
      });
    });
  } catch {
    // @sentry/react not installed — logger falls back to console only
  }
}

void initSentry();

/* -------------------------------------------------------------------------- */
/*  Global error handlers                                                     */
/* -------------------------------------------------------------------------- */

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  logger.error('Global error:', event.error);
});

/* -------------------------------------------------------------------------- */
/*  Service worker (production only)                                          */
/* -------------------------------------------------------------------------- */

if (import.meta.env.PROD) {
  void import('./hooks/useServiceWorkerUpdate').then(() => {
    // Service worker registration initialized
  }).catch(() => { /* SW registration is optional */ });
}

/* -------------------------------------------------------------------------- */
/*  Mount                                                                     */
/* -------------------------------------------------------------------------- */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
