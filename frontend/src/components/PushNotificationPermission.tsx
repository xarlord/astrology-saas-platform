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
          <span>Notifications enabled</span>
          <button className="push-notification-test" onClick={handleTest}>
            Send Test
          </button>
        </div>
      )}
    </div>
  );
};
