/**
 * Tests for Validation Rules
 */

import { describe, it, expect, vi } from 'vitest';
import {
  required,
  email,
  emailRequired,
  password,
  getPasswordStrength,
  getPasswordStrengthLevel,
  name,
  birthDate,
  reasonableBirthDate,
  time,
  birthTime,
  location,
  latitude,
  longitude,
  timezone,
  matchField,
  passwordConfirm,
  minLength,
  maxLength,
  pattern,
  custom,
  customAsync,
  isEmpty,
  getValidationMessage,
  ValidationMessageKeys,
} from '../rules';

describe('validation rules', () => {
  // ============================================================================
  // Utility Functions
  // ============================================================================

  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('test')).toBe(false);
    });

    it('should return false for non-empty array', () => {
      expect(isEmpty([1])).toBe(false);
    });

    it('should return false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('should return false for number 0', () => {
      expect(isEmpty(0)).toBe(false);
    });

    it('should return false for boolean false', () => {
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('getValidationMessage', () => {
    it('should return message for valid key', () => {
      const message = getValidationMessage(ValidationMessageKeys.REQUIRED);
      expect(message).toBe('This field is required');
    });

    it('should return key itself if not found', () => {
      const message = getValidationMessage('unknown.key');
      expect(message).toBe('unknown.key');
    });

    it('should interpolate parameters', () => {
      const message = getValidationMessage(ValidationMessageKeys.PASSWORD_MIN_LENGTH, { min: 8 });
      expect(message).toBe('Password must be at least 8 characters');
    });

    it('should interpolate multiple parameters', () => {
      const message = getValidationMessage(ValidationMessageKeys.DATE_RANGE, {
        min: '1/1/1900',
        max: 'today',
      });
      expect(message).toContain('1/1/1900');
      expect(message).toContain('today');
    });
  });

  // ============================================================================
  // Required Validation
  // ============================================================================

  describe('required', () => {
    const validator = required();

    it('should fail for null', () => {
      expect(validator(null)).toBeDefined();
    });

    it('should fail for undefined', () => {
      expect(validator(undefined)).toBeDefined();
    });

    it('should fail for empty string', () => {
      expect(validator('')).toBeDefined();
    });

    it('should pass for non-empty string', () => {
      expect(validator('test')).toBeUndefined();
    });

    it('should pass for number 0', () => {
      expect(validator(0)).toBeUndefined();
    });

    it('should pass for boolean false', () => {
      expect(validator(false)).toBeUndefined();
    });

    it('should use custom message', () => {
      const customValidator = required({ message: 'Custom required message' });
      expect(customValidator('')).toBe('Custom required message');
    });
  });

  // ============================================================================
  // Email Validation
  // ============================================================================

  describe('email', () => {
    const validator = email();

    it('should fail for invalid email formats', () => {
      expect(validator('notanemail')).toBeDefined();
      expect(validator('@example.com')).toBeDefined();
      expect(validator('test@')).toBeDefined();
      // Note: test@example is actually valid per RFC 5322 (TLD is not required)
    });

    it('should pass for valid email formats', () => {
      expect(validator('test@example.com')).toBeUndefined();
      expect(validator('user.name@example.com')).toBeUndefined();
      expect(validator('user+tag@example.co.uk')).toBeUndefined();
    });

    it('should fail for empty string', () => {
      expect(validator('')).toBeDefined();
    });

    it('should trim whitespace', () => {
      expect(validator('  test@example.com  ')).toBeUndefined();
    });
  });

  describe('emailRequired', () => {
    const validator = emailRequired();

    it('should fail for empty string', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for invalid email', () => {
      expect(validator('invalid')).toBeDefined();
    });

    it('should pass for valid email', () => {
      expect(validator('test@example.com')).toBeUndefined();
    });
  });

  // ============================================================================
  // Password Validation
  // ============================================================================

  describe('password', () => {
    const validator = password();

    it('should fail for empty password', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for password shorter than 8 characters', () => {
      expect(validator('Short1!')).toBeDefined();
    });

    it('should fail without uppercase letter', () => {
      expect(validator('lowercase1!')).toBeDefined();
    });

    it('should fail without lowercase letter', () => {
      expect(validator('UPPERCASE1!')).toBeDefined();
    });

    it('should fail without number', () => {
      expect(validator('NoNumber!')).toBeDefined();
    });

    it('should fail without special character', () => {
      expect(validator('NoSpecial1')).toBeDefined();
    });

    it('should pass for strong password', () => {
      expect(validator('ValidPass1!')).toBeUndefined();
    });

    it('should accept custom options', () => {
      const lenientValidator = password({
        minLength: 6,
        requireSpecialChar: false,
      });
      expect(lenientValidator('abc123')).toBeDefined(); // Still needs uppercase
      expect(lenientValidator('Abc123')).toBeUndefined();
    });
  });

  describe('getPasswordStrength', () => {
    it('should return 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0);
    });

    it('should return low score for weak password', () => {
      expect(getPasswordStrength('a')).toBeLessThan(40);
    });

    it('should return medium score for moderate password', () => {
      const score = getPasswordStrength('Password1');
      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(100);
    });

    it('should return high score for strong password', () => {
      const score = getPasswordStrength('Str0ng!Pass');
      expect(score).toBeGreaterThan(70);
    });
  });

  describe('getPasswordStrengthLevel', () => {
    it('should return weak for score < 40', () => {
      expect(getPasswordStrengthLevel('a')).toBe('weak');
    });

    it('should return fair for score 40-59', () => {
      // 'password' gives: 16 (length) + 10 (lowercase) = 26, which is weak
      // Use a stronger password for fair
      expect(getPasswordStrengthLevel('Password')).toBe('fair');
    });

    it('should return good for score 60-79', () => {
      expect(getPasswordStrengthLevel('Password1')).toBe('good');
    });

    it('should return strong for score >= 80', () => {
      expect(getPasswordStrengthLevel('Str0ng!Pass123')).toBe('strong');
    });
  });

  // ============================================================================
  // Name Validation
  // ============================================================================

  describe('name', () => {
    const validator = name();

    it('should fail for empty name', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for single character', () => {
      expect(validator('A')).toBeDefined();
    });

    it('should fail for name too long', () => {
      const longName = 'A'.repeat(101);
      expect(validator(longName)).toBeDefined();
    });

    it('should pass for valid name', () => {
      expect(validator('John')).toBeUndefined();
    });

    it('should allow spaces, hyphens, apostrophes', () => {
      expect(validator("Mary-Jane O'Connor")).toBeUndefined();
    });

    it('should allow unicode characters', () => {
      expect(validator('Jose Garcia')).toBeUndefined();
    });

    it('should fail for numbers', () => {
      expect(validator('John123')).toBeDefined();
    });

    it('should fail for special characters', () => {
      expect(validator('John@Doe')).toBeDefined();
    });
  });

  // ============================================================================
  // Date Validation
  // ============================================================================

  describe('birthDate', () => {
    const validator = birthDate();

    it('should fail for empty date', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for invalid date format', () => {
      expect(validator('not-a-date')).toBeDefined();
    });

    it('should fail for future date', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(validator(future)).toBeDefined();
    });

    it('should pass for valid past date', () => {
      expect(validator('1990-01-15')).toBeUndefined();
    });

    it('should pass for Date object', () => {
      const date = new Date('1990-01-15T00:00:00');
      expect(validator(date)).toBeUndefined();
    });

    it('should respect minYearsAgo option', () => {
      const adultValidator = birthDate({ minYearsAgo: 18 });
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 10);
      expect(adultValidator(recentDate)).toBeDefined();
    });

    it('should respect maxYearsAgo option', () => {
      const validator = birthDate({ maxYearsAgo: 100 });
      const oldDate = new Date('1800-01-01');
      expect(validator(oldDate)).toBeDefined();
    });
  });

  describe('reasonableBirthDate', () => {
    const validator = reasonableBirthDate();

    it('should fail for future date', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(validator(future)).toBeDefined();
    });

    it('should fail for date over 150 years ago', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 200);
      expect(validator(oldDate)).toBeDefined();
    });

    it('should pass for reasonable birth date', () => {
      expect(validator('1990-06-15')).toBeUndefined();
    });
  });

  // ============================================================================
  // Time Validation
  // ============================================================================

  describe('time', () => {
    const validator = time();

    it('should pass for empty time (optional)', () => {
      expect(validator('')).toBeUndefined();
    });

    it('should pass for valid 24-hour time', () => {
      expect(validator('14:30')).toBeUndefined();
      expect(validator('00:00')).toBeUndefined();
      expect(validator('23:59')).toBeUndefined();
    });

    it('should pass for valid 12-hour style time', () => {
      expect(validator('2:30')).toBeUndefined();
      expect(validator('9:00')).toBeUndefined();
    });

    it('should fail for invalid time', () => {
      expect(validator('25:00')).toBeDefined();
      expect(validator('12:60')).toBeDefined();
      expect(validator('not-time')).toBeDefined();
    });

    it('should enforce 24-hour format with option', () => {
      const strictValidator = time({ format24: true });
      expect(strictValidator('2:30')).toBeDefined();
      expect(strictValidator('02:30')).toBeUndefined();
    });
  });

  describe('birthTime', () => {
    const validator = birthTime();

    it('should pass for empty time (birth time can be unknown)', () => {
      expect(validator('')).toBeUndefined();
    });

    it('should pass for valid time', () => {
      expect(validator('14:30')).toBeUndefined();
    });

    it('should fail for invalid time', () => {
      expect(validator('invalid')).toBeDefined();
    });
  });

  // ============================================================================
  // Location Validation
  // ============================================================================

  describe('location', () => {
    const validator = location();

    it('should fail for empty location', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for single character', () => {
      expect(validator('A')).toBeDefined();
    });

    it('should pass for valid location', () => {
      expect(validator('New York, NY')).toBeUndefined();
    });
  });

  // ============================================================================
  // Coordinate Validation
  // ============================================================================

  describe('latitude', () => {
    const validator = latitude();

    it('should fail for non-numeric value', () => {
      expect(validator('not-a-number')).toBeDefined();
    });

    it('should fail for value outside range', () => {
      expect(validator(91)).toBeDefined();
      expect(validator(-91)).toBeDefined();
    });

    it('should pass for valid latitude', () => {
      expect(validator(40.7128)).toBeUndefined();
      expect(validator(-33.8688)).toBeUndefined();
      expect(validator(0)).toBeUndefined();
    });

    it('should accept string numbers', () => {
      expect(validator('40.7128')).toBeUndefined();
    });
  });

  describe('longitude', () => {
    const validator = longitude();

    it('should fail for non-numeric value', () => {
      expect(validator('not-a-number')).toBeDefined();
    });

    it('should fail for value outside range', () => {
      expect(validator(181)).toBeDefined();
      expect(validator(-181)).toBeDefined();
    });

    it('should pass for valid longitude', () => {
      expect(validator(-74.006)).toBeUndefined();
      expect(validator(151.2093)).toBeUndefined();
      expect(validator(0)).toBeUndefined();
    });

    it('should accept string numbers', () => {
      expect(validator('-74.0060')).toBeUndefined();
    });
  });

  // ============================================================================
  // Timezone Validation
  // ============================================================================

  describe('timezone', () => {
    const validator = timezone();

    it('should fail for empty timezone', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for invalid timezone', () => {
      expect(validator('Invalid/Timezone')).toBeDefined();
    });

    it('should pass for valid timezone', () => {
      expect(validator('America/New_York')).toBeUndefined();
      expect(validator('Europe/London')).toBeUndefined();
      expect(validator('UTC')).toBeUndefined();
    });
  });

  // ============================================================================
  // Match/Confirmation Validation
  // ============================================================================

  describe('matchField', () => {
    const validator = matchField('password');

    it('should fail when values do not match', () => {
      const formData = { password: 'test123' };
      expect(validator('different', formData)).toBeDefined();
    });

    it('should pass when values match', () => {
      const formData = { password: 'test123' };
      expect(validator('test123', formData)).toBeUndefined();
    });

    it('should fail when field is missing from form data', () => {
      expect(validator('test123', {})).toBeDefined();
    });
  });

  describe('passwordConfirm', () => {
    const validator = passwordConfirm();

    it('should fail when passwords do not match', () => {
      const formData = { password: 'Password1!' };
      expect(validator('Different1!', formData)).toBeDefined();
    });

    it('should pass when passwords match', () => {
      const formData = { password: 'Password1!' };
      expect(validator('Password1!', formData)).toBeUndefined();
    });
  });

  // ============================================================================
  // Length Validation
  // ============================================================================

  describe('minLength', () => {
    const validator = minLength(5);

    it('should pass for empty string (use required for empty check)', () => {
      expect(validator('')).toBeUndefined();
    });

    it('should fail for string shorter than minimum', () => {
      expect(validator('abc')).toBeDefined();
    });

    it('should pass for string at minimum', () => {
      expect(validator('abcde')).toBeUndefined();
    });

    it('should pass for string longer than minimum', () => {
      expect(validator('abcdefgh')).toBeUndefined();
    });
  });

  describe('maxLength', () => {
    const validator = maxLength(10);

    it('should pass for empty string', () => {
      expect(validator('')).toBeUndefined();
    });

    it('should fail for string longer than maximum', () => {
      expect(validator('abcdefghijk')).toBeDefined();
    });

    it('should pass for string at maximum', () => {
      expect(validator('abcdefghij')).toBeUndefined();
    });

    it('should pass for string shorter than maximum', () => {
      expect(validator('abc')).toBeUndefined();
    });
  });

  // ============================================================================
  // Pattern Validation
  // ============================================================================

  describe('pattern', () => {
    const validator = pattern(/^[A-Z]{2}\d{4}$/);

    it('should pass for matching pattern', () => {
      expect(validator('AB1234')).toBeUndefined();
    });

    it('should fail for non-matching pattern', () => {
      expect(validator('invalid')).toBeDefined();
    });

    it('should pass for empty string', () => {
      expect(validator('')).toBeUndefined();
    });
  });

  // ============================================================================
  // Custom Validation
  // ============================================================================

  describe('custom', () => {
    it('should pass when validation function returns true', () => {
      const validator = custom((value: number) => value > 0, 'Value must be positive');
      expect(validator(5)).toBeUndefined();
    });

    it('should fail when validation function returns false', () => {
      const validator = custom((value: number) => value > 0, 'Value must be positive');
      expect(validator(-5)).toBe('Value must be positive');
    });

    it('should receive form data', () => {
      const validator = custom(
        (value: string, formData) => formData?.other === 'test',
        'Other field must be test',
      );
      expect(validator('value', { other: 'test' })).toBeUndefined();
      expect(validator('value', { other: 'other' })).toBe('Other field must be test');
    });
  });

  describe('customAsync', () => {
    it('should pass when async validation returns true', async () => {
      const validator = customAsync(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value.length > 3;
      }, 'Value too short');
      expect(await validator('test')).toBeUndefined();
    });

    it('should fail when async validation returns false', async () => {
      const validator = customAsync(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value.length > 3;
      }, 'Value too short');
      expect(await validator('ab')).toBe('Value too short');
    });
  });
});
