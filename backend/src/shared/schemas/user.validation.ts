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
 * Type exports
 */
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
export type UpdateEmailPreferencesInput = z.infer<typeof UpdateEmailPreferencesSchema>;
