/**
 * Unit Tests for Authentication Controller
 * Tests user registration, login, profile management, and token refresh
 */

import { Request, Response } from 'express';
import { register, login, getProfile, updateProfile, updatePreferences, logout, refreshToken } from '../../controllers/auth.controller';
import { AppError } from '../../middleware/errorHandler';
import { UserModel } from '../../models';
import { generateToken, generateRefreshToken } from '../../middleware/auth';
import * as helpers from '../../utils/helpers';

// Mock dependencies
jest.mock('../../models');
jest.mock('../../middleware/auth');
jest.mock('../../utils/helpers');

describe('Authentication Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock request with user
    mockRequest = {
      user: { id: '123', email: 'test@example.com' },
      body: {},
      params: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock next
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      mockRequest.body = userData;

      // Mock user doesn't exist
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (helpers.hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: '123',
        email: userData.email,
        name: userData.name,
      });
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({
        id: '123',
        email: userData.email,
        name: userData.name,
      });
      (generateToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserModel.create).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object),
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      });
    });

    it('should throw 409 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      mockRequest.body = userData;

      (UserModel.findByEmail as jest.Mock).mockResolvedValue({
        id: '123',
        email: userData.email,
      });

      await expect(register(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(register(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('User with this email already exists');
    });

    it('should hash password before storing', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'PlainTextPassword',
      };

      mockRequest.body = userData;

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: '123',
        email: userData.email,
        name: userData.name,
      });
      (helpers.hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({});
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(helpers.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(UserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: 'hashedpassword',
        })
      );
    });

    it('should sanitize user data in response', async () => {
      const userData = {
        name: 'Test User',
        email: 'sanitize@example.com',
        password: 'Password123!',
      };

      mockRequest.body = userData;

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (helpers.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: '123',
        email: userData.email,
        name: userData.name,
        password_hash: 'hashed',
      });
      const sanitizedUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
      };
      (helpers.sanitizeUser as jest.Mock).mockReturnValue(sanitizedUser);
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(helpers.sanitizeUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: undefined,
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: sanitizedUser,
          accessToken: 'token',
          refreshToken: 'refresh-token',
        },
      });
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRequest.body = loginData;

      const mockUser = {
        id: '123',
        email: loginData.email,
        password_hash: 'hashedpassword',
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({
        id: mockUser.id,
        email: mockUser.email,
      });
      (generateToken as jest.Mock).mockReturnValue('access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(helpers.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password_hash);
      expect(generateToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object),
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      });
    });

    it('should throw 401 if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockRequest.body = loginData;

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(login(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(login(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Invalid email or password');
    });

    it('should throw 401 if password is invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockRequest.body = loginData;

      const mockUser = {
        id: '123',
        email: loginData.email,
        password_hash: 'hashedpassword',
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (helpers.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(login(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(login(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '123',
        email: 'profile@example.com',
        name: 'Profile User',
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });

      await getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.findById).toHaveBeenCalledWith('123');
      expect(helpers.sanitizeUser).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: expect.any(Object) },
      });
    });

    it('should throw 404 if user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(getProfile(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(getProfile(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      mockRequest.body = updateData;

      const updatedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Updated Name',
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      });

      await updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: expect.any(Object) },
      });
    });

    it('should update avatar_url', async () => {
      const updateData = {
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockRequest.body = updateData;

      const updatedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: updateData.avatar_url,
      };

      (UserModel.update as jest.Mock).mockResolvedValue(updatedUser);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.update).toHaveBeenCalledWith('123', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 if user not found', async () => {
      mockRequest.body = { name: 'Updated' };

      (UserModel.update as jest.Mock).mockResolvedValue(null);

      await expect(updateProfile(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(updateProfile(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('User not found');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferences = {
        theme: 'dark',
        defaultHouseSystem: 'whole_sign',
      };

      mockRequest.body = preferences;

      const updatedUser = {
        id: '123',
        preferences,
      };

      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(updatedUser);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue(updatedUser);

      await updatePreferences(mockRequest as Request, mockResponse as Response, mockNext);

      expect(UserModel.updatePreferences).toHaveBeenCalledWith('123', preferences);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: updatedUser },
      });
    });

    it('should throw 404 if user not found', async () => {
      mockRequest.body = { theme: 'dark' };

      (UserModel.updatePreferences as jest.Mock).mockResolvedValue(null);

      await expect(updatePreferences(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(updatePreferences(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('User not found');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token', async () => {
      (generateToken as jest.Mock).mockReturnValue('new-access-token');

      await refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(generateToken).toHaveBeenCalledWith({
        userId: '123',
        email: 'test@example.com',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { accessToken: 'new-access-token' },
      });
    });
  });

  describe('Response Structure', () => {
    it('should always return success: true for successful operations', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (helpers.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (UserModel.create as jest.Mock).mockResolvedValue({ id: '123' });
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({ id: '123' });
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh');

      mockRequest.body = {
        name: 'Test',
        email: 'test@example.com',
        password: 'pass',
      };

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include user data in all auth responses', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);
      const mockUser = { id: '123', email: 'test@example.com' };
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({ id: '123' });
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh');

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data.user).toBeDefined();
    });
  });
});
