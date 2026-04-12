/**
 * FormValidator Class
 *
 * Schema-based validation with custom rule registration, conditional validation,
 * and cross-field validation support.
 */

import type { Validator, AsyncValidator, ValidationResult } from './rules';

// ============================================================================
// Types
// ============================================================================

export type FieldValue = unknown;
export type FormData = Record<string, FieldValue>;

export interface FieldSchema {
  /** Field name */
  name: string;
  /** Array of validators to apply */
  validators: Validator[];
  /** Array of async validators */
  asyncValidators?: AsyncValidator[];
  /** Whether field is required */
  required?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on change */
  validateOnChange?: boolean;
  /** Debounce time for validation (ms) */
  debounce?: number;
  /** Conditional validation - only validate if function returns true */
  when?: (formData: FormData) => boolean;
  /** Dependencies - re-validate when these fields change */
  dependencies?: string[];
}

export interface FormSchema {
  /** Form field schemas */
  fields: FieldSchema[];
  /** Cross-field validators */
  crossFieldValidators?: CrossFieldValidator[];
  /** Global validation options */
  options?: FormValidatorOptions;
}

export interface FormValidatorOptions {
  /** Validate all fields on form submission */
  validateOnSubmit?: boolean;
  /** Stop on first error per field */
  stopOnFirstError?: boolean;
  /** Custom error message formatter */
  formatError?: (error: string, fieldName: string) => string;
}

export interface CrossFieldValidator {
  /** Fields involved in validation */
  fields: string[];
  /** Validation function */
  validate: (formData: FormData) => ValidationResult | Promise<ValidationResult>;
  /** Error message key */
  messageKey?: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  fields: Record<string, FieldValidationResult>;
  globalErrors: string[];
  firstErrorField?: string;
}

export type RuleFactory = (...args: unknown[]) => Validator;

// ============================================================================
// FormValidator Class
// ============================================================================

export class FormValidator {
  private schema: FormSchema;
  private customRules = new Map<string, RuleFactory>();
  private cachedResults = new Map<string, FieldValidationResult>();

  constructor(schema: FormSchema) {
    this.schema = schema;
    this.registerBuiltInRules();
  }

  // --------------------------------------------------------------------------
  // Rule Registration
  // --------------------------------------------------------------------------

  /**
   * Register a custom validation rule
   */
  registerRule(name: string, factory: RuleFactory): void {
    this.customRules.set(name, factory);
  }

  /**
   * Register multiple custom validation rules
   */
  registerRules(rules: Record<string, RuleFactory>): void {
    Object.entries(rules).forEach(([name, factory]) => {
      this.registerRule(name, factory);
    });
  }

  /**
   * Get a registered rule factory
   */
  getRule(name: string): RuleFactory | undefined {
    return this.customRules.get(name);
  }

  /**
   * Check if a rule is registered
   */
  hasRule(name: string): boolean {
    return this.customRules.has(name);
  }

  /**
   * Register built-in rules (placeholders for rules from rules.ts)
   */
  private registerBuiltInRules(): void {
    // These are placeholders - actual validators should be imported from rules.ts
    // This allows dynamic rule registration from config
    this.customRules.set(
      'required',
      () => (value: unknown) =>
        value === null || value === undefined || value === '' ? 'Required' : undefined,
    );
  }

  // --------------------------------------------------------------------------
  // Field Validation
  // --------------------------------------------------------------------------

  /**
   * Validate a single field
   */
  validateField(
    fieldName: string,
    value: FieldValue,
    formData: FormData = {},
  ): FieldValidationResult {
    const fieldSchema = this.schema.fields.find((f) => f.name === fieldName);

    if (!fieldSchema) {
      return { isValid: true, errors: [] };
    }

    // Check conditional validation
    if (fieldSchema.when && !fieldSchema.when(formData)) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];
    const stopOnFirstError = this.schema.options?.stopOnFirstError ?? false;

    // Run sync validators
    for (const validator of fieldSchema.validators) {
      const result = validator(value, formData);
      if (result) {
        errors.push(this.formatError(result, fieldName));
        if (stopOnFirstError) break;
      }
    }

