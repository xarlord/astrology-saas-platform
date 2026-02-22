/**
 * Tests for useAuth Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

// Mock the auth store
const mockAuthStore = {
  user: null as {
    id: string;
    email: string;
    name: string;
    plan: 'free' | 'basic' | 'premium';
    preferences?: Record<string, unknown>;
  } | null,
  token: null as string | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loadUser: vi.fn(),
  updateProfile: vi.fn(),
  updatePreferences: vi.fn(),
  clearError: vi.fn(),
  setLoading: vi.fn(),
};

vi.mock('../../stores', () => ({
  useAuthStore: vi.fn((selector?: (state: typeof mockAuthStore) => unknown) => {
    if (selector) {
      return selector(mockAuthStore);
    }
    return mockAuthStore;
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.user = null;
    mockAuthStore.token = null;
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.isLoading = false;
    mockAuthStore.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return auth state from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return authenticated state when user is logged in', () => {
      mockAuthStore.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'free',
      };
      mockAuthStore.token = 'test-token';
      mockAuthStore.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockAuthStore.user);
      expect(result.current.token).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should provide login function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.login).toBe('function');
    });

    it('should call store login and return true on success', async () => {
      mockAuthStore.login.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      let loginResult: boolean | undefined;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginResult).toBe(true);
    });

    it('should return false on login failure', async () => {
      mockAuthStore.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      let loginResult: boolean | undefined;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      });

      expect(loginResult).toBe(false);
    });
  });

  describe('register', () => {
    it('should provide register function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.register).toBe('function');
    });

    it('should call store register and return true on success', async () => {
      mockAuthStore.register.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      let registerResult: boolean | undefined;
      await act(async () => {
        registerResult = await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      expect(mockAuthStore.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });
      expect(registerResult).toBe(true);
    });

    it('should return false on register failure', async () => {
      mockAuthStore.register.mockRejectedValueOnce(new Error('Email exists'));

      const { result } = renderHook(() => useAuth());

      let registerResult: boolean | undefined;
      await act(async () => {
        registerResult = await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        });
      });

      expect(registerResult).toBe(false);
    });
  });

  describe('logout', () => {
    it('should provide logout function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.logout).toBe('function');
    });

    it('should call store logout', async () => {
      mockAuthStore.logout.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should provide updateProfile function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.updateProfile).toBe('function');
    });

    it('should call store updateProfile and return true on success', async () => {
      mockAuthStore.updateProfile.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateProfile({
          name: 'Updated Name',
        });
      });

      expect(mockAuthStore.updateProfile).toHaveBeenCalledWith({
        name: 'Updated Name',
      });
      expect(updateResult).toBe(true);
    });

    it('should return false on updateProfile failure', async () => {
      mockAuthStore.updateProfile.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useAuth());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateProfile({
          name: 'New Name',
        });
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('updatePreferences', () => {
    it('should provide updatePreferences function', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.updatePreferences).toBe('function');
    });

    it('should call store updatePreferences and return true on success', async () => {
      mockAuthStore.updatePreferences.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updatePreferences({
          theme: 'dark',
        });
      });

      expect(mockAuthStore.updatePreferences).toHaveBeenCalledWith({
        theme: 'dark',
      });
      expect(updateResult).toBe(true);
    });

    it('should return false on updatePreferences failure', async () => {
      mockAuthStore.updatePreferences.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useAuth());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updatePreferences({
          theme: 'light',
        });
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('hasPlan', () => {
    it('should return true when user has exact plan', () => {
      mockAuthStore.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        plan: 'premium',
      };

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasPlan('premium')).toBe(true);
      expect(result.current.hasPlan('basic')).toBe(false);
      expect(result.current.hasPlan('free')).toBe(false);
    });

    it('should return false when user is null', () => {
      mockAuthStore.user = null;

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasPlan('free')).toBe(false);
      expect(result.current.hasPlan('basic')).toBe(false);
      expect(result.current.hasPlan('premium')).toBe(false);
    });
  });

  describe('hasAtLeastPlan', () => {
    it('should return true when user has equal or higher plan', () => {
      mockAuthStore.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        plan: 'premium',
      };

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasAtLeastPlan('free')).toBe(true);
      expect(result.current.hasAtLeastPlan('basic')).toBe(true);
      expect(result.current.hasAtLeastPlan('premium')).toBe(true);
    });

    it('should return false when user has lower plan', () => {
      mockAuthStore.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test',
        plan: 'basic',
      };

      const { result } = renderHook(() => useAuth());

      expect(result.current.hasAtLeastPlan('free')).toBe(true);
      expect(result.current.hasAtLeastPlan('basic')).toBe(true);
      expect(result.current.hasAtLeastPlan('premium')).toBe(false);
    });

    it('should return true for free plan requirement when user is null (defaults to free)', () => {
      mockAuthStore.user = null;

      const { result } = renderHook(() => useAuth());

      // When user is null, the plan defaults to 'free' in the hierarchy check
      expect(result.current.hasAtLeastPlan('free')).toBe(true);
      expect(result.current.hasAtLeastPlan('basic')).toBe(false);
      expect(result.current.hasAtLeastPlan('premium')).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should expose loadUser from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loadUser).toBe(mockAuthStore.loadUser);
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.clearError).toBe(mockAuthStore.clearError);
    });

    it('should expose setLoading from store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.setLoading).toBe(mockAuthStore.setLoading);
    });

    it('should call clearError', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(mockAuthStore.clearError).toHaveBeenCalled();
    });

    it('should call setLoading', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.setLoading(true);
      });

      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(true);
    });
  });
});
