/**
 * Validation Utilities
 *
 * Core validation utilities including composeValidators, validateField,
 * validateForm, and async validation support.
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import type { Validator, AsyncValidator, ValidationResult } from './rules';

// ============================================================================
// Types
// ============================================================================

export type FormData = Record<string, unknown>;
export type FieldErrors = string[];
export type FormErrors = Record<string, FieldErrors>;

export interface ValidationOptions {
  /** Stop on first error per field */
  stopOnFirstError?: boolean;
  /** Validate all fields even if some fail */
  validateAllFields?: boolean;
  /** Custom error transformer */
  transformError?: (error: string, fieldName: string) => string;
}

export interface AsyncValidationOptions extends ValidationOptions {
  /** Timeout for async validation (ms) */
  timeout?: number;
}

export interface FieldValidationConfig {
  /** Sync validators */
  validators?: Validator[];
  /** Async validators */
  asyncValidators?: AsyncValidator[];
}

export interface FormValidationConfig {
  /** Field validation configs by field name */
  fields: Record<string, FieldValidationConfig>;
  /** Cross-field validators */
  crossFieldValidators?: CrossFieldValidator[];
  /** Global options */
  options?: ValidationOptions;
}

export interface CrossFieldValidator {
  /** Fields this validator depends on */
  fields: string[];
  /** Validation function */
  validate: (formData: FormData) => ValidationResult | Promise<ValidationResult>;
}

// ============================================================================
// Compose Validators
// ============================================================================

/**
 * Compose multiple validators into a single validator
 * Returns first error encountered, or undefined if all pass
 */
export function composeValidators<T = unknown>(...validators: Validator<T>[]): Validator<T> {
  return (value: T, formData?: FormData): ValidationResult => {
    for (const validator of validators) {
      const error = validator(value, formData);
      if (error) {
        return error;
      }
    }
    return undefined;
  };
}

/**
 * Compose validators and return all errors
 */
export function composeValidatorsAll<T = unknown>(...validators: Validator<T>[]): Validator<T>[] {
  return validators;
}

/**
 * Compose async validators into a single async validator
 */
export function composeAsyncValidators<T = unknown>(
  ...validators: AsyncValidator<T>[]
): AsyncValidator<T> {
  return async (value: T, formData?: FormData): Promise<ValidationResult> => {
    for (const validator of validators) {
      const error = await validator(value, formData);
      if (error) {
        return error;
      }
    }
    return undefined;
  };
}

/**
 * Create a validator that runs all validators and returns all errors
 */
export function allErrors<T = unknown>(
  ...validators: Validator<T>[]
): (value: T, formData?: FormData) => string[] {
  return (value: T, formData?: FormData): string[] => {
    const errors: string[] = [];
    for (const validator of validators) {
      const error = validator(value, formData);
      if (error) {
        errors.push(error);
      }
    }
    return errors;
  };
}

// ============================================================================
// Single Field Validation
// ============================================================================

/**
 * Validate a single field with multiple validators
 */
export function validateField(
  value: unknown,
  validators: Validator[],
  formData?: FormData,
  options: ValidationOptions = {},
): FieldErrors {
  const errors: string[] = [];
  const { stopOnFirstError = true, transformError } = options;

  for (const validator of validators) {
    const error = validator(value, formData);
    if (error) {
      const transformedError = transformError ? transformError(error, '') : error;
      errors.push(transformedError);
      if (stopOnFirstError) {
        break;
      }
    }
  }

  return errors;
}

/**
 * Validate a single field asynchronously
 */
export async function validateFieldAsync(
  value: unknown,
  validators: Validator[],
  asyncValidators: AsyncValidator[],
  formData?: FormData,
  options: AsyncValidationOptions = {},
): Promise<FieldErrors> {
  // First run sync validators
  const syncErrors = validateField(value, validators, formData, options);

  if (syncErrors.length > 0 && options.stopOnFirstError) {
    return syncErrors;
  }

  // Then run async validators
  const { timeout = 5000, transformError } = options;

  for (const validator of asyncValidators) {
    try {
      const error = await Promise.race([
        validator(value, formData),
        new Promise<undefined>((_, reject) =>
          setTimeout(() => reject(new Error('Validation timeout')), timeout),
        ),
      ]);

      if (error) {
        const transformedError = transformError ? transformError(error, '') : error;
        syncErrors.push(transformedError);
        if (options.stopOnFirstError) {
          break;
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Validation timeout') {
        syncErrors.push('Validation timed out');
      }
      // For other errors, log and continue
      console.error('Async validation error:', err);
    }
  }

  return syncErrors;
}

// ============================================================================
// Form Validation
// ============================================================================

/**
 * Validate an entire form
 */
export function validateForm(formData: FormData, config: FormValidationConfig): FormErrors {
  const errors: FormErrors = {};
  const { fields, options = {} } = config;

  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    const value = formData[fieldName];
    const fieldValidators = fieldConfig.validators || [];

    if (fieldValidators.length > 0) {
      const fieldErrors = validateField(value, fieldValidators, formData, {
        ...options,
        transformError: options.transformError
          ? (err) => options.transformError!(err, fieldName)
          : undefined,
      });

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    }
  }

  // Run cross-field validators
  if (config.crossFieldValidators) {
    for (const crossValidator of config.crossFieldValidators) {
      const error = crossValidator.validate(formData);
      if (typeof error === 'string') {
        // Add to the first field's errors
        const firstField = crossValidator.fields[0];
        if (!errors[firstField]) {
          errors[firstField] = [];
        }
        errors[firstField].push(error);
      }
    }
  }

  return errors;
}

