/**
 * usePushNotifications Hook Tests
 * TDD: Tests written before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

// Mock Notification API
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn(),
};

global.Notification = mockNotification as any;

// Mock URL base64 conversion
global.btoa = vi.fn((str) => Buffer.from(str).toString('base64'));

// Mock service worker registration
vi.mock('../../utils/serviceWorkerRegistration', () => ({
  getSWRegistration: vi.fn().mockResolvedValue({
    pushManager: {
      subscribe: vi.fn().mockResolvedValue({
        endpoint: 'https://test.push.endpoint',
        getKey: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
        toJSON: () => ({ endpoint: 'https://test.push.endpoint' }),
      }),
      getSubscription: vi.fn().mockResolvedValue(null),
    },
  }),
}));

// Mock API service
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../services/api';

describe('usePushNotifications Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Notification.permission
    mockNotification.permission = 'default';
    mockNotification.requestPermission.mockReset();

    // Clear all mock calls
    vi.mocked(api.get).mockClear();
    vi.mocked(api.post).mockClear();
    vi.mocked(api.delete).mockClear();
  });

  it('should have initial permission state', () => {
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('default');
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.subscribing).toBe(false);
  });

  it('should request permission and subscribe successfully', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { publicKey: 'test-public-key' } },
    });

    vi.mocked(api.post).mockResolvedValue({
      data: { success: true },
    });

    // Mock Notification.requestPermission
    mockNotification.requestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('default');

    await act(async () => {
      await result.current.subscribe();
    });

    await waitFor(() => {
      expect(result.current.permission).toBe('granted');
      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(vi.mocked(api.post)).toHaveBeenCalled();
    });
  });

  it('should check subscription status on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [] },
    });

    renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(vi.mocked(api.get)).toHaveBeenCalledWith('/notifications/subscriptions');
    });
  });

  it('should detect existing subscription', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          {
            id: 'sub-123',
            endpoint: 'https://test.push.endpoint',
          },
        ],
      },
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(true);
    });
  });

  it('should handle permission denied', async () => {
    mockNotification.requestPermission.mockResolvedValue('denied');
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [] },
    });

    const { result } = renderHook(() => usePushNotifications());

    // Wait for initial subscription check
    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    await waitFor(() => {
      expect(result.current.permission).toBe('denied');
      expect(result.current.isSubscribed).toBe(false);
    });
  });

  it('should unsubscribe from push notifications', async () => {
    const mockSubscription = {
      endpoint: 'https://test.push.endpoint',
      unsubscribe: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: [
          {
            id: 'sub-123',
            endpoint: 'https://test.push.endpoint',
          },
        ],
      },
    });

    vi.mocked(api.delete).mockResolvedValue({
      data: { success: true },
    });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(true);
    });

    await act(async () => {
      await result.current.unsubscribe('sub-123');
    });

    expect(vi.mocked(api.delete)).toHaveBeenCalledWith('/notifications/subscribe/sub-123');
  });

  it('should send test notification', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [] },
    });

    vi.mocked(api.post).mockResolvedValue({
      data: { success: true },
    });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.sendTest();
    });

    expect(vi.mocked(api.post)).toHaveBeenCalledWith('/notifications/test');
  });

  it('should handle subscription error gracefully', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(false);
    });
  });

  it('should set subscribing state during subscription process', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { publicKey: 'test-key' } },
    });

    vi.mocked(api.post).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: { success: true } }), 100);
        })
    );

    mockNotification.requestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => usePushNotifications());

    // Start subscription
    act(() => {
      result.current.subscribe();
    });

    // Check subscribing state is true during the process
    await waitFor(() => {
      expect(result.current.subscribing).toBe(true);
    });

    // Wait for subscription to complete
    await waitFor(() => {
      expect(result.current.subscribing).toBe(false);
    }, { timeout: 3000 });
  });

  it('should handle service worker not registered error', async () => {
    const { getSWRegistration } = await import('../../utils/serviceWorkerRegistration');
    vi.mocked(getSWRegistration).mockResolvedValueOnce(null);

    mockNotification.requestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch (error: any) {
        expect(error.message).toContain('Service worker not registered');
      }
    });
  });
});
