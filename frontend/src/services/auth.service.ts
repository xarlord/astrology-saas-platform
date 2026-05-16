/**
 * Auth Service
 */

import api from './api';
import type { User, UserPreferences } from './api.types';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

// Re-export types from api.types
export type { LoginCredentials, RegisterData, AuthResponse } from './api.types';

// ---------------------------------------------------------------------------
// Firebase singleton — initialized once, reused across calls
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------

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
    if (!isFirebaseConfigured()) {
      throw new Error('Social login is not configured. Please contact support.');
    }

    const auth = getFirebaseAuth();

    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Send the ID token to our backend to verify and create/get user
    const response = await api.post<{ data: AuthServiceResponse }>('/auth/social', {
      idToken,
      provider,
    });
    return response.data.data;
  },
};
