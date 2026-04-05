/**
 * Tests for Validation Utilities (index.ts)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  composeValidators,
  composeAsyncValidators,
  allErrors,
  validateField,
  validateFieldAsync,
  validateForm,
  validateFormAsync,
  hasErrors,
  getErrorCount,
  getFirstError,
  getFieldError,
  getFieldErrors,
  fieldHasError,
  clearFieldError,
  clearAllErrors,
  mergeErrors,
  createValidationState,
  updateValidationState,
  touchField,
  dirtyField,
  shouldShowError as shouldShowErrorFn,
  required,
  email,
  minLength,
} from '../index';

describe('validation utilities', () => {
  // ============================================================================
  // Compose Validators
  // ============================================================================

  describe('composeValidators', () => {
    it('should return undefined when all validators pass', () => {
      const validator = composeValidators(required(), minLength(3));

      expect(validator('test')).toBeUndefined();
    });

    it('should return first error encountered', () => {
      const validator = composeValidators(required(), minLength(5));

      const result = validator('abc');
      expect(result).toBeDefined();
    });

    it('should pass form data to validators', () => {
      const validator = composeValidators((value: string, formData) =>
        formData?.other === 'test' ? undefined : 'Other must be test',
      );

      expect(validator('value', { other: 'test' })).toBeUndefined();
      expect(validator('value', { other: 'other' })).toBe('Other must be test');
    });
  });

  describe('composeAsyncValidators', () => {
    it('should compose async validators', async () => {
      const validator = composeAsyncValidators(
        async () => undefined,
        async () => 'error',
      );

      const result = await validator('test');
      expect(result).toBe('error');
    });

    it('should return undefined when all pass', async () => {
      const validator = composeAsyncValidators(
        async () => undefined,
        async () => undefined,
      );

      const result = await validator('test');
      expect(result).toBeUndefined();
    });
  });

  describe('allErrors', () => {
    it('should return all errors', () => {
      const getErrors = allErrors(minLength(5), (value: string) =>
        value.includes('test') ? undefined : 'Must contain test',
      );

      const result = getErrors('ab');
      expect(result).toHaveLength(2);
    });

    it('should return empty array when all pass', () => {
      const getErrors = allErrors(required(), minLength(3));

      const result = getErrors('test');
      expect(result).toHaveLength(0);
    });
  });

  // ============================================================================
  // Field Validation
  // ============================================================================

  describe('validateField', () => {
    it('should return errors array', () => {
      const errors = validateField('', [required()]);

      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return empty array for valid value', () => {
      const errors = validateField('test@example.com', [required(), email()]);

      expect(errors).toHaveLength(0);
    });

    it('should stop on first error by default', () => {
      const errors = validateField('', [required(), minLength(5)]);

      expect(errors).toHaveLength(1);
    });

    it('should return all errors when stopOnFirstError is false', () => {
      // Note: required() returns first, so minLength won't run on empty string
      const errors = validateField(
        'ab',
        [minLength(3), minLength(5)],
        {},
        {
          stopOnFirstError: false,
        },
      );

      expect(errors.length).toBeGreaterThan(1);
    });

    it('should transform errors with custom function', () => {
      const errors = validateField(
        '',
        [required()],
        {},
        {
          transformError: (err) => `Custom: ${err}`,
        },
      );

      expect(errors[0]).toContain('Custom:');
    });
  });

  describe('validateFieldAsync', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should run both sync and async validators', async () => {
      const asyncValidator = vi.fn().mockResolvedValue('async error');

      const errorsPromise = validateFieldAsync('value', [required()], [asyncValidator]);

      await vi.runAllTimersAsync();
      const errors = await errorsPromise;

      expect(asyncValidator).toHaveBeenCalled();
      expect(errors).toContain('async error');
    });

    it('should return sync errors immediately', async () => {
      const asyncValidator = vi.fn().mockResolvedValue('async error');

      const errors = await validateFieldAsync(
        '',
        [required()],
        [asyncValidator],
        {},
        { stopOnFirstError: true },
      );

      expect(errors.length).toBeGreaterThan(0);
      // Async validator may still run, but we get sync errors first
    });

    it('should handle timeout', async () => {
      const slowValidator = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(undefined), 10000)),
        );

      const errorsPromise = validateFieldAsync('value', [], [slowValidator], {}, { timeout: 100 });

      await vi.advanceTimersByTimeAsync(200);
      const errors = await errorsPromise;

      expect(errors).toContain('Validation timed out');
    });
  });

  // ============================================================================
  // Form Validation
  // ============================================================================

  describe('validateForm', () => {
    it('should validate all fields', () => {
      const config = {
        fields: {
          email: { validators: [required(), email()] },
          password: { validators: [required()] },
        },
      };

      const errors = validateForm({ email: '', password: '' }, config);

      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('should return empty object for valid form', () => {
      const config = {
        fields: {
          email: { validators: [required(), email()] },
          password: { validators: [required()] },
        },
      };

      const errors = validateForm({ email: 'test@example.com', password: 'password123' }, config);

      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should run cross-field validators', () => {
      const config = {
        fields: {
          password: { validators: [required()] },
          confirmPassword: { validators: [required()] },
        },
        crossFieldValidators: [
          {
            fields: ['password', 'confirmPassword'],
            validate: (formData) =>
              formData.password !== formData.confirmPassword ? 'Passwords must match' : undefined,
          },
        ],
      };

      const errors = validateForm({ password: 'pass1', confirmPassword: 'pass2' }, config);

      expect(errors.password).toContain('Passwords must match');
    });
  });

  describe('validateFormAsync', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should validate all fields asynchronously', async () => {
      const config = {
        fields: {
          email: { validators: [required(), email()] },
          password: { validators: [required()] },
        },
      };

      const errorsPromise = validateFormAsync({ email: '', password: '' }, config);

      await vi.runAllTimersAsync();
      const errors = await errorsPromise;

      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('should run async validators', async () => {
      const asyncValidator = vi.fn().mockResolvedValue('Username taken');

      const config = {
        fields: {
          username: {
            validators: [],
            asyncValidators: [asyncValidator],
          },
        },
      };

      const errorsPromise = validateFormAsync({ username: 'test' }, config);
      await vi.runAllTimersAsync();
      const errors = await errorsPromise;

      expect(asyncValidator).toHaveBeenCalled();
      expect(errors.username).toContain('Username taken');
    });
  });

  // ============================================================================
  // Error Utilities
  // ============================================================================

  describe('hasErrors', () => {
    it('should return true for errors present', () => {
      expect(hasErrors({ email: ['Required'] })).toBe(true);
    });

    it('should return false for no errors', () => {
      expect(hasErrors({})).toBe(false);
    });

    it('should return false for empty error arrays', () => {
      expect(hasErrors({ email: [] })).toBe(false);
    });
  });

  describe('getErrorCount', () => {
    it('should count total errors', () => {
      const errors = {
        email: ['Required', 'Invalid format'],
        password: ['Required'],
      };

      expect(getErrorCount(errors)).toBe(3);
    });

    it('should return 0 for no errors', () => {
      expect(getErrorCount({})).toBe(0);
    });
  });

  describe('getFirstError', () => {
    it('should return first error from form', () => {
      const errors = {
        email: ['Required'],
        password: ['Too short'],
      };

      expect(getFirstError(errors)).toBe('Required');
    });

    it('should return undefined for no errors', () => {
      expect(getFirstError({})).toBeUndefined();
    });
  });

  describe('getFieldError', () => {
    it('should return first error for field', () => {
      const errors = { email: ['Required', 'Invalid'] };

      expect(getFieldError(errors, 'email')).toBe('Required');
    });

    it('should return undefined for field with no errors', () => {
      expect(getFieldError({}, 'email')).toBeUndefined();
    });
  });

  describe('getFieldErrors', () => {
    it('should return all errors for field', () => {
      const errors = { email: ['Required', 'Invalid'] };

      expect(getFieldErrors(errors, 'email')).toEqual(['Required', 'Invalid']);
    });

    it('should return empty array for field with no errors', () => {
      expect(getFieldErrors({}, 'email')).toEqual([]);
    });
  });

  describe('fieldHasError', () => {
    it('should return true for field with errors', () => {
      expect(fieldHasError({ email: ['Required'] }, 'email')).toBe(true);
    });

    it('should return false for field without errors', () => {
      expect(fieldHasError({}, 'email')).toBe(false);
    });
  });

  describe('clearFieldError', () => {
    it('should remove errors for specific field', () => {
      const errors = {
        email: ['Required'],
        password: ['Required'],
      };

      const cleared = clearFieldError(errors, 'email');

      expect(cleared.email).toBeUndefined();
      expect(cleared.password).toBeDefined();
    });
  });

  describe('clearAllErrors', () => {
    it('should return empty object', () => {
      expect(clearAllErrors()).toEqual({});
    });
  });

  describe('mergeErrors', () => {
    it('should merge multiple error objects', () => {
      const errors1 = { email: ['Required'] };
      const errors2 = { password: ['Too short'] };
      const errors3 = { email: ['Invalid format'] };

      const merged = mergeErrors(errors1, errors2, errors3);

      expect(merged.email).toEqual(['Required', 'Invalid format']);
      expect(merged.password).toEqual(['Too short']);
    });
  });

  // ============================================================================
  // Validation State
  // ============================================================================

  describe('createValidationState', () => {
    it('should create initial state', () => {
      const state = createValidationState();

      expect(state.errors).toEqual({});
      expect(state.isValid).toBe(true);
      expect(state.isValidating).toBe(false);
      expect(state.touched).toBeInstanceOf(Set);
      expect(state.dirty).toBeInstanceOf(Set);
    });
  });

  describe('updateValidationState', () => {
    it('should update state with new errors', () => {
      const state = createValidationState();
      const newErrors = { email: ['Required'] };

      const updated = updateValidationState(state, newErrors);

      expect(updated.errors).toEqual(newErrors);
      expect(updated.isValid).toBe(false);
    });
  });

  describe('touchField', () => {
    it('should mark field as touched', () => {
      const state = createValidationState();
      const updated = touchField(state, 'email');

      expect(updated.touched.has('email')).toBe(true);
    });
  });

  describe('dirtyField', () => {
    it('should mark field as dirty', () => {
      const state = createValidationState();
      const updated = dirtyField(state, 'email');

      expect(updated.dirty.has('email')).toBe(true);
    });
  });

  describe('shouldShowError', () => {
    it('should return false for untouched field', () => {
      const state = createValidationState();
      state.errors = { email: ['Required'] };

      expect(shouldShowErrorFn(state, 'email')).toBe(false);
    });

    it('should return true for touched field with error', () => {
      const state = createValidationState();
      state.errors = { email: ['Required'] };
      const touched = touchField(state, 'email');

      expect(shouldShowErrorFn(touched, 'email')).toBe(true);
    });

    it('should return true when form is submitted', () => {
      const state = createValidationState();
      state.errors = { email: ['Required'] };

      expect(shouldShowErrorFn(state, 'email', true)).toBe(true);
    });

    it('should return false for field without error', () => {
      const state = createValidationState();
      const touched = touchField(state, 'email');

      expect(shouldShowErrorFn(touched, 'email')).toBe(false);
    });
  });
});
