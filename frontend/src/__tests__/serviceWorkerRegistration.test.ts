/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerSW, isOffline, getSWRegistration } from '../utils/serviceWorkerRegistration';

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
  configurable: true,
});

describe('Service Worker Registration', () => {
  const originalServiceWorker = navigator.serviceWorker;
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    reloadMock.mockClear();
    // Reset navigator.serviceWorker to undefined before each test
    // @ts-ignore
    navigator.serviceWorker = undefined;
    // Reset onLine property
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original serviceWorker
    // @ts-ignore
    navigator.serviceWorker = originalServiceWorker;
    // Restore original onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  describe('registerSW', () => {
    it('should register service worker on mount', async () => {
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: null,
        installing: null,
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
      });

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        updateViaCache: 'imports',
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
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({ onNeedRefresh, onOfflineReady: vi.fn() });

      expect(onNeedRefresh).toHaveBeenCalled();
    });

    it('should skip waiting when user accepts update', async () => {
      const mockWaiting = {
        postMessage: vi.fn(),
      };
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: mockWaiting,
        installing: null,
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      const controls = await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
      });

      if (controls?.skipWaiting) {
        controls.skipWaiting();
      }

      expect(mockWaiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    it('should call update method when requested', async () => {
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: null,
        installing: null,
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      const controls = await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
      });

      if (controls?.update) {
        controls.update();
      }

      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should return null when service workers are not supported', async () => {
      // @ts-ignore
      navigator.serviceWorker = undefined;

      const result = await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
      });

      expect(result).toBeNull();
    });

    it('should call onRegistrationError when registration fails', async () => {
      const error = new Error('Registration failed');
      const onRegistrationError = vi.fn();

      const mockServiceWorker = {
        register: vi.fn().mockRejectedValue(error),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
        onRegistrationError,
      });

      expect(onRegistrationError).toHaveBeenCalledWith(error);
    });

    it('should detect new service worker via updatefound event', async () => {
      const onNeedRefresh = vi.fn();
      const mockNewWorker = {
        state: 'installed',
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'statechange') {
            // Simulate state change to installed
            callback();
          }
        }),
      };
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: null,
        installing: mockNewWorker,
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'updatefound') {
            callback();
          }
        }),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: {},
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({ onNeedRefresh, onOfflineReady: vi.fn() });

      expect(mockRegistration.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function));
    });

    it('should reload page on controller change', async () => {
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: null,
        installing: null,
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'controllerchange') {
            callback();
          }
        }),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady: vi.fn(),
      });

      expect(reloadMock).toHaveBeenCalled();
    });

    it('should detect offline events', async () => {
      const onOfflineReady = vi.fn();
      const mockRegistration = {
        update: vi.fn().mockResolvedValue(undefined),
        waiting: null,
        installing: null,
        addEventListener: vi.fn(),
      };

      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: null,
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      await registerSW({
        onNeedRefresh: vi.fn(),
        onOfflineReady,
      });

      // Simulate offline event
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);

      expect(onOfflineReady).toHaveBeenCalled();
    });
  });

  describe('isOffline', () => {
    it('should return true when offline', () => {
      // @ts-ignore
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      expect(isOffline()).toBe(true);
    });

    it('should return false when online', () => {
      // @ts-ignore
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

      expect(isOffline()).toBe(false);
    });
  });

  describe('getSWRegistration', () => {
    it('should return service worker registration', async () => {
      const mockRegistration = {
        scope: '/',
        update: vi.fn(),
      };

      const mockServiceWorker = {
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
      };

      // @ts-ignore
      navigator.serviceWorker = mockServiceWorker;

      const result = await getSWRegistration();

      expect(result).toBe(mockRegistration);
    });

    it('should return null when service workers are not supported', async () => {
      // Remove serviceWorker property to simulate lack of support
      // @ts-ignore
      delete navigator.serviceWorker;

      const result = await getSWRegistration();

      expect(result).toBeNull();
    });
  });
});
