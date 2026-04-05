/**
 * Auth Schema Tests
 * Unit tests for authentication Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginPasswordSchema,
  nameSchema,
  userIdSchema,
  userSchema,
  loginRequestSchema,
  registerRequestSchema,
  refreshTokenRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  changePasswordRequestSchema,
  authResponseSchema,
  refreshTokenResponseSchema,
} from '../auth.schema';

describe('Auth Schemas', () => {
  describe('emailSchema', () => {
    it('should validate a valid email', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('missing@domain').success).toBe(false);
      expect(emailSchema.safeParse('@nodomain.com').success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = emailSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate a strong password', () => {
      const result = passwordSchema.safeParse('StrongP@ss123');
      expect(result.success).toBe(true);
    });

    it('should require at least 8 characters', () => {
      const result = passwordSchema.safeParse('Short1A');
      expect(result.success).toBe(false);
    });

    it('should require uppercase letter', () => {
      const result = passwordSchema.safeParse('alllowercase1');
      expect(result.success).toBe(false);
    });

    it('should require lowercase letter', () => {
      const result = passwordSchema.safeParse('ALLUPPERCASE1');
      expect(result.success).toBe(false);
    });

    it('should require a number', () => {
      const result = passwordSchema.safeParse('NoNumbersHere');
      expect(result.success).toBe(false);
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'Aa1' + 'a'.repeat(130);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('loginPasswordSchema', () => {
    it('should accept any non-empty password for login', () => {
      expect(loginPasswordSchema.safeParse('weak').success).toBe(true);
      expect(loginPasswordSchema.safeParse('StrongP@ss123').success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginPasswordSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('should validate valid names', () => {
      expect(nameSchema.safeParse('John').success).toBe(true);
      expect(nameSchema.safeParse("O'Brien").success).toBe(true);
      expect(nameSchema.safeParse('Mary-Jane').success).toBe(true);
      expect(nameSchema.safeParse('Jose Maria').success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = nameSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });

    it('should reject names with numbers', () => {
      const result = nameSchema.safeParse('John123');
      expect(result.success).toBe(false);
    });
  });

  describe('userIdSchema', () => {
    it('should validate a valid UUID', () => {
      const result = userIdSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(userIdSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(userIdSchema.safeParse('12345').success).toBe(false);
    });
  });

  describe('userSchema', () => {
    const validUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      subscriptionTier: 'free',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid user', () => {
      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const result = userSchema.safeParse(validUser);
      if (result.success) {
        expect(result.data.role).toBe('user');
        expect(result.data.subscriptionTier).toBe('free');
      }
    });

    it('should validate with all optional fields', () => {
      const userWithExtras = {
        ...validUser,
        fullName: 'John Doe',
        avatar: 'https://example.com/avatar.png',
        subscriptionExpiresAt: '2025-01-01T00:00:00Z',
        settings: {
          timezone: 'America/New_York',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          notifications: {
            email: true,
            push: true,
            dailyDigest: false,
            transitAlerts: true,
            lunarReturns: true,
            solarReturns: true,
          },
        },
      };
      const result = userSchema.safeParse(userWithExtras);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = userSchema.safeParse({
        ...validUser,
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid subscription tier', () => {
      const result = userSchema.safeParse({
        ...validUser,
        subscriptionTier: 'enterprise',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginRequestSchema', () => {
    it('should validate a valid login request', () => {
      const result = loginRequestSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      expect(loginRequestSchema.safeParse({ email: 'test@example.com' }).success).toBe(false);
      expect(loginRequestSchema.safeParse({ password: 'password' }).success).toBe(false);
    });
  });

  describe('registerRequestSchema', () => {
    it('should validate a valid registration request', () => {
      const result = registerRequestSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = registerRequestSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01T00:00:00Z',
        birthTime: '14:30',
        birthPlace: 'New York, NY',
      });
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const result = registerRequestSchema.safeParse({
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid birth time format', () => {
      const result = registerRequestSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        firstName: 'John',
        lastName: 'Doe',
        birthTime: '25:00', // Invalid hour
      });
      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenRequestSchema', () => {
    it('should validate a valid refresh token request', () => {
      const result = refreshTokenRequestSchema.safeParse({
        refreshToken: 'some-token-string',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = refreshTokenRequestSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordRequestSchema', () => {
    it('should validate a valid forgot password request', () => {
      const result = forgotPasswordRequestSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordRequestSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordRequestSchema', () => {
    it('should validate a valid reset password request', () => {
      const result = resetPasswordRequestSchema.safeParse({
        token: 'reset-token',
        newPassword: 'StrongPass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const result = resetPasswordRequestSchema.safeParse({
        token: 'reset-token',
        newPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordRequestSchema', () => {
    it('should validate a valid change password request', () => {
      const result = changePasswordRequestSchema.safeParse({
        currentPassword: 'currentPass',
        newPassword: 'StrongPass123',
      });
      expect(result.success).toBe(true);
    });

    it('should require both passwords', () => {
      expect(changePasswordRequestSchema.safeParse({ currentPassword: 'current' }).success).toBe(
        false,
      );
      expect(changePasswordRequestSchema.safeParse({ newPassword: 'StrongPass123' }).success).toBe(
        false,
      );
    });
  });

  describe('authResponseSchema', () => {
    const validAuthResponse = {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        subscriptionTier: 'free',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'access-token-string',
      refreshToken: 'refresh-token-string',
      expiresIn: 3600,
    };

    it('should validate a valid auth response', () => {
      const result = authResponseSchema.safeParse(validAuthResponse);
      expect(result.success).toBe(true);
    });

    it('should reject missing tokens', () => {
      const result = authResponseSchema.safeParse({
        ...validAuthResponse,
        accessToken: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid expiresIn', () => {
      const result = authResponseSchema.safeParse({
        ...validAuthResponse,
        expiresIn: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenResponseSchema', () => {
    it('should validate a valid refresh token response', () => {
      const result = refreshTokenResponseSchema.safeParse({
        accessToken: 'new-access-token',
        expiresIn: 3600,
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      expect(refreshTokenResponseSchema.safeParse({ accessToken: 'token' }).success).toBe(false);
      expect(refreshTokenResponseSchema.safeParse({ expiresIn: 3600 }).success).toBe(false);
    });
  });
});
