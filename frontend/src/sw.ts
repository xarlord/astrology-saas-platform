/**
 * Custom Service Worker
 * Advanced caching strategies for PWA functionality
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { CACHE, HTTP } from './utils/constants';

declare const self: ServiceWorkerGlobalScope;

// CRITICAL: Immediately activate new service worker without waiting
// This ensures users always get the latest code (auth fixes, etc.)
(self as any).skipWaiting();
// NOTE: clients.claim() MUST be inside the 'activate' event, NOT top-level.
// Calling it at top-level throws: "Only the active worker can claim clients"
// because the SW hasn't reached the 'activated' state yet.

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
      statuses: [0, HTTP.STATUS_INTERNAL_ERROR - 300],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: CACHE.ONE_DAY_SECONDS,
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
      statuses: [0, HTTP.STATUS_INTERNAL_ERROR - 300],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: CACHE.ONE_DAY_SECONDS,
      purgeOnQuotaError: true,
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

// JavaScript and CSS - NetworkFirst to ensure fresh auth code
// (previously StaleWhileRevalidate which served stale cached bundles)
registerRoute(({ request }) => {
  return request.destination === 'script' || request.destination === 'style';
}, new NetworkFirst({
  cacheName: CACHE_NAMES.STATIC,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: CACHE.ONE_DAY_SECONDS,
      purgeOnQuotaError: true,
    }),
  ],
}));

// Navigation route (SPA fallback)
// This ensures all navigation requests return the index.html
const navigationRoute = new NavigationRoute(
  // Handler will be set by workbox
  new NetworkFirst({
    cacheName: CACHE_NAMES.STATIC,
  }),
  {
    allowlist: [/^\/(?!api).*/],
  },
);

registerRoute(navigationRoute);

// Skip waiting on message
(self as any).addEventListener('message', (event: any) => {
  if (event.data?.type === 'SKIP_WAITING') {
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
    body: data.body ?? '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: data.url ?? '/',
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
    (self as any).registration.showNotification(data.title ?? 'Notification', options),
  );
});

// Notification click handling
(self as any).addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil((self as any).clients.openWindow(event.notification.data?.url ?? '/'));
  }
});

// Sync event for background sync
(self as any).addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-charts') {
    event.waitUntil(
      // Sync chart data
      (() => {
        try {
          // Implement sync logic
          console.log('Syncing chart data...');
          // TODO: Implement actual sync with backend
          return Promise.resolve();
        } catch (error) {
          console.error('Sync failed:', error);
          return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
      })(),
    );
  }
});

// Catch handler for offline fallback
setCatchHandler(({ event }) =>
  Promise.resolve().then(() => {
    // For document requests (navigation), return offline HTML page
    if (event.request.destination === 'document') {
      return new Promise<Response>((resolve) => {
        resolve(
          new Response(
            '<!DOCTYPE html><html><head><title>Offline</title><style>body{font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;color:#333;background:#f5f5f5}h1{margin-bottom:16px}</style></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
            {
              headers: { 'Content-Type': 'text/html' },
            },
          ),
        );
      });
    }

    // For other requests, return error
    return Response.error();
  }),
);

// Activate event - claim clients + clean up old caches AND delete ALL workbox precache caches
// to force fresh downloads on every deploy
(self as any).addEventListener('activate', (event: any) => {
  event.waitUntil(
    (async () => {
      // Claim all clients immediately so the new SW controls existing pages
      // This MUST be inside 'activate' — calling at top-level throws InvalidStateError
      await (self as any).clients.claim();

      const cacheNames = await caches.keys();
      // Delete ALL old caches (including workbox-precache-v2) to ensure
      // no stale JS bundles survive across deploys
      for (const cacheName of cacheNames) {
        if (cacheName.startsWith('workbox-precache') || cacheName.startsWith('api-cache-') || cacheName.startsWith('images-cache-') || cacheName.startsWith('static-cache-')) {
          await caches.delete(cacheName);
        }
      }
    })(),
  );
});

export {};
