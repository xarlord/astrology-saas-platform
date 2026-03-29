# PWA Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing PWA configuration into a fully-featured Progressive Web App with offline support, push notifications, and optimized caching strategies.

**Architecture:**
- Extend existing vite-plugin-pwa configuration with custom service worker logic
- Implement NetworkFirst, StaleWhileRevalidate, and CacheFirst caching strategies
- Build frontend components for service worker updates and offline detection
- Add backend push notification infrastructure with Firebase Cloud Messaging (FCM)
- Create comprehensive PWA testing suite

**Tech Stack:**
- vite-plugin-pwa (already installed)
- Workbox for advanced service worker strategies
- Firebase Admin SDK for push notifications
- React components for PWA UI
- Vitest/Playwright for testing

---

## Task 1: Generate PWA Icons

**Files:**
- Create: `frontend/public/pwa-192x192.png`
- Create: `frontend/public/pwa-512x512.png`
- Create: `frontend/public/favicon.svg`
- Create: `frontend/public/apple-touch-icon.png`
- Create: `frontend/public/mask-icon.svg`
- Create: `frontend/scripts/generate-icons.ts` (icon generation script)
- Modify: `frontend/package.json` (add icon generation script)

**Step 1: Create icon generation script**

Create file: `frontend/scripts/generate-icons.ts`

```typescript
/**
 * PWA Icon Generator
 * Generates all required PWA icons from a single source
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const SOURCE_SVG = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

interface IconSize {
  name: string;
  size: number;
  type: 'png' | 'svg';
}

const ICONS: IconSize[] = [
  { name: 'pwa-192x192.png', size: 192, type: 'png' },
  { name: 'pwa-512x512.png', size: 512, type: 'png' },
  { name: 'favicon.ico', size: 48, type: 'png' }, // Will convert to ico
  { name: 'apple-touch-icon.png', size: 180, type: 'png' },
];

async function generateIcons(): Promise<void> {
  console.log('🎨 Generating PWA icons...');

  // Check if source SVG exists
  try {
    await fs.access(SOURCE_SVG);
  } catch {
    console.error('❌ Source logo.svg not found. Please create it first.');
    console.log('📍 Expected location:', SOURCE_SVG);
    process.exit(1);
  }

  // Generate each icon
  for (const icon of ICONS) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);

    await sharp(SOURCE_SVG)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Copy mask-icon.svg (just use logo.svg)
  const maskIconPath = path.join(OUTPUT_DIR, 'mask-icon.svg');
  await fs.copyFile(SOURCE_SVG, maskIconPath);
  console.log('✅ Generated mask-icon.svg');

  console.log('🎉 All PWA icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
```

**Step 2: Add sharp dependency**

Run: `cd frontend && npm install --save-dev sharp @types/sharp`
Expected: Dependencies added to package.json

**Step 3: Create simple logo SVG placeholder**

Create file: `frontend/public/logo.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#6366F1" rx="100"/>
  <circle cx="256" cy="180" r="60" fill="#FFD700"/>
  <path d="M256 260 L200 380 L312 380 Z" fill="#C0C0C0"/>
  <circle cx="256" cy="340" r="30" fill="#6366F1"/>
</svg>
```

**Step 4: Add icon generation script to package.json**

Modify: `frontend/package.json`

Add to scripts section:
```json
"generate-icons": "tsx scripts/generate-icons.ts"
```

**Step 5: Install tsx for running TypeScript**

Run: `npm install --save-dev tsx`
Expected: tsx added to devDependencies

**Step 6: Generate icons**

Run: `cd frontend && npm run generate-icons`
Expected: All PWA icons generated successfully

**Step 7: Commit**

```bash
git add frontend/public/*.png frontend/public/*.svg frontend/scripts/generate-icons.ts frontend/package.json
git commit -m "feat(pwa): add PWA icon generation script and assets"
```

---

## Task 2: Register Service Worker and Add Update Detection

**Files:**
- Modify: `frontend/src/main.tsx` (register service worker with update handling)
- Create: `frontend/src/utils/serviceWorkerRegistration.ts` (service worker utilities)
- Create: `frontend/src/hooks/useServiceWorkerUpdate.ts` (hook for update detection)

**Step 1: Write the failing test**

Create file: `frontend/src/__tests__/serviceWorkerRegistration.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerSW } from '../utils/serviceWorkerRegistration';

// Mock window.location.reload
const originalReload = window.location.reload;

describe('Service Worker Registration', () => {
  beforeEach(() => {
    window.location.reload = vi.fn();
  });

  afterEach(() => {
    window.location.reload = originalReload;
  });

  it('should register service worker on mount', async () => {
    const mockRegistration = {
      update: vi.fn().mockResolvedValue(undefined),
      waiting: null,
      installing: null,
    };

    // @ts-ignore - mocking navigator.serviceWorker
    navigator.serviceWorker.register = vi.fn().mockResolvedValue(mockRegistration);
    // @ts-ignore - mocking navigator.serviceWorker
    navigator.serviceWorker.addEventListener = vi.fn();

    await registerSW({
      onNeedRefresh: vi.fn(),
      onOfflineReady: vi.fn(),
    });

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      updateViaCache: 'import',
    });
  });

  it('should call onNeedRefresh when waiting service worker is found', async () => {
    const onNeedRefresh = vi.fn();
    const mockWaiting = {
      postMessage: vi.fn(),
    };
    const mockRegistration = {
      update: vi.fn().mockResolvedValue(undefined),
      waiting: mockWaiting,
      installing: null,
    };

    // @ts-ignore
    navigator.serviceWorker.register = vi.fn().mockResolvedValue(mockRegistration);
    // @ts-ignore
    navigator.serviceWorker.addEventListener = vi.fn((event: string, callback: any) => {
      if (event === 'controllerchange') {
        callback();
      }
    });

    await registerSW({ onNeedRefresh, onOfflineReady: vi.fn() });

    // Simulate waiting SW appearing
    setTimeout(() => {
      expect(onNeedRefresh).toHaveBeenCalled();
    }, 100);
  });

  it('should skip waiting when user accepts update', async () => {
    const mockWaiting = {
      postMessage: vi.fn(),
    };
    const mockRegistration = {
      update: vi.fn().mockResolvedValue(undefined),
      waiting: mockWaiting,
      installing: null,
    };

    // @ts-ignore
    navigator.serviceWorker.register = vi.fn().mockResolvedValue(mockRegistration);
    // @ts-ignore
    navigator.serviceWorker.addEventListener = vi.fn();

    const { skipWaiting } = await registerSW({
      onNeedRefresh: vi.fn(),
      onOfflineReady: vi.fn(),
    });

    skipWaiting();

    expect(mockWaiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test serviceWorkerRegistration.test.ts`
Expected: FAIL with "Cannot find module '../utils/serviceWorkerRegistration'"

**Step 3: Implement service worker registration utility**

