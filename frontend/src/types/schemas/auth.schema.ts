/**
 * Auth Schemas
 * Zod validation schemas for authentication API requests and responses
 *
 * @module types/schemas/auth.schema
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

/**
 * Password validation schema - strong password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Simple password schema for login (no complexity requirements)
 */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(128, 'Password must be less than 128 characters');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[\p{L}\s'-]+$/u, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * User ID schema (UUID format)
 */
export const userIdSchema = z.string().uuid('Invalid user ID format');

/**
 * JWT token schema
 */
export const tokenSchema = z.string().min(1, 'Token is required');

// ============================================================================
// USER SCHEMA
// ============================================================================

/**
 * User notification preferences schema
 */
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  dailyDigest: z.boolean().default(false),
  transitAlerts: z.boolean().default(true),
  lunarReturns: z.boolean().default(true),
  solarReturns: z.boolean().default(true),
});

/**
 * User settings schema
 */
export const userSettingsSchema = z.object({
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  dateFormat: z.string().default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  notifications: notificationPreferencesSchema,
});

/**
 * User preferences schema for astrology settings
 */
export const userPreferencesSchema = z.object({
  defaultChartType: z.enum(['natal', 'draconic', 'harmonic']).default('natal'),
  defaultOrb: z.number().min(1).max(15).default(8),
  defaultHouseSystem: z
    .enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign'])
    .default('placidus'),
  showAspects: z.boolean().default(true),
  showMidpoints: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

/**
 * Subscription tier schema
 */
export const subscriptionTierSchema = z.enum(['free', 'pro', 'lifetime']);

/**
 * User role schema
 */
export const userRoleSchema = z.enum(['user', 'admin']);

/**
 * Full user schema
 */
export const userSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  fullName: z.string().optional(),
  avatar: z.string().url().nullable().optional(),
  role: userRoleSchema.default('user'),
  subscriptionTier: subscriptionTierSchema.default('free'),
  subscriptionExpiresAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  settings: userSettingsSchema.optional(),
  preferences: userPreferencesSchema.optional(),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Login request schema
 */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/**
 * Registration request schema
 */
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  birthDate: z.string().datetime().optional(),
  birthTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  birthPlace: z.string().max(200).optional(),
});

/**
 * Refresh token request schema
 */
export const refreshTokenRequestSchema = z.object({
  refreshToken: tokenSchema,
});

/**
 * Forgot password request schema
 */
export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password request schema
 */
export const resetPasswordRequestSchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
});

/**
 * Change password request schema
 */
export const changePasswordRequestSchema = z.object({
  currentPassword: loginPasswordSchema,
  newPassword: passwordSchema,
});

/**
 * Update user request schema
 */
export const updateUserRequestSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  avatar: z.string().url().optional(),
  settings: userSettingsSchema.partial().optional(),
  preferences: userPreferencesSchema.partial().optional(),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Auth response schema (login/register)
 */
export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: tokenSchema,
  refreshToken: tokenSchema,
  expiresIn: z.number().positive(),
});

/**
 * Refresh token response schema
 */
export const refreshTokenResponseSchema = z.object({
  accessToken: tokenSchema,
  expiresIn: z.number().positive(),
});

/**
 * Logout response schema
 */
export const logoutResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Name = z.infer<typeof nameSchema>;
export type UserId = z.infer<typeof userIdSchema>;

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
