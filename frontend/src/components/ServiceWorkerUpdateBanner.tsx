/**
 * Service Worker Update Banner
 * Displays banner when new app version is available
 */

import React from 'react';
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';

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
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-[90%] w-[400px] bg-[#423d0f] border border-[#ca8a04] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] px-5 py-4 animate-slide-up sm:bottom-0 sm:left-0 sm:right-0 sm:translate-none sm:w-full sm:max-w-full sm:rounded-b-none sm:rounded-t-xl sm:animate-slide-up-mobile">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none shrink-0">📶</span>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-sm font-semibold text-white">You are offline</strong>
            <span className="text-xs text-slate-200">Some features may be unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-[90%] w-[400px] bg-cosmic-card/90 backdrop-blur-md border border-white/15 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] px-5 py-4 animate-slide-up sm:bottom-0 sm:left-0 sm:right-0 sm:translate-none sm:w-full sm:max-w-full sm:rounded-b-none sm:rounded-t-xl sm:animate-slide-up-mobile">
      <div className="flex items-center gap-3 sm:flex-row sm:flex-wrap">
        <span className="text-2xl leading-none shrink-0">🔄</span>
        <div className="flex-1 sm:min-w-0">
          <strong className="text-sm font-semibold text-white">New version available</strong>
          <span className="block text-xs text-slate-200">Refresh to get the latest features</span>
        </div>
        <div className="flex gap-2 shrink-0 sm:w-full sm:mt-2">
          <button type="button" className="px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-white/15 text-slate-200 hover:bg-white/15 sm:flex-1 sm:py-2.5 sm:px-4" onClick={handleReload}>
            Later
          </button>
          <button type="button" className="px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-primary text-white hover:bg-primary/90 sm:flex-1 sm:py-2.5 sm:px-4" onClick={handleRefresh}>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};