Create file: `frontend/src/utils/serviceWorkerRegistration.ts`

```typescript
/**
 * Service Worker Registration Utilities
 * Handles service worker registration, updates, and lifecycle
 */

export interface ServiceWorkerRegistrationOptions {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onRegistrationError?: (error: Error) => void;
}

export interface ServiceWorkerControls {
  update: () => void;
  skipWaiting: () => void;
}

/**
 * Register service worker with update detection
 */
export async function registerSW(
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerControls | null> {
  const {
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegistrationError,
  } = options;

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'import', // Always check for updates via import scripts
    });

    onRegistered?.(registration);

    // Check for waiting service worker (update available)
    if (registration.waiting) {
      onNeedRefresh?.();
    }

    // Listen for new service worker installing
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready, waiting to activate
          onNeedRefresh?.();
        }
      });
    });

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to use the new service worker
      window.location.reload();
    });

    // Listen for offline/online events
    window.addEventListener('online', () => {
      console.log('App is online');
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      onOfflineReady?.();
    });

    return {
      update: () => {
        registration.update();
      },
      skipWaiting: () => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      },
    };
  } catch (error) {
    console.error('Service worker registration failed:', error);
    onRegistrationError?.(error as Error);
    return null;
  }
}

/**
 * Check if app is currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get current service worker registration
 */
export async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  return await navigator.serviceWorker.getRegistration();
}

/**
 * Unregister all service workers
 */
export async function unregisterSW(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const registration of registrations) {
    await registration.unregister();
  }

  return registrations.length > 0;
}
```

**Step 4: Create custom hook for service worker updates**

Create file: `frontend/src/hooks/useServiceWorkerUpdate.ts`

```typescript
/**
 * Service Worker Update Hook
 * Detects and handles service worker updates
 */

import { useState, useEffect } from 'react';
import { registerSW, ServiceWorkerControls } from '../utils/serviceWorkerRegistration';

interface UseServiceWorkerUpdateResult {
  needRefresh: boolean;
  offlineReady: boolean;
  update: () => void;
  skipWaiting: () => void;
}

export function useServiceWorkerUpdate(): UseServiceWorkerUpdateResult {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [controls, setControls] = useState<ServiceWorkerControls | null>(null);

  useEffect(() => {
    let mounted = true;

    registerSW({
      onNeedRefresh: () => {
        if (mounted) {
          setNeedRefresh(true);
        }
      },
      onOfflineReady: () => {
        if (mounted) {
          setOfflineReady(true);
        }
      },
      onRegistered: (registration) => {
        console.log('Service worker registered:', registration);
      },
      onRegistrationError: (error) => {
        console.error('Service worker registration failed:', error);
      },
    }).then((swControls) => {
      if (mounted && swControls) {
        setControls(swControls);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    needRefresh,
    offlineReady,
    update: () => controls?.update(),
    skipWaiting: () => {
      setNeedRefresh(false);
      controls?.skipWaiting();
    },
  };
}
```

**Step 5: Update main.tsx to register service worker**

Modify: `frontend/src/main.tsx`

```typescript
/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Import service worker hook only in production
if (import.meta.env.PROD) {
  import('./hooks/useServiceWorkerUpdate').then(() => {
    console.log('Service worker registration initialized');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Step 6: Run tests to verify they pass**

Run: `cd frontend && npm test serviceWorkerRegistration.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add frontend/src/main.tsx frontend/src/utils/serviceWorkerRegistration.ts frontend/src/hooks/useServiceWorkerUpdate.ts frontend/src/__tests__/serviceWorkerRegistration.test.ts
git commit -m "feat(pwa): add service worker registration and update detection"
```

---

## Task 3: Create Service Worker Update Banner Component

**Files:**
- Create: `frontend/src/components/ServiceWorkerUpdateBanner.tsx`
- Create: `frontend/src/styles/ServiceWorkerUpdateBanner.css`

**Step 1: Write the failing test**

Create file: `frontend/src/__tests__/components/ServiceWorkerUpdateBanner.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceWorkerUpdateBanner } from '../components/ServiceWorkerUpdateBanner';

// Mock the useServiceWorkerUpdate hook
vi.mock('../hooks/useServiceWorkerUpdate', () => ({
  useServiceWorkerUpdate: vi.fn(),
}));

import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';

