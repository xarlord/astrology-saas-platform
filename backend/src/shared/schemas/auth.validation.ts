/**
 * Authentication Input Validation Schemas
 * Zod schemas for validating authentication-related requests
 */

import { z } from 'zod';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

/**
 * Password complexity regex:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

/**
 * Schema for user registration
 */
export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .regex(
        passwordRegex,
        'Password must be at least 12 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      ),
  })
  .strict();

/**
 * Schema for user login
 */
export const LoginSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

/**
 * Schema for forgot password request
 */
export const ForgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email format'),
  })
  .strict();

/**
 * Schema for password reset
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().length(64, 'Invalid reset token'),
    password: z
      .string()
      .regex(
        passwordRegex,
        'Password must be at least 12 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      ),
  })
  .strict();

/**
 * Type exports for inferred TypeScript types
 */
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
