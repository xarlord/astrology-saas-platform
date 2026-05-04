/**
 * Authentication Input Validation Tests
 * TDD: RED phase - tests must fail before implementation
 */

import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ValidationError,
} from '../../shared/schemas/auth.validation';

describe('RegisterSchema', () => {
  it('should accept valid registration data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    };

    const result = RegisterSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should reject missing name', () => {
    const invalidData = {
      email: 'john@example.com',
      password: 'SecurePass123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('should reject name shorter than 2 characters', () => {
    const invalidData = {
      name: 'J',
      email: 'john@example.com',
      password: 'SecurePass123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 100 characters', () => {
    const invalidData = {
      name: 'A'.repeat(101),
      email: 'john@example.com',
      password: 'SecurePass123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'SecurePass123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('should reject password shorter than 12 characters', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Short1!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password without uppercase letter', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'lowercase123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase letter', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'UPPERCASE123!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password without number', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'NoNumbers!',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password without special character', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'NoSpecial123',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject extra fields beyond schema', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      extraField: 'should not be accepted',
    };

    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('should accept valid login data', () => {
    const validData = {
      email: 'john@example.com',
      password: 'anypassword123!',
    };

    const result = LoginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing email', () => {
    const invalidData = {
      password: 'anypassword123!',
    };

    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const invalidData = {
      email: 'john@example.com',
    };

    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'anypassword123!',
    };

    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject extra fields', () => {
    const invalidData = {
      email: 'john@example.com',
      password: 'anypassword123!',
      rememberMe: true,
    };

    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('ForgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const validData = {
      email: 'john@example.com',
    };

    const result = ForgotPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing email', () => {
    const invalidData = {};

    const result = ForgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
    };

    const result = ForgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject extra fields', () => {
    const invalidData = {
      email: 'john@example.com',
      redirectUrl: '/reset-password',
    };

    const result = ForgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('ResetPasswordSchema', () => {
  it('should accept valid reset data', () => {
    const validData = {
      token: 'a'.repeat(64),
      password: 'NewSecurePass123!',
    };

    const result = ResetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing token', () => {
    const invalidData = {
      password: 'NewSecurePass123!',
    };

    const result = ResetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const invalidData = {
      token: 'a'.repeat(64),
    };

    const result = ResetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject token shorter than 64 characters', () => {
    const invalidData = {
      token: 'short',
      password: 'NewSecurePass123!',
    };

    const result = ResetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject password that does not meet complexity requirements', () => {
    const invalidData = {
      token: 'a'.repeat(64),
      password: 'weak',
    };

    const result = ResetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject extra fields', () => {
    const invalidData = {
      token: 'a'.repeat(64),
      password: 'NewSecurePass123!',
      confirmPassword: 'NewSecurePass123!',
    };

    const result = ResetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('ValidationError', () => {
  it('should be an instance of Error', () => {
    const error = new ValidationError([{ field: 'email', message: 'Invalid email' }]);
    expect(error).toBeInstanceOf(Error);
  });

  it('should store validation errors', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }];
    const error = new ValidationError(errors);
    expect(error.errors).toEqual(errors);
  });

  it('should have correct name and status code', () => {
    const error = new ValidationError([{ field: 'email', message: 'Invalid email' }]);
    expect(error.name).toBe('ValidationError');
    expect(error.statusCode).toBe(400);
  });
});
