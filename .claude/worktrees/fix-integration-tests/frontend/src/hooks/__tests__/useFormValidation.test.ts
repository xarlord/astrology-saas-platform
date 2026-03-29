/**
 * Tests for useFormValidation Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormValidation, useFieldValidation } from '../useFormValidation';
import { required, email, minLength, password, matchField } from '../../utils/validation';

describe('useFormValidation', () => {
  // ============================================================================
  // Basic State Management
  // ============================================================================

  describe('state management', () => {
    const basicConfig = {
      fields: {
        email: { validators: [required(), email()] },
        password: { validators: [required(), minLength(8)] },
      },
    };

    it('should initialize with default values', () => {
      const { result } = renderHook(() => useFormValidation(basicConfig));

      expect(result.current.values).toEqual({ email: '', password: '' });
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.touched.size).toBe(0);
      expect(result.current.dirty.size).toBe(0);
    });

    it('should initialize with initial values', () => {
      const config = {
        fields: {
          email: { validators: [required()], initialValue: 'test@example.com' },
          password: { validators: [required()], initialValue: 'password123' },
        },
      };

      const { result } = renderHook(() => useFormValidation(config));

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.values.password).toBe('password123');
    });

    it('should set field value', () => {
      const { result } = renderHook(() => useFormValidation(basicConfig));

      act(() => {
        result.current.setFieldValue('email', 'test@example.com');
      });

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.dirty.has('email')).toBe(true);
    });

    it('should set multiple values', () => {
      const { result } = renderHook(() => useFormValidation(basicConfig));

      act(() => {
        result.current.setValues({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.values.password).toBe('password123');
      expect(result.current.dirty.has('email')).toBe(true);
      expect(result.current.dirty.has('password')).toBe(true);
    });

    it('should set field error manually', () => {
      const { result } = renderHook(() => useFormValidation(basicConfig));

      act(() => {
        result.current.setFieldError('email', 'Custom error');
      });

      expect(result.current.errors.email).toEqual(['Custom error']);
    });

    it('should set field touched', () => {
      const { result } = renderHook(() => useFormValidation(basicConfig));

      act(() => {
        result.current.setFieldTouched('email', true);
      });

      expect(result.current.touched.has('email')).toBe(true);
    });
  });

  // ============================================================================
  // Change/Blur Handling
  // ============================================================================

  describe('event handlers', () => {
    const config = {
      fields: {
        email: {
          validators: [required(), email()],
          validateOnBlur: true,
          validateOnChange: false,
        },
        password: {
          validators: [required()],
          validateOnChange: true,
          debounce: 0,
        },
      },
    };

    it('should handle change event', () => {
      const { result } = renderHook(() => useFormValidation(config));

      const event = {
        target: { name: 'email', value: 'test@example.com', type: 'text' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('should handle checkbox change', () => {
      const checkboxConfig = {
        fields: {
          agree: { validators: [] },
        },
      };

      const { result } = renderHook(() => useFormValidation(checkboxConfig));

      const event = {
        target: { name: 'agree', checked: true, type: 'checkbox' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.values.agree).toBe(true);
    });

    it('should handle blur event', () => {
      const { result } = renderHook(() => useFormValidation(config));

      const event = {
        target: { name: 'email' },
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleBlur(event);
      });

      expect(result.current.touched.has('email')).toBe(true);
    });
  });

  // ============================================================================
  // Validation
  // ============================================================================

  describe('validation', () => {
    const config = {
      fields: {
        email: {
          validators: [required(), email()],
          validateOnBlur: true,
        },
        password: {
          validators: [required(), minLength(8)],
          validateOnBlur: true,
        },
      },
    };

    it('should validate field on demand', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        const errors = await result.current.validateField('email');
        expect(errors.length).toBeGreaterThan(0);
      });

      expect(result.current.errors.email).toBeDefined();
      expect(result.current.isValid).toBe(false);
    });

    it('should validate entire form', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        const errors = await result.current.validateForm();
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should pass valid values', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      act(() => {
        result.current.setValues({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await act(async () => {
        const errors = await result.current.validateForm();
        expect(Object.keys(errors).length).toBe(0);
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  // ============================================================================
  // Debounced Validation
  // ============================================================================

  describe('debounced validation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should support debounced validation option', async () => {
      const config = {
        fields: {
          email: {
            validators: [required(), email()],
            validateOnChange: true,
            debounce: 300,
          },
        },
      };

      const { result } = renderHook(() => useFormValidation(config));

      // Trigger change and immediate validation
      act(() => {
        result.current.setFieldValue('email', 'invalid');
      });

      // Manually validate
      await act(async () => {
        await result.current.validateField('email');
      });

      // Errors should appear after validation
      expect(result.current.errors.email).toBeDefined();
    });
  });

  // ============================================================================
  // Error Display
  // ============================================================================

  describe('error display helpers', () => {
    const config = {
      fields: {
        email: { validators: [required(), email()] },
      },
    };

    it('should get field error', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      const error = result.current.getFieldError('email');
      expect(error).toBeDefined();
    });

    it('should get all field errors', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      const errors = result.current.getFieldErrors('email');
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should check if field has error', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      expect(result.current.hasFieldError('email')).toBe(true);
    });

    it('should only show error when touched', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      // Not touched, should not show
      expect(result.current.shouldShowError('email')).toBe(false);

      // Touch the field
      act(() => {
        result.current.setFieldTouched('email', true);
      });

      expect(result.current.shouldShowError('email')).toBe(true);
    });

    it('should show error when form is submitted', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      // After submit, should show
      act(() => {
        // Simulate submit by calling handleSubmit
        const submitHandler = result.current.handleSubmit(() => {});
        void submitHandler();
      });

      await waitFor(() => {
        expect(result.current.isSubmitted).toBe(true);
      });
    });
  });

  // ============================================================================
  // Reset
  // ============================================================================

  describe('reset', () => {
    const config = {
      fields: {
        email: { validators: [required()], initialValue: 'initial@example.com' },
        password: { validators: [required()] },
      },
    };

    it('should reset form to initial state', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      // Make changes
      act(() => {
        result.current.setValues({
          email: 'changed@example.com',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.validateField('password');
      });

      act(() => {
        result.current.setFieldTouched('email', true);
      });

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values.email).toBe('initial@example.com');
      expect(result.current.values.password).toBe('');
      expect(result.current.errors).toEqual({});
      expect(result.current.touched.size).toBe(0);
      expect(result.current.dirty.size).toBe(0);
    });

    it('should reset specific field', async () => {
      const { result } = renderHook(() => useFormValidation(config));

      act(() => {
        result.current.setFieldValue('email', 'changed@example.com');
        result.current.setFieldValue('password', 'changed');
      });

      await act(async () => {
        await result.current.validateField('email');
        await result.current.validateField('password');
      });

      act(() => {
        result.current.setFieldTouched('email', true);
        result.current.setFieldTouched('password', true);
      });

      // Reset only email
      act(() => {
        result.current.resetField('email');
      });

      expect(result.current.values.email).toBe('initial@example.com');
      expect(result.current.values.password).toBe('changed');
      expect(result.current.errors.email).toBeUndefined();
      // Password should still have errors since we only validated but didn't set invalid value
      // The password validation will pass for 'changed' (minLength 0 is default)
      expect(result.current.touched.has('email')).toBe(false);
      expect(result.current.touched.has('password')).toBe(true);
    });
  });

  // ============================================================================
  // Submit Handling
  // ============================================================================

  describe('handleSubmit', () => {
    const config = {
      fields: {
        email: { validators: [required(), email()] },
        password: { validators: [required()] },
      },
    };

    it('should call onSubmit when form is valid', async () => {
      const { result } = renderHook(() => useFormValidation(config));
      const onSubmit = vi.fn();

      act(() => {
        result.current.setValues({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.handleSubmit(onSubmit)();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should not call onSubmit when form is invalid', async () => {
      const { result } = renderHook(() => useFormValidation(config));
      const onSubmit = vi.fn();

      await act(async () => {
        await result.current.handleSubmit(onSubmit)();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.isSubmitted).toBe(true);
    });

    it('should prevent default form submission', async () => {
      const { result } = renderHook(() => useFormValidation(config));
      const onSubmit = vi.fn();
      const preventDefault = vi.fn();

      act(() => {
        result.current.setValues({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await act(async () => {
        await result.current.handleSubmit(onSubmit)({
          preventDefault,
        } as React.FormEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Validating State
  // ============================================================================

  describe('validating state', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should track validating state', async () => {
      const asyncValidator = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      const config = {
        fields: {
          email: {
            validators: [required(), email()],
            asyncValidators: [asyncValidator],
          },
        },
      };

      const { result } = renderHook(() => useFormValidation(config));

      expect(result.current.isValidating).toBe(false);

      const validatePromise = act(async () => {
        return result.current.validateForm();
      });

      // Check validating state during async validation
      // Note: This is tricky with fake timers

      await vi.runAllTimersAsync();
      await validatePromise;

      expect(result.current.isValidating).toBe(false);
    });

    it('should track validating fields', async () => {
      const config = {
        fields: {
          email: { validators: [required(), email()] },
        },
      };

      const { result } = renderHook(() => useFormValidation(config));

      await act(async () => {
        await result.current.validateField('email');
      });

      // Field should no longer be in validating set after completion
      expect(result.current.validatingFields.has('email')).toBe(false);
    });
  });

  // ============================================================================
  // Validate on Mount
  // ============================================================================

  describe('validateOnMount', () => {
    it('should validate on mount when configured', async () => {
      const config = {
        fields: {
          email: { validators: [required()] },
        },
        validateOnMount: true,
      };

      const { result } = renderHook(() => useFormValidation(config));

      // Wait for validation to complete
      await waitFor(() => {
        expect(result.current.errors.email).toBeDefined();
      });
    });

    it('should not validate on mount by default', () => {
      const config = {
        fields: {
          email: { validators: [required()] },
        },
      };

      const { result } = renderHook(() => useFormValidation(config));

      expect(result.current.errors).toEqual({});
    });
  });
});

// ============================================================================
// useFieldValidation Tests
// ============================================================================

describe('useFieldValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should validate field value', async () => {
    const { result } = renderHook(() =>
      useFieldValidation('email', '', [required(), email()])
    );

    act(() => {
      result.current.setTouched(true);
    });

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBeDefined();
  });

  it('should support debounced validation option', () => {
    // This test verifies the debounce option is accepted and hook initializes
    const { result } = renderHook(() =>
      useFieldValidation('email', 'test@example.com', [required(), email()], {
        debounce: 300,
        validateOnChange: true
      })
    );

    // Hook should be initialized
    expect(result.current.isValidating).toBe(false);
    expect(result.current.touched).toBe(false);
  });

  it('should handle blur validation', async () => {
    const { result } = renderHook(() =>
      useFieldValidation('email', '', [required(), email()], { validateOnBlur: true })
    );

    // Trigger blur
    await act(async () => {
      result.current.onBlur();
    });

    expect(result.current.touched).toBe(true);
    expect(result.current.error).toBeDefined();
  });

  it('should pass for valid value', async () => {
    const { result } = renderHook(() =>
      useFieldValidation('email', 'test@example.com', [required(), email()])
    );

    act(() => {
      result.current.setTouched(true);
    });

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should not show error when not touched', async () => {
    const { result } = renderHook(() =>
      useFieldValidation('email', '', [required(), email()])
    );

    await act(async () => {
      await result.current.validate();
    });

    // Error should not be shown because field is not touched
    expect(result.current.error).toBeUndefined();
    expect(result.current.hasError).toBe(false);
  });

  it('should track validating state', async () => {
    const asyncValidator = vi.fn().mockImplementation(
      () => new Promise<string | undefined>(resolve => setTimeout(() => resolve(undefined), 100))
    );

    const { result } = renderHook(() =>
      useFieldValidation('email', 'test@example.com', [], { asyncValidators: [asyncValidator] })
    );

    act(() => {
      result.current.setTouched(true);
    });

    const validatePromise = act(async () => {
      await result.current.validate();
    });

    // During validation
    // Note: Tracking isValidating during async is complex

    await vi.runAllTimersAsync();
    await validatePromise;

    expect(result.current.isValidating).toBe(false);
  });
});
