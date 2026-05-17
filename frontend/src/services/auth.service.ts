/**
 * Auth Service — Google Sign-In via Firebase Auth SDK
 *
 * Uses signInWithRedirect (full page redirect) instead of signInWithPopup.
 * This avoids popup blocker issues and popup-closed-by-user errors that
 * occur on mobile browsers or when third-party cookies are blocked.
 *
 * Flow:
 * 1. Click Google button → redirect to Google auth
 * 2. Google auth → redirect to firebaseapp.com/__/auth/handler
 * 3. Firebase handler → redirect back to our app
 * 4. On page load, getRedirectResult() extracts the credential
 * 5. Send ID token to backend
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

// Track if we've already checked for redirect result on this page load
let redirectResultChecked = false;

// ---------------------------------------------------------------------------
// Firebase Auth — Google Sign-In via redirect
// ---------------------------------------------------------------------------

/**
 * Initiate Google Sign-In by redirecting the entire page to Google.
 */
async function firebaseGoogleSignInRedirect(): Promise<void> {
  const { getFirebaseAuth } = await import('../config/firebase');
  const { GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  await signInWithRedirect(auth, provider);
}

/**
 * Check if we're returning from a Google OAuth redirect.
 * If so, extract the credential and return the ID token.
 */
export async function checkRedirectResult(): Promise<string | null> {
  if (redirectResultChecked) return null;
  redirectResultChecked = true;

  try {
    const { getFirebaseAuth } = await import('../config/firebase');
    const { getRedirectResult } = await import('firebase/auth');

    const auth = getFirebaseAuth();
    const result = await getRedirectResult(auth);

    if (result) {
      const idToken = await result.user.getIdToken();
      return idToken;
    }
  } catch (err) {
    console.error('Firebase redirect result error:', err);
    throw err;
  }

  return null;
}

/**
 * Check if we're returning from a redirect (sync version for router guard).
 * Always returns null — actual check is async via checkRedirectResult().
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
   * Google social login using Firebase Auth SDK signInWithRedirect.
   * This triggers a full page redirect to Google, which then redirects back.
   * The result is picked up by checkRedirectResult() on page load.
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    // Initiate the redirect — this navigates away from the page
    await firebaseGoogleSignInRedirect();
    // Code after this won't execute (page navigates away)
    // But TypeScript needs a return value
    throw new Error('Redirecting to Google...');
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
