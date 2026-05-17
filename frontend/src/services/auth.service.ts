/**
 * Auth Service — Google Sign-In via Google Identity Services (GIS)
 *
 * Uses Google's native popup flow via GIS.
 * The OAuth client ID is discovered from the Firebase project config.
 * Backend verifies tokens via Google's tokeninfo endpoint.
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
// Google OAuth Client ID — from Firebase project's auto-created web client
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '867374800592-se2qmbmoi4n8nc9kjispnnk7cijt2nnk.apps.googleusercontent.com';

// ---------------------------------------------------------------------------
// Google Identity Services — popup OAuth flow
// ---------------------------------------------------------------------------

let gisScriptLoaded = false;
let gisScriptLoading: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (gisScriptLoaded) return Promise.resolve();
  if (typeof google !== 'undefined' && google.accounts?.oauth2) {
    gisScriptLoaded = true;
    return Promise.resolve();
  }
  if (gisScriptLoading) return gisScriptLoading;

  gisScriptLoading = new Promise<void>((resolve, reject) => {
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

/**
 * Open Google Sign-In popup using GIS token client.
 * Returns the access token from Google.
 */
function googleSignInPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject(new Error('Google Sign-In was cancelled'));
        }
      },
      error_callback: (error) => {
        reject(new Error(`Google Sign-In error: ${error.message || 'Unknown error'}`));
      },
    });

    tokenClient.requestAccessToken();
  });
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
   * Opens a popup from accounts.google.com — no Firebase authDomain needed.
   * Backend verifies the access token via Google's tokeninfo endpoint.
   */
  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    await loadGoogleIdentityServices();
    const accessToken = await googleSignInPopup();

    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      accessToken,
      provider,
    });
    return response.data.data;
  },
};
