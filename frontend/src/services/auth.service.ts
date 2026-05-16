/**
 * Auth Service — Firebase Google Sign-In
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
// Firebase — static imports to prevent tree-shaking / bundling issues
// ---------------------------------------------------------------------------
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

// Get or create Firebase app singleton
function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
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

  async socialLogin(provider: 'google'): Promise<AuthServiceResponse> {
    if (!isFirebaseConfigured()) {
      throw new Error('Social login is not configured. Please contact support.');
    }

    try {
      const app = getFirebaseApp();
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');

      // Sign out any existing Firebase user first to prevent popup-closed-by-user errors
      // when the user has already authenticated via Firebase on a different page
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await firebaseSignOut(auth);
        }
      } catch {
        // Ignore sign-out errors — proceed with popup
      }

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', { idToken, provider });
      return response.data.data;
    } catch (err) {
      // If the error is popup-closed-by-user, provide a clearer message
      if (err instanceof Error && err.message?.includes('popup-closed-by-user')) {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      throw err;
    }
  },
};
