/**
 * Auth Service Tests
 * Testing authentication API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/auth.service';
import {
  mockUser,
  createMockResponse,
  createMockError,
  setupLocalStorageMock,
} from './utils';

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

// Import after mock
import api from '../../services/api';

// Mock localStorage
let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = setupLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should call API with registration data', async () => {
      const mockResponse = createMockResponse({
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123!',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123!',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
    });

    it('should throw error when registration fails', async () => {
      const mockError = createMockError('Email already exists', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.register({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      })).rejects.toThrow();
    });

    it('should include all required fields in registration request', async () => {
      const mockResponse = createMockResponse({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      });
      (api.post as any).mockResolvedValue(mockResponse);

      await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ComplexPassword!234',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'ComplexPassword!234',
      }));
    });
  });

  describe('login', () => {
    it('should call API with credentials', async () => {
      const mockResponse = createMockResponse({
        user: mockUser,
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error on failed login', async () => {
      const mockError = createMockError('Invalid credentials', 401);
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow();
    });

    it('should return user and tokens on successful login', async () => {
      const mockResponse = createMockResponse({
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle logout errors gracefully', async () => {
      const mockError = createMockError('Logout failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should fetch current user profile', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle unauthorized error', async () => {
      const mockError = createMockError('Unauthorized', 401);
      (api.get as any).mockRejectedValue(mockError);

      await expect(authService.getProfile()).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile with provided data', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile({
        name: 'Updated Name',
        timezone: 'America/Los_Angeles',
      });

      expect(api.put).toHaveBeenCalledWith('/auth/me', {
        name: 'Updated Name',
        timezone: 'America/Los_Angeles',
      });
      expect(result.user.name).toBe('Updated Name');
    });

    it('should update avatar_url', async () => {
      const updatedUser = { ...mockUser, avatar_url: 'https://new-avatar.com/pic.jpg' };
      const mockResponse = createMockResponse({ user: updatedUser });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile({
        avatar_url: 'https://new-avatar.com/pic.jpg',
      });

      expect(api.put).toHaveBeenCalledWith('/auth/me', {
        avatar_url: 'https://new-avatar.com/pic.jpg',
      });
      expect(result.user.avatar_url).toBe('https://new-avatar.com/pic.jpg');
    });

    it('should handle partial updates', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.put as any).mockResolvedValue(mockResponse);

      await authService.updateProfile({ name: 'Only Name Changed' });

      expect(api.put).toHaveBeenCalledWith('/auth/me', { name: 'Only Name Changed' });
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

      const result = await authService.updatePreferences({
        theme: 'light',
        notifications: {
          email: false,
          push: true,
          transitAlerts: true,
          lunarPhases: false,
        },
      });

      expect(api.put).toHaveBeenCalledWith('/auth/me/preferences', {
        preferences: expect.objectContaining({
          theme: 'light',
        }),
      });
      expect(result.user.preferences.theme).toBe('light');
    });

    it('should handle partial preference updates', async () => {
      const mockResponse = createMockResponse({ user: mockUser });
      (api.put as any).mockResolvedValue(mockResponse);

      await authService.updatePreferences({ theme: 'dark' });

      expect(api.put).toHaveBeenCalledWith('/auth/me/preferences', {
        preferences: { theme: 'dark' },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const mockResponse = createMockResponse({ accessToken: 'new-access-token' });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken('existing-refresh-token');

      expect(api.post).toHaveBeenCalledWith(
        '/auth/refresh',
        {},
        { headers: { Authorization: 'Bearer existing-refresh-token' } }
      );
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should handle invalid refresh token', async () => {
      const mockError = createMockError('Invalid refresh token', 401);
      (api.post as any).mockRejectedValue(mockError);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow();
    });

    it('should pass refresh token in authorization header', async () => {
      const mockResponse = createMockResponse({ accessToken: 'new-token' });
      (api.post as any).mockResolvedValue(mockResponse);

      await authService.refreshToken('my-refresh-token');

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-refresh-token' },
        })
      );
    });
  });
});
