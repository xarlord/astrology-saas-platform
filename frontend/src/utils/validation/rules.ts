/**
 * Form Validation Rules
 *
 * Comprehensive validation rules for form fields with i18n support.
 * Each rule returns undefined for valid input, or an error message key for invalid input.
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

// ============================================================================
// Types
// ============================================================================

export type ValidationResult = string | undefined;
export type Validator<T = unknown> = (
  value: T,
  formData?: Record<string, unknown>,
) => ValidationResult;
export type AsyncValidator<T = unknown> = (
  value: T,
  formData?: Record<string, unknown>,
) => Promise<ValidationResult>;

export interface ValidationRuleOptions {
  /** Custom error message (overrides default i18n key) */
  message?: string;
  /** i18n key for error message */
  messageKey?: string;
  /** Whether this rule should be skipped for async validation */
  sync?: boolean;
}

export interface PasswordStrengthOptions extends ValidationRuleOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export interface DateRangeOptions extends ValidationRuleOptions {
  minDate?: Date;
  maxDate?: Date;
  minYearsAgo?: number;
  maxYearsAgo?: number;
}

export interface CoordinateOptions extends ValidationRuleOptions {
  min?: number;
  max?: number;
}

// ============================================================================
// i18n Message Keys
// ============================================================================

export const ValidationMessageKeys = {
  // Required
  REQUIRED: 'validation.required',

  // Email
  EMAIL_INVALID: 'validation.email.invalid',
  EMAIL_EMPTY: 'validation.email.empty',

  // Password
  PASSWORD_MIN_LENGTH: 'validation.password.minLength',
  PASSWORD_UPPERCASE: 'validation.password.uppercase',
  PASSWORD_LOWERCASE: 'validation.password.lowercase',
  PASSWORD_NUMBER: 'validation.password.number',
  PASSWORD_SPECIAL: 'validation.password.special',
  PASSWORD_WEAK: 'validation.password.weak',

  // Name
  NAME_MIN_LENGTH: 'validation.name.minLength',
  NAME_MAX_LENGTH: 'validation.name.maxLength',
  NAME_INVALID_CHARS: 'validation.name.invalidChars',

  // Date
  DATE_INVALID: 'validation.date.invalid',
  DATE_FUTURE: 'validation.date.future',
  DATE_TOO_OLD: 'validation.date.tooOld',
  DATE_TOO_RECENT: 'validation.date.tooRecent',
  DATE_RANGE: 'validation.date.range',

  // Time
  TIME_INVALID: 'validation.time.invalid',
  TIME_FORMAT: 'validation.time.format',

  // Location
  LOCATION_EMPTY: 'validation.location.empty',
  LOCATION_INVALID: 'validation.location.invalid',

  // Coordinates
  LATITUDE_INVALID: 'validation.coordinates.latitude',
  LONGITUDE_INVALID: 'validation.coordinates.longitude',

  // Timezone
  TIMEZONE_INVALID: 'validation.timezone.invalid',

  // General
  CONFIRM_MISMATCH: 'validation.confirm.mismatch',
  TOO_SHORT: 'validation.tooShort',
  TOO_LONG: 'validation.tooLong',
  INVALID_FORMAT: 'validation.invalidFormat',
} as const;

// ============================================================================
// Default Error Messages (English fallback)
// ============================================================================

const defaultMessages: Record<string, string> = {
  [ValidationMessageKeys.REQUIRED]: 'This field is required',
  [ValidationMessageKeys.EMAIL_INVALID]: 'Please enter a valid email address',
  [ValidationMessageKeys.EMAIL_EMPTY]: 'Email is required',
  [ValidationMessageKeys.PASSWORD_MIN_LENGTH]: 'Password must be at least {min} characters',
  [ValidationMessageKeys.PASSWORD_UPPERCASE]: 'Password must contain at least one uppercase letter',
  [ValidationMessageKeys.PASSWORD_LOWERCASE]: 'Password must contain at least one lowercase letter',
  [ValidationMessageKeys.PASSWORD_NUMBER]: 'Password must contain at least one number',
  [ValidationMessageKeys.PASSWORD_SPECIAL]: 'Password must contain at least one special character',
  [ValidationMessageKeys.PASSWORD_WEAK]: 'Password is too weak',
  [ValidationMessageKeys.NAME_MIN_LENGTH]: 'Name must be at least {min} characters',
  [ValidationMessageKeys.NAME_MAX_LENGTH]: 'Name must be at most {max} characters',
  [ValidationMessageKeys.NAME_INVALID_CHARS]: 'Name contains invalid characters',
  [ValidationMessageKeys.DATE_INVALID]: 'Please enter a valid date',
  [ValidationMessageKeys.DATE_FUTURE]: 'Date cannot be in the future',
  [ValidationMessageKeys.DATE_TOO_OLD]: 'Date is too far in the past',
  [ValidationMessageKeys.DATE_TOO_RECENT]: 'Date is too recent',
  [ValidationMessageKeys.DATE_RANGE]: 'Date must be between {min} and {max}',
  [ValidationMessageKeys.TIME_INVALID]: 'Please enter a valid time',
  [ValidationMessageKeys.TIME_FORMAT]: 'Time must be in HH:MM format',
  [ValidationMessageKeys.LOCATION_EMPTY]: 'Location is required',
  [ValidationMessageKeys.LOCATION_INVALID]: 'Please select a valid location',
  [ValidationMessageKeys.LATITUDE_INVALID]: 'Latitude must be between -90 and 90',
  [ValidationMessageKeys.LONGITUDE_INVALID]: 'Longitude must be between -180 and 180',
  [ValidationMessageKeys.TIMEZONE_INVALID]: 'Please select a valid timezone',
  [ValidationMessageKeys.CONFIRM_MISMATCH]: 'Values do not match',
  [ValidationMessageKeys.TOO_SHORT]: 'Must be at least {min} characters',
  [ValidationMessageKeys.TOO_LONG]: 'Must be at most {max} characters',
  [ValidationMessageKeys.INVALID_FORMAT]: 'Invalid format',
};

