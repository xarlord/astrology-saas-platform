/**
 * Auth Service — Google Sign-In via Firebase Identity Toolkit
 *
 * Uses Firebase's createAuthUri API to generate a Google OAuth URL.
 * Two flows:
 * 1. Popup: Opens Google auth in a popup, monitors for redirect back
 * 2. Redirect: Full page redirect to Google, then back with token in hash
 *
 * Firebase's createAuthUri sets redirect_uri to our domain, which IS
 * authorized in the OAuth client's redirect URI list. This bypasses:
 *   - The dead authDomain (firebaseapp.com → Site Not Found)
 *   - The origin_mismatch error (OAuth client has no JS origins configured)
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
// Firebase config
// ---------------------------------------------------------------------------

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY ||
  'AIzaSyBvdiU2UDvmWbrbbYDL_ijKGjqDnYls0Ig';

// ---------------------------------------------------------------------------
// Firebase Identity Toolkit — createAuthUri flow
// ---------------------------------------------------------------------------

interface CreateAuthUriResponse {
  authUri: string;
  sessionId: string;
  providerId: string;
}

/**
 * Call Firebase's createAuthUri to get a Google OAuth URL.
 * The redirect_uri is set to our domain (which IS in the authorized redirect URIs).
 */
async function getGoogleAuthUri(): Promise<CreateAuthUriResponse> {
  const continueUri = window.location.origin + '/auth/google-callback';

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'google.com',
        continueUri,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || 'Failed to create auth URI');
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Popup flow
// ---------------------------------------------------------------------------

/**
 * Open Google Sign-In popup and extract the id_token after redirect.
 * The popup goes: accounts.google.com → auth → redirect back to our domain
 * We poll the popup URL and extract the token when it returns to our origin.
 */
function googleSignInPopup(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let authData: CreateAuthUriResponse;
    try {
      authData = await getGoogleAuthUri();
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Failed to initiate Google Sign-In'));
      return;
    }

    const width = 500;
    const height = 600;
    const left = Math.max(0, (screen.width - width) / 2);
    const top = Math.max(0, (screen.height - height) / 2);

    const popup = window.open(
      authData.authUri,
      'google-signin',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    const origin = window.location.origin;
    let resolved = false;

    const interval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          if (!resolved) {
            resolved = true;
            reject(new Error('Google Sign-In was cancelled'));
          }
          return;
        }

        const popupUrl = popup.location.href;
        if (popupUrl.startsWith(origin)) {
          clearInterval(interval);

          // Extract id_token from URL hash or query params
          const idToken = extractToken(popupUrl);
          popup.close();

          if (idToken) {
            resolved = true;
            resolve(idToken);
          } else {
            resolved = true;
            reject(new Error('No ID token received from Google'));
          }
        }
      } catch {
        // Cross-origin error while popup is on Google's domain — expected, keep polling
      }
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      if (!resolved) {
        resolved = true;
        if (!popup.closed) popup.close();
        reject(new Error('Google Sign-In timed out'));
      }
    }, 120_000);
  });
}

/**
 * Extract id_token from a URL — checks both hash fragment and query params.
 */
function extractToken(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Check hash fragment first: #id_token=xxx
    const hash = parsed.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const fromHash = hashParams.get('id_token');
    if (fromHash) return fromHash;

    // Check query params: ?id_token=xxx or ?code=xxx
    const fromQuery = parsed.searchParams.get('id_token');
    if (fromQuery) return fromQuery;

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if we're returning from a Google OAuth redirect.
 * Call this on app startup to handle the redirect callback.
 */
export function handleOAuthCallback(): string | null {
  const url = window.location.href;
  const token = extractToken(url);
  if (token) {
    // Clean up the URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    return token;
  }
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
   * Google social login using Firebase Identity Toolkit createAuthUri.
   *
   * 1. Call Firebase API → get Google OAuth URL with our domain as redirect_uri
   * 2. Open popup to Google auth
   * 3. Google redirects back to our domain with id_token
   * 4. Send id_token to backend for verification
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    const idToken = await googleSignInPopup();

    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider,
    });
    return response.data.data;
  },

  /**
   * Complete social login with a pre-obtained id_token (from redirect callback).
   */
  async socialLoginWithToken(idToken: string): Promise<AuthServiceResponse> {
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider: 'google',
    });
    return response.data.data;
  },
};
