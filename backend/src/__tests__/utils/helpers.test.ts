/**
 * Unit Tests for Helper Utilities
 * Tests password hashing, validation, and sanitization
 */

import * as bcrypt from 'bcryptjs';
import {
  hashPassword,
  comparePassword,
  isValidEmail,
  validatePassword,
  generateToken,
  sanitizeUser,
} from '../../utils/helpers';

// Mock bcrypt
jest.mock('bcryptjs');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Helper Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with salt', async () => {
      const password = 'PlainTextPassword123';
      const hashedPassword = 'hashedpassword123';

      mockedBcrypt.genSalt.mockResolvedValue('salt10');
      mockedBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 'salt10');
      expect(result).toBe(hashedPassword);
    });

    it('should generate salt with 10 rounds', async () => {
      mockedBcrypt.genSalt.mockResolvedValue('salt10');
      mockedBcrypt.hash.mockResolvedValue('hashed');

      await hashPassword('password');

      expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'PlainTextPassword123';
      const hash = 'hashedpassword123';

      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'WrongPassword';
      const hash = 'hashedpassword123';

      mockedBcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(result).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should require @ symbol', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should require domain after @', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('StrongPass123');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require minimum 8 characters', () => {
      const result = validatePassword('Short1A');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should require uppercase letter', () => {
      const result = validatePassword('lowercase123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letter', () => {
      const result = validatePassword('UPPERCASE123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const result = validatePassword('NoNumbersHere');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePassword('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateToken', () => {
    it('should generate random token', () => {
      const token = generateToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate alphanumeric token', () => {
      const token = generateToken();

      expect(token).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password_hash from user object', () => {
      const user = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        timezone: 'UTC',
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).not.toHaveProperty('password_hash');
      expect(sanitized).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        timezone: 'UTC',
      });
    });

    it('should preserve other properties', () => {
      const user = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed',
        avatar_url: 'https://example.com/avatar.jpg',
        preferences: { theme: 'dark' },
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).toHaveProperty('id', '123');
      expect(sanitized).toHaveProperty('name', 'Test User');
      expect(sanitized).toHaveProperty('avatar_url', 'https://example.com/avatar.jpg');
      expect(sanitized).toHaveProperty('preferences', { theme: 'dark' });
    });

    it('should work with empty object', () => {
      const user = {} as any;
      const sanitized = sanitizeUser(user);

      expect(sanitized).toEqual({});
    });

    it('should work with object without password_hash', () => {
      const user = {
        id: '123',
        name: 'Test User',
      };

      const sanitized = sanitizeUser(user);

      expect(sanitized).toEqual({
        id: '123',
        name: 'Test User',
      });
    });
  });
});
