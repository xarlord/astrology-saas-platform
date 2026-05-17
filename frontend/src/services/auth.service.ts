/**
 * Auth Service — Firebase Auth for Google Sign-In
 *
 * Uses Firebase Auth SDK for Google sign-in popup.
 * The Firebase project astroverse-4ca2e has astroverse.fly.dev
 * as an authorized domain.
 *
 * Backend verifies Firebase ID tokens using Firebase Admin SDK.
 */

import api from './api';
import type { User, UserPreferences } from './api.types';

// Re-export types from api.types
export type { LoginCredentials, RegisterData, AuthResponse } from './api.types';

export interface AuthServiceResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Firebase Auth
// ---------------------------------------------------------------------------

async function getFirebaseAuth() {
  const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
  const { getFirebaseApp } = await import('../config/firebase');
  const auth = getAuth(getFirebaseApp());
  return { auth, signInWithPopup, GoogleAuthProvider };
}

// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/register', data);
    return response.data.data;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ data: { user: User } }>('/auth/me');
    return response.data.data;
  },

  async updateProfile(data: { name?: string; avatar_url?: string; timezone?: string }): Promise<{ user: User }> {
    const response = await api.put<{ data: { user: User } }>('/auth/me', data);
    return response.data.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{ user: User }> {
    const response = await api.put<{ data: { user: User } }>('/auth/me/preferences', { preferences });
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    type RefreshResponse = { data: { accessToken: string } };
    const response = await api.post<RefreshResponse>(
      '/auth/refresh', {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
    return response.data.data;
  },

  /**
   * Google social login using Firebase Auth SDK.
   * Firebase handles the OAuth flow internally using the project's API key.
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    const { auth, signInWithPopup, GoogleAuthProvider } = await getFirebaseAuth();

    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider,
    });
    return response.data.data;
  },
};
