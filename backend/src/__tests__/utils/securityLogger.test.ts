/**
 * Security Logger Tests
 * TDD: RED phase - tests must fail before implementation
 */

import { Request } from 'express';
import {
  logSecurityEvent,
  logAuthFailure,
  logCSRFViolation,
  logRateLimitExceeded,
  logUnauthorizedAccess,
  logSuspiciousActivity,
  SecurityEventType,
} from '../../utils/securityLogger';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logger = require('../../utils/logger');

describe('Security Logger', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/v1/auth/login',
      method: 'POST',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'TestAgent/1.0';
        return undefined;
      }),
    };
  });

  describe('logSecurityEvent', () => {
    it('should log high severity events as error', () => {
      logSecurityEvent(
        SecurityEventType.UNAUTHORIZED_ACCESS,
        { reason: 'Invalid token' },
        mockRequest as Request,
      );

      expect(logger.error).toHaveBeenCalled();
    });

    it('should log medium severity events as warning', () => {
      logSecurityEvent(
        SecurityEventType.AUTH_FAILURE,
        { reason: 'Invalid credentials' },
        mockRequest as Request,
      );

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should log low severity events as info', () => {
      logSecurityEvent(
        SecurityEventType.VALIDATION_FAILURE,
        { field: 'email' },
        mockRequest as Request,
      );

      expect(logger.info).toHaveBeenCalled();
    });

    it('should include request metadata in logs', () => {
      logSecurityEvent(SecurityEventType.AUTH_FAILURE, { reason: 'Test' }, mockRequest as Request);

      const logCall = logger.warn.mock.calls[0][1];
      expect(logCall).toHaveProperty('securityEvent');
      expect(logCall.securityEvent).toMatchObject({
        type: SecurityEventType.AUTH_FAILURE,
        ipAddress: '127.0.0.1',
        path: '/api/v1/auth/login',
        method: 'POST',
      });
    });

    it('should include user ID if authenticated', () => {
      (mockRequest as { user?: { id?: string } }).user = { id: 'user-123' };

      logSecurityEvent(SecurityEventType.AUTH_SUCCESS, { method: 'jwt' }, mockRequest as Request);

      const logCall = logger.info.mock.calls[0][1];
      expect(logCall.securityEvent).toMatchObject({
        userId: 'user-123',
      });
    });
  });

  describe('Helper Functions', () => {
    it('logAuthFailure should log authentication failures', () => {
      logAuthFailure('Invalid password', mockRequest as Request);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('AUTH_FAILURE'),
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: SecurityEventType.AUTH_FAILURE,
            details: expect.objectContaining({
              reason: 'Invalid password',
            }),
          }),
        }),
      );
    });

    it('logCSRFViolation should log CSRF violations', () => {
      logCSRFViolation(mockRequest as Request);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('CSRF_FAILURE'),
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: SecurityEventType.CSRF_FAILURE,
          }),
        }),
      );
    });

    it('logRateLimitExceeded should log rate limit violations', () => {
      logRateLimitExceeded('authRateLimiter', mockRequest as Request);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT_EXCEEDED'),
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            details: expect.objectContaining({
              limitName: 'authRateLimiter',
            }),
          }),
        }),
      );
    });

    it('logUnauthorizedAccess should log unauthorized access attempts', () => {
      logUnauthorizedAccess('No token provided', mockRequest as Request);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('UNAUTHORIZED_ACCESS'),
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: SecurityEventType.UNAUTHORIZED_ACCESS,
            details: expect.objectContaining({
              reason: 'No token provided',
            }),
          }),
        }),
      );
    });

    it('logSuspiciousActivity should log suspicious activity', () => {
      logSuspiciousActivity('Multiple failed login attempts', mockRequest as Request, 'high');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('SUSPICIOUS'),
        expect.objectContaining({
          securityEvent: expect.objectContaining({
            type: SecurityEventType.SUSPICIOUS_ACTIVITY,
            severity: 'high',
            details: expect.objectContaining({
              description: 'Multiple failed login attempts',
            }),
          }),
        }),
      );
    });
  });

  describe('Severity Levels', () => {
    it('should assign correct severity to event types', () => {
      const testCases = [
        { type: SecurityEventType.AUTH_FAILURE, expectedSeverity: 'medium' },
        { type: SecurityEventType.CSRF_FAILURE, expectedSeverity: 'high' },
        { type: SecurityEventType.RATE_LIMIT_EXCEEDED, expectedSeverity: 'medium' },
        { type: SecurityEventType.UNAUTHORIZED_ACCESS, expectedSeverity: 'high' },
        { type: SecurityEventType.VALIDATION_FAILURE, expectedSeverity: 'low' },
      ];

      testCases.forEach(({ type, expectedSeverity }) => {
        logSecurityEvent(type, { test: true }, mockRequest as Request);

        // Find the appropriate logger call based on severity
        let loggerCall;
        if (expectedSeverity === 'high') {
          loggerCall = logger.error;
        } else if (expectedSeverity === 'medium') {
          loggerCall = logger.warn;
        } else {
          loggerCall = logger.info;
        }

        expect(loggerCall).toHaveBeenCalled();
        const securityEvent = loggerCall.mock.calls[0][1].securityEvent;
        expect(securityEvent.severity).toBe(expectedSeverity);
      });
    });
  });
});
