/**
 * useAuth Hook — Email/password only
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

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    [login],
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      await register(data);
    },
    [register],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

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

  const hasPlan = useCallback(
    (plan: 'free' | 'basic' | 'premium') => {
      return user?.plan === plan;
    },
    [user],
  );

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
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loadUser,
    updateProfile: handleUpdateProfile,
    updatePreferences: handleUpdatePreferences,
    clearError,
    setLoading,

    hasPlan,
    hasAtLeastPlan,
  };
};

export default useAuth;