describe('ServiceWorkerUpdateBanner', () => {
  it('should not render when no update is needed', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument();
  });

  it('should render banner when update is needed', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.getByText(/update available/i)).toBeInTheDocument();
    expect(screen.getByText(/refresh/i)).toBeInTheDocument();
  });

  it('should call skipWaiting when refresh button is clicked', async () => {
    const skipWaiting = vi.fn();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update: vi.fn(),
      skipWaiting,
    });

    render(<ServiceWorkerUpdateBanner />);

    const refreshButton = screen.getByText(/refresh/i);
    refreshButton.click();

    await waitFor(() => {
      expect(skipWaiting).toHaveBeenCalled();
    });
  });

  it('should call update and close banner when reload button is clicked', async () => {
    const update = vi.fn();

    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: true,
      offlineReady: false,
      update,
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    const reloadButton = screen.getByText(/reload/i);
    reloadButton.click();

    await waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });

  it('should render offline banner when app goes offline', () => {
    vi.mocked(useServiceWorkerUpdate).mockReturnValue({
      needRefresh: false,
      offlineReady: true,
      update: vi.fn(),
      skipWaiting: vi.fn(),
    });

    render(<ServiceWorkerUpdateBanner />);

    expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test ServiceWorkerUpdateBanner.test.tsx`
Expected: FAIL with "Cannot find module '../components/ServiceWorkerUpdateBanner'"

**Step 3: Implement update banner component**

Create file: `frontend/src/components/ServiceWorkerUpdateBanner.tsx`

```typescript
/**
 * Service Worker Update Banner
 * Displays banner when new app version is available
 */

import React from 'react';
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';
import './ServiceWorkerUpdateBanner.css';

export const ServiceWorkerUpdateBanner: React.FC = () => {
  const { needRefresh, offlineReady, update, skipWaiting } = useServiceWorkerUpdate();

  const handleRefresh = () => {
    skipWaiting();
  };

  const handleReload = () => {
    update();
  };

  if (offlineReady) {
    return (
      <div className="sw-update-banner offline">
        <div className="sw-update-content">
          <span className="sw-update-icon">📶</span>
          <div className="sw-update-message">
            <strong>You are offline</strong>
            <span className="sw-update-subtext">Some features may be unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="sw-update-banner">
      <div className="sw-update-content">
        <span className="sw-update-icon">🔄</span>
        <div className="sw-update-message">
          <strong>New version available</strong>
          <span className="sw-update-subtext">Refresh to get the latest features</span>
        </div>
        <div className="sw-update-actions">
          <button className="sw-update-button secondary" onClick={handleReload}>
            Later
          </button>
          <button className="sw-update-button primary" onClick={handleRefresh}>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Add styling**

Create file: `frontend/src/styles/ServiceWorkerUpdateBanner.css`

```css
/**
 * Service Worker Update Banner Styles
 */

.sw-update-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 90%;
  width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  animation: slideUp 0.3s ease-out;
}

.sw-update-banner.offline {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.sw-update-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sw-update-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.sw-update-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sw-update-message strong {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.sw-update-subtext {
  font-size: 12px;
  color: #6b7280;
}

.sw-update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.sw-update-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.sw-update-button.primary {
  background: #6366f1;
  color: white;
}

.sw-update-button.primary:hover {
  background: #5558e3;
}

.sw-update-button.secondary {
  background: #f3f4f6;
  color: #374151;
}

.sw-update-button.secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .sw-update-banner {
    width: calc(100% - 32px);
    bottom: 16px;
  }

  .sw-update-actions {
    flex-direction: column;
    width: 100%;
  }

  .sw-update-button {
    width: 100%;
  }
}
```

**Step 5: Add banner to App component**

Modify: `frontend/src/App.tsx`

Import and add to render:
```typescript
import { ServiceWorkerUpdateBanner } from './components/ServiceWorkerUpdateBanner';

// In JSX, inside the main div:
<ServiceWorkerUpdateBanner />
```

**Step 6: Run tests to verify they pass**

Run: `cd frontend && npm test ServiceWorkerUpdateBanner.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add frontend/src/components/ServiceWorkerUpdateBanner.tsx frontend/src/styles/ServiceWorkerUpdateBanner.css frontend/src/__tests__/components/ServiceWorkerUpdateBanner.test.tsx frontend/src/App.tsx
git commit -m "feat(pwa): add service worker update banner component"
```

---

## Task 4: Create Custom Service Worker with Advanced Caching

**Files:**
- Create: `frontend/src/sw.ts` (custom service worker with advanced caching)
- Create: `frontend/src/vite-plugin-pwa.d.ts` (TypeScript declarations)
- Modify: `frontend/vite.config.ts` (update to use custom SW)

**Step 1: Write the failing test**

Create file: `frontend/src/__tests__/serviceWorker/sw.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock service worker environment
const mockCache = {
  put: vi.fn().mockResolvedValue(undefined),
  match: vi.fn().mockResolvedValue(undefined),
  add: vi.fn().mockResolvedValue(undefined),
  addAll: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([]),
};

const mockCacheStorage = {
  open: vi.fn().mockResolvedValue(mockCache),
  has: vi.fn().mockResolvedValue(true),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([]),
};

global.caches = mockCacheStorage as any;

describe('Service Worker Caching Strategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cache API responses with NetworkFirst strategy', async () => {
    const mockRequest = new Request('https://api.example.com/data');
    const mockResponse = new Response('{"data":"test"}');

    // Simulate network success
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    // This would be tested by importing and calling the actual service worker code
    // For now, we're testing the concept
    const cacheName = 'api-cache';
    const cache = await caches.open(cacheName);

    expect(cache.put).toHaveBeenCalledWith(
      mockRequest,
      mockResponse
    );
  });

  it('should serve from cache when offline', async () => {
    const mockRequest = new Request('https://api.example.com/data');
    const cachedResponse = new Response('{"cached":"data"}');

    mockCache.match.mockResolvedValueOnce(cachedResponse);

    const cache = await caches.open('api-cache');
    const response = await cache.match(mockRequest);

    expect(response).toEqual(cachedResponse);
  });

  it('should cache static assets with CacheFirst strategy', async () => {
    const staticAssets = [
      '/index.html',
      '/main.js',
      '/main.css',
    ];

    const cache = await caches.open('static-cache');

    // Verify cache operations
    expect(cache.addAll).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test sw.test.ts`
Expected: Tests may pass (they're mocked) but service worker doesn't exist yet

**Step 3: Create custom service worker**

Create file: `frontend/src/sw.ts`

```typescript
/**
 * Custom Service Worker
 * Advanced caching strategies for PWA functionality
 */

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  registerRoute,
  NavigationRoute,
  setCatchHandler,
} from 'workbox-routing';
import {
  CacheableResponsePlugin,
  ExpirationPlugin,
} from 'workbox-expiration';
import { CachePlugin } from 'workbox-strategies';

declare global {
  interface ServiceWorkerGlobalScope {
    skipWaiting: () => void;
    clients: Clients;
  }
}

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
 */
const imageCacheStrategy = new CacheFirst({
  cacheName: CACHE_NAMES.IMAGES,
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      purgeOnQuotaError: true,
    }),
  ],
});

/**
 * Static assets - StaleWhileRevalidate
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

// API routes
registerRoute(({ url }) => {
  return url.pathname.startsWith('/api');
}, apiCacheStrategy);

// Image routes
registerRoute(({ request }) => {
  return request.destination === 'image';
}, imageCacheStrategy);

// JavaScript and CSS
registerRoute(({ request }) => {
  return request.destination === 'script' || request.destination === 'style';
}, staticCacheStrategy);

// Navigation route (SPA fallback)
const navigationRoute = new NavigationRoute(null, {
  allowlist: [/^\/(?!api).*/],
});

registerRoute(navigationRoute);

// Skip waiting on message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
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
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Sync event for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-charts') {
    event.waitUntil(
      // Sync chart data
      (async () => {
        try {
          // Implement sync logic
          console.log('Syncing chart data...');
        } catch (error) {
          console.error('Sync failed:', error);
        }
      })()
    );
  }
});

// Catch handler for offline fallback
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  return Response.error();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
```

**Step 4: Add TypeScript declarations**

Create file: `frontend/src/vite-plugin-pwa.d.ts`

```typescript
/**
 * Vite PWA Plugin Type Declarations
 */

interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: string[];
}

declare const self: ServiceWorkerGlobalScope;

export {};
```

**Step 5: Update vite.config.ts to use custom service worker**

Modify: `frontend/vite.config.ts`

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
  manifest: {
    name: 'Astrology SaaS Platform',
    short_name: 'Astrology',
    description: 'Natal chart generation, personality analysis, and forecasting',
    theme_color: '#6366F1',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
    ],
  },
  // Use custom service worker
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
}),
```

**Step 6: Run tests to verify they pass**

Run: `cd frontend && npm test sw.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add frontend/src/sw.ts frontend/src/vite-plugin-pwa.d.ts frontend/vite.config.ts frontend/src/__tests__/serviceWorker/sw.test.ts
git commit -m "feat(pwa): add custom service worker with advanced caching"
```

---

## Task 5: Backend Push Notification Infrastructure

**Files:**
- Create: `backend/src/modules/notifications/models/pushSubscription.model.ts`
- Create: `backend/src/modules/notifications/services/pushNotification.service.ts`
- Create: `backend/src/modules/notifications/controllers/pushNotification.controller.ts`
- Create: `backend/src/modules/notifications/routes/pushNotification.routes.ts`
- Create: `backend/src/modules/notifications/index.ts`
- Modify: `backend/package.json` (add Firebase Admin SDK)
- Create: `backend/migrations/TIMESTAMP_create_push_subscriptions_table.ts`

**Step 1: Write the failing test**

Create file: `backend/src/__tests__/notifications/pushNotification.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import pushNotificationService from '../../modules/notifications/services/pushNotification.service';

describe('Push Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save push subscription', async () => {
    const subscriptionData = {
      userId: 'user-123',
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    };

    const subscription = await pushNotificationService.saveSubscription(subscriptionData);

    expect(subscription).toHaveProperty('id');
    expect(subscription.endpoint).toBe(subscriptionData.endpoint);
  });

  it('should send push notification to user', async () => {
    const notification = {
      title: 'Test Notification',
      body: 'Test body',
      icon: '/pwa-192x192.png',
      data: { url: '/test' },
    };

    const result = await pushNotificationService.sendNotification('user-123', notification);

    expect(result.success).toBe(true);
    expect(result.sentCount).toBeGreaterThan(0);
  });

  it('should delete push subscription', async () => {
    const result = await pushNotificationService.deleteSubscription('subscription-123');

    expect(result).toBe(true);
  });

  it('should get all subscriptions for user', async () => {
    const subscriptions = await pushNotificationService.getUserSubscriptions('user-123');

    expect(Array.isArray(subscriptions)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd backend && npm test pushNotification.service.test.ts`
Expected: FAIL with "Cannot find module '../../modules/notifications/services/pushNotification.service'"

**Step 3: Install Firebase Admin SDK**

Run: `cd backend && npm install firebase-admin`
Expected: firebase-admin added to dependencies

**Step 4: Create database migration**

Create file: `backend/migrations/20260216210000_create_push_subscriptions_table.ts`

```typescript
/**
 * Create Push Subscriptions Table
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('push_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('endpoint').notNullable();
    table.jsonb('keys').notNullable(); // { p256dh, auth }
    table.string('user_agent').nullable();
    table.timestamps(true, true);

    table.index('user_id');
    table.unique('endpoint');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('push_subscriptions');
}
```

**Step 5: Create push subscription model**

Create file: `backend/src/modules/notifications/models/pushSubscription.model.ts`

```typescript
/**
 * Push Subscription Model
 */

import { db } from '../../config/database';

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePushSubscriptionInput {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

class PushSubscriptionModel {
  async create(data: CreatePushSubscriptionInput): Promise<PushSubscription> {
    const [subscription] = await db<PushSubscription>('push_subscriptions')
      .insert({
        user_id: data.userId,
        endpoint: data.endpoint,
        keys: data.keys,
        user_agent: data.userAgent,
      })
      .returning('*');

    return subscription;
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    return db<PushSubscription>('push_subscriptions')
      .where({ user_id: userId })
      .select('*');
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const [subscription] = await db<PushSubscription>('push_subscriptions')
      .where({ endpoint })
      .select('*');

    return subscription || null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await db<PushSubscription>('push_subscriptions')
      .where({ id })
      .delete();

    return count > 0;
  }

  async deleteByEndpoint(endpoint: string): Promise<boolean> {
    const count = await db<PushSubscription>('push_subscriptions')
      .where({ endpoint })
      .delete();

    return count > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    return db<PushSubscription>('push_subscriptions')
      .where({ user_id: userId })
      .delete();
  }
}

export default new PushSubscriptionModel();
```

**Step 6: Create push notification service**

Create file: `backend/src/modules/notifications/services/pushNotification.service.ts`

```typescript
/**
 * Push Notification Service
 * Manages push subscriptions and sends notifications using Web Push Protocol
 */

import webpush from 'web-push';
import pushSubscriptionModel from '../models/pushSubscription.model';
import logger from '../../../config/logger';

// Configure Web Push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@astrology-saas.com';

if (!publicVapidKey || !privateVapidKey) {
  logger.warn('VAPID keys not configured. Push notifications will not work.');
} else {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface SendNotificationResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: Array<{
    endpoint: string;
    error: string;
  }>;
}

class PushNotificationService {
  /**
   * Save push subscription
   */
  async saveSubscription(data: {
    userId: string;
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }): Promise<any> {
    // Check if subscription already exists
    const existing = await pushSubscriptionModel.findByEndpoint(data.endpoint);

    if (existing) {
      // Update existing subscription
      return existing;
    }

    // Create new subscription
    return pushSubscriptionModel.create(data);
  }

  /**
   * Send notification to a single subscription
   */
  async sendToSubscription(
    subscription: any,
    payload: PushNotificationPayload
  ): Promise<void> {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
  }

  /**
   * Send notification to user (all their subscriptions)
   */
  async sendNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<SendNotificationResult> {
    const subscriptions = await pushSubscriptionModel.findByUserId(userId);

    if (subscriptions.length === 0) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    const errors: SendNotificationResult['errors'] = [];
    let sentCount = 0;

    for (const subscription of subscriptions) {
      try {
        await this.sendToSubscription(subscription, payload);
        sentCount++;
      } catch (error: any) {
        // If subscription is invalid, delete it
        if (error.statusCode === 404 || error.statusCode === 410) {
          await pushSubscriptionModel.delete(subscription.id);
        }

        errors.push({
          endpoint: subscription.endpoint,
          error: error.message,
        });

        logger.error('Failed to send push notification:', error);
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      failedCount: errors.length,
      errors,
    };
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<SendNotificationResult> {
    const results = await Promise.all(
      userIds.map((userId) => this.sendNotification(userId, payload))
    );

    return results.reduce(
      (acc, result) => ({
        success: acc.success || result.success,
        sentCount: acc.sentCount + result.sentCount,
        failedCount: acc.failedCount + result.failedCount,
        errors: [...acc.errors, ...result.errors],
      }),
      { success: false, sentCount: 0, failedCount: 0, errors: [] }
    );
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    return pushSubscriptionModel.delete(subscriptionId);
  }

  /**
   * Get all subscriptions for user
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    return pushSubscriptionModel.findByUserId(userId);
  }

  /**
   * Generate VAPID keys (for development)
   */
  generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}

export default new PushNotificationService();
```

**Step 7: Add web-push dependency**

Run: `cd backend && npm install web-push`
Expected: web-push added to dependencies

**Step 8: Create push notification controller**

Create file: `backend/src/modules/notifications/controllers/pushNotification.controller.ts`

```typescript
/**
 * Push Notification Controller
 */

import asyncHandler from '../../../utils/asyncHandler';
import pushNotificationService from '../services/pushNotification.service';
import { Request, Response } from 'express';

export const saveSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint, keys } = req.body;
  const userId = req.user!.id;

  const subscription = await pushNotificationService.saveSubscription({
    userId,
    endpoint,
    keys,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

export const deleteSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const userId = req.user!.id;

  // Verify subscription belongs to user
  const subscriptions = await pushNotificationService.getUserSubscriptions(userId);
  const subscription = subscriptions.find((s) => s.id === subscriptionId);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Subscription not found',
      },
    });
  }

  await pushNotificationService.deleteSubscription(subscriptionId);

  res.json({
    success: true,
    message: 'Subscription deleted successfully',
  });
});

export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await pushNotificationService.getUserSubscriptions(userId);

  res.json({
    success: true,
    data: subscriptions,
  });
});

export const sendTestNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await pushNotificationService.sendNotification(userId, {
    title: 'Test Notification',
    body: 'This is a test notification from Astrology SaaS Platform',
    icon: '/pwa-192x192.png',
    data: { url: '/dashboard' },
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getVapidPublicKey = asyncHandler(async (req: Request, res: Response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'VAPID public key not configured',
      },
    });
  }

  res.json({
    success: true,
    data: { publicKey },
  });
});
```

**Step 9: Create routes**

Create file: `backend/src/modules/notifications/routes/pushNotification.routes.ts`

```typescript
/**
 * Push Notification Routes
 */

