/**
 * Authentication Store
 *
 * Manages user authentication state and actions
 * Persists to localStorage for session persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authService } from '../services';
import { getAccessToken } from '../utils/tokenStorage';
import type { User, LoginCredentials, RegisterData } from '../services/api.types';

interface AuthState {
  // State
  user: User | null;
  token: string | null; // In-memory only (not persisted)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
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
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(credentials);
            const { user, accessToken } = response;

            // Store only access token in-memory; refresh token handled via httpOnly cookie

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

        // Register action
        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register(data);
            const { user, accessToken } = response;

            // Store only access token in-memory; refresh token handled via httpOnly cookie

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

        // Logout action
        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            // Clear state
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        // Load user from token
        loadUser: async () => {
          const token = getAccessToken();
          if (!token) {
            set({ isAuthenticated: false });
            return;
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
            // Clear invalid tokens via Zustand persist
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        // Update profile
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

        // Update preferences
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

        // Clear error
        clearError: () => set({ error: null }),

        // Set loading state
        setLoading: (loading: boolean) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;
