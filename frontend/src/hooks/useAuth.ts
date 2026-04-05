/**
 * useAuth Hook
 *
 * Custom hook for authentication methods and state
 * Wraps the auth store for easier use in components
 */

import { useCallback } from 'react';
import { useAuthStore } from '../stores';
import type { LoginCredentials, RegisterData, User } from '../services/api.types';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    updatePreferences,
    clearError,
    setLoading,
  } = useAuthStore();

  // Login wrapper with error handling
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await login(credentials);
        return true;
      } catch {
        return false;
      }
    },
    [login],
  );

  // Register wrapper with error handling
  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        await register(data);
        return true;
      } catch {
        return false;
      }
    },
    [register],
  );

  // Logout wrapper
  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Update profile wrapper
  const handleUpdateProfile = useCallback(
    async (data: { name?: string; avatar_url?: string; timezone?: string }) => {
      try {
        await updateProfile(data);
        return true;
      } catch {
        return false;
      }
    },
    [updateProfile],
  );

  // Update preferences wrapper
  const handleUpdatePreferences = useCallback(
    async (preferences: Partial<User['preferences']>) => {
      try {
        await updatePreferences(preferences);
        return true;
      } catch {
        return false;
      }
    },
    [updatePreferences],
  );

  // Check if user has specific plan
  const hasPlan = useCallback(
    (plan: 'free' | 'basic' | 'premium') => {
      return user?.plan === plan;
    },
    [user],
  );

  // Check if user has at least specific plan
  const hasAtLeastPlan = useCallback(
    (plan: 'free' | 'basic' | 'premium') => {
      const planHierarchy = { free: 0, basic: 1, premium: 2 };
      const userPlanLevel = planHierarchy[user?.plan ?? 'free'];
      const requiredPlanLevel = planHierarchy[plan];
      return userPlanLevel >= requiredPlanLevel;
    },
    [user],
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loadUser,
    updateProfile: handleUpdateProfile,
    updatePreferences: handleUpdatePreferences,
    clearError,
    setLoading,

    // Computed
    hasPlan,
    hasAtLeastPlan,
  };
};

export default useAuth;
