/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './assets/styles/globals.css';

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // TODO(#77): Send to error reporting service (Sentry) — issue #77 tracks Sentry integration
  // Prevent default browser error handling
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO(#77): Send to error reporting service (Sentry)
});

// Import service worker hook only in production
if (import.meta.env.PROD) {
  void import('./hooks/useServiceWorkerUpdate').then(() => {
    // Service worker registration initialized
  });

}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
