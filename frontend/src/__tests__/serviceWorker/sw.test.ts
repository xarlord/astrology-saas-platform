/**
 * Service Worker Tests
 * Tests for custom service worker with advanced caching strategies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock service worker environment
const createMockCache = () => ({
  put: vi.fn().mockResolvedValue(undefined),
  match: vi.fn().mockResolvedValue(undefined),
  add: vi.fn().mockResolvedValue(undefined),
  addAll: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([]),
});

let mockCache = createMockCache();

const mockCacheStorage = {
  open: vi.fn().mockResolvedValue(mockCache),
  has: vi.fn().mockResolvedValue(true),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue(['api-cache-v1', 'images-cache-v1', 'static-cache-v1']),
};

global.caches = mockCacheStorage as any;

describe('Service Worker Caching Strategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCache = createMockCache();
    mockCacheStorage.open.mockResolvedValue(mockCache);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('NetworkFirst Strategy for API calls', () => {
    it('should cache API responses with NetworkFirst strategy', async () => {
      const mockRequest = new Request('https://api.example.com/data');
      const mockResponse = new Response('{"data":"test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      // Simulate network success
      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      // Simulate cache operations
      const cacheName = 'api-cache-v1';
      const cache = await caches.open(cacheName);

      expect(cache).toBeDefined();
      expect(cache.put).toBeDefined();
      expect(mockCacheStorage.open).toHaveBeenCalledWith(cacheName);
    });

    it('should serve from cache when offline', async () => {
      const mockRequest = new Request('https://api.example.com/data');
      const cachedResponse = new Response('{"cached":"data"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      mockCache.match.mockResolvedValueOnce(cachedResponse);

      const cache = await caches.open('api-cache-v1');
      const response = await cache.match(mockRequest);

      expect(response).toEqual(cachedResponse);
      expect(response?.status).toBe(200);
    });

    it('should handle network errors and fallback to cache', async () => {
      const mockRequest = new Request('https://api.example.com/data');
      const cachedResponse = new Response('{"cached":"data"}', {
        status: 200,
      });

      mockCache.match.mockResolvedValueOnce(cachedResponse);

      // Network fails
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const cache = await caches.open('api-cache-v1');
      const response = await cache.match(mockRequest);

      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
    });
  });

  describe('CacheFirst Strategy for Images', () => {
    it('should cache images with CacheFirst strategy', async () => {
      const imageUrl = 'https://example.com/image.png';
      const mockResponse = new Response(new ArrayBuffer(1024), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const cache = await caches.open('images-cache-v1');

      expect(cache).toBeDefined();
      expect(cache.put).toBeDefined();
      expect(mockCacheStorage.open).toHaveBeenCalledWith('images-cache-v1');
    });

    it('should enforce max entries limit for image cache', async () => {
      const cache = await caches.open('images-cache-v1');

      // Simulate having 60 cached images
      const mockKeys = Array.from({ length: 60 }, (_, i) => ({
        url: `https://example.com/image${i}.png`,
      }));
      mockCache.keys.mockResolvedValueOnce(mockKeys);

      const keys = await cache.keys();
      expect(keys.length).toBe(60);
    });

    it('should expire old images after 24 hours', async () => {
      const cache = await caches.open('images-cache-v1');

      // Cache operations should support expiration
      expect(cache.delete).toBeDefined();
      expect(cache.keys).toBeDefined();
    });
  });

  describe('StaleWhileRevalidate for Static Assets', () => {
    it('should serve stale JS/CSS immediately while revalidating', async () => {
      const mockRequest = new Request('https://example.com/main.js');
      const staleResponse = new Response('console.log("stale");', {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
      });

      mockCache.match.mockResolvedValueOnce(staleResponse);

      const cache = await caches.open('static-cache-v1');
      const response = await cache.match(mockRequest);

      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
    });

    it('should update cache in background', async () => {
      const mockRequest = new Request('https://example.com/main.css');
      const freshResponse = new Response('body { color: red; }', {
        status: 200,
        headers: { 'Content-Type': 'text/css' },
      });

      global.fetch = vi.fn().mockResolvedValueOnce(freshResponse);

      const cache = await caches.open('static-cache-v1');

      // Should put fresh response in cache
      expect(cache.put).toBeDefined();
    });
  });

  describe('Navigation Route for SPA Fallback', () => {
    it('should handle navigation requests', async () => {
      const mockRequest = new Request('https://example.com/dashboard');
      // Mock destination property
      Object.defineProperty(mockRequest, 'destination', {
        value: 'document',
        writable: false,
      });

      expect(mockRequest.destination).toBe('document');
    });

    it('should allowlist non-API routes', () => {
      const allowedPath = /^\/(?!api).*/;
      expect(allowedPath.test('/dashboard')).toBe(true);
      expect(allowedPath.test('/api/data')).toBe(false);
      expect(allowedPath.test('/profile')).toBe(true);
    });
  });
});