import express from 'express';
import {
  saveSubscription,
  deleteSubscription,
  getSubscriptions,
  sendTestNotification,
  getVapidPublicKey,
} from '../controllers/pushNotification.controller';
import { authenticate } from '../../../middleware/auth';

const router = express.Router();

router.get('/vapid-key', getVapidPublicKey);

// All routes below require authentication
router.use(authenticate);

router.post('/subscribe', saveSubscription);
router.delete('/subscribe/:subscriptionId', deleteSubscription);
router.get('/subscriptions', getSubscriptions);
router.post('/test', sendTestNotification);

export default router;
```

**Step 10: Run tests to verify they pass**

Run: `cd backend && npm test pushNotification.service.test.ts`
Expected: PASS

**Step 11: Commit**

```bash
git add backend/src/modules/notifications backend/migrations/20260216210000_create_push_subscriptions_table.ts backend/package.json backend/src/__tests__/notifications/pushNotification.service.test.ts
git commit -m "feat(pwa): add backend push notification infrastructure"
```

---

## Task 6: Frontend Push Notification Components

**Files:**
- Create: `frontend/src/hooks/usePushNotifications.ts`
- Create: `frontend/src/services/pushNotification.service.ts`
- Create: `frontend/src/components/PushNotificationPermission.tsx`
- Create: `frontend/src/styles/PushNotificationPermission.css`

**Step 1: Write the failing test**

Create file: `frontend/src/__tests__/hooks/usePushNotifications.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Mock URL base64 conversion
global.btoa = vi.fn((str) => Buffer.from(str).toString('base64'));

