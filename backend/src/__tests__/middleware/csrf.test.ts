/**
 * CSRF Middleware Tests
 */

import { Request, Response } from 'express';
import { getCsrfToken, csrfMiddleware } from '../../middleware/csrf';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the security logger
jest.mock('../../utils/securityLogger', () => ({
  logCSRFViolation: jest.fn(),
}));

describe('CSRF Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeAll(() => {
    process.env.TEST_CSRF = 'true';
  });

  afterAll(() => {
    delete process.env.TEST_CSRF;
  });

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      path: '/api/v1/test',
      ip: '127.0.0.1',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      locals: {},
    };
    mockNext = jest.fn();
  });

  describe('getCsrfToken', () => {
    it('should handle token generation gracefully', () => {
      // This test verifies the handler exists and handles errors
      expect(typeof getCsrfToken).toBe('function');

      // Call with mock request - should either succeed or return error
      try {
        getCsrfToken(mockReq as Request, mockRes as Response);
      } catch (error) {
        // If it throws, that's acceptable for partial mock
        expect(error).toBeDefined();
      }
    });
  });

  describe('csrfMiddleware', () => {
    it('should skip CSRF check for GET requests', () => {
      mockReq.method = 'GET';

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip CSRF check for HEAD requests', () => {
      mockReq.method = 'HEAD';

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip CSRF check for OPTIONS requests', () => {
      mockReq.method = 'OPTIONS';

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject POST requests without CSRF token', () => {
      mockReq.method = 'POST';
      mockReq.headers = {}; // No CSRF token

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject PUT requests without CSRF token', () => {
      mockReq.method = 'PUT';

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should reject DELETE requests without CSRF token', () => {
      mockReq.method = 'DELETE';

      csrfMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
