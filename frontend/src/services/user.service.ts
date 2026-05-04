/**
 * User Service
 *
 * Handles user profile, preferences, and account management
 */

import api from './api';
import type { User, UserPreferences, ApiResponse } from './api.types';
import { transformUser, type APIUser } from '@/utils/apiTransformers';

/**
 * User Service Class
 */
class UserService {
  private readonly TIMEOUT = 15000; // 15 seconds

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: APIUser }>>('/auth/me', {
        timeout: this.TIMEOUT,
      });

      // Transform API user to frontend user
      const apiUser = response.data.data.user;
      return transformUser(apiUser) as unknown as User;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch profile: ${message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    name?: string;
    avatar_url?: string;
    timezone?: string;
  }): Promise<User> {
    try {
      // Transform frontend data to API format
      const apiData = data.avatar_url ? { avatar_url: data.avatar_url } : {};

      const response = await api.put<ApiResponse<{ user: APIUser }>>('/auth/me', apiData, {
        timeout: this.TIMEOUT,
      });

      // Transform API user back to frontend format
      const apiUser = response.data.data.user;
      return transformUser(apiUser) as unknown as User;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update profile: ${message}`);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<{ user: User }>>(
        '/auth/me/preferences',
        { preferences },
        { timeout: this.TIMEOUT },
      );
      return response.data.data.user;
    } catch (error: unknown) {
      throw new Error(
        `Failed to update preferences: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.post('/auth/change-password', data, {
        timeout: this.TIMEOUT,
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/auth/me', {
        timeout: this.TIMEOUT,
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post<ApiResponse<{ avatar_url: string }>>(
        '/auth/me/avatar',
        formData,
        {
          timeout: 30000, // 30 seconds for file upload
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<void> {
    try {
      await api.delete('/auth/me/avatar', {
        timeout: this.TIMEOUT,
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to delete avatar: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get user subscription status
   */
  async getSubscriptionStatus(): Promise<{
    plan: string;
    status: string;
    renewalDate?: string;
    cancelAtPeriodEnd: boolean;
  }> {
    try {
      const response = await api.get<
        ApiResponse<{
          plan: string;
          status: string;
          renewalDate?: string;
          cancelAtPeriodEnd: boolean;
        }>
      >('/auth/me/subscription', {
        timeout: this.TIMEOUT,
      });
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(
        `Failed to fetch subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      await api.post(
        '/auth/me/subscription/cancel',
        {},
        {
          timeout: this.TIMEOUT,
        },
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<void> {
    try {
      await api.post(
        '/auth/me/subscription/reactivate',
        {},
        {
          timeout: this.TIMEOUT,
        },
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to reactivate subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;