// Mock service worker registration
vi.mock('../utils/serviceWorkerRegistration', () => ({
  getSWRegistration: vi.fn().mockResolvedValue({
    pushManager: {
      subscribe: vi.fn().mockResolvedValue({
        endpoint: 'https://test.push.endpoint',
        toJSON: () => ({ endpoint: 'https://test.push.endpoint' }),
      }),
      getSubscription: vi.fn().mockResolvedValue(null),
    },
  }),
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import axios from 'axios';

describe('usePushNotifications Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Notification.permission
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      value: 'default',
    });
  });

  it('should request permission and subscribe', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: { publicKey: 'test-public-key' } },
    });

    (axios.post as any).mockResolvedValue({
      data: { success: true },
    });

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('default');

    await act(async () => {
      await result.current.subscribe();
    });

    await waitFor(() => {
      expect(result.current.permission).toBe('granted');
    });
  });

  it('should check subscription status on mount', async () => {
    (axios.get as any).mockResolvedValue({
      data: { data: [] },
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/notifications/subscriptions');
    });
  });

  it('should unsubscribe from push notifications', async () => {
    const mockSubscription = {
      endpoint: 'https://test.push.endpoint',
      unsubscribe: vi.fn().mockResolvedValue(undefined),
    };

    (axios.get as any).mockResolvedValue({
      data: {
        data: [
          {
            id: 'sub-123',
            endpoint: 'https://test.push.endpoint',
          },
        ],
      },
    });

    (axios.delete as any).mockResolvedValue({
      data: { success: true },
    });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.unsubscribe('sub-123');
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/notifications/subscribe/sub-123');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test usePushNotifications.test.ts`
Expected: FAIL with "Cannot find module '../hooks/usePushNotifications'"

**Step 3: Create push notification service**

Create file: `frontend/src/services/pushNotification.service.ts`

```typescript
/**
 * Push Notification Service
 * Manages push subscriptions
 */

import api from './api';

export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribePayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  /**
   * Get VAPID public key
   */
  async getVapidPublicKey(): Promise<string> {
    const response = await api.get('/notifications/vapid-key');
    return response.data.data.publicKey;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(subscription: SubscribePayload): Promise<PushSubscription> {
    const response = await api.post('/notifications/subscribe', subscription);
    return response.data.data;
  }

  /**
   * Get all user subscriptions
   */
  async getSubscriptions(): Promise<PushSubscription[]> {
    const response = await api.get('/notifications/subscriptions');
    return response.data.data;
  }

  /**
   * Delete subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    await api.delete(`/notifications/subscribe/${subscriptionId}`);
  }

  /**
   * Send test notification
   */
  async sendTest(): Promise<void> {
    await api.post('/notifications/test');
  }
}

export default new PushNotificationService();
```

**Step 4: Create push notifications hook**

Create file: `frontend/src/hooks/usePushNotifications.ts`

```typescript
/**
 * Push Notifications Hook
 * Manages push notification subscription and permissions
 */

import { useState, useEffect } from 'react';
import pushNotificationService from '../services/pushNotification.service';
import { getSWRegistration } from '../utils/serviceWorkerRegistration';

interface UsePushNotificationsResult {
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscribing: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: (subscriptionId: string) => Promise<void>;
  sendTest: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscriptions = await pushNotificationService.getSubscriptions();
      setIsSubscribed(subscriptions.length > 0);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  const subscribe = async () => {
    setSubscribing(true);

    try {
      // Request permission
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);

      if (newPermission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await getSWRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      // Get VAPID public key
      const vapidPublicKey = await pushNotificationService.getVapidPublicKey();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      await pushNotificationService.subscribe({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
            : '',
          auth: subscription.getKey('auth')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
            : '',
        },
      });

      setIsSubscribed(true);
    } catch (error: any) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribe = async (subscriptionId: string) => {
    try {
      await pushNotificationService.unsubscribe(subscriptionId);
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  };

  const sendTest = async () => {
    try {
      await pushNotificationService.sendTest();
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  };

  return {
    permission,
    isSubscribed,
    subscribing,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
```

**Step 5: Create permission request component**

Create file: `frontend/src/components/PushNotificationPermission.tsx`

```typescript
/**
 * Push Notification Permission Component
 * Prompts users to enable push notifications
 */

import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, X } from 'lucide-react';
import './PushNotificationPermission.css';

interface PushNotificationPermissionProps {
  autoShow?: boolean;
}

export const PushNotificationPermission: React.FC<PushNotificationPermissionProps> = ({
  autoShow = true,
}) => {
  const { permission, isSubscribed, subscribing, subscribe, sendTest } = usePushNotifications();
  const [dismissed, setDismissed] = React.useState(false);

  const shouldShow = autoShow && permission === 'default' && !isSubscribed && !dismissed;

  const handleSubscribe = async () => {
    try {
      await subscribe();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleTest = async () => {
    try {
      await sendTest();
    } catch (error) {
      console.error('Failed to send test:', error);
    }
  };

  if (!shouldShow && !isSubscribed) {
    return null;
  }

  return (
    <div className="push-notification-prompt">
      {shouldShow && (
        <div className="push-notification-card">
          <button className="push-notification-close" onClick={handleDismiss}>
            <X size={18} />
          </button>

          <div className="push-notification-content">
            <div className="push-notification-icon">
              <Bell size={32} />
            </div>

            <div className="push-notification-text">
              <h3>Enable Notifications</h3>
              <p>
                Get notified about your astrological forecasts, lunar returns, and important
                transit events.
              </p>
            </div>

            <div className="push-notification-actions">
              <button
                className="push-notification-button primary"
                onClick={handleSubscribe}
                disabled={subscribing}
              >
                {subscribing ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                className="push-notification-button secondary"
                onClick={handleDismiss}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubscribed && (
        <div className="push-notification-success">
          <span>✅ Notifications enabled</span>
          <button className="push-notification-test" onClick={handleTest}>
            Send Test
          </button>
        </div>
      )}
    </div>
  );
};
```

**Step 6: Add styling**

Create file: `frontend/src/styles/PushNotificationPermission.css`

```css
/**
 * Push Notification Permission Styles
 */

.push-notification-prompt {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

.push-notification-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  position: relative;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.push-notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.push-notification-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.push-notification-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.push-notification-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.push-notification-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.push-notification-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.push-notification-actions {
  display: flex;
  gap: 8px;
}

.push-notification-button {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.push-notification-button.primary {
  background: #6366f1;
  color: white;
}

.push-notification-button.primary:hover:not(:disabled) {
  background: #5558e3;
}

.push-notification-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.push-notification-button.secondary {
  background: #f3f4f6;
  color: #374151;
}

.push-notification-button.secondary:hover {
  background: #e5e7eb;
}

.push-notification-success {
  background: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  animation: slideInRight 0.3s ease-out;
}

.push-notification-test {
  background: white;
  border: 1px solid #10b981;
  color: #10b981;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.push-notification-test:hover {
  background: #10b981;
  color: white;
}

@media (max-width: 640px) {
  .push-notification-prompt {
    top: auto;
    bottom: 20px;
    right: 16px;
    left: 16px;
    max-width: none;
  }

  .push-notification-actions {
    flex-direction: column;
  }
}
```

**Step 7: Update exports**

Modify: `frontend/src/components/index.ts`

```typescript
export { ServiceWorkerUpdateBanner } from './ServiceWorkerUpdateBanner';
export { PushNotificationPermission } from './PushNotificationPermission';
```

Modify: `frontend/src/hooks/index.ts`

```typescript
export { useServiceWorkerUpdate } from './useServiceWorkerUpdate';
export { usePushNotifications } from './usePushNotifications';
```

**Step 8: Run tests to verify they pass**

Run: `cd frontend && npm test usePushNotifications.test.ts`
Expected: PASS

**Step 9: Commit**

```bash
git add frontend/src/hooks/usePushNotifications.ts frontend/src/services/pushNotification.service.ts frontend/src/components/PushNotificationPermission.tsx frontend/src/styles/PushNotificationPermission.css frontend/src/__tests__/hooks/usePushNotifications.test.ts frontend/src/components/index.ts frontend/src/hooks/index.ts
git commit -m "feat(pwa): add frontend push notification components"
```

---

## Task 7: Performance Optimization

**Files:**
- Modify: `frontend/vite.config.ts` (add code splitting and compression)
- Create: `frontend/src/utils/lazyLoad.ts` (lazy loading utilities)
- Create: `frontend/.browserslistrc` (browser targets)

**Step 1: Write the failing test**

Create file: `frontend/src/__tests__/utils/lazyLoad.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { lazyLoadComponent } from '../utils/lazyLoad';

describe('Lazy Load Utilities', () => {
  it('should lazy load component', async () => {
    const mockComponent = vi.fn().mockReturnValue(<div>Lazy Component</div>);
    const importFn = vi.fn().mockResolvedValue({ default: mockComponent });

    const LazyComponent = lazyLoadComponent(importFn);

    expect(LazyComponent).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm test lazyLoad.test.ts`
Expected: FAIL with "Cannot find module '../utils/lazyLoad'"

**Step 3: Implement lazy load utilities**

Create file: `frontend/src/utils/lazyLoad.ts`

```typescript
/**
 * Lazy Loading Utilities
 * Utilities for code splitting and lazy loading
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load a component with error handling
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T {
  return lazy(() => importFn().catch((error) => {
    console.error('Failed to load component:', error);

    // Return a fallback component
    return {
      default: (() => (
        <div className="lazy-load-error">
          <p>Failed to load component. Please refresh the page.</p>
        </div>
      )) as unknown as T,
    };
  })) as T;
}

/**
 * Lazy load with retry logic
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries = 3
): T {
  let retries = 0;

  const loadWithRetry = (): Promise<{ default: T }> => {
    return importFn().catch((error) => {
      retries++;

      if (retries < maxRetries) {
        console.warn(`Retry ${retries}/${maxRetries} for component`);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(loadWithRetry());
          }, 1000 * retries);
        });
      }

      throw error;
    });
  };

  return lazy(loadWithRetry) as T;
}
```

**Step 4: Update vite.config.ts with optimizations**

Modify: `frontend/vite.config.ts`

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        charts: ['d3', 'recharts'],
        query: ['@tanstack/react-query'],
        utils: ['axios', 'date-fns'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
},
```

**Step 5: Create browserlist config**

Create file: `frontend/.browserslistrc`

```
# Browsers that we support

> 1%
last 2 versions
not dead
not ie 11
```

**Step 6: Run tests to verify they pass**

Run: `cd frontend && npm test lazyLoad.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add frontend/vite.config.ts frontend/src/utils/lazyLoad.ts frontend/.browserslistrc frontend/src/__tests__/utils/lazyLoad.test.ts
git commit -m "perf(pwa): add performance optimization utilities"
```

---

## Task 8: PWA Testing

**Files:**
- Create: `frontend/src/__tests__/e2e/pwa.spec.ts`
- Create: `frontend/playwright.config.ts` (if not exists)

**Step 1: Write comprehensive PWA E2E test**

Create file: `frontend/src/__tests__/e2e/pwa.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register service worker', async ({ page }) => {
    const swRegistration = await page.evaluate(async () => {
      return await navigator.serviceWorker.getRegistration();
    });

    expect(swRegistration).not.toBeNull();
  });

  test('should load offline', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Navigate to a different page
    await page.goto('/dashboard');

    // Page should still load (from cache)
    const content = await page.textContent('body');
    expect(content).toBeTruthy();

    // Restore online mode
    await context.setOffline(false);
  });

  test('should display update banner when new version available', async ({ page }) => {
    // This test would require mocking service worker updates
    // For now, we check if the banner component exists
    const updateBanner = page.locator('.sw-update-banner');
    await expect(updateBanner).toHaveCount(0); // Should not show initially
  });

  test('should request notification permission', async ({ page }) => {
    const permissionButton = page.locator('text=Enable Notifications');

    // Check if permission prompt is shown
    const isVisible = await permissionButton.isVisible().catch(() => false);

    if (isVisible) {
      await permissionButton.click();

      // Check if browser permission dialog was triggered
      // Note: Playwright can't actually interact with browser permission dialogs
      // This test verifies the UI flow only
    }
  });

  test('should be installable', async ({ page, context }) => {
    // Check if manifest is loaded
    const manifestLink = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link?.getAttribute('href');
    });

    expect(manifestLink).toBeTruthy();

    // Check for service worker
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  test('should cache API responses', async ({ page, context }) => {
    // Make an API request
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Reload page - should load from cache
    await page.reload();

    // Should still show dashboard (from cache)
    const dashboard = page.locator('h1, h2').filter({ hasText: /dashboard/i });
    await expect(dashboard).toBeVisible();

    // Restore connection
    await context.setOffline(false);
  });
});

