import { Request, Response } from 'express';
import { socialLogin } from '../controllers/socialAuth.controller';
import * as firebaseAdmin from '../../../config/firebase-admin';

// Mock dependencies
jest.mock('../../../config/firebase-admin');
jest.mock('../../users/models/user.model', () => ({
  findByFirebaseUid: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../../middleware/auth', () => ({
  generateToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
}));
jest.mock('../models/refreshToken.model', () => ({
  createRefreshToken: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../config/database', () => ({}));
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

import UserModel from '../../users/models/user.model';

const mockVerifyFirebaseToken = firebaseAdmin.verifyFirebaseToken as jest.MockedFunction<
  typeof firebaseAdmin.verifyFirebaseToken
>;

describe('socialLogin controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let cookie: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    cookie = jest.fn();
    req = {
      body: {},
      get: jest.fn().mockReturnValue('test-agent'),
      ip: '127.0.0.1',
    };
    res = {
      json,
      cookie,
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    // Re-setup mock return values after clear
    const { generateToken, generateRefreshToken } = require('../../../middleware/auth');
    (generateToken as jest.Mock).mockReturnValue('mock-access-token');
    (generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');
  });

  it('should return 400 if idToken is missing', async () => {
    req.body = { provider: 'google' };

    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
      'idToken and provider are required',
    );
  });

  it('should return 400 if provider is missing', async () => {
    req.body = { idToken: 'some-token' };

    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
      'idToken and provider are required',
    );
  });

  it('should return 401 if Firebase token verification fails', async () => {
    req.body = { idToken: 'bad-token', provider: 'google' };
    mockVerifyFirebaseToken.mockResolvedValue(null);

    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
      'Invalid social login token',
    );
  });

  it('should create new user if not found', async () => {
    req.body = { idToken: 'valid-token', provider: 'google' };

    mockVerifyFirebaseToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'new@gmail.com',
      name: 'New User',
      picture: 'https://avatar.url',
    } as any);

    (UserModel.findByFirebaseUid as jest.Mock).mockResolvedValue(null);
    (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserModel.create as jest.Mock).mockResolvedValue({
      id: 'user-uuid',
      email: 'new@gmail.com',
      name: 'New User',
      auth_provider: 'google',
      plan: 'free',
    });

    await socialLogin(req as Request, res as Response);

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@gmail.com',
        auth_provider: 'google',
        firebase_uid: 'firebase-uid-123',
      }),
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({ email: 'new@gmail.com' }),
        }),
      }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.anything(),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('should find existing user by firebase_uid', async () => {
    req.body = { idToken: 'valid-token', provider: 'google' };

    mockVerifyFirebaseToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'existing@gmail.com',
    } as any);

    (UserModel.findByFirebaseUid as jest.Mock).mockResolvedValue({
      id: 'user-uuid',
      email: 'existing@gmail.com',
      name: 'Existing',
      auth_provider: 'google',
    });

    await socialLogin(req as Request, res as Response);

    expect(UserModel.create).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({ email: 'existing@gmail.com' }),
        }),
      }),
    );
  });

  it('should return 400 if social account has no email', async () => {
    req.body = { idToken: 'valid-token', provider: 'google' };

    mockVerifyFirebaseToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      email: undefined,
    } as any);

    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
      'Social account must have an email address',
    );
  });
});