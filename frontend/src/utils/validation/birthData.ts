/**
 * Birth Data Validator
 *
 * Specialized validation for astrological birth data including
 * date, time, coordinates, and timezone validation.
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import type { Validator, ValidationResult, ValidationRuleOptions } from './rules';
import { ValidationMessageKeys, getValidationMessage, isEmpty } from './rules';

// ============================================================================
// Types
// ============================================================================

export interface BirthData {
  /** Birth date (YYYY-MM-DD or Date object) */
  birth_date: string | Date;
  /** Birth time (HH:MM format) */
  birth_time?: string;
  /** Birth place name */
  birth_place: string;
  /** Latitude (-90 to 90) */
  latitude: number;
  /** Longitude (-180 to 180) */
  longitude: number;
  /** Timezone identifier (e.g., America/New_York) */
  timezone: string;
  /** Whether birth time is unknown */
  time_unknown?: boolean;
}

export interface BirthDataValidationResult {
  isValid: boolean;
  errors: Record<keyof BirthData, string[]>;
  warnings: string[];
}

// ============================================================================
// Constants
// ============================================================================

/** Earliest reasonable birth year (for astrology) */
const EARLIEST_BIRTH_YEAR = 1800;

/** Maximum age considered reasonable */
const MAX_AGE_YEARS = 150;

// ============================================================================
// Birth Date Validation
// ============================================================================

/**
 * Validate birth date is not in the future
 */
export function birthDateNotFuture(options: ValidationRuleOptions = {}): Validator<string | Date> {
  return (value: string | Date): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.REQUIRED);
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return getValidationMessage(ValidationMessageKeys.DATE_INVALID);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (date > now) {
      return options.message || getValidationMessage(ValidationMessageKeys.DATE_FUTURE);
    }

    return undefined;
  };
}

/**
 * Validate birth date is within reasonable range
 */
export function birthDateRange(options: ValidationRuleOptions = {}): Validator<string | Date> {
  return (value: string | Date): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.REQUIRED);
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return getValidationMessage(ValidationMessageKeys.DATE_INVALID);
    }

    const now = new Date();

    // Check if too old
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - MAX_AGE_YEARS);

    if (date < maxPastDate) {
      return options.message || getValidationMessage(ValidationMessageKeys.DATE_TOO_OLD);
    }

    // Check if too recent (future check)
    if (date > now) {
      return options.message || getValidationMessage(ValidationMessageKeys.DATE_FUTURE);
    }

    // Check earliest reasonable year for astrological data
    const earliestDate = new Date(`${EARLIEST_BIRTH_YEAR}-01-01`);
    if (date < earliestDate) {
      return options.message || `Birth date cannot be before ${EARLIEST_BIRTH_YEAR}`;
    }

    return undefined;
  };
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if birth date indicates a minor (under 18)
 */
export function isMinor(birthDate: string | Date): boolean {
  return calculateAge(birthDate) < 18;
}

// ============================================================================
// Birth Time Validation
// ============================================================================

/** Time format regex (HH:MM) */
const TIME_FORMAT_REGEX = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

/** Time format 24-hour with padding (HH:MM) */
const TIME_24_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

/** Time format with seconds (HH:MM:SS) */
const TIME_WITH_SECONDS_REGEX = /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

/**
 * Validate birth time format
 */
export function birthTimeFormat(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    // Birth time is optional
    if (isEmpty(value)) {
      return undefined;
    }

    const trimmed = value.trim();

    // Check standard time format
    if (TIME_FORMAT_REGEX.test(trimmed) || TIME_WITH_SECONDS_REGEX.test(trimmed)) {
      return undefined;
    }

    return options.message || getValidationMessage(ValidationMessageKeys.TIME_FORMAT);
  };
}

/**
 * Normalize time to HH:MM format
 */
export function normalizeBirthTime(time: string): string {
  if (!time) return '';

  const trimmed = time.trim();

  // Already in correct 24-hour format
  if (TIME_24_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Already in correct 12-hour format (but needs padding)
  if (TIME_FORMAT_REGEX.test(trimmed)) {
    const [hours, minutes] = trimmed.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Handle seconds (remove them)
  const secondsMatch = trimmed.match(/^(\d{1,2}):([0-5]\d):[0-5]\d$/);
  if (secondsMatch) {
    const hours = secondsMatch[1].padStart(2, '0');
    return `${hours}:${secondsMatch[2]}`;
  }

  return trimmed;
}

/**
 * Validate birth time with unknown flag consideration
 */
export function birthTimeWithUnknown(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string, formData?: Record<string, unknown>): ValidationResult => {
    // If time is marked as unknown, skip validation
    if (formData?.time_unknown === true) {
      return undefined;
    }

    return birthTimeFormat(options)(value);
  };
}

// ============================================================================
// Coordinate Validation
// ============================================================================

/**
 * Validate latitude for birth location
 */
export function birthLatitude(options: ValidationRuleOptions = {}): Validator<number | string> {
  return (value: number | string): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.REQUIRED);
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return options.message || getValidationMessage(ValidationMessageKeys.LATITUDE_INVALID);
    }

    if (num < -90 || num > 90) {
      return options.message || getValidationMessage(ValidationMessageKeys.LATITUDE_INVALID);
    }

    return undefined;
  };
}

/**
 * Validate longitude for birth location
 */
export function birthLongitude(options: ValidationRuleOptions = {}): Validator<number | string> {
  return (value: number | string): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.REQUIRED);
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return options.message || getValidationMessage(ValidationMessageKeys.LONGITUDE_INVALID);
    }

    if (num < -180 || num > 180) {
      return options.message || getValidationMessage(ValidationMessageKeys.LONGITUDE_INVALID);
    }

    return undefined;
  };
}

