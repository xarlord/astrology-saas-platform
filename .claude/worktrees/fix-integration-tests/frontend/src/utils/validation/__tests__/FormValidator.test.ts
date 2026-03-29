/**
 * Tests for FormValidator Class
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FormValidator,
  FormSchemaBuilder,
  createFormSchema,
  createFormValidator,
} from '../FormValidator';
import { required, email, minLength, password, matchField } from '../rules';

describe('FormValidator', () => {
  // ============================================================================
  // Basic Schema Validation
  // ============================================================================

  describe('validateField', () => {
    it('should validate a single field', () => {
      const schema = {
        fields: [
          {
            name: 'email',
            validators: [required(), email()],
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateField('email', '');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass valid field', () => {
      const schema = {
        fields: [
          {
            name: 'email',
            validators: [required(), email()],
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateField('email', 'test@example.com');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors when stopOnFirstError is false', () => {
      const schema = {
        fields: [
          {
            name: 'password',
            validators: [minLength(8), password()],
          },
        ],
        options: {
          stopOnFirstError: false,
        },
      };

      const validator = new FormValidator(schema);
      const result = validator.validateField('password', 'a');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should return first error when stopOnFirstError is true', () => {
      const schema = {
        fields: [
          {
            name: 'password',
            validators: [minLength(8), password()],
          },
        ],
        options: {
          stopOnFirstError: true,
        },
      };

      const validator = new FormValidator(schema);
      const result = validator.validateField('password', 'a');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ============================================================================
  // Form Validation
  // ============================================================================

  describe('validateForm', () => {
    it('should validate all fields in the form', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [required(), email()] },
          { name: 'password', validators: [required()] },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateForm({
        email: '',
        password: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.fields.email.isValid).toBe(false);
      expect(result.fields.password.isValid).toBe(false);
    });

    it('should pass valid form', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [required(), email()] },
          { name: 'password', validators: [required()] },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateForm({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(true);
    });

    it('should identify first error field', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [required()] },
          { name: 'password', validators: [required()] },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateForm({
        email: '',
        password: '',
      });

      expect(result.firstErrorField).toBe('email');
    });
  });

  // ============================================================================
  // Conditional Validation
  // ============================================================================

  describe('conditional validation', () => {
    it('should skip validation when condition is false', () => {
      const schema = {
        fields: [
          {
            name: 'email',
            validators: [required(), email()],
          },
          {
            name: 'confirmEmail',
            validators: [required()],
            when: (formData: Record<string, unknown>) => formData.email !== '',
          },
        ],
      };

      const validator = new FormValidator(schema);

      // confirmEmail should be skipped because email is empty
      const result = validator.validateForm({
        email: '',
        confirmEmail: '',
      });

      expect(result.fields.email.isValid).toBe(false);
      expect(result.fields.confirmEmail.isValid).toBe(true); // Skipped
    });

    it('should validate when condition is true', () => {
      const schema = {
        fields: [
          {
            name: 'email',
            validators: [required(), email()],
          },
          {
            name: 'confirmEmail',
            validators: [required()],
            when: (formData: Record<string, unknown>) => formData.email !== '',
          },
        ],
      };

      const validator = new FormValidator(schema);

      const result = validator.validateForm({
        email: 'test@example.com',
        confirmEmail: '',
      });

      expect(result.fields.email.isValid).toBe(true);
      expect(result.fields.confirmEmail.isValid).toBe(false);
    });
  });

  // ============================================================================
  // Cross-Field Validation
  // ============================================================================

  describe('cross-field validation', () => {
    it('should run cross-field validators', () => {
      const schema = {
        fields: [
          { name: 'password', validators: [required()] },
          { name: 'confirmPassword', validators: [required()] },
        ],
        crossFieldValidators: [
          {
            fields: ['password', 'confirmPassword'],
            validate: (formData: Record<string, unknown>) => {
              if (formData.password !== formData.confirmPassword) {
                return 'Passwords do not match';
              }
              return undefined;
            },
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateForm({
        password: 'Password1!',
        confirmPassword: 'Different1!',
      });

      expect(result.globalErrors).toContain('Passwords do not match');
    });

    it('should pass when cross-field validation passes', () => {
      const schema = {
        fields: [
          { name: 'password', validators: [required()] },
          { name: 'confirmPassword', validators: [required()] },
        ],
        crossFieldValidators: [
          {
            fields: ['password', 'confirmPassword'],
            validate: (formData: Record<string, unknown>) => {
              if (formData.password !== formData.confirmPassword) {
                return 'Passwords do not match';
              }
              return undefined;
            },
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = validator.validateForm({
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });

      expect(result.globalErrors).toHaveLength(0);
    });
  });

  // ============================================================================
  // Async Validation
  // ============================================================================

  describe('validateFieldAsync', () => {
    it('should run async validators', async () => {
      const asyncValidator = vi.fn().mockResolvedValue('Async error');

      const schema = {
        fields: [
          {
            name: 'username',
            validators: [required()],
            asyncValidators: [asyncValidator],
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = await validator.validateFieldAsync('username', 'test');

      expect(asyncValidator).toHaveBeenCalled();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Async error');
    });

    it('should pass when async validator returns undefined', async () => {
      const asyncValidator = vi.fn().mockResolvedValue(undefined);

      const schema = {
        fields: [
          {
            name: 'username',
            validators: [],
            asyncValidators: [asyncValidator],
          },
        ],
      };

      const validator = new FormValidator(schema);
      const result = await validator.validateFieldAsync('username', 'valid');

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateFormAsync', () => {
    it('should validate all fields asynchronously', async () => {
      const schema = {
        fields: [
          { name: 'email', validators: [required(), email()] },
          { name: 'password', validators: [required()] },
        ],
      };

      const validator = new FormValidator(schema);
      const result = await validator.validateFormAsync({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // Custom Rule Registration
  // ============================================================================

  describe('custom rules', () => {
    it('should register custom rule', () => {
      const schema = { fields: [] };
      const validator = new FormValidator(schema);

      const customRule = (message: string) => (value: string) =>
        value === 'valid' ? undefined : message;

      validator.registerRule('customRule', customRule);

      expect(validator.hasRule('customRule')).toBe(true);
      expect(validator.getRule('customRule')).toBe(customRule);
    });

    it('should register multiple rules', () => {
      const schema = { fields: [] };
      const validator = new FormValidator(schema);

      validator.registerRules({
        rule1: () => () => undefined,
        rule2: () => () => undefined,
      });

      expect(validator.hasRule('rule1')).toBe(true);
      expect(validator.hasRule('rule2')).toBe(true);
    });
  });

  // ============================================================================
  // Utility Methods
  // ============================================================================

  describe('utility methods', () => {
    it('should get field schema', () => {
      const schema = {
        fields: [{ name: 'email', validators: [required()] }],
      };

      const validator = new FormValidator(schema);
      const fieldSchema = validator.getFieldSchema('email');

      expect(fieldSchema?.name).toBe('email');
    });

    it('should get all field names', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [] },
          { name: 'password', validators: [] },
        ],
      };

      const validator = new FormValidator(schema);
      const fieldNames = validator.getFieldNames();

      expect(fieldNames).toEqual(['email', 'password']);
    });

    it('should check validate on blur setting', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [], validateOnBlur: true },
          { name: 'password', validators: [], validateOnBlur: false },
        ],
      };

      const validator = new FormValidator(schema);

      expect(validator.shouldValidateOnBlur('email')).toBe(true);
      expect(validator.shouldValidateOnBlur('password')).toBe(false);
      // Default should be true
      expect(validator.shouldValidateOnBlur('nonexistent')).toBe(true);
    });

    it('should get debounce time', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [], debounce: 500 },
        ],
      };

      const validator = new FormValidator(schema);

      expect(validator.getDebounceTime('email')).toBe(500);
      expect(validator.getDebounceTime('nonexistent')).toBe(300); // Default
    });
  });

  // ============================================================================
  // Caching
  // ============================================================================

  describe('caching', () => {
    it('should cache validation results', () => {
      const schema = {
        fields: [{ name: 'email', validators: [required()] }],
      };

      const validator = new FormValidator(schema);
      validator.validateField('email', '');

      const cached = validator.getCachedResult('email');
      expect(cached).toBeDefined();
      expect(cached?.isValid).toBe(false);
    });

    it('should clear cache', () => {
      const schema = {
        fields: [{ name: 'email', validators: [required()] }],
      };

      const validator = new FormValidator(schema);
      validator.validateField('email', '');
      validator.clearCache();

      expect(validator.getCachedResult('email')).toBeUndefined();
    });

    it('should clear field cache', () => {
      const schema = {
        fields: [
          { name: 'email', validators: [required()] },
          { name: 'password', validators: [required()] },
        ],
      };

      const validator = new FormValidator(schema);
      validator.validateField('email', '');
      validator.validateField('password', '');
      validator.clearFieldCache('email');

      expect(validator.getCachedResult('email')).toBeUndefined();
      expect(validator.getCachedResult('password')).toBeDefined();
    });
  });
});

// ============================================================================
// FormSchemaBuilder Tests
// ============================================================================

describe('FormSchemaBuilder', () => {
  it('should build schema with fields', () => {
    const schema = createFormSchema()
      .addField({
        name: 'email',
        validators: [required(), email()],
      })
      .build();

    expect(schema.fields).toHaveLength(1);
    expect(schema.fields[0].name).toBe('email');
  });

  it('should add multiple fields', () => {
    const schema = createFormSchema()
      .addFields([
        { name: 'email', validators: [required()] },
        { name: 'password', validators: [required()] },
      ])
      .build();

    expect(schema.fields).toHaveLength(2);
  });

  it('should add cross-field validators', () => {
    const schema = createFormSchema()
      .addField({ name: 'password', validators: [] })
      .addField({ name: 'confirmPassword', validators: [] })
      .addCrossFieldValidator({
        fields: ['password', 'confirmPassword'],
        validate: (formData) =>
          formData.password !== formData.confirmPassword
            ? 'Passwords must match'
            : undefined,
      })
      .build();

    expect(schema.crossFieldValidators).toHaveLength(1);
  });

  it('should set options', () => {
    const schema = createFormSchema()
      .addField({ name: 'email', validators: [] })
      .setOptions({ stopOnFirstError: false })
      .build();

    expect(schema.options?.stopOnFirstError).toBe(false);
  });

  it('should build validator instance', () => {
    const validator = createFormSchema()
      .addField({ name: 'email', validators: [required()] })
      .buildValidator();

    expect(validator).toBeInstanceOf(FormValidator);
  });
});

// ============================================================================
// Factory Functions Tests
// ============================================================================

describe('factory functions', () => {
  it('should create validator from schema', () => {
    const schema = {
      fields: [{ name: 'email', validators: [required()] }],
    };

    const validator = createFormValidator(schema);
    expect(validator).toBeInstanceOf(FormValidator);
  });
});
