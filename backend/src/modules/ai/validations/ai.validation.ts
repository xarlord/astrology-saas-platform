/**
 * AI Validation Schemas
 * Zod schemas for validating AI interpretation request bodies
 */

import { z } from 'zod';

/**
 * Schema for planet position data
 */
const PlanetPositionSchema = z.object({
  name: z.string().min(1).max(50),
  longitude: z.number().min(-360).max(360),
  latitude: z.number().min(-90).max(90).optional(),
  speed: z.number().optional(),
  house: z.number().int().min(1).max(12).optional(),
  sign: z.string().max(30).optional(),
  degree: z.number().min(0).max(30).optional(),
  isRetrograde: z.boolean().optional(),
});

/**
 * Schema for natal chart interpretation request
 * POST /api/v1/ai/natal
 */
export const AiNatalSchema = z
  .object({
    planets: z
      .array(PlanetPositionSchema)
      .min(1, 'At least one planet position is required')
      .max(20, 'Too many planet positions'),
    houses: z
      .array(
        z.object({
          number: z.number().int().min(1).max(12),
          cusp: z.number(),
        })
      )
      .optional(),
    aspects: z
      .array(
        z.object({
          planet1: z.string(),
          planet2: z.string(),
          type: z.string(),
          orb: z.number().optional(),
        })
      )
      .optional(),
    chartName: z.string().max(200).optional(),
    birthDate: z.string().optional(),
  })
  .strict();

/**
 * Schema for transit interpretation request
 * POST /api/v1/ai/transit
 */
export const AiTransitSchema = z
  .object({
    currentTransits: z
      .array(
        z.object({
          planet: z.string().max(50),
          sign: z.string().max(30).optional(),
          house: z.number().int().min(1).max(12).optional(),
          aspectTo: z.string().max(50).optional(),
          aspectType: z.string().max(30).optional(),
        })
      )
      .min(1, 'At least one transit event is required')
      .max(50, 'Too many transit events'),
    natalPlanets: z.array(PlanetPositionSchema).optional(),
    chartName: z.string().max(200).optional(),
  })
  .strict();

/**
 * Schema for compatibility interpretation request
 * POST /api/v1/ai/compatibility
 */
const ChartInputSchema = z.object({
  planets: z
    .array(PlanetPositionSchema)
    .min(1, 'At least one planet position is required')
    .max(20, 'Too many planet positions'),
  houses: z
    .array(
      z.object({
        number: z.number().int().min(1).max(12),
        cusp: z.number(),
      })
    )
    .optional(),
  aspects: z
    .array(
      z.object({
        planet1: z.string(),
        planet2: z.string(),
        type: z.string(),
        orb: z.number().optional(),
      })
    )
    .optional(),
  name: z.string().max(200).optional(),
});

export const AiCompatibilitySchema = z
  .object({
    chartA: ChartInputSchema,
    chartB: ChartInputSchema,
  })
  .strict();

/**
 * Schema for lunar return interpretation request
 * POST /api/v1/ai/lunar-return
 */
export const AiLunarReturnSchema = AiNatalSchema;

/**
 * Schema for solar return interpretation request
 * POST /api/v1/ai/solar-return
 */
export const AiSolarReturnSchema = AiNatalSchema;

/**
 * Query parameter schemas for AI usage endpoints
 */

export const AiUsageStatsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30).optional(),
}).strict();

export const AiUsageHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
}).strict();

export const AiUsageDailyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30).optional(),
}).strict();

export const AiUsageRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).strict();

/**
 * Type exports
 */
export type AiNatalInput = z.infer<typeof AiNatalSchema>;
export type AiTransitInput = z.infer<typeof AiTransitSchema>;
export type AiCompatibilityInput = z.infer<typeof AiCompatibilitySchema>;
export type AiLunarReturnInput = z.infer<typeof AiLunarReturnSchema>;
export type AiSolarReturnInput = z.infer<typeof AiSolarReturnSchema>;