    const result: FieldValidationResult = {
      isValid: errors.length === 0,
      errors,
    };

    // Cache the result
    this.cachedResults.set(fieldName, result);

    return result;
  }

  /**
   * Validate a single field asynchronously
   */
  async validateFieldAsync(
    fieldName: string,
    value: FieldValue,
    formData: FormData = {},
  ): Promise<FieldValidationResult> {
    // First run sync validation
    const syncResult = this.validateField(fieldName, value, formData);

    if (!syncResult.isValid) {
      return syncResult;
    }

    const fieldSchema = this.schema.fields.find((f) => f.name === fieldName);

    if (!fieldSchema?.asyncValidators?.length) {
      return syncResult;
    }

    // Check conditional validation
    if (fieldSchema.when && !fieldSchema.when(formData)) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];
    const stopOnFirstError = this.schema.options?.stopOnFirstError ?? false;

    // Run async validators
    for (const validator of fieldSchema.asyncValidators) {
      const result = await validator(value, formData);
      if (result) {
        errors.push(this.formatError(result, fieldName));
        if (stopOnFirstError) break;
      }
    }

    const result: FieldValidationResult = {
      isValid: errors.length === 0,
      errors: [...syncResult.errors, ...errors],
    };

    // Cache the result
    this.cachedResults.set(fieldName, result);

    return result;
  }

  // --------------------------------------------------------------------------
  // Form Validation
  // --------------------------------------------------------------------------

  /**
   * Validate all fields in the form
   */
  validateForm(formData: FormData): FormValidationResult {
    const fields: Record<string, FieldValidationResult> = {};
    let isValid = true;
    let firstErrorField: string | undefined;

    for (const fieldSchema of this.schema.fields) {
      const value = formData[fieldSchema.name];
      const result = this.validateField(fieldSchema.name, value, formData);
      fields[fieldSchema.name] = result;

      if (!result.isValid) {
        isValid = false;
        if (!firstErrorField) {
          firstErrorField = fieldSchema.name;
        }
      }
    }

    // Run cross-field validators
    const globalErrors = this.runCrossFieldValidators(formData);
    if (globalErrors.length > 0) {
      isValid = false;
    }

    return {
      isValid,
      fields,
      globalErrors,
      firstErrorField,
    };
  }

  /**
   * Validate all fields asynchronously
   */
  async validateFormAsync(formData: FormData): Promise<FormValidationResult> {
    const fields: Record<string, FieldValidationResult> = {};
    let isValid = true;
    let firstErrorField: string | undefined;

    // Validate all fields in parallel
    const fieldNames = this.schema.fields.map((f) => f.name);
    const results = await Promise.all(
      this.schema.fields.map((fieldSchema) =>
        this.validateFieldAsync(fieldSchema.name, formData[fieldSchema.name], formData),
      ),
    );

    results.forEach((result, index) => {
      const fieldName = fieldNames[index];
      fields[fieldName] = result;

      if (!result.isValid) {
        isValid = false;
        if (!firstErrorField) {
          firstErrorField = fieldName;
        }
      }
    });

    // Run cross-field validators asynchronously
    const globalErrors = await this.runCrossFieldValidatorsAsync(formData);
    if (globalErrors.length > 0) {
      isValid = false;
    }

    return {
      isValid,
      fields,
      globalErrors,
      firstErrorField,
    };
  }

  // --------------------------------------------------------------------------
  // Cross-Field Validation
  // --------------------------------------------------------------------------

  /**
   * Run cross-field validators
   */
  private runCrossFieldValidators(formData: FormData): string[] {
    const errors: string[] = [];

    if (!this.schema.crossFieldValidators) {
      return errors;
    }

    for (const validator of this.schema.crossFieldValidators) {
      // Check if all required fields have values
      const hasAllFields = validator.fields.every(
        (field) => formData[field] !== undefined && formData[field] !== '',
      );

      if (!hasAllFields) continue;

      const result = validator.validate(formData);
      if (typeof result === 'string') {
        errors.push(this.formatError(result, validator.fields.join('-')));
      }
    }

    return errors;
  }

  /**
   * Run cross-field validators asynchronously
   */
  private async runCrossFieldValidatorsAsync(formData: FormData): Promise<string[]> {
    const errors: string[] = [];

    if (!this.schema.crossFieldValidators) {
      return errors;
    }

    for (const validator of this.schema.crossFieldValidators) {
      // Check if all required fields have values
      const hasAllFields = validator.fields.every(
        (field) => formData[field] !== undefined && formData[field] !== '',
      );

      if (!hasAllFields) continue;

      const result = await validator.validate(formData);
      if (result) {
        errors.push(this.formatError(result, validator.fields.join('-')));
      }
    }

    return errors;
  }

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  /**
   * Format error message
   */
  private formatError(error: string, fieldName: string): string {
    if (this.schema.options?.formatError) {
      return this.schema.options.formatError(error, fieldName);
    }
    return error;
  }

  /**
   * Get cached result for a field
   */
  getCachedResult(fieldName: string): FieldValidationResult | undefined {
    return this.cachedResults.get(fieldName);
  }

  /**
   * Clear cached results
   */
  clearCache(): void {
    this.cachedResults.clear();
  }

  /**
   * Clear cached result for a specific field
   */
  clearFieldCache(fieldName: string): void {
    this.cachedResults.delete(fieldName);
  }

  /**
   * Get field schema by name
   */
  getFieldSchema(fieldName: string): FieldSchema | undefined {
    return this.schema.fields.find((f) => f.name === fieldName);
  }

  /**
   * Get all field names
   */
  getFieldNames(): string[] {
    return this.schema.fields.map((f) => f.name);
  }

  /**
   * Check if field should validate on blur
   */
  shouldValidateOnBlur(fieldName: string): boolean {
    const fieldSchema = this.getFieldSchema(fieldName);
    return fieldSchema?.validateOnBlur ?? true;
  }

  /**
   * Check if field should validate on change
   */
  shouldValidateOnChange(fieldName: string): boolean {
    const fieldSchema = this.getFieldSchema(fieldName);
    return fieldSchema?.validateOnChange ?? false;
  }

  /**
   * Get debounce time for field
   */
  getDebounceTime(fieldName: string): number {
    const fieldSchema = this.getFieldSchema(fieldName);
    return fieldSchema?.debounce ?? 300;
  }

  /**
   * Get dependencies for a field
   */
  getDependencies(fieldName: string): string[] {
    const fieldSchema = this.getFieldSchema(fieldName);
    return fieldSchema?.dependencies ?? [];
  }

  /**
   * Update schema at runtime
   */
  updateSchema(newSchema: Partial<FormSchema>): void {
    this.schema = {
      ...this.schema,
      ...newSchema,
    };
    this.clearCache();
  }
}

