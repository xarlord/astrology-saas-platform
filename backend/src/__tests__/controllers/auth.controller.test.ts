/**
 * Unit Tests for Authentication Controller
 * Tests user registration, login, profile management, and token refresh
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response } from 'express';
import { register, login, getProfile, updateProfile, updatePreferences, logout, refreshToken } from '../../modules/auth/controllers/auth.controller';
import { AppError } from '../../utils/appError';
import UserModel from '../../modules/users/models/user.model';
import { generateToken, generateRefreshToken } from '../../middleware/auth';
import * as helpers from '../../utils/helpers';
import * as RefreshTokenModel from '../../modules/auth/models/refreshToken.model';
import * as EmailService from '../../services/email.service';

// Mock dependencies
jest.mock('../../modules/users/models/user.model', () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));

jest.mock('../../modules/auth/models/refreshToken.model', () => ({
  findRefreshToken: jest.fn(),
  createRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
}));

jest.mock('../../middleware/auth', () => ({
  generateToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

jest.mock('../../utils/helpers', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  sanitizeUser: jest.fn(),
}));

jest.mock('../../services/email.service', () => ({
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendSubscriptionConfirmationEmail: jest.fn(),
  DEFAULT_EMAIL_PREFS: { marketing: true, transactional: true },
}));

jest.mock('../../db', () => {
  const mockUpdate = jest.fn().mockResolvedValue(1);
  const mockWhere = jest.fn().mockReturnValue({ update: mockUpdate });
  const mockTrxTable = jest.fn().mockReturnValue({ where: mockWhere });
  const mockInsert = jest.fn().mockResolvedValue(undefined);
  const mockTrxTableForInsert = jest.fn();
  mockTrxTableForInsert.mockImplementation((table: string) => {
    if (table === 'refresh_tokens') {
      // First call is the update (revoke), second is insert
      return { where: mockWhere };
    }
    return {};
  });

  // Track call count so we can return different chain objects
  let callCount = 0;
  const mockTrx = jest.fn().mockImplementation((table: string) => {
    callCount++;
    if (callCount === 1) {
      // revoke old token: trx('refresh_tokens').where({token}).update(...)
      return { where: mockWhere };
    }
    // create new token: trx('refresh_tokens').insert(...)
    return { insert: mockInsert };
  });

  // Reset call count per transaction
  const transactionFn = jest.fn().mockImplementation(async (callback: (trx: any) => Promise<any>) => {
    callCount = 0;
    return callback(mockTrx);
  });

  return {
    __esModule: true,
    default: {
      transaction: transactionFn,
    },
  };
});

describe('Authentication Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: { id: '123', email: 'test@example.com' },
      body: {},
      params: {},
      get: jest.fn().mockReturnValue('test-agent'),
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

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
      (RefreshTokenModel.createRefreshToken as jest.Mock).mockResolvedValue({});

      await register(mockRequest as Request, mockResponse as Response);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserModel.create).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);

      // Verify welcome email was sent
      expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        userData.email,
        userData.name,
      );
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

      await expect(register(mockRequest as Request, mockResponse as Response)).rejects.toThrow(AppError);
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
      (RefreshTokenModel.createRefreshToken as jest.Mock).mockResolvedValue({});

      await register(mockRequest as Request, mockResponse as Response);

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

      const userWithHash = {
        id: '123',
        email: userData.email,
        name: userData.name,
        password_hash: 'hashed',
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (helpers.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (UserModel.create as jest.Mock).mockResolvedValue(userWithHash);
      const sanitizedUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
      };
      (helpers.sanitizeUser as jest.Mock).mockReturnValue(sanitizedUser);
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      (RefreshTokenModel.createRefreshToken as jest.Mock).mockResolvedValue({});

      await register(mockRequest as Request, mockResponse as Response);

      expect(helpers.sanitizeUser).toHaveBeenCalledWith(userWithHash);
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

      await login(mockRequest as Request, mockResponse as Response);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(helpers.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password_hash);
      expect(generateToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should throw 401 if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockRequest.body = loginData;

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(login(mockRequest as Request, mockResponse as Response)).rejects.toThrow();
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

      await expect(login(mockRequest as Request, mockResponse as Response)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token', async () => {
      const oldRefreshToken = 'old-refresh-token';
      mockRequest.body = { refreshToken: oldRefreshToken };

      const mockTokenRecord = {
        token: oldRefreshToken,
        user_id: '123',
        revoked: false,
        expires_at: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      (RefreshTokenModel.findRefreshToken as jest.Mock).mockResolvedValue(mockTokenRecord);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('new-access-token');
      (generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      await refreshToken(mockRequest as Request, mockResponse as Response);

      expect(RefreshTokenModel.findRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(UserModel.findById).toHaveBeenCalledWith('123');
      expect(generateToken).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
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
      (RefreshTokenModel.createRefreshToken as jest.Mock).mockResolvedValue({});

      mockRequest.body = {
        name: 'Test',
        email: 'test@example.com',
        password: 'pass',
      };

      await register(mockRequest as Request, mockResponse as Response);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include user data in all auth responses', async () => {
      const mockUser = { id: '123', email: 'test@example.com', password_hash: 'hashed' };
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (helpers.comparePassword as jest.Mock).mockResolvedValue(true);
      (helpers.sanitizeUser as jest.Mock).mockReturnValue({ id: '123' });
      (generateToken as jest.Mock).mockReturnValue('token');
      (generateRefreshToken as jest.Mock).mockReturnValue('refresh');
      (RefreshTokenModel.createRefreshToken as jest.Mock).mockResolvedValue({});

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data.user).toBeDefined();
    });
  });
});