/**
 * Get error message by key with interpolation support
 */
export function getValidationMessage(
  key: string,
  params?: Record<string, string | number>,
): string {
  let message = defaultMessages[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      message = message.replace(`{${paramKey}}`, String(value));
    });
  }

  return message;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if value is empty (null, undefined, empty string, or whitespace-only)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return false; // Date objects are never empty
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Create validation result with message resolution
 */
function createResult(
  isValid: boolean,
  options: ValidationRuleOptions = {},
  messageKey: string = ValidationMessageKeys.INVALID_FORMAT,
  params?: Record<string, string | number>,
): ValidationResult {
  if (isValid) return undefined;

  if (options.message) return options.message;
  return getValidationMessage(options.messageKey || messageKey, params);
}

// ============================================================================
// Required Validation
// ============================================================================

/**
 * Validate that a field is not empty
 */
export function required<T = unknown>(options: ValidationRuleOptions = {}): Validator<T> {
  return (value: T): ValidationResult => {
    const isValid = !isEmpty(value);
    return createResult(isValid, options, ValidationMessageKeys.REQUIRED);
  };
}

// ============================================================================
// Email Validation
// ============================================================================

// RFC 5322 compliant email regex (simplified but covers most cases)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email format
 */
export function email(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.EMAIL_EMPTY);
    }

    const isValid = EMAIL_REGEX.test(value.trim());
    return createResult(isValid, options, ValidationMessageKeys.EMAIL_INVALID);
  };
}

/**
 * Validate email with required check
 */
export function emailRequired(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    // First check required
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.EMAIL_EMPTY);
    }
    // Then validate format
    return email(options)(value);
  };
}

// ============================================================================
// Password Validation
// ============================================================================

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

/**
 * Default password strength options
 */
const DEFAULT_PASSWORD_OPTIONS: PasswordStrengthOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validate password strength
 */
export function password(options: PasswordStrengthOptions = {}): Validator<string> {
  const opts: PasswordStrengthOptions = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, opts, ValidationMessageKeys.REQUIRED);
    }

    // Check minimum length
    if (opts.minLength && value.length < opts.minLength) {
      return createResult(false, opts, ValidationMessageKeys.PASSWORD_MIN_LENGTH, {
        min: opts.minLength,
      });
    }

    // Check uppercase
    if (opts.requireUppercase && !UPPERCASE_REGEX.test(value)) {
      return createResult(false, opts, ValidationMessageKeys.PASSWORD_UPPERCASE);
    }

    // Check lowercase
    if (opts.requireLowercase && !LOWERCASE_REGEX.test(value)) {
      return createResult(false, opts, ValidationMessageKeys.PASSWORD_LOWERCASE);
    }

    // Check number
    if (opts.requireNumber && !NUMBER_REGEX.test(value)) {
      return createResult(false, opts, ValidationMessageKeys.PASSWORD_NUMBER);
    }

    // Check special character
    if (opts.requireSpecialChar && !SPECIAL_CHAR_REGEX.test(value)) {
      return createResult(false, opts, ValidationMessageKeys.PASSWORD_SPECIAL);
    }

    return undefined;
  };
}

/**
 * Calculate password strength score (0-100)
 */
