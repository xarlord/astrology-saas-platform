/**
 * Auth Service — Google Sign-In via Firebase Auth SDK (signInWithPopup)
 *
 * Uses signInWithPopup instead of signInWithRedirect.
 * The redirect flow fails because Firebase's iframe credential relay is blocked
 * by third-party cookie restrictions in modern browsers (cross-origin:
 * fly.dev page can't receive credential from firebaseapp.com iframe).
 *
 * signInWithPopup avoids this entirely — the popup communicates via postMessage,
 * no iframe, no cross-origin cookie dependency, no redirect state loss.
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
// Firebase Auth — Google Sign-In via popup
// ---------------------------------------------------------------------------

/**
 * Initiate Google Sign-In via popup. Returns ID token on success.
 */
async function firebaseGoogleSignInPopup(): Promise<string> {
  const { getFirebaseAuth } = await import('../config/firebase');
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return idToken;
}

/**
 * Check for redirect result — returns null (kept for API compat).
 * We use popup flow now, so this is a no-op.
 */
export async function checkRedirectResult(): Promise<string | null> {
  return null;
}

/**
 * Handle OAuth callback — returns null (kept for API compat).
 */
export function handleOAuthCallback(): string | null {
  return null;
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
   * Google social login using Firebase Auth signInWithPopup.
   * Opens a popup to Google, gets ID token, sends to backend.
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    const idToken = await firebaseGoogleSignInPopup();
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider: 'google',
    });
    return response.data.data;
  },

  /**
   * Complete social login with a pre-obtained ID token.
   */
  async socialLoginWithToken(idToken: string): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider: 'google',
    });
    return response.data.data;
  },
};
