/**
 * Authentication Store — Email/password only
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authService } from '../services';
import { getAccessToken } from '../utils/tokenStorage';
import { clearCsrfToken } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../services/api.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar_url?: string; timezone?: string }) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, _get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(credentials);
            const { user, accessToken } = response;
            // CSRF token was generated for anonymous session; clear it
            // so the next mutating request fetches a fresh one for the authenticated session.
            clearCsrfToken();
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register(data);
            const { user, accessToken } = response;
            // CSRF token was generated for anonymous session; clear it
            clearCsrfToken();
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Registration failed',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            // Logout error: session cleared on client side regardless
          } finally {
            clearCsrfToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        loadUser: async () => {
          // First try: use existing token
          let token = getAccessToken();
          
          // If no token but user was authenticated (persisted state), try refresh
          if (!token) {
            try {
              const { data } = await (await import('../services/api')).default.post<{ data: { accessToken: string } }>('/v1/auth/refresh');
              token = data.data.accessToken;
              // Update store with refreshed token
              set({ token, isAuthenticated: true });
            } catch {
              // Refresh failed — clear auth
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
              return;
            }
          }

          set({ isLoading: true, error: null });
          try {
            const response = await authService.getProfile();
            set({
              user: response.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.updateProfile(data);
            set({
              user: response.user,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Profile update failed',
              isLoading: false,
            });
            throw error;
          }
        },

        updatePreferences: async (preferences) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.updatePreferences(preferences);
            set({
              user: response.user,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Preferences update failed',
              isLoading: false,
            });
            throw error;
          }
        },

        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Listen for token refresh events from API interceptor
window.addEventListener('auth:token-refreshed', ((event: CustomEvent<{ accessToken: string }>) => {
  useAuthStore.setState({ token: event.detail.accessToken });
}) as EventListener);

// Listen for session expiry events
window.addEventListener('auth:session-expired', () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
});

export default useAuthStore;
