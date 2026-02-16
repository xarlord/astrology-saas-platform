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
