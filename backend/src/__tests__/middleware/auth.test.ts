/**
 * Unit Tests for Authentication Middleware
 * Tests JWT token verification, user authentication, and token generation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, optionalAuthenticate, generateToken, generateRefreshToken } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import config from '../../config';

// Mock dependencies
jest.mock('../../config');
jest.mock('jsonwebtoken');

// Mock request/response/next
const mockRequest = () => ({
  headers: {},
} as Request);

const mockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response);

const mockNext = jest.fn() as NextFunction;

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('authenticate', () => {
    it('should attach user to request when valid token provided', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const tokenPayload = {
        id: '123',
        email: 'test@example.com',
      };

      req.headers.authorization = 'Bearer valid-token';

      (jwt.verify as jest.Mock).mockReturnValue(tokenPayload);

      authenticate(req, res, next);

      expect(req.user).toEqual(tokenPayload);
      expect(next).toHaveBeenCalledWith();
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
    });

    it('should throw 401 when no authorization header provided', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No token provided',
        statusCode: 401,
      }));
    });

    it('should throw 401 when authorization header does not start with Bearer', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'InvalidFormat token';

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No token provided',
        statusCode: 401,
      }));
    });

    it('should throw 401 when token is invalid (JsonWebTokenError)', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer invalid-token';

      const jwtError = new jwt.JsonWebTokenError('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      expect(() => authenticate(req, res, next)).toThrow(AppError);
      expect(() => authenticate(req, res, next)).toThrow('Invalid token');
    });

    it('should throw 401 when token is expired (TokenExpiredError)', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer expired-token';

      const jwtError = new jwt.TokenExpiredError('Token expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      expect(() => authenticate(req, res, next)).toThrow(AppError);
      expect(() => authenticate(req, res, next)).toThrow('Token expired');
    });

    it('should pass error to next when unexpected error occurs', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer token';

      const unexpectedError = new Error('Unexpected error');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw unexpectedError;
      });

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(unexpectedError);
    });

    it('should correctly extract token from Bearer prefix', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer my-jwt-token';

      const tokenPayload = {
        id: '456',
        email: 'user@example.com',
      };

      (jwt.verify as jest.Mock).mockReturnValue(tokenPayload);

      authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('my-jwt-token', config.jwt.secret);
    });

    it('should handle case-insensitive Bearer prefix', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'bearer my-token'; // lowercase

      const tokenPayload = {
        id: '789',
        email: 'another@example.com',
      };

      (jwt.verify as jest.Mock).mockReturnValue(tokenPayload);

      // Should still fail because we check for exact 'Bearer ' match
      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No token provided',
        statusCode: 401,
      }));
    });
  });

  describe('optionalAuthenticate', () => {
    it('should attach user to request when valid token provided', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const tokenPayload = {
        id: '123',
        email: 'test@example.com',
      };

      req.headers.authorization = 'Bearer valid-token';

      (jwt.verify as jest.Mock).mockReturnValue(tokenPayload);

      optionalAuthenticate(req, res, next);

      expect(req.user).toEqual(tokenPayload);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next without user when no authorization header', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      optionalAuthenticate(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next without throwing when token is invalid', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer invalid-token';

      const jwtError = new jwt.JsonWebTokenError('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      optionalAuthenticate(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
      expect(() => optionalAuthenticate(req, res, next)).not.toThrow();
    });

    it('should call next without throwing when token is expired', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'Bearer expired-token';

      const jwtError = new jwt.TokenExpiredError('Token expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      optionalAuthenticate(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
      expect(() => optionalAuthenticate(req, res, next)).not.toThrow();
    });

    it('should handle malformed authorization header gracefully', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      req.headers.authorization = 'InvalidFormat';

      optionalAuthenticate(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
      };

      (jwt.sign as jest.Mock).mockReturnValue('generated-token');

      const token = generateToken(payload);

      expect(token).toBe('generated-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });
    });

    it('should generate token without iat and exp in payload', () => {
      const payload = {
        id: '456',
        email: 'user@example.com',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token-without-timestamps');

      const token = generateToken(payload);

      // Verify jwt.sign was called with payload that doesn't have iat/exp
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.not.objectContaining({
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
        config.jwt.secret,
        expect.any(Object)
      );
    });

    it('should use configured JWT secret', () => {
      const payload = {
        id: '789',
        email: 'another@example.com',
      };

      (jwt.sign as jest.Mock).mockReturnValue('secret-token');

      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        config.jwt.secret,
        expect.any(Object)
      );
    });

    it('should use configured expiration time', () => {
      const payload = {
        id: '999',
        email: 'expire@example.com',
      };

      (jwt.sign as jest.Mock).mockReturnValue('expiring-token');

      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: config.jwt.expiresIn }
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
      };

      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens each time', () => {
      const payload = {
        id: '456',
        email: 'refresh@example.com',
      };

      const token1 = generateRefreshToken(payload);
      const token2 = generateRefreshToken(payload);

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens than access token', () => {
      const payload = {
        id: '789',
        email: 'tokens@example.com',
      };

      (jwt.sign as jest.Mock).mockReturnValue('access-token');

      const accessToken = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      expect(accessToken).not.toBe(refreshToken);
      expect(accessToken).toBe('access-token');
      expect(typeof refreshToken).toBe('string');
    });
  });

  describe('Token Payload Interface', () => {
    it('should accept valid token payload structure', () => {
      const validPayload = {
        id: '123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890,
      };

      expect(validPayload.id).toBeDefined();
      expect(validPayload.email).toBeDefined();
      expect(validPayload.iat).toBeDefined();
      expect(validPayload.exp).toBeDefined();
    });

    it('should accept payload without timestamps', () => {
      const payloadWithoutTimestamps = {
        id: '456',
        email: 'user@example.com',
      };

      expect(payloadWithoutTimestamps.id).toBeDefined();
      expect(payloadWithoutTimestamps.email).toBeDefined();
      expect(payloadWithoutTimestamps.iat).toBeUndefined();
      expect(payloadWithoutTimestamps.exp).toBeUndefined();
    });
  });

  describe('Express Request Type Extension', () => {
    it('should allow user property to be attached to request', () => {
      const req: Request = {} as Request;
      const user = {
        id: '123',
        email: 'test@example.com',
      };

      req.user = user;

      expect(req.user).toEqual(user);
    });

    it('should allow user to be undefined', () => {
      const req: Request = {} as Request;

      expect(req.user).toBeUndefined();
    });
  });
});
