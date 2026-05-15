/**
 * Unit Tests for User Controller
 * Tests user profile and preferences management
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserPreferences,
  updateUserPreferences,
  deleteAccount,
  getUserCharts,
  getEmailPreferences,
  updateEmailPreferences,
} from '../../modules/users/controllers/user.controller';
import { AppError } from '../../utils/appError';
import UserModel from '../../modules/users/models/user.model';
import { sanitizeUser } from '../../utils/helpers';

// Mock dependencies
jest.mock('../../modules/users/models/user.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    update: jest.fn(),
    getCharts: jest.fn(),
    updatePreferences: jest.fn(),
    softDelete: jest.fn(),
  },
}));

jest.mock('../../utils/helpers', () => ({
  sanitizeUser: jest.fn(),
}));

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: { id: '123', email: 'test@example.com' },
      body: {},
      validated: {}, // Add validated property for validation middleware
      params: {},
      query: {},
      get: jest.fn().mockReturnValue('test-agent'),
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const sanitizedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (sanitizeUser as jest.Mock).mockReturnValue(sanitizedUser);

      await getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.findById).toHaveBeenCalledWith('123');
      expect(sanitizeUser).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: sanitizedUser },
      });
    });

    it('should throw 404 if user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateCurrentUser', () => {
    it('should update user name', async () => {
      mockRequest.validated = { name: 'Updated Name' };

      const updatedUser = {
        id: '123',
        name: 'Updated Name',
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', {
        name: 'Updated Name',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should update avatar_url', async () => {
      mockRequest.validated = {
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const updatedUser = {
        id: '123',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', {
        avatar_url: 'https://example.com/avatar.jpg',
      });
    });

    it('should update timezone', async () => {
      mockRequest.validated = { timezone: 'America/Los_Angeles' };

      const updatedUser = {
        id: '123',
        timezone: 'America/Los_Angeles',
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', {
        timezone: 'America/Los_Angeles',
      });
    });

    it('should update multiple fields', async () => {
      mockRequest.validated = {
        name: 'New Name',
        avatar_url: 'https://example.com/new.jpg',
        timezone: 'Europe/Paris',
      };

      const updatedUser = {
        id: '123',
        name: 'New Name',
        avatar_url: 'https://example.com/new.jpg',
        timezone: 'Europe/Paris',
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', {
        name: 'New Name',
        avatar_url: 'https://example.com/new.jpg',
        timezone: 'Europe/Paris',
      });
    });

    it('should throw 404 if user not found', async () => {
      mockRequest.validated = { name: 'Updated' };

      (UserModel.update as jest.Mock).mockResolvedValue(null);

      await expect(
        updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        updateCurrentUser(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserCharts', () => {
    it('should get user charts with pagination', async () => {
      mockRequest.query = { page: '1', limit: '10' };

      const mockCharts = [
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ];

      (UserModel.getCharts as jest.Mock).mockResolvedValue(mockCharts);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.getCharts).toHaveBeenCalledWith('123', 10, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { charts: mockCharts },
      });
    });

    it('should use default pagination values', async () => {
      mockRequest.query = {};

      (UserModel.getCharts as jest.Mock).mockResolvedValue([]);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.getCharts).toHaveBeenCalledWith('123', 20, 0);
    });

    it('should calculate offset correctly', async () => {
      mockRequest.query = { page: '3', limit: '15' };

      (UserModel.getCharts as jest.Mock).mockResolvedValue([]);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.getCharts).toHaveBeenCalledWith('123', 15, 30);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const mockUser = {
        id: '123',
        preferences: {
          theme: 'dark',
          defaultHouseSystem: 'whole_sign',
          defaultZodiac: 'tropical',
        },
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      await getUserPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.findById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { preferences: mockUser.preferences },
      });
    });

    it('should throw 404 if user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        getUserPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        getUserPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences', async () => {
      const preferences = {
        theme: 'light',
        defaultHouseSystem: 'placidus',
        defaultZodiac: 'sidereal',
      };

      mockRequest.validated = preferences;

      const updatedUser = {
        id: '123',
        preferences: preferences,
      };

      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(updatedUser);

      await updateUserPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.updatePreferences).toHaveBeenCalledWith('123', preferences);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { preferences: preferences },
      });
    });

    it('should update partial preferences', async () => {
      const preferences = {
        theme: 'dark',
      };

      mockRequest.validated = preferences;

      const updatedUser = {
        id: '123',
        preferences: {
          theme: 'dark',
          defaultHouseSystem: 'placidus',
        },
      };

      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(updatedUser);

      await updateUserPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.updatePreferences).toHaveBeenCalledWith('123', preferences);
    });

    it('should throw 404 if user not found', async () => {
      mockRequest.validated = { theme: 'dark' };

      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(null);

      await expect(
        updateUserPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        updateUserPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('User not found');
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account successfully', async () => {
      (UserModel.softDelete as jest.Mock).mockResolvedValue(true);

      await deleteAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.softDelete).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account deleted successfully',
      });
    });
  });

  describe('Response Structure', () => {
    it('should always return success: true for successful operations', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: '123',
        preferences: {},
      });

      await getUserPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include data object in responses', async () => {
      const mockUser = { id: '123' };
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (sanitizeUser as jest.Mock).mockReturnValue(mockUser);

      await getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
    });
  });

  describe('getEmailPreferences', () => {
    it('should return default preferences when none set', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: '123',
        preferences: {},
      });

      await getEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            emailNotifications: { marketing: true, transactional: true },
          },
        }),
      );
    });

    it('should return stored email preferences', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: '123',
        preferences: {
          emailNotifications: { marketing: false, transactional: true },
        },
      });

      await getEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            emailNotifications: { marketing: false, transactional: true },
          },
        }),
      );
    });

    it('should throw 404 when user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        getEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateEmailPreferences', () => {
    it('should update email preferences via updatePreferences', async () => {
      const updatedUser = {
        id: '123',
        preferences: {
          emailNotifications: { marketing: false, transactional: true },
        },
      };
      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(updatedUser);

      mockRequest.validated = { marketing: false, transactional: true };

      await updateEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.updatePreferences).toHaveBeenCalledWith('123', {
        emailNotifications: { marketing: false, transactional: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            emailNotifications: { marketing: false, transactional: true },
          },
        }),
      );
    });

    it('should use defaults for missing boolean fields', async () => {
      (UserModel.updatePreferences as jest.Mock).mockResolvedValue({
        id: '123',
        preferences: {},
      });

      mockRequest.validated = {};

      await updateEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.updatePreferences).toHaveBeenCalledWith('123', {
        emailNotifications: { marketing: true, transactional: true },
      });
    });

    it('should throw 404 when user not found after update', async () => {
      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(null);

      mockRequest.validated = { marketing: true };

      await expect(
        updateEmailPreferences(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });
  });
});
