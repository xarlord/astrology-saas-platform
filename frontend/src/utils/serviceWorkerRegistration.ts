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
      updateViaCache: 'imports', // Always check for updates via import scripts
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

  const registration = await navigator.serviceWorker.getRegistration();
  return registration ?? null;
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
