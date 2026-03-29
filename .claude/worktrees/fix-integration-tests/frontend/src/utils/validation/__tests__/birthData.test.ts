/**
 * Tests for Birth Data Validator
 */

import { describe, it, expect, vi } from 'vitest';
import {
  birthDateNotFuture,
  birthDateRange,
  calculateAge,
  isMinor,
  birthTimeFormat,
  normalizeBirthTime,
  birthTimeWithUnknown,
  birthLatitude,
  birthLongitude,
  coordinatePrecision,
  hasSufficientPrecision,
  birthTimezone,
  getTimezoneOffset,
  suggestTimezone,
  birthPlace,
  validateBirthData,
  isBirthDataValid,
  getRequiredBirthDataFields,
  getOptionalBirthDataFields,
  sanitizeBirthData,
} from '../birthData';

describe('birthData validator', () => {
  // ============================================================================
  // Birth Date Validation
  // ============================================================================

  describe('birthDateNotFuture', () => {
    const validator = birthDateNotFuture();

    it('should fail for empty date', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for future date', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(validator(future)).toBeDefined();
    });

    it('should pass for past date', () => {
      expect(validator('1990-01-15')).toBeUndefined();
    });

    it('should pass for today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(validator(today)).toBeUndefined();
    });
  });

  describe('birthDateRange', () => {
    const validator = birthDateRange();

    it('should fail for empty date', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for invalid date', () => {
      expect(validator('not-a-date')).toBeDefined();
    });

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

    it('should pass for valid birth date', () => {
      expect(validator('1985-06-20')).toBeUndefined();
    });

    it('should pass for date string in ISO format', () => {
      expect(validator('1990-12-31')).toBeUndefined();
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      expect(calculateAge(birthDate)).toBe(30);
    });

    it('should handle birthday not yet occurred this year', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      birthDate.setMonth(birthDate.getMonth() + 1); // Next month
      expect(calculateAge(birthDate)).toBe(29);
    });

    it('should work with string date', () => {
      const age = calculateAge('1990-06-15');
      expect(age).toBeGreaterThanOrEqual(33);
      expect(age).toBeLessThanOrEqual(36);
    });
  });

  describe('isMinor', () => {
    it('should return true for person under 18', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 15);
      expect(isMinor(birthDate)).toBe(true);
    });

    it('should return false for person 18 or older', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 20);
      expect(isMinor(birthDate)).toBe(false);
    });
  });

  // ============================================================================
  // Birth Time Validation
  // ============================================================================

  describe('birthTimeFormat', () => {
    const validator = birthTimeFormat();

    it('should pass for empty time (optional)', () => {
      expect(validator('')).toBeUndefined();
    });

    it('should pass for valid HH:MM format', () => {
      expect(validator('14:30')).toBeUndefined();
      expect(validator('00:00')).toBeUndefined();
      expect(validator('23:59')).toBeUndefined();
    });

    it('should pass for valid H:MM format', () => {
      expect(validator('9:30')).toBeUndefined();
      expect(validator('0:00')).toBeUndefined();
    });

    it('should pass for HH:MM:SS format', () => {
      expect(validator('14:30:45')).toBeUndefined();
    });

    it('should fail for invalid time format', () => {
      expect(validator('25:00')).toBeDefined();
      expect(validator('12:60')).toBeDefined();
      expect(validator('invalid')).toBeDefined();
    });
  });

  describe('normalizeBirthTime', () => {
    it('should return empty string for empty input', () => {
      expect(normalizeBirthTime('')).toBe('');
    });

    it('should pad single digit hours', () => {
      expect(normalizeBirthTime('9:30')).toBe('09:30');
    });

    it('should not modify valid format', () => {
      expect(normalizeBirthTime('14:30')).toBe('14:30');
    });

    it('should remove seconds', () => {
      expect(normalizeBirthTime('14:30:45')).toBe('14:30');
    });

    it('should handle H:MM:SS format', () => {
      expect(normalizeBirthTime('9:30:00')).toBe('09:30');
    });
  });

  describe('birthTimeWithUnknown', () => {
    const validator = birthTimeWithUnknown();

    it('should pass for empty when time_unknown is true', () => {
      const result = validator('', { time_unknown: true });
      expect(result).toBeUndefined();
    });

    it('should validate when time_unknown is false', () => {
      const result = validator('', { time_unknown: false });
      expect(result).toBeUndefined(); // Empty is still valid for optional
    });

    it('should validate format when time is provided', () => {
      const result = validator('invalid', {});
      expect(result).toBeDefined();
    });
  });

  // ============================================================================
  // Coordinate Validation
  // ============================================================================

  describe('birthLatitude', () => {
    const validator = birthLatitude();

    it('should fail for empty value', () => {
      expect(validator('')).toBeDefined();
    });

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

  describe('birthLongitude', () => {
    const validator = birthLongitude();

    it('should fail for empty value', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for non-numeric value', () => {
      expect(validator('not-a-number')).toBeDefined();
    });

    it('should fail for value outside range', () => {
      expect(validator(181)).toBeDefined();
      expect(validator(-181)).toBeDefined();
    });

    it('should pass for valid longitude', () => {
      expect(validator(-74.0060)).toBeUndefined();
      expect(validator(151.2093)).toBeUndefined();
      expect(validator(0)).toBeUndefined();
    });
  });

  describe('coordinatePrecision', () => {
    it('should return 0 for integer', () => {
      expect(coordinatePrecision(40)).toBe(0);
    });

    it('should return correct decimal places', () => {
      expect(coordinatePrecision(40.71)).toBe(2);
      expect(coordinatePrecision(40.7128)).toBe(4);
      expect(coordinatePrecision(40.7128123)).toBe(7);
    });
  });

  describe('hasSufficientPrecision', () => {
    it('should return true for 2+ decimal places', () => {
      expect(hasSufficientPrecision(40.71, -74.01)).toBe(true);
      expect(hasSufficientPrecision(40.7128, -74.0060)).toBe(true);
    });

    it('should return false for less than 2 decimal places', () => {
      expect(hasSufficientPrecision(40, -74)).toBe(false);
      expect(hasSufficientPrecision(40.7, -74)).toBe(false);
      expect(hasSufficientPrecision(40, -74.1)).toBe(false);
    });
  });

  // ============================================================================
  // Timezone Validation
  // ============================================================================

  describe('birthTimezone', () => {
    const validator = birthTimezone();

    it('should fail for empty timezone', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for invalid timezone', () => {
      expect(validator('Invalid/Timezone')).toBeDefined();
    });

    it('should pass for valid timezone', () => {
      expect(validator('America/New_York')).toBeUndefined();
      expect(validator('Europe/London')).toBeUndefined();
      expect(validator('Asia/Tokyo')).toBeUndefined();
      expect(validator('UTC')).toBeUndefined();
    });
  });

  describe('getTimezoneOffset', () => {
    it('should return offset in hours', () => {
      const offset = getTimezoneOffset('America/New_York');
      expect(typeof offset).toBe('number');
      // NYC is UTC-5 or UTC-4 depending on DST
      expect(offset).toBeGreaterThanOrEqual(-5);
      expect(offset).toBeLessThanOrEqual(-4);
    });

    it('should return 0 for UTC', () => {
      const offset = getTimezoneOffset('UTC');
      expect(offset).toBe(0);
    });
  });

  describe('suggestTimezone', () => {
    it('should suggest timezone based on longitude', () => {
      expect(suggestTimezone(-74)).toBe('America/New_York');
      expect(suggestTimezone(0)).toBe('Europe/London');
      expect(suggestTimezone(139.7)).toBe('Asia/Tokyo');
    });

    it('should return UTC for extreme values', () => {
      expect(suggestTimezone(200)).toBe('UTC');
    });
  });

  // ============================================================================
  // Birth Place Validation
  // ============================================================================

  describe('birthPlace', () => {
    const validator = birthPlace();

    it('should fail for empty location', () => {
      expect(validator('')).toBeDefined();
    });

    it('should fail for single character', () => {
      expect(validator('A')).toBeDefined();
    });

    it('should fail for location without letters', () => {
      expect(validator('12345')).toBeDefined();
    });

    it('should pass for valid location', () => {
      expect(validator('New York, NY')).toBeUndefined();
      expect(validator('Paris, France')).toBeUndefined();
      expect(validator('Tokyo')).toBeUndefined();
    });
  });

  // ============================================================================
  // Complete Birth Data Validation
  // ============================================================================

  describe('validateBirthData', () => {
    it('should validate complete birth data', () => {
      const result = validateBirthData({
        birth_date: '1990-06-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      });

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should fail for missing required fields', () => {
      const result = validateBirthData({});

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should add warning for missing birth time', () => {
      const result = validateBirthData({
        birth_date: '1990-06-15',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Birth time not provided');
    });

    it('should add warning for low coordinate precision', () => {
      const result = validateBirthData({
        birth_date: '1990-06-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40, // Low precision
        longitude: -74, // Low precision
        timezone: 'America/New_York',
      });

      expect(result.warnings.some(w => w.includes('low precision'))).toBe(true);
    });

    it('should fail for invalid birth date', () => {
      const result = validateBirthData({
        birth_date: 'invalid-date',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.birth_date.length).toBeGreaterThan(0);
    });

    it('should fail for invalid coordinates', () => {
      const result = validateBirthData({
        birth_date: '1990-06-15',
        birth_place: 'New York, NY',
        latitude: 91, // Invalid
        longitude: -181, // Invalid
        timezone: 'America/New_York',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.latitude.length).toBeGreaterThan(0);
      expect(result.errors.longitude.length).toBeGreaterThan(0);
    });
  });

  describe('isBirthDataValid', () => {
    it('should return true for valid data', () => {
      const result = isBirthDataValid({
        birth_date: '1990-06-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      });

      expect(result).toBe(true);
    });

    it('should return false for invalid data', () => {
      const result = isBirthDataValid({});

      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // Field Lists
  // ============================================================================

  describe('getRequiredBirthDataFields', () => {
    it('should return required fields', () => {
      const fields = getRequiredBirthDataFields();

      expect(fields).toContain('birth_date');
      expect(fields).toContain('birth_place');
      expect(fields).toContain('latitude');
      expect(fields).toContain('longitude');
      expect(fields).toContain('timezone');
      expect(fields).not.toContain('birth_time');
      expect(fields).not.toContain('time_unknown');
    });
  });

  describe('getOptionalBirthDataFields', () => {
    it('should return optional fields', () => {
      const fields = getOptionalBirthDataFields();

      expect(fields).toContain('birth_time');
      expect(fields).toContain('time_unknown');
      expect(fields).not.toContain('birth_date');
      expect(fields).not.toContain('birth_place');
    });
  });

  // ============================================================================
  // Sanitization
  // ============================================================================

  describe('sanitizeBirthData', () => {
    it('should trim strings', () => {
      const result = sanitizeBirthData({
        birth_place: '  New York, NY  ',
        timezone: '  America/New_York  ',
      });

      expect(result.birth_place).toBe('New York, NY');
      expect(result.timezone).toBe('America/New_York');
    });

    it('should normalize birth time', () => {
      const result = sanitizeBirthData({
        birth_time: '9:30',
      });

      expect(result.birth_time).toBe('09:30');
    });

    it('should preserve undefined values', () => {
      const result = sanitizeBirthData({
        birth_date: '1990-06-15',
      });

      expect(result.birth_time).toBeUndefined();
    });

    it('should handle empty strings', () => {
      const result = sanitizeBirthData({
        birth_place: '',
        birth_time: '',
      });

      expect(result.birth_place).toBe('');
      // normalizeBirthTime returns '' for empty input
      expect(result.birth_time).toBe('');
    });
  });
});