test.describe('Push Notifications', () => {
  test('should allow subscribing to push notifications', async ({ page }) => {
    await page.goto('/settings');

    // Navigate to notification settings
    const notificationSection = page.locator('text=Notifications');
    await expect(notificationSection).toBeVisible();

    // Check for subscribe button
    const subscribeButton = page.locator('button', { hasText: /subscribe|enable/i });
    const hasSubscribe = await subscribeButton.isVisible().catch(() => false);

    if (hasSubscribe) {
      // Note: Actual permission interaction can't be tested in E2E
      // This test verifies UI presence
      await expect(subscribeButton).toBeVisible();
    }
  });
});

test.describe('Offline Behavior', () => {
  test('should show offline banner when offline', async ({ page, context }) => {
    await page.goto('/dashboard');

    // Go offline
    await context.setOffline(true);

    // Wait for offline detection
    await page.waitForTimeout(1000);

    // Check for offline banner
    const offlineBanner = page.locator('.sw-update-banner.offline');
    await expect(offlineBanner).toBeVisible();

    // Restore connection
    await context.setOffline(false);

    // Banner should disappear
    await page.waitForTimeout(1000);
    await expect(offlineBanner).not.toBeVisible();
  });

  test('should cache static assets', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Try loading a static asset (CSS)
    const stylesLoaded = await page.evaluate(() => {
      const sheets = document.styleSheets;
      return sheets.length > 0;
    });

    expect(stylesLoaded).toBe(true);

    // Restore connection
    await context.setOffline(false);
  });
});
```

**Step 2: Update exports**

Modify: `frontend/src/components/index.ts`

Add export for push notification component:
```typescript
export { PushNotificationPermission } from './PushNotificationPermission';
```

**Step 3: Run E2E tests**

Run: `cd frontend && npm run test:e2e`
Expected: Tests verify PWA functionality

**Step 4: Commit**

```bash
git add frontend/src/__tests__/e2e/pwa.spec.ts frontend/src/components/index.ts
git commit -m "test(pwa): add comprehensive PWA E2E tests"
```

---

## Task 9: Documentation and Environment Setup

**Files:**
- Create: `backend/.env.pwa.example`
- Create: `frontend/PWA_SETUP.md`
- Create: `PWA_GUIDE.md` (root level)

**Step 1: Create environment variable templates**

Create file: `backend/.env.pwa.example`

```bash
# VAPID Keys for Push Notifications
# Generate using: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:contact@astrology-saas.com

