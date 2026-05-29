/**
 * Auth Service — Email/password only
 */

import api from './api';
import type { User, UserPreferences } from './api.types';

export type { LoginCredentials, RegisterData, AuthResponse } from './api.types';

export interface AuthServiceResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

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
    interface RefreshResponse { data: { accessToken: string } }
    const response = await api.post<RefreshResponse>(
      '/auth/refresh', {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    );
    return response.data.data;
  },
};