export function getPasswordStrength(value: string): number {
  if (!value) return 0;

  let score = 0;

  // Length scoring (up to 25 points)
  score += Math.min(value.length * 2, 25);

  // Character variety scoring
  if (UPPERCASE_REGEX.test(value)) score += 15;
  if (LOWERCASE_REGEX.test(value)) score += 10;
  if (NUMBER_REGEX.test(value)) score += 15;
  if (SPECIAL_CHAR_REGEX.test(value)) score += 20;

  // Bonus for mixed character types
  const typeCount = [
    UPPERCASE_REGEX.test(value),
    LOWERCASE_REGEX.test(value),
    NUMBER_REGEX.test(value),
    SPECIAL_CHAR_REGEX.test(value),
  ].filter(Boolean).length;

  if (typeCount >= 3) score += 10;
  if (typeCount === 4) score += 5;

  return Math.min(score, 100);
}

/**
 * Get password strength level
 */
export function getPasswordStrengthLevel(value: string): 'weak' | 'fair' | 'good' | 'strong' {
  const score = getPasswordStrength(value);
  if (score < 40) return 'weak';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  return 'strong';
}

// ============================================================================
// Name Validation
// ============================================================================

/**
 * Validate name (person's name)
 */
export function name(
  options: ValidationRuleOptions & { minLength?: number; maxLength?: number } = {},
): Validator<string> {
  const { minLength = 2, maxLength = 100 } = options;

  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.REQUIRED);
    }

    const trimmed = value.trim();

    // Check minimum length
    if (trimmed.length < minLength) {
      return createResult(false, options, ValidationMessageKeys.NAME_MIN_LENGTH, {
        min: minLength,
      });
    }

    // Check maximum length
    if (trimmed.length > maxLength) {
      return createResult(false, options, ValidationMessageKeys.NAME_MAX_LENGTH, {
        max: maxLength,
      });
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return createResult(false, options, ValidationMessageKeys.NAME_INVALID_CHARS);
    }

    return undefined;
  };
}

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Parse date string to Date object
 */
function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Try ISO format first
  const isoDate = new Date(value);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Validate birth date
 */
export function birthDate(options: DateRangeOptions = {}): Validator<string | Date> {
  return (value: string | Date): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.REQUIRED);
    }

    const date = parseDate(value);
    if (!date) {
      return createResult(false, options, ValidationMessageKeys.DATE_INVALID);
    }

    const now = new Date();

    // Check if date is in the future
    if (date > now) {
      return createResult(false, options, ValidationMessageKeys.DATE_FUTURE);
    }

    // Check minimum years ago (e.g., must be at least 13 years old)
    if (options.minYearsAgo) {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - options.minYearsAgo);
      if (date > minDate) {
        return createResult(false, options, ValidationMessageKeys.DATE_TOO_RECENT);
      }
    }

    // Check maximum years ago (e.g., can't be more than 150 years old)
    if (options.maxYearsAgo) {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - options.maxYearsAgo);
      if (date < maxDate) {
        return createResult(false, options, ValidationMessageKeys.DATE_TOO_OLD);
      }
    }

    // Check explicit date range
    if (options.minDate && date < options.minDate) {
      return createResult(false, options, ValidationMessageKeys.DATE_RANGE, {
        min: options.minDate.toLocaleDateString(),
        max: options.maxDate?.toLocaleDateString() || 'present',
      });
    }

    if (options.maxDate && date > options.maxDate) {
      return createResult(false, options, ValidationMessageKeys.DATE_RANGE, {
        min: options.minDate?.toLocaleDateString() || 'past',
        max: options.maxDate.toLocaleDateString(),
      });
    }

    return undefined;
  };
}

/**
 * Validate date is reasonable for birth (not future, not too old)
 */
export function reasonableBirthDate(options: ValidationRuleOptions = {}): Validator<string | Date> {
  return birthDate({
    ...options,
    maxYearsAgo: 150, // Maximum 150 years old
  });
}

// ============================================================================
// Time Validation
// ============================================================================

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
const TIME_24_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * Validate time format (HH:MM)
 */
export function time(
  options: ValidationRuleOptions & { format24?: boolean } = {},
): Validator<string> {
  const { format24 = false } = options;
  const regex = format24 ? TIME_24_REGEX : TIME_REGEX;

  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      // Time might be optional
      return undefined;
    }

    const isValid = regex.test(value.trim());
    return createResult(isValid, options, ValidationMessageKeys.TIME_FORMAT);
  };
}

/**
 * Validate birth time (can be optional)
 */
export function birthTime(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      // Birth time is often unknown, so empty is valid
      return undefined;
    }

    return time(options)(value);
  };
}

// ============================================================================
// Location Validation
// ============================================================================

/**
 * Validate location string (city, country format)
 */
export function location(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.LOCATION_EMPTY);
    }

    // Basic check for location format
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return createResult(false, options, ValidationMessageKeys.LOCATION_INVALID);
    }

    return undefined;
  };
}

// ============================================================================
// Coordinate Validation
// ============================================================================

/**
 * Validate latitude (-90 to 90)
 */
