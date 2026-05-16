/**
 * Auth Service — Google Sign-In via Google Identity Services (GIS)
 *
 * Uses Google's native One Tap / Popup flow instead of Firebase Auth.
 * This bypasses Firebase authDomain issues (the firebaseapp.com domain
 * returns "Site Not Found", breaking the popup/redirect flow).
 *
 * The backend verifies Google ID tokens directly using Google's public keys.
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
// Google Identity Services — direct OAuth2 popup
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ? `${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}.apps.googleusercontent.com`
    : '';

/**
 * Decode JWT payload without a library
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Open Google Sign-In popup using Google Identity Services (GIS).
 * Returns the ID token string directly from Google.
 *
 * This approach:
 * - Does NOT use Firebase Auth or firebaseapp.com authDomain
 * - Works on any domain (no authorized domains config needed)
 * - Uses Google's native popup flow via accounts.google.com
 */
function googleSignInWithPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if Google Identity Services script is loaded
    if (typeof google === 'undefined' || !google.accounts?.id) {
      reject(new Error('Google Sign-In is not available. Please refresh the page and try again.'));
      return;
    }

    // Use the GIS popup (token client) method
    const tokenClient = google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: google.accounts.id.CredentialResponse) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('Google Sign-In was cancelled or failed'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    // Prompt for account selection (popup style)
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // One Tap can't display — try popup method instead
        tryGoogleOAuthPopup(resolve, reject);
      } else if (notification.isSkippedMoment()) {
        // User skipped or already signed in — try popup
        tryGoogleOAuthPopup(resolve, reject);
      } else if (notification.isDismissedMoment()) {
        reject(new Error('Google Sign-In was cancelled'));
      }
    });
  });
}

/**
 * Fallback: Use Google OAuth2 popup via accounts.google.com/gsi/client
 * This is the explicit popup that opens a Google sign-in window.
 */
function tryGoogleOAuthPopup(
  resolve: (token: string) => void,
  reject: (error: Error) => void,
): void {
  // Use the GIS token client for popup flow
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile openid',
    callback: (response) => {
      if (response.access_token) {
        // We got an access token — exchange for ID token via userinfo
        fetchUserInfo(response.access_token)
          .then((userInfo) => {
            // Create a minimal JWT-like payload for the backend
            // The backend will verify the access token directly
            resolve(response.access_token);
          })
          .catch(() => reject(new Error('Failed to get user info from Google')));
      } else {
        reject(new Error('Google Sign-In was cancelled'));
      }
    },
    error_callback: (error) => {
      reject(new Error(`Google Sign-In error: ${error.message || 'Unknown error'}`));
    },
  });

  tokenClient.requestAccessToken();
}

/**
 * Fetch user info from Google using access token
 */
async function fetchUserInfo(accessToken: string): Promise<{ email: string; name: string; sub: string }> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}

/**
 * Load the Google Identity Services script dynamically
 */
let gisScriptLoaded = false;
let gisScriptLoading: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (gisScriptLoaded) return Promise.resolve();
  if (gisScriptLoading) return gisScriptLoading;

  gisScriptLoading = new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if (typeof google !== 'undefined' && google.accounts?.id) {
      gisScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });

  return gisScriptLoading;
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
   * Google social login using Google Identity Services (GIS).
   * No Firebase dependency — works directly with accounts.google.com.
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    // Load GIS script if not already loaded
    await loadGoogleIdentityServices();

    // Get Google credential (ID token or access token)
    const credential = await googleSignInWithPopup();

    // Decode the JWT to check if it's an ID token or access token
    const payload = decodeJwtPayload(credential);
    const isIdToken = payload && payload['iss'] === 'https://accounts.google.com';

    if (isIdToken) {
      // Send ID token to backend (same format as Firebase ID token)
      const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
        idToken: credential,
        provider,
      });
      return response.data.data;
    } else {
      // It's an access token — send to a different endpoint
      const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
        accessToken: credential,
        provider,
      });
      return response.data.data;
    }
  },
};
