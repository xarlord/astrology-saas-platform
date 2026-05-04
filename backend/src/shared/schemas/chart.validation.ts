/**
 * Chart Input Validation Schemas
 * Zod schemas for validating chart-related requests
 */

import { z } from 'zod';

/**
 * Schema for creating a natal chart
 */
export const CreateNatalChartSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Chart name is required')
      .max(200, 'Chart name must not exceed 200 characters'),
    type: z.enum(['natal', 'solar-return', 'lunar-return']).optional(),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
    birth_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time format. Use HH:MM')
      .optional(),
    birth_time_unknown: z.boolean().optional(),
    birth_place_name: z.string().min(1, 'Place name is required'),
    birth_latitude: z.number().min(-90).max(90, 'Invalid latitude'),
    birth_longitude: z.number().min(-180).max(180, 'Invalid longitude'),
    birth_timezone: z.string().min(1, 'Timezone is required'),
    house_system: z.enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign']).optional(),
    zodiac: z.enum(['tropical', 'sidereal']).optional(),
    sidereal_mode: z.string().optional(),
  })
  .strict();

/**
 * Schema for updating chart metadata
 */
export const UpdateChartSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name must be at least 1 character')
      .max(200, 'Name must not exceed 200 characters')
      .optional(),
    house_system: z.enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign']).optional(),
    zodiac: z.enum(['tropical', 'sidereal']).optional(),
    sidereal_mode: z.string().optional(),
  })
  .strict();

/**
 * Schema for sharing a chart
 */
export const ShareChartSchema = z
  .object({
    chartId: z.string().uuid('Invalid chart ID'),
    password: z.string().min(8).optional(),
    expiresInDays: z.number().int().min(1).max(365).optional(),
  })
  .strict();

/**
 * Schema for accessing a shared chart
 */
export const AccessSharedChartSchema = z
  .object({
    shareToken: z.string().min(20, 'Invalid share token'),
    password: z.string().optional(),
  })
  .strict();

/**
 * Type exports
 */
export type CreateNatalChartInput = z.infer<typeof CreateNatalChartSchema>;
export type UpdateChartInput = z.infer<typeof UpdateChartSchema>;
export type ShareChartInput = z.infer<typeof ShareChartSchema>;
export type AccessSharedChartInput = z.infer<typeof AccessSharedChartSchema>;