/**
 * Validate an entire form asynchronously
 */
export async function validateFormAsync(
  formData: FormData,
  config: FormValidationConfig,
  options: AsyncValidationOptions = {},
): Promise<FormErrors> {
  const errors: FormErrors = {};
  const { fields, crossFieldValidators, options: configOptions = {} } = config;
  const mergedOptions = { ...configOptions, ...options };

  // Validate all fields in parallel
  const fieldNames = Object.keys(fields);
  const results = await Promise.all(
    fieldNames.map(async (fieldName) => {
      const fieldConfig = fields[fieldName];
      const value = formData[fieldName];

      const fieldErrors = await validateFieldAsync(
        value,
        fieldConfig.validators || [],
        fieldConfig.asyncValidators || [],
        formData,
        {
          ...mergedOptions,
          transformError: mergedOptions.transformError
            ? (err) => mergedOptions.transformError!(err, fieldName)
            : undefined,
        },
      );

      return { fieldName, errors: fieldErrors };
    }),
  );

  // Collect results
  for (const { fieldName, errors: fieldErrors } of results) {
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }

  // Run cross-field validators
  if (crossFieldValidators) {
    for (const crossValidator of crossFieldValidators) {
      const error = await crossValidator.validate(formData);
      if (error) {
        const firstField = crossValidator.fields[0];
        if (!errors[firstField]) {
          errors[firstField] = [];
        }
        errors[firstField].push(error);
      }
    }
  }

  return errors;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if form has any errors
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((fieldErrors) => fieldErrors.length > 0);
}

/**
 * Get total error count
 */
export function getErrorCount(errors: FormErrors): number {
  return Object.values(errors).reduce((count, fieldErrors) => count + fieldErrors.length, 0);
}

/**
 * Get first error from form
 */
export function getFirstError(errors: FormErrors): string | undefined {
  for (const fieldErrors of Object.values(errors)) {
    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }
  return undefined;
}

/**
 * Get first error for a specific field
 */
export function getFieldError(errors: FormErrors, fieldName: string): string | undefined {
  return errors[fieldName]?.[0];
}

/**
 * Get all errors for a specific field
 */
export function getFieldErrors(errors: FormErrors, fieldName: string): string[] {
  return errors[fieldName] || [];
}

/**
 * Check if a field has errors
 */
export function fieldHasError(errors: FormErrors, fieldName: string): boolean {
  return (errors[fieldName]?.length ?? 0) > 0;
}

/**
 * Clear errors for a specific field
 */
export function clearFieldError(errors: FormErrors, fieldName: string): FormErrors {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

/**
 * Clear all errors
 */
export function clearAllErrors(): FormErrors {
  return {};
}

/**
 * Merge errors from multiple validation runs
 */
export function mergeErrors(...errorObjects: FormErrors[]): FormErrors {
  const merged: FormErrors = {};

  for (const errors of errorObjects) {
    for (const [field, fieldErrors] of Object.entries(errors)) {
      if (!merged[field]) {
        merged[field] = [];
      }
      merged[field].push(...fieldErrors);
    }
  }

  return merged;
}

// ============================================================================
// Validation State Helpers
// ============================================================================

export interface ValidationState {
  errors: FormErrors;
  isValid: boolean;
  isValidating: boolean;
  touched: Set<string>;
  dirty: Set<string>;
}

/**
 * Create initial validation state
 */
export function createValidationState(): ValidationState {
  return {
    errors: {},
    isValid: true,
    isValidating: false,
    touched: new Set(),
    dirty: new Set(),
  };
}

/**
 * Update validation state with new errors
 */
export function updateValidationState(state: ValidationState, errors: FormErrors): ValidationState {
  return {
    ...state,
    errors,
    isValid: !hasErrors(errors),
  };
}

/**
 * Mark field as touched
 */
export function touchField(state: ValidationState, fieldName: string): ValidationState {
  const newTouched = new Set(state.touched);
  newTouched.add(fieldName);
  return { ...state, touched: newTouched };
}

/**
 * Mark field as dirty (modified)
 */
export function dirtyField(state: ValidationState, fieldName: string): ValidationState {
  const newDirty = new Set(state.dirty);
  newDirty.add(fieldName);
  return { ...state, dirty: newDirty };
}

/**
 * Check if field should show error (touched or submitted)
 */
export function shouldShowError(state: ValidationState, fieldName: string, submitted = false) {
  return (state.touched.has(fieldName) || submitted) && fieldHasError(state.errors, fieldName);
}

// ============================================================================
// Re-export from rules.ts
// ============================================================================

export * from './rules';
export * from './FormValidator';
export * from './birthData';
