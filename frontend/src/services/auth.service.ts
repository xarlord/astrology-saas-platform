/**
 * Auth Service — Google Sign-In via Firebase Auth SDK
 *
 * Uses Firebase Auth's signInWithPopup which handles the full OAuth flow:
 *   - Opens popup to accounts.google.com
 *   - Google redirects to firebaseapp.com/__/auth/handler (alive and working)
 *   - Firebase Auth handler processes the token
 *   - Result relayed back through popup to parent window
 *
 * The Firebase auth handler at astroverse-4ca2e.firebaseapp.com/__/auth/handler
 * returns 200 and is fully functional (served by Firebase Auth infra, not Hosting).
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
// Firebase Auth — Google Sign-In
// ---------------------------------------------------------------------------

/**
 * Sign in with Google using Firebase Auth SDK.
 * Lazy-loads Firebase to avoid unnecessary bundle size.
 */
async function firebaseGoogleSignIn(): Promise<string> {
  // Dynamic imports — Firebase is only loaded when user clicks Google login
  const { getFirebaseAuth } = await import('../config/firebase');
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  // Add scopes
  provider.addScope('email');
  provider.addScope('profile');

  // Set custom parameters to always show account picker
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await signInWithPopup(auth, provider);

  // Get the ID token from the Firebase user
  const idToken = await result.user.getIdToken();

  if (!idToken) {
    throw new Error('Failed to get ID token from Google Sign-In');
  }

  return idToken;
}

/**
 * Check if we're returning from a Google OAuth redirect.
 * Not used in popup flow but kept for potential redirect fallback.
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
   * Google social login using Firebase Auth SDK signInWithPopup.
   *
   * Flow:
   * 1. signInWithPopup opens Google auth in a popup
   * 2. Google redirects to firebaseapp.com/__/auth/handler (alive and working)
   * 3. Firebase processes the credential
   * 4. Result returned to parent window via popup relay
   * 5. We extract the ID token and send to our backend
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    const idToken = await firebaseGoogleSignIn();

    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider,
    });
    return response.data.data;
  },

  /**
   * Complete social login with a pre-obtained id_token.
   */
  async socialLoginWithToken(idToken: string): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider: 'google',
    });
    return response.data.data;
  },
};
