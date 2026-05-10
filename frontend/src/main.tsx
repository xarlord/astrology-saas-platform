/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/styles/globals.css';

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to Sentry (if configured)
  import('./utils/sentry').then(({ captureException }) => {
    captureException(event.reason, { source: 'unhandledrejection' });
  }).catch(() => { /* Sentry not configured */ });
  // Prevent default browser error handling
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to Sentry (if configured)
  import('./utils/sentry').then(({ captureException }) => {
    captureException(event.error, { source: 'global_error' });
  }).catch(() => { /* Sentry not configured */ });
});

// Import service worker hook only in production
if (import.meta.env.PROD) {
  void import('./hooks/useServiceWorkerUpdate').then(() => {
    // Service worker registration initialized
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
