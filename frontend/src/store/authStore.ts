/**
 * Auth Store - Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';
import type { UserPreferences } from '../services/auth.service';
import { getErrorMessage } from '../utils/errorHandling';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  plan: string;
  preferences: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Record<string, unknown>) => Promise<void>;
  clearError: () => void;
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, 'Login failed'),
            isLoading: false,
          });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ name, email, password });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, 'Registration failed'),
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(data);
          set({ user: response.user, isLoading: false });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, 'Update failed'),
            isLoading: false,
          });
        }
      },

      updatePreferences: async (preferences) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updatePreferences(preferences as UserPreferences);
          set({ user: response.user, isLoading: false });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, 'Update failed'),
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for token refresh events from API interceptor
window.addEventListener('auth:token-refreshed', ((event: CustomEvent<{ accessToken: string }>) => {
  useAuthStore.setState({ accessToken: event.detail.accessToken });
}) as EventListener);

// Listen for session expiry events
window.addEventListener('auth:session-expired', () => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  window.location.href = '/login';
});
