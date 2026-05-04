/**
 * useFormValidation Hook
 *
 * Comprehensive form validation hook with field-level and form-level validation,
 * debounced validation, validation on blur/change/submit, and error state management.
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type {
  Validator,
  AsyncValidator,
  FormData,
  FormErrors,
  FieldErrors,
  ValidationOptions,
} from '../utils/validation';
import {
  validateFieldAsync,
  validateFormAsync,
  hasErrors,
  getFieldError,
} from '../utils/validation';

// ============================================================================
// Types
// ============================================================================

export interface FieldConfig {
  /** Sync validators */
  validators?: Validator[];
  /** Async validators */
  asyncValidators?: AsyncValidator[];
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Debounce time for validation (ms) */
  debounce?: number;
  /** Initial value */
  initialValue?: unknown;
}

export interface FormValidationConfig {
  /** Field configurations */
  fields: Record<string, FieldConfig>;
  /** Validation options */
  options?: ValidationOptions;
  /** Validate on mount */
  validateOnMount?: boolean;
}

export interface UseFormValidationReturn {
  /** Current form values */
  values: FormData;
  /** Current errors */
  errors: FormErrors;
  /** Touched fields */
  touched: Set<string>;
  /** Dirty fields (modified) */
  dirty: Set<string>;
  /** Is form valid */
  isValid: boolean;
  /** Is currently validating */
  isValidating: boolean;
  /** Has been submitted */
  isSubmitted: boolean;
  /** Field-specific validating states */
  validatingFields: Set<string>;
  /** Set field value */
  setFieldValue: (name: string, value: unknown) => void;
  /** Set multiple field values */
  setValues: (values: Partial<FormData>) => void;
  /** Set field error manually */
  setFieldError: (name: string, error: string | string[]) => void;
  /** Set field touched */
  setFieldTouched: (name: string, touched?: boolean) => void;
  /** Handle change event */
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  /** Handle blur event */
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  /** Validate single field */
  validateField: (name: string) => Promise<FieldErrors>;
  /** Validate all fields */
  validateForm: () => Promise<FormErrors>;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Reset specific field */
  resetField: (name: string) => void;
  /** Get field error (for display) */
  getFieldError: (name: string) => string | undefined;
  /** Get all field errors */
  getFieldErrors: (name: string) => string[];
  /** Check if field has error */
  hasFieldError: (name: string) => boolean;
  /** Check if field should show error */
  shouldShowError: (name: string) => boolean;
  /** Submit handler wrapper */
  handleSubmit: <T>(
    onSubmit: (values: FormData) => T | Promise<T>,
  ) => (e?: React.FormEvent) => Promise<T | undefined>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for form validation
 */
export function useFormValidation(config: FormValidationConfig): UseFormValidationReturn {
  const { fields, options = {}, validateOnMount = false } = config;

  // Extract initial values from config
  const initialValues = useMemo(() => {
    const values: FormData = {};
    for (const [name, fieldConfig] of Object.entries(fields)) {
      values[name] = fieldConfig.initialValue ?? '';
    }
    return values;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // State
  const [values, setValuesState] = useState<FormData>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set());

  // Refs for debouncing
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Debounced values for each field
  const debouncedValues = useRef<Map<string, unknown>>(new Map());

  // --------------------------------------------------------------------------
  // Field Value Management
  // --------------------------------------------------------------------------

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setDirty((prev) => new Set(prev).add(name));

    // Store debounced value
    debouncedValues.current.set(name, value);
  }, []);

  const setValues = useCallback(
    (newValues: Partial<FormData>) => {
      setValuesState((prev) => ({ ...prev, ...newValues }));
      const newDirty = new Set(dirty);
      Object.keys(newValues).forEach((key) => newDirty.add(key));
      setDirty(newDirty);
    },
    [dirty],
  );

  // --------------------------------------------------------------------------
  // Field Error Management
  // --------------------------------------------------------------------------

  const setFieldError = useCallback((name: string, error: string | string[]) => {
    setErrors((prev) => ({
      ...prev,
      [name]: Array.isArray(error) ? error : [error],
    }));
  }, []);

  const getFieldErrorFn = useCallback(
    (name: string): string | undefined => {
      return getFieldError(errors, name);
    },
    [errors],
  );

  const getFieldErrors = useCallback(
    (name: string): string[] => {
      return errors[name] || [];
    },
    [errors],
  );

  const hasFieldError = useCallback(
    (name: string): boolean => {
      return (errors[name]?.length ?? 0) > 0;
    },
    [errors],
  );

  const shouldShowError = useCallback(
    (name: string): boolean => {
      return (touched.has(name) || isSubmitted) && hasFieldError(name);
    },
    [touched, isSubmitted, hasFieldError],
  );

  // --------------------------------------------------------------------------
  // Field Touch Management
  // --------------------------------------------------------------------------