export function latitude(options: CoordinateOptions = {}): Validator<number | string> {
  return (value: number | string): ValidationResult => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return createResult(false, options, ValidationMessageKeys.LATITUDE_INVALID);
    }

    const isValid = num >= -90 && num <= 90;
    return createResult(isValid, options, ValidationMessageKeys.LATITUDE_INVALID);
  };
}

/**
 * Validate longitude (-180 to 180)
 */
export function longitude(options: CoordinateOptions = {}): Validator<number | string> {
  return (value: number | string): ValidationResult => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      return createResult(false, options, ValidationMessageKeys.LONGITUDE_INVALID);
    }

    const isValid = num >= -180 && num <= 180;
    return createResult(isValid, options, ValidationMessageKeys.LONGITUDE_INVALID);
  };
}

/**
 * Validate coordinates object
 */
export function coordinates(
  options: ValidationRuleOptions = {},
): Validator<{ latitude: number; longitude: number }> {
  return (value: { latitude: number; longitude: number }): ValidationResult => {
    if (!value || typeof value !== 'object') {
      return createResult(false, options, ValidationMessageKeys.LOCATION_INVALID);
    }

    const latResult = latitude()(value.latitude);
    if (latResult) return latResult;

    const lngResult = longitude()(value.longitude);
    if (lngResult) return lngResult;

    return undefined;
  };
}

// ============================================================================
// Timezone Validation
// ============================================================================

/**
 * Common timezone list (can be expanded)
 */
const COMMON_TIMEZONES = new Set([
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Vienna',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Mumbai',
  'Asia/Dubai',
  'Asia/Bangkok',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Honolulu',
  // Add more as needed
]);

/**
 * Validate timezone string
 */
export function timezone(options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return createResult(false, options, ValidationMessageKeys.TIMEZONE_INVALID);
    }

    // Try to validate using Intl API
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return undefined;
    } catch {
      // Fall back to common timezone list
      const isValid = COMMON_TIMEZONES.has(value);
      return createResult(isValid, options, ValidationMessageKeys.TIMEZONE_INVALID);
    }
  };
}

// ============================================================================
// Confirmation/Match Validation
// ============================================================================

/**
 * Validate that value matches another field
 */
export function matchField(
  fieldName: string,
  options: ValidationRuleOptions = {},
): Validator<string> {
  return (value: string, formData?: Record<string, unknown>): ValidationResult => {
    if (!formData || !(fieldName in formData)) {
      return createResult(false, options, ValidationMessageKeys.CONFIRM_MISMATCH);
    }

    const otherValue = formData[fieldName];
    const isValid = value === otherValue;
    return createResult(isValid, options, ValidationMessageKeys.CONFIRM_MISMATCH);
  };
}

/**
 * Validate password confirmation
 */
export function passwordConfirm(options: ValidationRuleOptions = {}): Validator<string> {
  return matchField('password', {
    messageKey: ValidationMessageKeys.CONFIRM_MISMATCH,
    ...options,
  });
}

// ============================================================================
// Length Validation
// ============================================================================

/**
 * Validate minimum length
 */
export function minLength(min: number, options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return undefined; // Use required() for empty check
    }

    const isValid = value.length >= min;
    return createResult(isValid, options, ValidationMessageKeys.TOO_SHORT, { min });
  };
}

/**
 * Validate maximum length
 */
export function maxLength(max: number, options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return undefined;
    }

    const isValid = value.length <= max;
    return createResult(isValid, options, ValidationMessageKeys.TOO_LONG, { max });
  };
}

// ============================================================================
// Pattern Validation
// ============================================================================

/**
 * Validate against a custom regex pattern
 */
export function pattern(regex: RegExp, options: ValidationRuleOptions = {}): Validator<string> {
  return (value: string): ValidationResult => {
    if (isEmpty(value)) {
      return undefined;
    }

    const isValid = regex.test(value);
    return createResult(isValid, options, ValidationMessageKeys.INVALID_FORMAT);
  };
}

// ============================================================================
// Custom Validation
// ============================================================================

/**
 * Create a custom validator function
 */
export function custom<T = unknown>(
  validateFn: (value: T, formData?: Record<string, unknown>) => boolean,
  message: string,
): Validator<T> {
  return (value: T, formData?: Record<string, unknown>): ValidationResult => {
    const isValid = validateFn(value, formData);
    return isValid ? undefined : message;
  };
}

/**
 * Create an async custom validator
 */
export function customAsync<T = unknown>(
  validateFn: (value: T, formData?: Record<string, unknown>) => Promise<boolean>,
  message: string,
): AsyncValidator<T> {
  return async (value: T, formData?: Record<string, unknown>): Promise<ValidationResult> => {
    const isValid = await validateFn(value, formData);
    return isValid ? undefined : message;
  };
}
