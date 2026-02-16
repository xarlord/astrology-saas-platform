/**
 * Custom Service Worker
 * Advanced caching strategies for PWA functionality
 */

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup outdated caches
cleanupOutdatedCaches();

// Cache names
const CACHE_NAMES = {
  API: 'api-cache-v1',
  IMAGES: 'images-cache-v1',
  STATIC: 'static-cache-v1',
};

// Cache strategies

/**
 * API caching - NetworkFirst for fresh data
 * 24 hour expiry, 50 entries
 */
const apiCacheStrategy = new NetworkFirst({
  cacheName: CACHE_NAMES.API,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24, // 24 hours
      purgeOnQuotaError: true,
    }),
  ],
});

/**
 * Image caching - CacheFirst for faster loading
 * 24 hour expiry, 60 entries
 */
const imageCacheStrategy = new CacheFirst({
  cacheName: CACHE_NAMES.IMAGES,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24, // 24 hours
      purgeOnQuotaError: true,
    }),
  ],
});

/**
 * Static assets - StaleWhileRevalidate
 * Serves cached content immediately while updating in background
 */
const staticCacheStrategy = new StaleWhileRevalidate({
  cacheName: CACHE_NAMES.STATIC,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

// Register routes

// API routes - NetworkFirst for /api/* paths
registerRoute(({ url }) => {
  return url.pathname.startsWith('/api');
}, apiCacheStrategy);

// Image routes - CacheFirst for faster loading
registerRoute(({ request }) => {
  return request.destination === 'image';
}, imageCacheStrategy);

// JavaScript and CSS - StaleWhileRevalidate
registerRoute(({ request }) => {
  return request.destination === 'script' || request.destination === 'style';
}, staticCacheStrategy);

// Navigation route (SPA fallback)
// This ensures all navigation requests return the index.html
const navigationRoute = new NavigationRoute(
  // Handler will be set by workbox
  new NetworkFirst({
    cacheName: CACHE_NAMES.STATIC,
  }),
  {
    allowlist: [/^\/(?!api).*/],
  }
);

registerRoute(navigationRoute);

// Skip waiting on message
(self as any).addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
});

// Push notification handling
(self as any).addEventListener('push', (event: any) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options: any = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title || 'Notification', options)
  );
});

// Notification click handling
(self as any).addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      (self as any).clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Sync event for background sync
(self as any).addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-charts') {
    event.waitUntil(
      // Sync chart data
      (async () => {
        try {
          // Implement sync logic
          console.log('Syncing chart data...');
          // TODO: Implement actual sync with backend
        } catch (error) {
          console.error('Sync failed:', error);
        }
      })()
    );
  }
});

// Catch handler for offline fallback
setCatchHandler(async ({ event }) => {
  // For document requests (navigation), return offline HTML page
  if (event.request.destination === 'document') {
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title><style>body{font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;color:#333;background:#f5f5f5}h1{margin-bottom:16px}</style></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // For other requests, return error
  return Response.error();
});

// Activate event - clean up old caches
(self as any).addEventListener('activate', (event: any) => {
  const currentCaches = Object.values(CACHE_NAMES);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        if (!currentCaches.includes(cacheName as any)) {
          await caches.delete(cacheName);
        }
      }
    })()
  );
});

export {};
