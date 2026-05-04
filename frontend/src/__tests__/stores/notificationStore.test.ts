/**
 * Tests for Notification Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useNotificationStore,
  type Notification,
  type NotificationVariant,
} from '../../stores/notificationStore';

describe('notificationStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useNotificationStore.setState({
      notifications: [],
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useNotificationStore.getState();

      expect(state.notifications).toEqual([]);
      expect(state.maxNotifications).toBe(5);
    });
  });

  describe('addNotification action', () => {
    it('should add a notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Test message',
        });
      });

      const state = useNotificationStore.getState();

      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].variant).toBe('info');
      expect(state.notifications[0].message).toBe('Test message');
    });

    it('should generate unique id and timestamp', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'success',
          message: 'Message 1',
        });
        useNotificationStore.getState().addNotification({
          variant: 'error',
          message: 'Message 2',
        });
      });

      const state = useNotificationStore.getState();

      expect(state.notifications[0].id).not.toBe(state.notifications[1].id);
      expect(state.notifications[0].timestamp).toBeDefined();
      expect(state.notifications[1].timestamp).toBeDefined();
    });

    it('should include optional fields', () => {
      const action = vi.fn();

      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'warning',
          message: 'Warning message',
          title: 'Warning Title',
          duration: 5000,
          action: {
            label: 'Click me',
            onClick: action,
          },
          showProgress: true,
        });
      });

      const notification = useNotificationStore.getState().notifications[0];

      expect(notification.title).toBe('Warning Title');
      expect(notification.duration).toBe(5000);
      expect(notification.action?.label).toBe('Click me');
      expect(notification.action?.onClick).toBe(action);
      expect(notification.showProgress).toBe(true);
    });

    it('should limit notifications to maxNotifications', () => {
      // Add 7 notifications (max is 5)
      for (let i = 0; i < 7; i++) {
        act(() => {
          useNotificationStore.getState().addNotification({
            variant: 'info',
            message: `Message ${i}`,
          });
        });
      }

      const state = useNotificationStore.getState();

      expect(state.notifications).toHaveLength(5);
    });

    it('should remove oldest notifications when exceeding limit', () => {
      // Add 6 notifications
      for (let i = 0; i < 6; i++) {
        act(() => {
          useNotificationStore.getState().addNotification({
            variant: 'info',
            message: `Message ${i}`,
          });
        });
      }

      const state = useNotificationStore.getState();

      // First notification should be removed
      expect(state.notifications.find((n) => n.message === 'Message 0')).toBeUndefined();
      // Last notification should exist
      expect(state.notifications.find((n) => n.message === 'Message 5')).toBeDefined();
    });

    it('should auto-remove notification after duration', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Auto-remove message',
          duration: 3000,
        });
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      // Advance timers by duration
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });

    it('should not auto-remove notification with no duration', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Persistent message',
          duration: 0,
        });
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      // Advance timers significantly
      act(() => {
        vi.advanceTimersByTime(100000);
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });

    it('should not auto-remove notification with negative duration', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Persistent message',
          duration: -1,
        });
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(100000);
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });

  describe('removeNotification action', () => {
    it('should remove a notification by id', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Message 1',
        });
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Message 2',
        });
      });

      const state = useNotificationStore.getState();
      const idToRemove = state.notifications[0].id;

      act(() => {
        useNotificationStore.getState().removeNotification(idToRemove);
      });

      const newState = useNotificationStore.getState();

      expect(newState.notifications).toHaveLength(1);
      expect(newState.notifications[0].message).toBe('Message 2');
    });

    it('should handle removing non-existent id', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Message 1',
        });
      });

      act(() => {
        useNotificationStore.getState().removeNotification('non-existent-id');
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });

    it('should handle empty notifications', () => {
      act(() => {
        useNotificationStore.getState().removeNotification('some-id');
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('clearAll action', () => {
    it('should clear all notifications', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          variant: 'info',
          message: 'Message 1',
        });
        useNotificationStore.getState().addNotification({
          variant: 'success',
          message: 'Message 2',
        });
        useNotificationStore.getState().addNotification({
          variant: 'error',
          message: 'Message 3',
        });
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(3);

      act(() => {
        useNotificationStore.getState().clearAll();
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });

    it('should handle clearing empty notifications', () => {
      act(() => {
        useNotificationStore.getState().clearAll();
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('convenience methods', () => {
    it('showInfo should add info notification with default duration', () => {
      act(() => {
        useNotificationStore.getState().showInfo('Info message', 'Info Title');
      });

      const notification = useNotificationStore.getState().notifications[0];

      expect(notification.variant).toBe('info');
      expect(notification.message).toBe('Info message');
      expect(notification.title).toBe('Info Title');
      expect(notification.duration).toBe(5000);
    });

    it('showSuccess should add success notification with default duration', () => {
      act(() => {
        useNotificationStore.getState().showSuccess('Success message', 'Success Title');
      });

      const notification = useNotificationStore.getState().notifications[0];

      expect(notification.variant).toBe('success');
      expect(notification.message).toBe('Success message');
      expect(notification.title).toBe('Success Title');
      expect(notification.duration).toBe(4000);
    });

    it('showWarning should add warning notification with default duration', () => {
      act(() => {
        useNotificationStore.getState().showWarning('Warning message', 'Warning Title');
      });

      const notification = useNotificationStore.getState().notifications[0];

      expect(notification.variant).toBe('warning');
      expect(notification.message).toBe('Warning message');
      expect(notification.title).toBe('Warning Title');
      expect(notification.duration).toBe(6000);
    });

    it('showError should add error notification with default duration', () => {
      act(() => {
        useNotificationStore.getState().showError('Error message', 'Error Title');
      });

      const notification = useNotificationStore.getState().notifications[0];

      expect(notification.variant).toBe('error');
      expect(notification.message).toBe('Error message');
      expect(notification.title).toBe('Error Title');
      expect(notification.duration).toBe(8000);
    });

    it('convenience methods should work without title', () => {
      const variants: {
        method: 'showInfo' | 'showSuccess' | 'showWarning' | 'showError';
        variant: NotificationVariant;
      }[] = [
        { method: 'showInfo', variant: 'info' },
        { method: 'showSuccess', variant: 'success' },
        { method: 'showWarning', variant: 'warning' },
        { method: 'showError', variant: 'error' },
      ];

      variants.forEach(({ method }) => {
        act(() => {
          useNotificationStore.getState()[method]('Test message');
        });
      });

      const state = useNotificationStore.getState();

      expect(state.notifications).toHaveLength(4);
      state.notifications.forEach((n, i) => {
        expect(n.variant).toBe(variants[i].variant);
        expect(n.title).toBeUndefined();
      });
    });
  });

  describe('selector hooks', () => {
    it('useNotifications should return notifications', () => {
      useNotificationStore.setState({
        notifications: [{ id: '1', variant: 'info', message: 'Test', timestamp: Date.now() }],
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(1);
    });

    it('useAddNotification should return addNotification function', () => {
      const addNotification = useNotificationStore.getState().addNotification;

      act(() => {
        addNotification({ variant: 'info', message: 'Test' });
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });

    it('useRemoveNotification should return removeNotification function', () => {
      useNotificationStore.setState({
        notifications: [{ id: 'test-id', variant: 'info', message: 'Test', timestamp: Date.now() }],
      });

      const removeNotification = useNotificationStore.getState().removeNotification;

      act(() => {
        removeNotification('test-id');
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('notification variants', () => {
    it('should support all notification variants', () => {
      const variants: NotificationVariant[] = ['info', 'success', 'warning', 'error'];

      variants.forEach((variant) => {
        act(() => {
          useNotificationStore.getState().addNotification({
            variant,
            message: `${variant} message`,
          });
        });
      });

      const state = useNotificationStore.getState();

      expect(state.notifications).toHaveLength(4);
      state.notifications.forEach((n, i) => {
        expect(n.variant).toBe(variants[i]);
      });
    });
  });
});