/**
 * Validate coordinate precision (decimal places)
 */
export function coordinatePrecision(value: number): number {
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) return 0;
  return str.length - decimalIndex - 1;
}

/**
 * Check if coordinates are precise enough for astrological calculations
 * (at least 2 decimal places recommended)
 */
export function hasSufficientPrecision(latitude: number, longitude: number): boolean {
  return coordinatePrecision(latitude) >= 2 && coordinatePrecision(longitude) >= 2;
}

// ============================================================================
// Timezone Validation
// ============================================================================

/**
 * Validate timezone identifier
 */
export function birthTimezone(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.REQUIRED);
    }

    try {
      // Use Intl API to validate timezone
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return undefined;
    } catch {
      return options.message || getValidationMessage(ValidationMessageKeys.TIMEZONE_INVALID);
    }
  };
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

/**
 * Suggest timezone based on longitude
 */
export function suggestTimezone(longitude: number): string {
  // Rough timezone estimation based on longitude
  // This is a simplification - real timezone detection should use a proper library
  const offset = Math.round(longitude / 15);

  const timezoneMap: Record<number, string> = {
    [-12]: 'Etc/GMT+12',
    [-11]: 'Pacific/Midway',
    [-10]: 'Pacific/Honolulu',
    [-9]: 'America/Anchorage',
    [-8]: 'America/Los_Angeles',
    [-7]: 'America/Denver',
    [-6]: 'America/Chicago',
    [-5]: 'America/New_York',
    [-4]: 'America/Caracas',
    [-3]: 'America/Sao_Paulo',
    [-2]: 'Atlantic/South_Georgia',
    [-1]: 'Atlantic/Azores',
    [0]: 'Europe/London',
    [1]: 'Europe/Paris',
    [2]: 'Europe/Berlin',
    [3]: 'Europe/Moscow',
    [4]: 'Asia/Dubai',
    [5]: 'Asia/Karachi',
    [6]: 'Asia/Dhaka',
    [7]: 'Asia/Bangkok',
    [8]: 'Asia/Singapore',
    [9]: 'Asia/Tokyo',
    [10]: 'Australia/Sydney',
    [11]: 'Pacific/Noumea',
    [12]: 'Pacific/Auckland',
  };

  return timezoneMap[offset] || 'UTC';
}

// ============================================================================
// Birth Location Validation
// ============================================================================

/**
 * Validate birth place name
 */
export function birthPlace(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return getValidationMessage(ValidationMessageKeys.LOCATION_EMPTY);
    }

    const trimmed = value.trim();

    if (trimmed.length < 2) {
      return options.message || getValidationMessage(ValidationMessageKeys.LOCATION_INVALID);
    }

    // Check for reasonable format (at least contains some letters)
    if (!/[a-zA-Z\u00C0-\u024F]/.test(trimmed)) {
      return options.message || getValidationMessage(ValidationMessageKeys.LOCATION_INVALID);
    }

    return undefined;
  };
}

// ============================================================================
// Complete Birth Data Validation
// ============================================================================

/**
 * Validate complete birth data object
 */
export function validateBirthData(data: Partial<BirthData>): BirthDataValidationResult {
  const errors: Record<keyof BirthData, string[]> = {
    birth_date: [],
    birth_time: [],
    birth_place: [],
    latitude: [],
    longitude: [],
    timezone: [],
    time_unknown: [],
  };

  const warnings: string[] = [];

  // Validate birth date
  const dateResult = birthDateRange()(data.birth_date || '');
  if (dateResult) errors.birth_date.push(dateResult);

  // Validate birth time (if not unknown)
  if (!data.time_unknown && data.birth_time) {
    const timeResult = birthTimeFormat()(data.birth_time);
    if (timeResult) errors.birth_time.push(timeResult);
  }

  // Validate birth place
  const placeResult = birthPlace()(data.birth_place || '');
  if (placeResult) errors.birth_place.push(placeResult);

  // Validate coordinates
  const latResult = birthLatitude()(data.latitude ?? '');
  if (latResult) errors.latitude.push(latResult);

  const lngResult = birthLongitude()(data.longitude ?? '');
  if (lngResult) errors.longitude.push(lngResult);

  // Validate timezone
  const tzResult = birthTimezone()(data.timezone || '');
  if (tzResult) errors.timezone.push(tzResult);

  // Add warnings for potential issues
  if (!data.time_unknown && !data.birth_time) {
    warnings.push('Birth time not provided - chart accuracy may be reduced for house placements');
  }

  if (
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number' &&
    !hasSufficientPrecision(data.latitude, data.longitude)
  ) {
    warnings.push('Coordinates have low precision - chart accuracy may be reduced');
  }

  // Calculate if overall data is valid
  const isValid = Object.values(errors).every(arr => arr.length === 0);

  return {
    isValid,
    errors,
    warnings,
  };
}

/**
 * Quick validation check for birth data
 */
export function isBirthDataValid(data: Partial<BirthData>): boolean {
  return validateBirthData(data).isValid;
}

/**
 * Get required fields for birth data
 */
export function getRequiredBirthDataFields(): (keyof BirthData)[] {
  return ['birth_date', 'birth_place', 'latitude', 'longitude', 'timezone'];
}

/**
 * Get optional fields for birth data
 */
export function getOptionalBirthDataFields(): (keyof BirthData)[] {
  return ['birth_time', 'time_unknown'];
}

/**
 * Sanitize birth data (normalize formats, trim strings)
 */
export function sanitizeBirthData(data: Partial<BirthData>): Partial<BirthData> {
  return {
    ...data,
    birth_place: data.birth_place?.trim(),
    birth_time: data.birth_time ? normalizeBirthTime(data.birth_time) : data.birth_time,
    timezone: data.timezone?.trim(),
  };
}
