/**
 * Auth Service
 */

import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    timezone: string;
    plan: string;
    preferences: Record<string, any>;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', data);
    return data.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data.data;
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
  async getProfile(): Promise<{ user: any }> {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  /**
   * Update profile
   */
  async updateProfile(data: {
    name?: string;
    avatar_url?: string;
    timezone?: string;
  }): Promise<{ user: any }> {
    const { data: responseData } = await api.put('/auth/me', data);
    return responseData.data;
  },

  /**
   * Update preferences
   */
  async updatePreferences(preferences: Record<string, any>): Promise<{ user: any }> {
    const { data: responseData } = await api.put('/auth/me/preferences', { preferences });
    return responseData.data;
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return data.data;
  },
};