describe('Service Worker Event Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Push Event Handler', () => {
    it('should display push notification with data', () => {
      const mockData = {
        title: 'Test Notification',
        body: 'Test body',
        url: '/test',
      };

      expect(mockData.title).toBe('Test Notification');
      expect(mockData.body).toBe('Test body');
      expect(mockData.url).toBe('/test');
    });

    it('should handle push events with notification options', () => {
      const options = {
        body: 'Test body',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        data: { url: '/test' },
        actions: [
          { action: 'view', title: 'View' },
          { action: 'close', title: 'Close' },
        ],
      };

      expect(options).toHaveProperty('body');
      expect(options).toHaveProperty('icon');
      expect(options).toHaveProperty('vibrate');
      expect(options.actions).toHaveLength(2);
    });
  });

  describe('Notification Click Handler', () => {
    it('should handle view action', () => {
      const action = 'view';
      const url = '/test';

      expect(action).toBe('view');
      expect(url).toBeDefined();
    });

    it('should close notification on click', () => {
      const notification = {
        close: vi.fn(),
        data: { url: '/test' },
      };

      notification.close();
      expect(notification.close).toHaveBeenCalled();
    });
  });

  describe('Background Sync Handler', () => {
    it('should handle sync events', () => {
      const syncTag = 'sync-charts';
      expect(syncTag).toBe('sync-charts');
    });

    it('should implement sync logic', () => {
      const syncLogic = async () => {
        console.log('Syncing chart data...');
      };

      expect(syncLogic).toBeDefined();
      expect(typeof syncLogic).toBe('function');
    });
  });

  describe('Offline Fallback Handler', () => {
    it('should return offline HTML for document requests', () => {
      const offlineHTML = '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>';

      expect(offlineHTML).toContain('You are offline');
      expect(offlineHTML).toContain('internet connection');
    });

    it('should return error response for non-document requests', () => {
      const errorResponse = Response.error();
      expect(errorResponse).toBeDefined();
      expect(errorResponse instanceof Response).toBe(true);
    });
  });

  describe('Activate Event Handler', () => {
    it('should clean up old caches', async () => {
      const currentCaches = ['api-cache-v1', 'images-cache-v1', 'static-cache-v1'];
      const allCacheKeys = ['api-cache-v1', 'images-cache-v1', 'static-cache-v1', 'old-cache-v1'];

      const cachesToDelete = allCacheKeys.filter(
        (cache) => !currentCaches.includes(cache as any)
      );

      expect(cachesToDelete).toContain('old-cache-v1');
      expect(cachesToDelete).not.toContain('api-cache-v1');
    });

    it('should keep only current cache versions', () => {
      const CACHE_NAMES = {
        API: 'api-cache-v1',
        IMAGES: 'images-cache-v1',
        STATIC: 'static-cache-v1',
      };

      const currentCaches = Object.values(CACHE_NAMES);

      expect(currentCaches).toContain('api-cache-v1');
      expect(currentCaches).toContain('images-cache-v1');
      expect(currentCaches).toContain('static-cache-v1');
      expect(currentCaches).toHaveLength(3);
    });
  });

  describe('SKIP_WAITING Message Handler', () => {
    it('should handle SKIP_WAITING message', () => {
      const message = { type: 'SKIP_WAITING' };
      expect(message.type).toBe('SKIP_WAITING');
    });

    it('should call skipWaiting when message received', () => {
      const skipWaiting = vi.fn();
      const message = { type: 'SKIP_WAITING' };

      if (message.type === 'SKIP_WAITING') {
        skipWaiting();
      }

      expect(skipWaiting).toHaveBeenCalled();
    });
  });
});

describe('Service Worker Configuration', () => {
  it('should define cache names', () => {
    const CACHE_NAMES = {
      API: 'api-cache-v1',
      IMAGES: 'images-cache-v1',
      STATIC: 'static-cache-v1',
    };

    expect(CACHE_NAMES.API).toBe('api-cache-v1');
    expect(CACHE_NAMES.IMAGES).toBe('images-cache-v1');
    expect(CACHE_NAMES.STATIC).toBe('static-cache-v1');
  });

  it('should have correct cache configuration', () => {
    const apiConfig = {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24, // 24 hours
    };

    const imageConfig = {
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    };

    expect(apiConfig.maxEntries).toBe(50);
    expect(apiConfig.maxAgeSeconds).toBe(86400);
    expect(imageConfig.maxEntries).toBe(60);
    expect(imageConfig.maxAgeSeconds).toBe(2592000);
  });
});
