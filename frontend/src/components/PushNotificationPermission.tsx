/**
 * Push Notification Permission Component
 * Prompts users to enable push notifications
 */

import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';


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
    <div className="fixed bottom-5 right-5 z-[1000] max-w-[400px] w-full sm:bottom-2.5 sm:right-2.5 sm:left-2.5 sm:max-w-none">
      {shouldShow && (
        <div className="glass-panel rounded-2xl p-5 relative animate-slide-in sm:p-4">
          <button
            className="absolute top-3 right-3 bg-transparent border-none text-slate-200 cursor-pointer p-1 rounded flex items-center justify-center transition-all duration-200 hover:bg-white/15 hover:text-white"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>close</span>
          </button>

          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white self-start">
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '32px' }}>notifications</span>
            </div>

            <div>
              <h3 className="m-0 mb-2 text-lg font-semibold text-white">
                Enable Notifications
              </h3>
              <p className="m-0 text-sm text-slate-200 leading-relaxed">
                Get notified about your astrological forecasts, lunar returns, and important
                transit events.
              </p>
            </div>

            <div className="flex gap-2 sm:flex-col">
              <button
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full"
                onClick={() => { void handleSubscribe(); }}
                disabled={subscribing}
              >
                {subscribing ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none bg-white/15 text-slate-200 hover:bg-white/15 sm:w-full"
                onClick={handleDismiss}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubscribed && (
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-between gap-3 animate-slide-in">
          <span>Notifications enabled</span>
          <button
            className="bg-white text-emerald-500 py-2 px-4 rounded-md text-[13px] font-medium border-none cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            onClick={() => { void handleTest(); }}
          >
            Send Test
          </button>
        </div>
      )}
    </div>
  );
};
