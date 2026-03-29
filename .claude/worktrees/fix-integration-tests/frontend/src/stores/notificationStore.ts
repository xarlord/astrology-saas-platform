/**
 * Notification Store
 *
 * Manages notification state and actions using Zustand
 * Handles toast notifications, alerts, and their lifecycle
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  variant: NotificationVariant;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  showProgress?: boolean;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;

  // Convenience methods
  showInfo: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      maxNotifications: 5,

      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };

        set((state) => {
          const notifications = [...state.notifications, newNotification];

          // Keep only the most recent notifications
          if (notifications.length > state.maxNotifications) {
            notifications.shift();
          }

          return { notifications };
        });

        // Auto-remove after duration (if specified)
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      // Convenience methods
      showInfo: (message, title) => {
        get().addNotification({
          variant: 'info',
          message,
          title,
          duration: 5000,
        });
      },

      showSuccess: (message, title) => {
        get().addNotification({
          variant: 'success',
          message,
          title,
          duration: 4000,
        });
      },

      showWarning: (message, title) => {
        get().addNotification({
          variant: 'warning',
          message,
          title,
          duration: 6000,
        });
      },

      showError: (message, title) => {
        get().addNotification({
          variant: 'error',
          message,
          title,
          duration: 8000,
        });
      },
    }),
    {
      name: 'NotificationStore',
    }
  )
);

// Selector hooks for optimized re-renders
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useAddNotification = () => useNotificationStore((state) => state.addNotification);
export const useRemoveNotification = () => useNotificationStore((state) => state.removeNotification);

export default useNotificationStore;
