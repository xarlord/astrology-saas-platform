/**
 * Auth Service
 */

import api from './api';
import type { User, UserPreferences } from './api.types';
import { getAuth, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { getFirebaseApp, isFirebaseConfigured } from '../config/firebase';

// Re-export types from api.types
export type { LoginCredentials, RegisterData, AuthResponse } from './api.types';

export interface AuthServiceResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/register', data);
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(credentials: { email: string; password: string }): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ data: { user: User } }>('/auth/me');
    return response.data.data;
  },

  /**
   * Update profile
   */
  async updateProfile(data: {
    name?: string;
    avatar_url?: string;
    timezone?: string;
  }): Promise<{ user: User }> {
    const response = await api.put<{ data: { user: User } }>('/auth/me', data);
    return response.data.data;
  },

  /**
   * Update preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ user: User }> {
    const response = await api.put<{ data: { user: User } }>('/auth/me/preferences', {
      preferences,
    });
    return response.data.data;
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ data: { accessToken: string } }>(
      '/auth/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    );
    return response.data.data;
  },

  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    // All firebase/auth imports are now static — prevents Vite tree-shaking this entire code path
    if (!isFirebaseConfigured()) {
      throw new Error('Social login is not configured. Please contact support.');
    }

    const auth = getAuth(getFirebaseApp());

    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Use signInWithPopup — more reliable across browsers and doesn't require
    // redirect handling. signInWithRedirect was failing silently in production
    // because Vite's chunk merging corrupted the dynamic import resolution.
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Send the ID token to our backend to verify and create/get user
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider,
    });
    return response.data.data;
  },

  /**
   * Handle Firebase redirect result after Google sign-in returns to our page.
   * Must be called on app initialization (e.g., in App.tsx or a top-level effect).
   * Returns null if no redirect is pending, or the AuthServiceResponse on success.
   */
  async handleRedirectResult(): Promise<AuthServiceResponse | null> {
    if (!isFirebaseConfigured()) {
      return null;
    }

    const auth = getAuth(getFirebaseApp());

    let result;
    try {
      result = await getRedirectResult(auth);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; customData?: unknown };
      console.error('[Firebase] getRedirectResult error:', {
        code: e.code,
        message: e.message,
        customData: e.customData,
      });
      throw err;
    }

    if (!result) {
      return null; // No redirect happened — normal page load
    }

    console.log('[Firebase] getRedirectResult success, user:', result.user.email);
    const idToken = await result.user.getIdToken();

    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider: 'google',
    });

    return response.data.data;
  },
};
