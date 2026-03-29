/**
 * useNotifications Hook
 *
 * Custom hook for toast notifications
 * Wraps the notification store for easier use in components
 */

import { useCallback } from 'react';
import { useNotificationStore } from '../stores';
import type { Notification } from '../stores/notificationStore';

export const useNotifications = () => {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showInfo,
    showSuccess,
    showWarning,
    showError,
  } = useNotificationStore();

  // Show info notification
  const info = useCallback((message: string, title?: string) => {
    showInfo(message, title);
  }, [showInfo]);

  // Show success notification
  const success = useCallback((message: string, title?: string) => {
    showSuccess(message, title);
  }, [showSuccess]);

  // Show warning notification
  const warning = useCallback((message: string, title?: string) => {
    showWarning(message, title);
  }, [showWarning]);

  // Show error notification
  const error = useCallback((message: string, title?: string) => {
    showError(message, title);
  }, [showError]);

  // Add custom notification
  const add = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    addNotification(notification);
  }, [addNotification]);

  // Remove notification
  const remove = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // Clear all notifications
  const clear = useCallback(() => {
    clearAll();
  }, [clearAll]);

  // Show notification with action
  const withAction = useCallback((
    message: string,
    actionLabel: string,
    action: () => void,
    variant: Notification['variant'] = 'info'
  ) => {
    addNotification({
      variant,
      message,
      action: {
        label: actionLabel,
        onClick: action,
      },
      duration: 0, // Don't auto-close
    });
  }, [addNotification]);

  // Show loading notification
  const loading = useCallback((message: string): (() => void) => {
    const id = `loading-${Date.now()}`;
    addNotification({
      variant: 'info',
      message,
      duration: 0,
    });

    // Return function to remove loading notification
    return () => removeNotification(id);
  }, [addNotification, removeNotification]);

  // Wrap async operation with loading notification
  const withLoading = useCallback(async <T>(
    message: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const dismiss = loading(message);

    try {
      const result = await operation();
      dismiss();
      return result;
    } catch (err) {
      dismiss();
      throw err;
    }
  }, [loading]);

  return {
    // State
    notifications,

    // Convenience methods
    info,
    success,
    warning,
    error,
    add,
    remove,
    clear,
    withAction,
    loading,
    withLoading,
  };
};

export default useNotifications;
