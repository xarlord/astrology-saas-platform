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
    // Skip SW registration in development — PWA is only for production
    if (!import.meta.env.PROD) {
      return;
    }

    let mounted = true;

    void registerSW({
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

    // Also listen for the custom 'sw-updated' event dispatched on controllerchange
    // This replaces the old auto-reload that killed Firebase Auth popups
    const handleSwUpdated = () => {
      if (mounted) {
        setNeedRefresh(true);
      }
    };
    window.addEventListener('sw-updated', handleSwUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('sw-updated', handleSwUpdated);
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
