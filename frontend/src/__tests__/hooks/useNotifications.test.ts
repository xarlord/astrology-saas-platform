/**
 * Tests for useNotifications Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../stores/notificationStore';

// Mock notification data
const mockNotification: Notification = {
  id: 'notification-1',
  variant: 'info',
  message: 'Test notification',
  timestamp: Date.now(),
};

const mockSuccessNotification: Notification = {
  id: 'notification-2',
  variant: 'success',
  title: 'Success!',
  message: 'Operation completed successfully',
  duration: 4000,
  timestamp: Date.now(),
};

const mockWarningNotification: Notification = {
  id: 'notification-3',
  variant: 'warning',
  title: 'Warning',
  message: 'Please review your input',
  duration: 6000,
  timestamp: Date.now(),
};

const mockErrorNotification: Notification = {
  id: 'notification-4',
  variant: 'error',
  title: 'Error',
  message: 'Something went wrong',
  duration: 8000,
  timestamp: Date.now(),
};

const mockNotificationWithAction: Notification = {
  id: 'notification-5',
  variant: 'info',
  message: 'Undo action?',
  action: {
    label: 'Undo',
    onClick: vi.fn(),
  },
  duration: 0,
  timestamp: Date.now(),
};

// Mock the notification store
const mockNotificationStore = {
  notifications: [] as Notification[],
  maxNotifications: 5,
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  clearAll: vi.fn(),
  showInfo: vi.fn(),
  showSuccess: vi.fn(),
  showWarning: vi.fn(),
  showError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useNotificationStore: vi.fn((selector?: (state: typeof mockNotificationStore) => unknown) => {
    if (selector) {
      return selector(mockNotificationStore);
    }
    return mockNotificationStore;
  }),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationStore.notifications = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should return notifications from store', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useNotifications());

      // State
      expect(result.current).toHaveProperty('notifications');

      // Methods
      expect(typeof result.current.info).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.add).toBe('function');
      expect(typeof result.current.remove).toBe('function');
      expect(typeof result.current.clear).toBe('function');
      expect(typeof result.current.withAction).toBe('function');
      expect(typeof result.current.loading).toBe('function');
      expect(typeof result.current.withLoading).toBe('function');
    });
  });

  describe('info', () => {
    it('should call store showInfo with message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.info('Info message');
      });

      expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('Info message', undefined);
    });

    it('should call store showInfo with message and title', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.info('Info message', 'Info Title');
      });

      expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('Info message', 'Info Title');
    });
  });

  describe('success', () => {
    it('should call store showSuccess with message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.success('Success message');
      });

      expect(mockNotificationStore.showSuccess).toHaveBeenCalledWith('Success message', undefined);
    });

    it('should call store showSuccess with message and title', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.success('Success message', 'Success Title');
      });

      expect(mockNotificationStore.showSuccess).toHaveBeenCalledWith(
        'Success message',
        'Success Title',
      );
    });
  });

  describe('warning', () => {
    it('should call store showWarning with message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.warning('Warning message');
      });

      expect(mockNotificationStore.showWarning).toHaveBeenCalledWith('Warning message', undefined);
    });

    it('should call store showWarning with message and title', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.warning('Warning message', 'Warning Title');
      });

      expect(mockNotificationStore.showWarning).toHaveBeenCalledWith(
        'Warning message',
        'Warning Title',
      );
    });
  });

  describe('error', () => {
    it('should call store showError with message', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.error('Error message');
      });

      expect(mockNotificationStore.showError).toHaveBeenCalledWith('Error message', undefined);
    });

    it('should call store showError with message and title', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.error('Error message', 'Error Title');
      });

      expect(mockNotificationStore.showError).toHaveBeenCalledWith('Error message', 'Error Title');
    });
  });

  describe('add', () => {
    it('should call store addNotification with notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.add({
          variant: 'info',
          message: 'Custom notification',
        });
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        variant: 'info',
        message: 'Custom notification',
      });
    });

    it('should support all notification properties', () => {
      const { result } = renderHook(() => useNotifications());

      const customNotification = {
        variant: 'success' as const,
        title: 'Custom Title',
        message: 'Custom message',
        duration: 10000,
        showProgress: true,
        action: {
          label: 'View',
          onClick: vi.fn(),
        },
      };

      act(() => {
        result.current.add(customNotification);
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(customNotification);
    });
  });

  describe('remove', () => {
    it('should call store removeNotification with id', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.remove('notification-1');
      });

      expect(mockNotificationStore.removeNotification).toHaveBeenCalledWith('notification-1');
    });
  });

  describe('clear', () => {
    it('should call store clearAll', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.clear();
      });

      expect(mockNotificationStore.clearAll).toHaveBeenCalled();
    });
  });

  describe('withAction', () => {
    it('should add notification with action', () => {
      const { result } = renderHook(() => useNotifications());

      const actionHandler = vi.fn();

      act(() => {
        result.current.withAction('Undo this action?', 'Undo', actionHandler, 'warning');
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        variant: 'warning',
        message: 'Undo this action?',
        action: {
          label: 'Undo',
          onClick: actionHandler,
        },
        duration: 0,
      });
    });

    it('should default variant to info', () => {
      const { result } = renderHook(() => useNotifications());

      const actionHandler = vi.fn();

      act(() => {
        result.current.withAction('Message', 'Action', actionHandler);
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
        }),
      );
    });

    it('should set duration to 0 (no auto-close)', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.withAction('Message', 'Action', vi.fn(), 'error');
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0,
        }),
      );
    });
  });

  describe('loading', () => {
    it('should add loading notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.loading('Loading data...');
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        variant: 'info',
        message: 'Loading data...',
        duration: 0,
      });
    });

    it('should return dismiss function', () => {
      const { result } = renderHook(() => useNotifications());

      let dismiss: (() => void) | undefined;
      act(() => {
        dismiss = result.current.loading('Loading...');
      });

      expect(typeof dismiss).toBe('function');

      act(() => {
        dismiss?.();
      });

      expect(mockNotificationStore.removeNotification).toHaveBeenCalled();
    });

    it('dismiss function should remove the notification', () => {
      const { result } = renderHook(() => useNotifications());

      let dismiss: (() => void) | undefined;
      act(() => {
        dismiss = result.current.loading('Loading...');
      });

      // The loading function creates an id like `loading-${Date.now()}`
      // So we check that removeNotification was called with an id starting with 'loading-'
      act(() => {
        dismiss?.();
      });

      const calledWithId = mockNotificationStore.removeNotification.mock.calls[0][0];
      expect(calledWithId).toMatch(/^loading-\d+$/);
    });
  });

  describe('withLoading', () => {
    it('should show loading notification during operation', async () => {
      const { result } = renderHook(() => useNotifications());

      const operation = vi.fn().mockResolvedValue('result');

      await act(async () => {
        const operationResult = await result.current.withLoading('Processing...', operation);
        expect(operationResult).toBe('result');
      });

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        variant: 'info',
        message: 'Processing...',
        duration: 0,
      });
    });

    it('should dismiss loading notification after operation completes', async () => {
      const { result } = renderHook(() => useNotifications());

      const operation = vi.fn().mockResolvedValue('result');

      await act(async () => {
        await result.current.withLoading('Processing...', operation);
      });

      expect(mockNotificationStore.removeNotification).toHaveBeenCalled();
    });

    it('should return operation result', async () => {
      const { result } = renderHook(() => useNotifications());

      const operation = vi.fn().mockResolvedValue({ data: 'test' });

      let operationResult: unknown;
      await act(async () => {
        operationResult = await result.current.withLoading('Processing...', operation);
      });

      expect(operationResult).toEqual({ data: 'test' });
    });

    it('should dismiss loading notification on error', async () => {
      const { result } = renderHook(() => useNotifications());

      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      await act(async () => {
        try {
          await result.current.withLoading('Processing...', operation);
        } catch {
          // Expected error
        }
      });

      expect(mockNotificationStore.removeNotification).toHaveBeenCalled();
    });

    it('should rethrow error after dismissing', async () => {
      const { result } = renderHook(() => useNotifications());

      const error = new Error('Operation failed');
      const operation = vi.fn().mockRejectedValue(error);

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.withLoading('Processing...', operation);
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError).toEqual(error);
    });
  });

  describe('notifications state', () => {
    it('should reflect notifications from store', () => {
      mockNotificationStore.notifications = [mockNotification, mockSuccessNotification];

      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications).toContainEqual(mockNotification);
      expect(result.current.notifications).toContainEqual(mockSuccessNotification);
    });

    it('should reflect empty notifications array', () => {
      mockNotificationStore.notifications = [];

      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
    });

    it('should reflect notifications with actions', () => {
      mockNotificationStore.notifications = [mockNotificationWithAction];

      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].action).toBeDefined();
      expect(result.current.notifications[0].action?.label).toBe('Undo');
    });
  });

  describe('multiple notifications', () => {
    it('should handle multiple sequential notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.info('First message');
        result.current.success('Second message');
        result.current.warning('Third message');
      });

      expect(mockNotificationStore.showInfo).toHaveBeenCalledWith('First message', undefined);
      expect(mockNotificationStore.showSuccess).toHaveBeenCalledWith('Second message', undefined);
      expect(mockNotificationStore.showWarning).toHaveBeenCalledWith('Third message', undefined);
    });
  });
});
