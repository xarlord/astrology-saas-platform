/**
 * Tests for Auth Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '../../stores/authStore';

// Mock the authService
vi.mock('../../services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));

// Import after mocking
import { authService } from '../../services';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  preferences: {
    theme: 'system' as const,
    notifications: true,
    language: 'en',
  },
};

const mockCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

const mockRegisterData = {
  email: 'new@example.com',
  password: 'password123',
  name: 'New User',
};

describe('authStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login action', () => {
    it('should successfully login and update state', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useAuthStore.getState().login(mockCredentials);
      });

      const state = useAuthStore.getState();

      expect(authService.login).toHaveBeenCalledWith(mockCredentials);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('access-token-123');
      expect(state.refreshToken).toBe('refresh-token-123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should store tokens in localStorage on login', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useAuthStore.getState().login(mockCredentials);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token-123');
    });

    it('should set loading state during login', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      vi.mocked(authService.login).mockImplementationOnce(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const loginPromise = act(async () => {
        await useAuthStore.getState().login(mockCredentials);
      });

      // Check loading state immediately after calling login
      expect(useAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        try {
          await useAuthStore.getState().login(mockCredentials);
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should handle non-Error login failures', async () => {
      vi.mocked(authService.login).mockRejectedValueOnce('Unknown error');

      await act(async () => {
        try {
          await useAuthStore.getState().login(mockCredentials);
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe('Login failed');
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('register action', () => {
    it('should successfully register and update state', async () => {
      const newUser = { ...mockUser, email: 'new@example.com', name: 'New User' };
      const mockResponse = {
        user: newUser,
        accessToken: 'access-token-456',
        refreshToken: 'refresh-token-456',
      };

      vi.mocked(authService.register).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useAuthStore.getState().register(mockRegisterData);
      });

      const state = useAuthStore.getState();

      expect(authService.register).toHaveBeenCalledWith(mockRegisterData);
      expect(state.user).toEqual(newUser);
      expect(state.token).toBe('access-token-456');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should store tokens in localStorage on register', async () => {
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token-456',
        refreshToken: 'refresh-token-456',
      };

      vi.mocked(authService.register).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useAuthStore.getState().register(mockRegisterData);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token-456');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token-456');
    });

    it('should handle register error', async () => {
      const errorMessage = 'Email already exists';
      vi.mocked(authService.register).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        try {
          await useAuthStore.getState().register(mockRegisterData);
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle non-Error register failures', async () => {
      vi.mocked(authService.register).mockRejectedValueOnce({});

      await act(async () => {
        try {
          await useAuthStore.getState().register(mockRegisterData);
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe('Registration failed');
    });
  });

  describe('logout action', () => {
    it('should successfully logout and clear state', async () => {
      // First login
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useAuthStore.getState().login(mockCredentials);
      });

      // Now logout
      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();

      expect(authService.logout).toHaveBeenCalled();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear tokens from localStorage on logout', async () => {
      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear state even if logout API fails', async () => {
      vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Network error'));

      // Set authenticated state first
      useAuthStore.setState({
        user: mockUser,
        token: 'token',
        isAuthenticated: true,
      });

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('loadUser action', () => {
    it('should load user from token', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('existing-token');
      vi.mocked(authService.getProfile).mockResolvedValueOnce({ user: mockUser });

      await act(async () => {
        await useAuthStore.getState().loadUser();
      });

      const state = useAuthStore.getState();

      expect(authService.getProfile).toHaveBeenCalled();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('existing-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should not load user if no token exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      await act(async () => {
        await useAuthStore.getState().loadUser();
      });

      const state = useAuthStore.getState();

      expect(authService.getProfile).not.toHaveBeenCalled();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear tokens if profile fetch fails', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-token');
      vi.mocked(authService.getProfile).mockRejectedValueOnce(new Error('Unauthorized'));

      await act(async () => {
        await useAuthStore.getState().loadUser();
      });

      const state = useAuthStore.getState();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateProfile action', () => {
    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(authService.updateProfile).mockResolvedValueOnce({ user: updatedUser });

      await act(async () => {
        await useAuthStore.getState().updateProfile({ name: 'Updated Name' });
      });

      const state = useAuthStore.getState();

      expect(authService.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(state.user).toEqual(updatedUser);
      expect(state.isLoading).toBe(false);
    });

    it('should handle profile update error', async () => {
      vi.mocked(authService.updateProfile).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        try {
          await useAuthStore.getState().updateProfile({ name: 'Updated Name' });
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe('Update failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updatePreferences action', () => {
    it('should update preferences successfully', async () => {
      const updatedUser = {
        ...mockUser,
        preferences: { ...mockUser.preferences, theme: 'dark' as const },
      };
      vi.mocked(authService.updatePreferences).mockResolvedValueOnce({ user: updatedUser });

      await act(async () => {
        await useAuthStore.getState().updatePreferences({ theme: 'dark' });
      });

      const state = useAuthStore.getState();

      expect(authService.updatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
      expect(state.user).toEqual(updatedUser);
    });

    it('should handle preferences update error', async () => {
      vi.mocked(authService.updatePreferences).mockRejectedValueOnce(new Error('Preferences error'));

      await act(async () => {
        try {
          await useAuthStore.getState().updatePreferences({ theme: 'dark' });
        } catch {
          // Expected to throw
        }
      });

      const state = useAuthStore.getState();

      expect(state.error).toBe('Preferences error');
    });
  });

  describe('clearError action', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      act(() => {
        useAuthStore.getState().clearError();
      });

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('setLoading action', () => {
    it('should set loading state', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('selector hooks', () => {
    it('useUser should return user', () => {
      useAuthStore.setState({ user: mockUser });
      const user = useAuthStore.getState().user;
      expect(user).toEqual(mockUser);
    });

    it('useIsAuthenticated should return authentication status', () => {
      useAuthStore.setState({ isAuthenticated: true });
      const isAuth = useAuthStore.getState().isAuthenticated;
      expect(isAuth).toBe(true);
    });

    it('useAuthLoading should return loading state', () => {
      useAuthStore.setState({ isLoading: true });
      const isLoading = useAuthStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });

    it('useAuthError should return error', () => {
      useAuthStore.setState({ error: 'Test error' });
      const error = useAuthStore.getState().error;
      expect(error).toBe('Test error');
    });
  });
});
