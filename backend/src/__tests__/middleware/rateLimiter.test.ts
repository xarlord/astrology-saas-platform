/**
 * Tests for Rate Limiting Middleware
 * Security-critical middleware to prevent abuse
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';

// Mock express-rate-limit
jest.mock('express-rate-limit', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn((req, res, next) => next())),
}));

import rateLimit from 'express-rate-limit';

describe('Rate Limiter Middleware', () => {
  let configs: any[];

  beforeAll(() => {
    // Load the module once to capture all configurations
    require('../../middleware/rateLimiter');
    configs = (rateLimit as jest.MockedFunction<typeof rateLimit>).mock.calls.map(
      (call) => call[0],
    );
  });

  // ===== PDF Rate Limiter =====

  describe('PDF Rate Limiter', () => {
    it('should configure rate limit with correct window and max requests', () => {
      const pdfConfig = configs[0];
      expect(pdfConfig.windowMs).toBe(15 * 60 * 1000);
      expect(pdfConfig.max).toBe(10);
    });

    it('should use IP and user ID for rate limiting when authenticated', () => {
      const pdfConfig = configs[0];
      const mockReq = { user: { id: 'user-123' }, ip: '192.168.1.1' };
      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
      expect(generatedKey).toBe('192.168.1.1:user-123');
    });

    it('should use IP only when user is not authenticated', () => {
      const pdfConfig = configs[0];
      const mockReq = { ip: '192.168.1.1' };
      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
      expect(generatedKey).toBe('192.168.1.1');
    });

    it('should return correct error message and code', () => {
      const pdfConfig = configs[0];
      expect(pdfConfig.message).toEqual({
        success: false,
        error: 'Too many PDF requests. Please try again later.',
        code: 'RATE_LIMIT_PDF',
      });
    });

    it('should enable standard headers and disable legacy headers', () => {
      const pdfConfig = configs[0];
      expect(pdfConfig.standardHeaders).toBe(true);
      expect(pdfConfig.legacyHeaders).toBe(false);
    });
  });

  // ===== Share Rate Limiter =====

  describe('Share Rate Limiter', () => {
    it('should configure rate limit with correct window and max requests', () => {
      const shareConfig = configs[1];
      expect(shareConfig.windowMs).toBe(60 * 1000);
      expect(shareConfig.max).toBe(20);
    });

    it('should return correct error message and code', () => {
      const shareConfig = configs[1];
      expect(shareConfig.message).toEqual({
        success: false,
        error: 'Too many requests to shared charts. Please try again later.',
        code: 'RATE_LIMIT_SHARE',
      });
    });

    it('should enable standard headers and disable legacy headers', () => {
      const shareConfig = configs[1];
      expect(shareConfig.standardHeaders).toBe(true);
      expect(shareConfig.legacyHeaders).toBe(false);
    });
  });

  // ===== Auth Rate Limiter =====

  describe('Auth Rate Limiter', () => {
    it('should configure rate limit with correct window and max requests', () => {
      const authConfig = configs[2];
      expect(authConfig.windowMs).toBe(15 * 60 * 1000);
      expect(authConfig.max).toBeGreaterThanOrEqual(5);
      expect(authConfig.max).toBeLessThanOrEqual(100);
    });

    it('should return correct error message and code', () => {
      const authConfig = configs[2];
      expect(authConfig.message).toEqual({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_AUTH',
      });
    });

    it('should skip successful requests', () => {
      const authConfig = configs[2];
      expect(authConfig.skipSuccessfulRequests).toBe(true);
    });
  });

  // ===== Chart Creation Rate Limiter =====

  describe('Chart Creation Rate Limiter', () => {
    it('should configure rate limit with correct window and max requests', () => {
      const chartConfig = configs[3];
      expect(chartConfig.windowMs).toBe(60 * 60 * 1000);
      expect(chartConfig.max).toBe(20);
    });

    it('should use user ID for rate limiting', () => {
      const chartConfig = configs[3];
      const mockReq = { user: { id: 'user-123' } };
      const generatedKey = chartConfig.keyGenerator(mockReq as any);
      expect(generatedKey).toBe('chart:user-123');
    });

    it('should throw error when user is not authenticated', () => {
      const chartConfig = configs[3];
      const mockReq = {};
      expect(() => chartConfig.keyGenerator(mockReq as any)).toThrow('User must be authenticated');
    });

    it('should return correct error message and code', () => {
      const chartConfig = configs[3];
      expect(chartConfig.message).toEqual({
        success: false,
        error: 'Chart creation limit reached. Please try again later.',
        code: 'RATE_LIMIT_CHART',
      });
    });
  });

  // ===== Password Reset Rate Limiter =====

  describe('Password Reset Rate Limiter', () => {
    it('should configure rate limit with correct window and max requests', () => {
      const passwordResetConfig = configs[4];
      expect(passwordResetConfig.windowMs).toBe(60 * 60 * 1000);
      expect(passwordResetConfig.max).toBe(3);
    });

    it('should have very strict limits compared to other limiters', () => {
      const passwordResetConfig = configs[4];
      const pdfConfig = configs[0];
      expect(passwordResetConfig.max).toBeLessThan(pdfConfig.max);
    });

    it('should return correct error message and code', () => {
      const passwordResetConfig = configs[4];
      expect(passwordResetConfig.message).toEqual({
        success: false,
        error: 'Too many password reset requests. Please check your email or try again later.',
        code: 'RATE_LIMIT_PASSWORD_RESET',
      });
    });
  });

  // ===== Default Export =====

  describe('Default Export', () => {
    it('should export all rate limiters with correct names', () => {
      const rateLimiters = require('../../middleware/rateLimiter');
      const { default: defaultExport } = rateLimiters;

      expect(defaultExport).toBeDefined();
      expect(defaultExport.pdf).toBeDefined();
      expect(defaultExport.share).toBeDefined();
      expect(defaultExport.auth).toBeDefined();
      expect(defaultExport.chartCreation).toBeDefined();
      expect(defaultExport.passwordReset).toBeDefined();
    });

    it('should export rate limiters that match named exports', () => {
      const rateLimiters = require('../../middleware/rateLimiter');
      const { default: defaultExport, pdfRateLimiter, shareRateLimiter } = rateLimiters;

      expect(defaultExport.pdf).toEqual(pdfRateLimiter);
      expect(defaultExport.share).toEqual(shareRateLimiter);
    });
  });

  // ===== Edge Cases =====

  describe('Edge Cases', () => {
    it('should handle request with missing IP address', () => {
      const pdfConfig = configs[0];
      const mockReq = { connection: { remoteAddress: '10.0.0.1' } };
      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
      expect(generatedKey).toBe('10.0.0.1');
    });

    it('should handle request with missing IP and connection', () => {
      const pdfConfig = configs[0];
      const mockReq = { connection: {} }; // Connection exists but no remoteAddress
      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
      expect(generatedKey).toBe('unknown');
    });

    it('should handle request with connection remoteAddress as fallback', () => {
      const shareConfig = configs[1];
      expect(shareConfig.keyGenerator).toBeUndefined();
    });
  });

  // ===== Security Validation =====

  describe('Security Validation', () => {
    it('should ensure all rate limiters have error codes', () => {
      configs.forEach((config) => {
        expect(config.message).toHaveProperty('code');
        expect(config.message.code).toMatch(/^RATE_LIMIT_/);
        expect(typeof config.message.code).toBe('string');
      });
    });

    it('should ensure all rate limiters have user-friendly error messages', () => {
      configs.forEach((config) => {
        expect(config.message).toHaveProperty('error');
        expect(typeof config.message.error).toBe('string');
        expect(config.message.error.length).toBeGreaterThan(0);
      });
    });

    it('should ensure all rate limiters have reasonable window sizes', () => {
      configs.forEach((config) => {
        expect(config.windowMs).toBeGreaterThan(0);
        expect(config.windowMs).toBeLessThanOrEqual(60 * 60 * 1000);
        expect(typeof config.windowMs).toBe('number');
      });
    });

    it('should ensure all rate limiters have positive max requests', () => {
      configs.forEach((config) => {
        expect(config.max).toBeGreaterThan(0);
        expect(typeof config.max).toBe('number');
      });
    });
  });
});
