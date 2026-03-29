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
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-[90%] w-[400px] bg-[#fff3cd] border border-[#ffc107] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-5 py-4 animate-slide-up sm:bottom-0 sm:left-0 sm:right-0 sm:translate-none sm:w-full sm:max-w-full sm:rounded-b-none sm:rounded-t-xl sm:animate-slide-up-mobile dark:bg-[#423d0f] dark:border-[#ca8a04] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none shrink-0">📶</span>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-sm font-semibold text-gray-800 dark:text-gray-100">You are offline</strong>
            <span className="text-xs text-gray-500 dark:text-gray-300">Some features may be unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-[90%] w-[400px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-5 py-4 animate-slide-up sm:bottom-0 sm:left-0 sm:right-0 sm:translate-none sm:w-full sm:max-w-full sm:rounded-b-none sm:rounded-t-xl sm:animate-slide-up-mobile dark:bg-gray-800 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 sm:flex-row sm:flex-wrap">
        <span className="text-2xl leading-none shrink-0">🔄</span>
        <div className="flex-1 sm:min-w-0">
          <strong className="text-sm font-semibold text-gray-800 dark:text-gray-100">New version available</strong>
          <span className="block text-xs text-gray-500 dark:text-gray-300">Refresh to get the latest features</span>
        </div>
        <div className="flex gap-2 shrink-0 sm:w-full sm:mt-2">
          <button type="button" className="px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:flex-1 sm:py-2.5 sm:px-4" onClick={handleReload}>
            Later
          </button>
          <button type="button" className="px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-blue-500 text-white hover:bg-blue-600 sm:flex-1 sm:py-2.5 sm:px-4" onClick={handleRefresh}>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};
