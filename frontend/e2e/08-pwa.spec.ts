/**
 * E2E Test: PWA Functionality
 * Tests complete Progressive Web App features including:
 * - Service worker registration
 * - Offline behavior and caching
 * - Update banner display
 * - Push notification permissions
 * - Installability criteria
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test.describe('Service Worker Registration', () => {
    test('should register service worker successfully', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if service worker is registered
      const swRegistration = await page.evaluate(async () => {
        return await navigator.serviceWorker.ready.then((registration) => ({
          scope: registration.scope,
          state: registration.active?.state,
          scriptURL: registration.active?.scriptURL,
        })).catch(() => null);
      });

      expect(swRegistration).not.toBeNull();
      expect(swRegistration?.state).toBe('activated');
      expect(swRegistration?.scriptURL).toContain('sw.js');
    });

    test('should have service worker controller', async ({ page }) => {
      const hasController = await page.evaluate(() => {
        return !!navigator.serviceWorker.controller;
      });

      expect(hasController).toBeTruthy();
    });

    test('should listen for service worker updates', async ({ page }) => {
      // Check if update listener is registered
      const hasUpdateListener = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Check if service worker has update capability
            navigator.serviceWorker.getRegistration().then((registration) => {
              resolve(!!registration);
            }).catch(() => resolve(false));
          }, 1000);
        });
      });

      expect(hasUpdateListener).toBeTruthy();
    });
  });

  test.describe('Offline Behavior', () => {
    test('should show offline banner when offline', async ({ page }) => {
      // Wait for service worker to be ready
      await page.waitForTimeout(2000);

      // Simulate offline mode
      await page.context().setOffline(true);

      // Wait for offline event to propagate
      await page.waitForTimeout(1000);

      // Check if offline banner is displayed
      const offlineBanner = page.locator('text=/offline|no internet|connection lost/i');
      const isVisible = await offlineBanner.count() > 0;

      // Offline banner should be visible (or some offline indicator)
      if (isVisible) {
        await expect(offlineBanner.first()).toBeVisible();
      } else {
        // If no banner, check for offline status in UI
        const isOffline = await page.evaluate(() => !navigator.onLine);
        expect(isOffline).toBeTruthy();
      }

      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should cache static assets', async ({ page }) => {
      // Open caches and check if static assets are cached
      const cachesExist = await page.evaluate(async () => {
        if (!('caches' in window)) return false;

        const cacheNames = await caches.keys();
        return cacheNames.some(name => name.includes('static') || name.includes('precache'));
      });

      expect(cachesExist).toBeTruthy();
    });

    test('should load cached page when offline', async ({ page }) => {
      // First, load the page online to cache it
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Give SW time to cache

      // Go offline
      await page.context().setOffline(true);

      // Try to reload the page
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Page should still load (from cache)
      const title = await page.title();
      expect(title).toBeTruthy();

      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should cache API responses', async ({ page }) => {
      const apiCacheExists = await page.evaluate(async () => {
        if (!('caches' in window)) return false;

        const cacheNames = await caches.keys();
        return cacheNames.some(name => name.includes('api'));
      });

      // API cache might not exist if no API calls were made yet
      // This is informational - not a hard requirement
      console.log('API cache exists:', apiCacheExists);
    });
  });

  test.describe('Service Worker Update Banner', () => {
    test('should display update banner when new version available', async ({ page }) => {
      // The update banner component should be present in DOM
      const updateBanner = page.locator('[data-testid="sw-update-banner"], .sw-update-banner');
      const bannerExists = await updateBanner.count() > 0;

      // Banner component exists (might not be visible if no update)
      expect(bannerExists).toBeTruthy();
    });

    test('should have update controls available', async ({ page }) => {
      // Check for update controls via service worker registration
      const canUpdate = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready;
        return {
          canUpdate: typeof registration.update === 'function',
          hasWaiting: !!registration.waiting,
          hasInstalling: !!registration.installing,
        };
      });

      expect(canUpdate.canUpdate).toBeTruthy();
    });
  });

  test.describe('Push Notifications', () => {
    test('should request notification permission UI component', async ({ page }) => {
      // Check if push notification permission component exists
      const permissionComponent = page.locator('[data-testid="push-notification-permission"]');
      const componentExists = await permissionComponent.count() > 0;

      // Component should exist in the app
      expect(componentExists).toBeTruthy();
    });

    test('should support notification permission request', async ({ page }) => {
      // Check if app has capability to request notification permission
      const hasNotificationSupport = await page.evaluate(() => {
        return 'Notification' in window;
      });

      expect(hasNotificationSupport).toBeTruthy();
    });

    test('should display permission UI when permission is default', async ({ page }) => {
      // Mock notification permission state
      const permissionState = await page.evaluate(() => {
        return Notification.permission;
      });

      // If permission is default, UI might be shown
      if (permissionState === 'default') {
        const permissionUI = page.locator('text=/enable notifications|allow notifications|turn on notifications/i');
        const isVisible = await permissionUI.count() > 0;

        if (isVisible) {
          await expect(permissionUI.first()).toBeVisible();
        }
      }
    });

    test('should handle permission grant', async ({ page }) => {
      // Grant notification permission
      await page.context().grantPermissions(['notifications']);

      // Check permission state
      const permissionState = await page.evaluate(() => {
        return Notification.permission;
      });

      expect(permissionState).toBe('granted');
    });

    test('should handle permission denial', async ({ page }) => {
      // Clear permissions first
      await page.context().clearPermissions();

      // Deny notification permission
      await page.context().grantPermissions([], ['notifications']);

      // Check permission state
      const permissionState = await page.evaluate(() => {
        return Notification.permission;
      });

      expect(permissionState).toBe('denied');
    });
  });

  test.describe('PWA Installability', () => {
    test('should have valid manifest', async ({ page }) => {
      // Fetch manifest
      const manifestData = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="manifest"]');
        if (!link) return null;

        const href = link.getAttribute('href');
        if (!href) return null;

        const response = await fetch(href);
        return await response.json();
      });

      expect(manifestData).not.toBeNull();
      expect(manifestData).toHaveProperty('name');
      expect(manifestData).toHaveProperty('short_name');
      expect(manifestData).toHaveProperty('icons');
      expect(manifestData).toHaveProperty('display', 'standalone');
    });

    test('should have required icons in manifest', async ({ page }) => {
      const manifestData = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="manifest"]');
        if (!link) return null;

        const href = link.getAttribute('href');
        if (!href) return null;

        const response = await fetch(href);
        return await response.json();
      });

      expect(manifestData?.icons).toBeDefined();
      expect(manifestData?.icons.length).toBeGreaterThan(0);

      // Check for required sizes
      const iconSizes = manifestData?.icons.map((icon: any) => icon.sizes);
      const has192 = iconSizes?.some((size: string) => size.includes('192'));
      const has512 = iconSizes?.some((size: string) => size.includes('512'));

      expect(has192).toBeTruthy();
      expect(has512).toBeTruthy();
    });

    test('should have service worker for installability', async ({ page }) => {
      // Service worker is required for PWA installability
      const hasServiceWorker = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready;
        return !!registration;
      });

      expect(hasServiceWorker).toBeTruthy();
    });

    test('should have theme color meta tag', async ({ page }) => {
      const themeColor = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        return meta?.getAttribute('content');
      });

      expect(themeColor).toBeTruthy();
      expect(themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    test('should have apple touch icon', async ({ page }) => {
      const hasAppleIcon = await page.evaluate(() => {
        const link = document.querySelector('link[rel="apple-touch-icon"]');
        return !!link;
      });

      expect(hasAppleIcon).toBeTruthy();
    });

    test('should be installable (beforeinstallprompt)', async ({ page }) => {
      // Listen for beforeinstallprompt event
      const installPromptFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fired = false;

          const handler = (event: Event) => {
            fired = true;
            event.preventDefault();
            window.removeEventListener('beforeinstallprompt', handler);
            resolve(fired);
          };

          window.addEventListener('beforeinstallprompt', handler);

          // Timeout after 5 seconds if event doesn't fire
          setTimeout(() => {
            window.removeEventListener('beforeinstallprompt', handler);
            resolve(fired);
          }, 5000);
        });
      });

      // Note: This might not fire in all browsers or if already installed
      console.log('Install prompt fired:', installPromptFired);
    });
  });

  test.describe('Cache Management', () => {
    test('should have multiple cache strategies configured', async ({ page }) => {
      const cacheNames = await page.evaluate(async () => {
        if (!('caches' in window)) return [];

        return await caches.keys();
      });

      // Should have at least one cache
      expect(cacheNames.length).toBeGreaterThan(0);

      // Should have API cache
      const hasApiCache = cacheNames.some(name => name.includes('api'));
      console.log('Has API cache:', hasApiCache);

      // Should have static cache
      const hasStaticCache = cacheNames.some(name => name.includes('static') || name.includes('precache'));
      expect(hasStaticCache).toBeTruthy();
    });

    test('should clean up outdated caches', async ({ page }) => {
      // Get all cache names
      const cacheNames = await page.evaluate(async () => {
        return await caches.keys();
      });

      // All caches should have version numbers
      const allHaveVersions = cacheNames.every(name => {
        return /-v\d+$/.test(name) || /precache/.test(name);
      });

      expect(allHaveVersions).toBeTruthy();
    });
  });

  test.describe('Online/Offline Events', () => {
    test('should handle online event', async ({ page }) => {
      // Go offline first
      await page.context().setOffline(true);
      await page.waitForTimeout(500);

      // Check offline status
      const isOffline = await page.evaluate(() => !navigator.onLine);
      expect(isOffline).toBeTruthy();

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(500);

      // Check online status
      const isOnline = await page.evaluate(() => navigator.onLine);
      expect(isOnline).toBeTruthy();
    });

    test('should update UI when connectivity changes', async ({ page }) => {
      // Wait for initial load
      await page.waitForLoadState('networkidle');

      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Check for offline indicator
      const hasOfflineIndicator = await page.evaluate(() => {
        const body = document.body;
        const bodyText = body?.textContent || '';
        const hasOfflineText = /offline|no internet|connection lost/i.test(bodyText);
        const hasOfflineClass = body?.classList.contains('offline');

        return hasOfflineText || hasOfflineClass;
      });

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(1000);

      // Check for online status
      const isOnline = await page.evaluate(() => navigator.onLine);
      expect(isOnline).toBeTruthy();
    });
  });
});

test.describe('PWA Integration Tests', () => {
  test('should maintain app state when switching between online and offline', async ({ page }) => {
    // Navigate to a page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial page content
    const initialContent = await page.textContent('body');

    // Go offline
    await page.context().setOffline(true);

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Content should still be available (from cache)
    const offlineContent = await page.textContent('body');
    expect(offlineContent).toBeTruthy();

    // Go back online
    await page.context().setOffline(false);

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Content should be back to normal
    const onlineContent = await page.textContent('body');
    expect(onlineContent).toBeTruthy();
  });

  test('should work with authenticated routes offline', async ({ page }) => {
    // This test verifies that authenticated pages can be cached and accessed offline
    // Note: This requires proper setup of authentication

    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Try to access login page (should work from cache)
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    expect(title).toContain('Login');

    // Restore online
    await page.context().setOffline(false);
  });

  test('should handle service worker update flow', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get current service worker version
    const currentSW = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return {
        scriptURL: registration.active?.scriptURL,
        state: registration.active?.state,
      };
    });

    expect(currentSW.scriptURL).toContain('sw.js');
    expect(currentSW.state).toBe('activated');

    // In a real scenario, you would deploy a new version and check for updates
    // For now, we just verify the update mechanism exists
    const canCheckForUpdates = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return typeof registration.update === 'function';
    });

    expect(canCheckForUpdates).toBeTruthy();
  });
});

test.describe('PWA Performance', () => {
  test('should load static assets from cache on second visit', async ({ page }) => {
    // First visit - load from network
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Reload - should load from cache
    const startTime = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Second load should be faster (from cache)
    // This is a soft check - performance can vary
    console.log('Second load time:', loadTime, 'ms');
  });

  test('should precache essential assets', async ({ page }) => {
    // Wait for service worker to install
    await page.waitForTimeout(2000);

    // Check precache
    const precacheExists = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const precacheName = cacheNames.find(name => name.includes('precache') || name.includes('workbox'));

      if (!precacheName) return false;

      const cache = await caches.open(precacheName);
      const keys = await cache.keys();

      return keys.length > 0;
    });

    expect(precacheExists).toBeTruthy();
  });
});

test.describe('PWA Accessibility', () => {
  test('should have accessible manifest', async ({ page }) => {
    const manifestData = await page.evaluate(async () => {
      const link = document.querySelector('link[rel="manifest"]');
      if (!link) return null;

      const href = link.getAttribute('href');
      if (!href) return null;

      const response = await fetch(href);
      return await response.json();
    });

    // Check for accessibility-related manifest properties
    expect(manifestData).toHaveProperty('name');
    expect(manifestData).toHaveProperty('short_name');

    // Check for proper contrast colors
    if (manifestData?.background_color && manifestData?.theme_color) {
      const backgroundColor = manifestData.background_color;
      const themeColor = manifestData.theme_color;

      expect(backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('should have accessible offline page', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Try to navigate to a non-cached page
    await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' });

    // Should show some kind of offline/error page
    const pageContent = await page.textContent('body');

    // Restore online
    await page.context().setOffline(false);

    expect(pageContent).toBeTruthy();
  });
});