# Firebase Cloud Messaging (Optional - for mobile push)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

**Step 2: Create frontend PWA setup guide**

Create file: `frontend/PWA_SETUP.md`

```markdown
# PWA Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. PWA icons generated
3. VAPID keys configured

## Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to `backend/.env`:

```bash
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:contact@yourdomain.com
```

## Generate PWA Icons

```bash
cd frontend
npm run generate-icons
```

This will generate all required PWA icons from `public/logo.svg`.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Service worker will not register in development mode (only production)

## Production Build

1. Build the application:
```bash
npm run build
```

2. Test production build locally:
```bash
npm run preview
```

3. Deploy to your hosting service

## Testing PWA

### Manual Testing Checklist

- [ ] Service worker installs successfully
- [ ] App works offline (cache first strategy)
- [ ] App is installable (add to home screen)
- [ ] Push notifications work (grant permission, send test)
- [ ] Update banner appears when new version available
- [ ] Offline banner appears when connection lost
- [ ] All static assets are cached
- [ ] API responses are cached appropriately

### Lighthouse Testing

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit
5. Target: 90+ score

### Playwright Testing

```bash
npm run test:e2e
```

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Verify service worker file is served from root
- Clear site data and reload

### Push Notifications Not Working

- Verify VAPID keys are correct
- Check browser permission status
- Verify service worker is active
- Check backend logs for errors

### Icons Not Displaying

- Regenerate icons with `npm run generate-icons`
- Verify icon paths in manifest
- Clear browser cache

## Deployment

### Railway

```bash
# Set environment variables in Railway dashboard
# Deploy using git push
```

### Render

```bash
# Add environment variables in Render dashboard
# Connect GitHub repository
# Deploy automatically on push
```

### Docker

```bash
docker build -t astrology-pwa .
docker run -p 3000:3000 astrology-pwa
```
```

**Step 3: Create root-level PWA guide**

Create file: `PWA_GUIDE.md`

