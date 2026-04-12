/**
 * Solar and Lunar Return Schemas
 * Zod validation schemas for solar and lunar return API requests and responses
 *
 * @module types/schemas/returns.schema
 */

import { z } from 'zod';
import { zodiacSignSchema, calculatedChartSchema, aspectSchema } from './chart.schema';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Return location schema
 */
export const returnLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  placeName: z.string().min(1).max(200),
  timezone: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
});

// ============================================================================
// SOLAR RETURN SCHEMAS
// ============================================================================

/**
 * Solar return request schema
 */
export const solarReturnRequestSchema = z.object({
  chartId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100),
  location: returnLocationSchema.optional(),
  houseSystem: z
    .enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign'])
    .optional()
    .default('placidus'),
});

/**
 * Solar return key date schema
 */
export const solarReturnKeyDateSchema = z.object({
  date: z.string().datetime(),
  event: z.string(),
  significance: z.string(),
  activatedHouses: z.array(z.number().int().min(1).max(12)),
});

/**
 * Solar return analysis schema
 */
export const solarReturnAnalysisSchema = z.object({
  overview: z.string(),
  dominantThemes: z.array(z.string()),
  houseEmphasis: z.array(z.number().int().min(1).max(12)),
  majorAspects: z.array(aspectSchema),
  recommendations: z.array(z.string()),
  sunHouse: z
    .object({
      house: z.number().int().min(1).max(12),
      interpretation: z.string(),
      focus: z.array(z.string()),
    })
    .optional(),
  moonPhase: z
    .object({
      phase: z.string(),
      interpretation: z.string(),
    })
    .optional(),
  luckyDays: z
    .array(
      z.object({
        date: z.string().datetime(),
        reason: z.string(),
        intensity: z.number().min(1).max(10),
      }),
    )
    .optional(),
  challenges: z
    .array(
      z.object({
        area: z.string(),
        description: z.string(),
        advice: z.string(),
      }),
    )
    .optional(),
  opportunities: z
    .array(
      z.object({
        area: z.string(),
        description: z.string(),
        timing: z.string(),
      }),
    )
    .optional(),
  advice: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Solar return response schema
 */
export const solarReturnResponseSchema = z.object({
  id: z.string().uuid(),
  chartId: z.string().uuid(),
  year: z.number().int(),
  returnDate: z.string().datetime(),
  location: returnLocationSchema.nullable().optional(),
  solarReturnChart: calculatedChartSchema,
  analysis: solarReturnAnalysisSchema,
  themes: z.array(z.string()),
  keyDates: z.array(solarReturnKeyDateSchema).optional(),
  createdAt: z.string().datetime(),
  isRelocated: z.boolean().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// LUNAR RETURN SCHEMAS
// ============================================================================

/**
 * Lunar return request schema
 */
export const lunarReturnRequestSchema = z.object({
  chartId: z.string().uuid(),
  date: z.string().datetime(),
  location: returnLocationSchema.optional(),
  houseSystem: z
    .enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign'])
    .optional()
    .default('placidus'),
});

/**
 * Lunar return analysis schema
 */
export const lunarReturnAnalysisSchema = z.object({
  emotionalOverview: z.string(),
  moodThemes: z.array(z.string()),
  focusAreas: z.array(z.string()),
  houseEmphasis: z.array(z.number().int().min(1).max(12)),
  aspects: z.array(aspectSchema),
  recommendations: z.array(z.string()),
  emotionalGuidance: z.string().optional(),
  innerNeeds: z.array(z.string()).optional(),
  nurturingStyle: z.string().optional(),
  homeFamilyFocus: z.string().optional(),
});

/**
 * Lunar return response schema
 */
export const lunarReturnResponseSchema = z.object({
  id: z.string().uuid(),
  chartId: z.string().uuid(),
  returnDate: z.string().datetime(),
  location: returnLocationSchema.nullable().optional(),
  lunarReturnChart: calculatedChartSchema,
  analysis: lunarReturnAnalysisSchema,
  emotionalThemes: z.array(z.string()),
  createdAt: z.string().datetime(),
  moonPhase: z.string().optional(),
  moonSign: zodiacSignSchema.optional(),
});

// ============================================================================
// LUNAR FORECAST SCHEMAS
// ============================================================================

/**
 * Lunar forecast request schema
 */
export const lunarForecastRequestSchema = z.object({
  chartId: z.string().uuid(),
  months: z.number().int().min(1).max(12).optional().default(1),
});

/**
 * Lunar forecast response schema
 */
export const lunarForecastResponseSchema = z.object({
  chartId: z.string().uuid(),
  returns: z.array(lunarReturnResponseSchema),
  nextReturnDate: z.string().datetime(),
  currentPhase: z.string(),
  daysUntilNextReturn: z.number().int().nonnegative(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ReturnLocation = z.infer<typeof returnLocationSchema>;

export type SolarReturnRequest = z.infer<typeof solarReturnRequestSchema>;
export type SolarReturnKeyDate = z.infer<typeof solarReturnKeyDateSchema>;
export type SolarReturnAnalysis = z.infer<typeof solarReturnAnalysisSchema>;
export type SolarReturnResponse = z.infer<typeof solarReturnResponseSchema>;

export type LunarReturnRequest = z.infer<typeof lunarReturnRequestSchema>;
export type LunarReturnAnalysis = z.infer<typeof lunarReturnAnalysisSchema>;
export type LunarReturnResponse = z.infer<typeof lunarReturnResponseSchema>;

export type LunarForecastRequest = z.infer<typeof lunarForecastRequestSchema>;
export type LunarForecastResponse = z.infer<typeof lunarForecastResponseSchema>;
