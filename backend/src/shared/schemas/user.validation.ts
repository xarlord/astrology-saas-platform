/**
 * User Input Validation Schemas
 * Zod schemas for validating user-related requests
 */

import { z } from 'zod';

/**
 * Schema for updating user profile
 */
export const UpdateUserProfileSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional(),
    timezone: z.string().optional(),
  })
  .strict();

/**
 * Schema for updating user preferences
 */
export const UpdateUserPreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().length(2).optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        dailyBriefing: z.boolean().optional(),
      })
      .optional(),
    chartDefaults: z
      .object({
        houseSystem: z.enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign']).optional(),
        zodiac: z.enum(['tropical', 'sidereal']).optional(),
      })
      .optional(),
  })
  .strict();

/**
 * Schema for updating email notification preferences
 */
export const UpdateEmailPreferencesSchema = z
  .object({
    marketing: z.boolean().optional(),
    transactional: z.boolean().optional(),
  })
  .strict();

/**
 * Schema for changing password (#240)
 */
export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]/, 'Must contain at least one special character'),
  })
  .strict();

/**
 * Type exports
 */
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
export type UpdateEmailPreferencesInput = z.infer<typeof UpdateEmailPreferencesSchema>;