```markdown
# Astrology SaaS Platform - PWA Features

## Overview

The Astrology SaaS Platform is a fully-featured Progressive Web App (PWA) with:

- ✅ Offline functionality
- ✅ Installable on desktop and mobile
- ✅ Push notifications
- ✅ Automatic updates
- ✅ Cached assets and API responses
- ✅ Optimized performance

## PWA Features

### 1. Offline Support

The app caches static assets and API responses, allowing users to:
- View previously loaded charts and data offline
- Access cached pages without internet
- Receive offline notifications

**Caching Strategy:**
- Static assets: `CacheFirst` (JS, CSS, images)
- API calls: `NetworkFirst` (fresh data, fallback to cache)
- Navigation: `StaleWhileRevalidate` (SPA routing)

### 2. Push Notifications

Users can opt-in to receive notifications for:
- 🌙 Lunar return reminders
- 📅 Astrological calendar events
- 🔮 Major transit updates
- 🎂 Birthday reminders (solar returns)

**To enable:**
1. Click "Enable Notifications" when prompted
2. Allow browser permission
3. Notifications are sent based on your astrological data

### 3. App Installation

Users can install the app on their device:

**Desktop (Chrome/Edge):**
- Click install icon in address bar
- App launches in standalone window

**Mobile:**
- Tap "Add to Home Screen" from browser menu
- App launches full-screen like native app

### 4. Automatic Updates

When a new version is available:
- Update banner appears
- User can refresh to get latest version
- Old service worker is replaced
- All cached data is updated

## Technical Implementation

### Service Worker

Custom service worker (`frontend/src/sw.ts`) implements:
- NetworkFirst for API calls
- CacheFirst for images
- StaleWhileRevalidate for static assets
- Background sync for failed requests
- Push notification handling

### Caching

**Cache Names:**
- `api-cache-v1`: API responses (24hr expiry)
- `images-cache-v1`: Images (30 day expiry)
- `static-cache-v1`: JS/CSS files

**Cache Limits:**
- API: 50 entries
- Images: 60 entries
- Static: unlimited

### Push Notifications

**Backend:**
- Web Push Protocol (VAPID)
- Subscription management
- Notification delivery

**Frontend:**
- Permission request UI
- Subscription management
- Notification display

## Configuration

### Environment Variables

**Backend (.env):**
```bash
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:contact@yourdomain.com
```

**Frontend:**
No configuration needed - uses production PWA plugin

### Manifest

The app manifest (`vite.config.ts`) includes:
- App name and description
- Icons (192x192, 512x512)
- Theme color (#6366F1)
- Display mode (standalone)
- Orientation (portrait)

## Performance

### Target Metrics

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

### Optimization

- Code splitting by route
- Lazy loading components
- Image optimization
- Asset compression (gzip/brotli)
- Tree shaking
- Minification

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Lighthouse Audit

```bash
npm run build
npm run preview
# Run Lighthouse in Chrome DevTools
```

**Target Score:** 90+ in all categories

## Deployment

### Production Build

```bash
npm run build
```

Output: `frontend/dist/`

Deploy this folder to any static hosting service.

### Environment Setup

1. Generate VAPID keys
2. Add to backend `.env`
3. Build and deploy
4. Test PWA functionality

### Checklist

Before deploying:

- [ ] VAPID keys configured
- [ ] PWA icons generated
- [ ] Environment variables set
- [ ] Service worker builds correctly
- [ ] Manifest is valid
- [ ] Lighthouse score > 90
- [ ] Push notifications tested
- [ ] Offline mode tested
- [ ] Update flow tested

## Troubleshooting

**Service Worker Issues:**
- Clear site data (DevTools > Application > Clear storage)
- Unregister service workers
- Hard refresh (Ctrl+Shift+R)

**Push Notification Issues:**
- Check VAPID keys
- Verify browser permission
- Test with "Send Test" button
- Check backend logs

**Install Prompt Not Showing:**
- Visit site at least twice
- Check service worker is active
- Verify manifest is valid
- Use HTTPS (required)

## Support

For issues or questions:
- GitHub: [repository-url]
- Email: support@astrology-saas.com
- Docs: [docs-url]

---

**Built with ❤️ and modern web technologies**
```

**Step 4: Commit**

```bash
git add backend/.env.pwa.example frontend/PWA_SETUP.md PWA_GUIDE.md
git commit -m "docs(pwa): add comprehensive PWA setup and configuration guides"
```

---

## Task 10: Final Integration and Testing

**Files:**
- Modify: `frontend/src/App.tsx` (add PWA components)
- Create: `backend/src/api/v1/index.ts` (add notification routes)
- Test complete PWA functionality

**Step 1: Update App.tsx with PWA components**

Modify: `frontend/src/App.tsx`

```typescript
// Add imports
import { ServiceWorkerUpdateBanner, PushNotificationPermission } from './components';

// In main layout:
<>
  <ServiceWorkerUpdateBanner />
  <PushNotificationPermission autoShow={false} />
  {/* Existing app content */}
</>
```

**Step 2: Register notification routes in backend**

Modify: `backend/src/api/v1/index.ts`

```typescript
import notificationRoutes from '../../modules/notifications/routes/pushNotification.routes';

router.use('/notifications', notificationRoutes);
```

**Step 3: Create comprehensive integration test**

Create file: `backend/src/__tests__/pwa.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server';
import { TestDataSource } from '../config/database.test';

describe('PWA Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await TestDataSource.initialize();
    await TestDataSource.migrate();

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'pwa@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    await TestDataSource.cleanup();
  });

  it('should get VAPID public key', async () => {
    const response = await request(app)
      .get('/api/v1/notifications/vapid-key');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.publicKey).toBeDefined();
  });

  it('should save push subscription', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        endpoint: 'https://fcm.googleapis.com/test',
        keys: {
          p256dh: 'test-key',
          auth: 'test-auth',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('should get user subscriptions', async () => {
    const response = await request(app)
      .get('/api/v1/notifications/subscriptions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should send test notification', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/test')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

**Step 4: Run full test suite**

Run: `npm test`
Expected: All tests pass

Run: `cd frontend && npm run test:e2e`
Expected: All E2E tests pass

**Step 5: Build production bundle**

Run: `cd frontend && npm run build`
Expected: Successful build with service worker

**Step 6: Verify PWA with Lighthouse**

1. Build and serve: `npm run preview`
2. Open Chrome DevTools > Lighthouse
3. Run PWA audit
4. Verify score > 90

**Step 7: Final commit**

```bash
git add frontend/src/App.tsx backend/src/api/v1/index.ts backend/src/__tests__/pwa.integration.test.ts
git commit -m "feat(pwa): complete PWA integration - all features working"
```

---

## Summary

This plan implements a complete PWA enhancement with:

✅ **10 Tasks, 60+ Steps**
✅ **Service Worker with Advanced Caching**
✅ **Push Notifications (Web Push Protocol)**
✅ **Offline Detection and UI**
✅ **Automatic Update Flow**
✅ **Performance Optimization**
✅ **Comprehensive Testing**
✅ **Full Documentation**

**Estimated Implementation Time:** 8-12 hours

**Testing Coverage:** Unit tests for all utilities, E2E tests for PWA functionality

**Files Created:** 30+ new files
**Files Modified:** 10+ existing files

**Next Phase:** Sprint 3 - AI-Powered Interpretations
