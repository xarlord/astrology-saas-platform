/**
 * User Service Tests
 * Testing user profile and account management API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userService from '../../services/user.service';
import { mockUser, createMockResponse, createMockError } from './utils';

// Mock the api module with hoisted mock
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock the transformers
vi.mock('../../utils/apiTransformers', () => ({
  transformUser: vi.fn((user) => user),
}));

// Import after mock
import api from '../../services/api';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch current user profile', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        timeout: 15000,
      });
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should include timeout configuration', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.get as any).mockResolvedValue(mockResponse);

      await userService.getProfile();

      expect(api.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000 }),
      );
    });

    it('should throw error with message on failure', async () => {
      const mockError = createMockError('Unauthorized', 401);
      (api.get as any).mockRejectedValue(mockError);

      await expect(userService.getProfile()).rejects.toThrow('Failed to fetch profile');
    });

    it('should handle unknown errors', async () => {
      (api.get as any).mockRejectedValue('Unknown error');

      await expect(userService.getProfile()).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with provided data', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updateProfile({
        name: 'Updated Name',
      });

      expect(api.put).toHaveBeenCalledWith('/auth/me', expect.any(Object), {
        timeout: 15000,
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should update timezone', async () => {
      const updatedUser = { ...mockUser, timezone: 'America/Los_Angeles' };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updateProfile({
        timezone: 'America/Los_Angeles',
      });

      expect(result.timezone).toBe('America/Los_Angeles');
    });

    it('should handle avatar_url update', async () => {
      const updatedUser = { ...mockUser, avatar_url: 'https://example.com/new-avatar.jpg' };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updateProfile({
        avatar_url: 'https://example.com/new-avatar.jpg',
      });

      expect(result.avatar_url).toBe('https://example.com/new-avatar.jpg');
    });

    it('should throw error on update failure', async () => {
      const mockError = createMockError('Update failed', 500);
      (api.put as any).mockRejectedValue(mockError);

      await expect(userService.updateProfile({ name: 'New' })).rejects.toThrow(
        'Failed to update profile',
      );
    });

    it('should handle partial updates', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.put as any).mockResolvedValue(mockResponse);

      await userService.updateProfile({ name: 'Only Name' });

      expect(api.put).toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const updatedUser = {
        ...mockUser,
        preferences: { ...mockUser.preferences, theme: 'light' as const },
      };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updatePreferences({
        theme: 'light',
      });

      expect(api.put).toHaveBeenCalledWith(
        '/auth/me/preferences',
        { preferences: { theme: 'light' } },
        { timeout: 15000 },
      );
      expect(result.preferences.theme).toBe('light');
    });

    it('should update notification preferences', async () => {
      const updatedUser = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          notifications: {
            email: false,
            push: true,
            transitAlerts: false,
            lunarPhases: true,
          },
        },
      };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await userService.updatePreferences({
        notifications: {
          email: false,
          push: true,
          transitAlerts: false,
          lunarPhases: true,
        },
      });

      expect(result.preferences.notifications.email).toBe(false);
      expect(result.preferences.notifications.push).toBe(true);
    });

    it('should handle update preferences error', async () => {
      const mockError = createMockError('Preferences update failed', 400);
      (api.put as any).mockRejectedValue(mockError);

      await expect(userService.updatePreferences({ theme: 'dark' })).rejects.toThrow(
        'Failed to update preferences',
      );
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      await userService.changePassword({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      });

      expect(api.post).toHaveBeenCalledWith(
        '/auth/change-password',
        {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        },
        { timeout: 15000 },
      );
    });

    it('should throw error on password change failure', async () => {
      const mockError = createMockError('Invalid current password', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(
        userService.changePassword({
          currentPassword: 'wrong',
          newPassword: 'newpassword',
        }),
      ).rejects.toThrow('Failed to change password');
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await userService.deleteAccount();

      expect(api.delete).toHaveBeenCalledWith('/auth/me', {
        timeout: 15000,
      });
    });

    it('should throw error on account deletion failure', async () => {
      const mockError = createMockError('Deletion failed', 500);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(userService.deleteAccount()).rejects.toThrow('Failed to delete account');
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar file', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockResponse = createMockResponse({
        avatar_url: 'https://example.com/avatars/avatar-123.jpg',
      });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await userService.uploadAvatar(mockFile);

      expect(api.post).toHaveBeenCalledWith(
        '/auth/me/avatar',
        expect.any(FormData),
        expect.objectContaining({
          timeout: 30000,
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      expect(result.avatar_url).toBe('https://example.com/avatars/avatar-123.jpg');
    });

    it('should use longer timeout for file upload', async () => {
      const mockFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const mockResponse = createMockResponse({ avatar_url: 'url' });
      (api.post as any).mockResolvedValue(mockResponse);

      await userService.uploadAvatar(mockFile);

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(FormData),
        expect.objectContaining({ timeout: 30000 }),
      );
    });

    it('should throw error on upload failure', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockError = createMockError('Upload failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(userService.uploadAvatar(mockFile)).rejects.toThrow('Failed to upload avatar');
    });
  });

  describe('deleteAvatar', () => {
    it('should delete user avatar', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await userService.deleteAvatar();

      expect(api.delete).toHaveBeenCalledWith('/auth/me/avatar', {
        timeout: 15000,
      });
    });

    it('should throw error on avatar deletion failure', async () => {
      const mockError = createMockError('Delete failed', 500);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(userService.deleteAvatar()).rejects.toThrow('Failed to delete avatar');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should fetch subscription status', async () => {
      const mockSubscription = {
        plan: 'premium',
        status: 'active',
        renewalDate: '2024-03-01T00:00:00Z',
        cancelAtPeriodEnd: false,
      };
      const mockResponse = createMockResponse(mockSubscription);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getSubscriptionStatus();

      expect(api.get).toHaveBeenCalledWith('/auth/me/subscription', {
        timeout: 15000,
      });
      expect(result.plan).toBe('premium');
      expect(result.status).toBe('active');
    });

    it('should handle subscription without renewal date', async () => {
      const mockSubscription = {
        plan: 'free',
        status: 'active',
        cancelAtPeriodEnd: false,
      };
      const mockResponse = createMockResponse(mockSubscription);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getSubscriptionStatus();

      expect(result.plan).toBe('free');
      expect(result.renewalDate).toBeUndefined();
    });

    it('should throw error on subscription fetch failure', async () => {
      const mockError = createMockError('Fetch failed', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(userService.getSubscriptionStatus()).rejects.toThrow(
        'Failed to fetch subscription',
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      await userService.cancelSubscription();

      expect(api.post).toHaveBeenCalledWith('/auth/me/subscription/cancel', {}, { timeout: 15000 });
    });

    it('should throw error on cancellation failure', async () => {
      const mockError = createMockError('Cancellation failed', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(userService.cancelSubscription()).rejects.toThrow(
        'Failed to cancel subscription',
      );
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate subscription', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      await userService.reactivateSubscription();

      expect(api.post).toHaveBeenCalledWith(
        '/auth/me/subscription/reactivate',
        {},
        { timeout: 15000 },
      );
    });

    it('should throw error on reactivation failure', async () => {
      const mockError = createMockError('Reactivation failed', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(userService.reactivateSubscription()).rejects.toThrow(
        'Failed to reactivate subscription',
      );
    });
  });
});
