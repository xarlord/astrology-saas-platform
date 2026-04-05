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
  // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
  // Prevent default browser error handling
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO: Send to error reporting service
});

// Import service worker hook only in production
if (import.meta.env.PROD) {
  void import('./hooks/useServiceWorkerUpdate').then(() => {
    console.log('Service worker registration initialized');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