// ============================================================================
// Schema Builder
// ============================================================================

/**
 * Builder for creating form schemas
 */
export class FormSchemaBuilder {
  private fields: FieldSchema[] = [];
  private crossFieldValidators: CrossFieldValidator[] = [];
  private options: FormValidatorOptions = {};

  /**
   * Add a field to the schema
   */
  addField(field: FieldSchema): this {
    this.fields.push(field);
    return this;
  }

  /**
   * Add multiple fields to the schema
   */
  addFields(fields: FieldSchema[]): this {
    this.fields.push(...fields);
    return this;
  }

  /**
   * Add a cross-field validator
   */
  addCrossFieldValidator(validator: CrossFieldValidator): this {
    this.crossFieldValidators.push(validator);
    return this;
  }

  /**
   * Set validation options
   */
  setOptions(options: FormValidatorOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Build the schema
   */
  build(): FormSchema {
    return {
      fields: this.fields,
      crossFieldValidators: this.crossFieldValidators,
      options: this.options,
    };
  }

  /**
   * Build and create a FormValidator instance
   */
  buildValidator(): FormValidator {
    return new FormValidator(this.build());
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new form schema builder
 */
export function createFormSchema(): FormSchemaBuilder {
  return new FormSchemaBuilder();
}

/**
 * Create a form validator from a schema
 */
export function createFormValidator(schema: FormSchema): FormValidator {
  return new FormValidator(schema);
}