  const setFieldTouched = useCallback((name: string, isTouched = true) => {
    setTouched((prev) => {
      const next = new Set(prev);
      if (isTouched) {
        next.add(name);
      } else {
        next.delete(name);
      }
      return next;
    });
  }, []);

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  const validateFieldByName = useCallback(
    async (name: string): Promise<FieldErrors> => {
      const fieldConfig = fields[name];
      if (!fieldConfig) return [];

      const value = values[name];
      const validators = fieldConfig.validators || [];
      const asyncValidators = fieldConfig.asyncValidators || [];

      // Mark field as validating
      setValidatingFields((prev) => new Set(prev).add(name));

      try {
        const fieldErrors = await validateFieldAsync(
          value,
          validators,
          asyncValidators,
          values,
          options,
        );

        // Update errors for this field
        setErrors((prev) => {
          const next = { ...prev };
          if (fieldErrors.length > 0) {
            next[name] = fieldErrors;
          } else {
            delete next[name];
          }
          return next;
        });

        return fieldErrors;
      } finally {
        // Remove from validating fields
        setValidatingFields((prev) => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
      }
    },
    [fields, values, options],
  );

  const validateAllFields = useCallback(async (): Promise<FormErrors> => {
    setIsValidating(true);

    try {
      const formErrors = await validateFormAsync(
        values,
        {
          fields: Object.fromEntries(
            Object.entries(fields).map(([name, config]) => [
              name,
              { validators: config.validators, asyncValidators: config.asyncValidators },
            ]),
          ),
          options,
        },
        { timeout: 5000 },
      );

      setErrors(formErrors);
      return formErrors;
    } finally {
      setIsValidating(false);
    }
  }, [values, fields, options]);

  // Debounced field validation
  const debouncedValidateField = useCallback(
    (name: string, debounceMs: number) => {
      // Clear existing timer
      const existingTimer = debounceTimers.current.get(name);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        void validateFieldByName(name);
        debounceTimers.current.delete(name);
      }, debounceMs);

      debounceTimers.current.set(name, timer);
    },
    [validateFieldByName],
  );

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      const fieldValue = type === 'checkbox' ? checked : value;

      setFieldValue(name, fieldValue);

      // Validate on change if configured
      const fieldConfig = fields[name];
      if (fieldConfig?.validateOnChange === true) {
        const debounceMs = fieldConfig.debounce ?? 300;
        debouncedValidateField(name, debounceMs);
      }
    },
    [fields, setFieldValue, debouncedValidateField],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;

      setFieldTouched(name, true);

      // Validate on blur if configured
      const fieldConfig = fields[name];
      if (fieldConfig?.validateOnBlur !== false) {
        void validateFieldByName(name);
      }
    },
    [fields, setFieldTouched, validateFieldByName],
  );

  // --------------------------------------------------------------------------
  // Reset
  // --------------------------------------------------------------------------

  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched(new Set());
    setDirty(new Set());
    setIsValidating(false);
    setIsSubmitted(false);
    setValidatingFields(new Set());

    // Clear debounce timers
    debounceTimers.current.forEach((timer) => clearTimeout(timer));
    debounceTimers.current.clear();
  }, [initialValues]);

  const resetField = useCallback(
    (name: string) => {
      setValuesState((prev) => {
        const next = { ...prev };
        next[name] = fields[name]?.initialValue ?? '';
        return next;
      });

      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });

      setTouched((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });

      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    },
    [fields],
  );

  // --------------------------------------------------------------------------
  // Submit Handler
  // --------------------------------------------------------------------------

  const handleSubmit = useCallback(
    <T>(onSubmit: (values: FormData) => T | Promise<T>) =>
      async (e?: React.FormEvent): Promise<T | undefined> => {
        e?.preventDefault();

        setIsSubmitted(true);

        // Validate all fields
        const formErrors = await validateAllFields();

        // If there are errors, don't submit
        if (hasErrors(formErrors)) {
          return undefined;
        }

        // Call submit handler
        return onSubmit(values);
      },
    [values, validateAllFields],
  );

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // Validate on mount if configured
  useEffect(() => {
    if (validateOnMount) {
      void validateAllFields();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // --------------------------------------------------------------------------
  // Computed Values
  // --------------------------------------------------------------------------

  const isValid = !hasErrors(errors);

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isValidating,
    isSubmitted,
    validatingFields,
    setFieldValue,
    setValues,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    validateField: validateFieldByName,
    validateForm: validateAllFields,
    resetForm,
    resetField,
    getFieldError: getFieldErrorFn,
    getFieldErrors,
    hasFieldError,
    shouldShowError,
    handleSubmit,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for validating a single field with debouncing
 */
export function useFieldValidation(
  name: string,
  value: unknown,
  validators: Validator[],
  options: {
    asyncValidators?: AsyncValidator[];
    debounce?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  } = {},
) {
  const {
    asyncValidators = [],
    debounce = 300,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [error, setError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [touched, setTouched] = useState(false);

  const debouncedValue = useDebounce(value, debounce);

  const validate = useCallback(async () => {
    setIsValidating(true);
    try {
      const errors = await validateFieldAsync(
        value,
        validators,
        asyncValidators,
        {},
        { stopOnFirstError: true },
      );
      setError(errors[0]);
      return errors;
    } finally {
      setIsValidating(false);
    }
  }, [value, validators, asyncValidators]);

  useEffect(() => {
    if (validateOnChange && touched) {
      void validate();
    }
  }, [debouncedValue, validateOnChange, touched, validate]);

  const onBlur = useCallback(() => {
    setTouched(true);
    if (validateOnBlur) {
      void validate();
    }
  }, [validateOnBlur, validate]);

  return {
    error: touched ? error : undefined,
    isValidating,
    touched,
    setTouched,
    validate,
    onBlur,
    hasError: touched && !!error,
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default useFormValidation;
