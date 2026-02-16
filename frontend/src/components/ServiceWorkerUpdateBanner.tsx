/**
 * Service Worker Update Banner
 * Displays banner when new app version is available
 */

import React from 'react';
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate';
import '../styles/ServiceWorkerUpdateBanner.css';

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
