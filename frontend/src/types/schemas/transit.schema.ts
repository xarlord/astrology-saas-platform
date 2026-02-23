/**
 * Transit Schemas
 * Zod validation schemas for transit API requests and responses
 *
 * @module types/schemas/transit.schema
 */

import { z } from 'zod';
import { aspectTypeSchema, zodiacSignSchema } from './chart.schema';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Transit significance schema
 */
export const transitSignificanceSchema = z.enum(['minor', 'moderate', 'major']);

/**
 * Transit influence schema
 */
export const transitInfluenceSchema = z.enum(['positive', 'neutral', 'challenging']);

/**
 * Energy level schema
 */
export const energyLevelSchema = z.enum(['low', 'moderate', 'high']);

/**
 * Lunar phase type schema
 */
export const lunarPhaseTypeSchema = z.enum([
  'new-moon',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full-moon',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent'
]);

// ============================================================================
// TRANSIT ASPECT SCHEMA
// ============================================================================

/**
 * Transit aspect schema (aspect between transit and natal planet)
 */
export const transitAspectSchema = z.object({
  transitPlanet: z.string(),
  natalPlanet: z.string(),
  type: aspectTypeSchema,
  degree: z.number().min(0).max(30),
  orb: z.number().min(0).max(15),
  applying: z.boolean(),
  peakDate: z.string().datetime(),
  influence: transitInfluenceSchema,
});

// ============================================================================
// TRANSIT MOOD SCHEMA
// ============================================================================

/**
 * Transit mood schema
 */
export const transitMoodSchema = z.object({
  overall: z.string(),
  energy: energyLevelSchema,
  focus: z.array(z.string()),
});

// ============================================================================
// DAILY TRANSIT SCHEMA
// ============================================================================

/**
 * Daily transit schema
 */
export const dailyTransitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  aspects: z.array(transitAspectSchema),
  mood: transitMoodSchema,
  keyEvents: z.array(z.string()),
});

// ============================================================================
// MAJOR TRANSIT SCHEMA
// ============================================================================

/**
 * Major transit schema (longer-term planetary influences)
 */
export const majorTransitSchema = z.object({
  id: z.string().optional(),
  planet: z.string(),
  type: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  peakDate: z.string().datetime(),
  aspects: z.array(transitAspectSchema).optional(),
  significance: transitSignificanceSchema,
  description: z.string(),
  influence: z.object({
    overall: z.string(),
    career: z.string().optional(),
    relationships: z.string().optional(),
    personalGrowth: z.string().optional(),
  }).optional(),
  intensity: z.number().min(1).max(10).optional(),
});

// ============================================================================
// LUNAR PHASE SCHEMA
// ============================================================================

/**
 * Lunar phase schema
 */
export const lunarPhaseSchema = z.object({
  date: z.string().datetime(),
  phase: lunarPhaseTypeSchema,
  sign: zodiacSignSchema,
  degree: z.number().min(0).max(30),
  illumination: z.number().min(0).max(100).optional(),
  influence: z.string(),
});

// ============================================================================
// PLANETARY INGRESS SCHEMA
// ============================================================================

/**
 * Planetary ingress schema (planet entering a new sign)
 */
export const planetaryIngressSchema = z.object({
  date: z.string().datetime(),
  planet: z.string(),
  sign: zodiacSignSchema,
  degree: z.number().min(0).max(30),
  influence: z.string(),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Transit request schema
 */
export const transitRequestSchema = z.object({
  chartId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

/**
 * Transit forecast request schema
 */
export const transitForecastRequestSchema = z.object({
  chartId: z.string().uuid(),
  duration: z.number().int().positive().max(365), // days
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Transit response schema
 */
export const transitResponseSchema = z.object({
  chartId: z.string().uuid(),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  dailyTransits: z.array(dailyTransitSchema),
  majorTransits: z.array(majorTransitSchema),
  lunarPhases: z.array(lunarPhaseSchema),
  planetaryIngresses: z.array(planetaryIngressSchema).optional(),
});

/**
 * Transit chart schema
 */
export const transitChartSchema = z.object({
  chartId: z.string().uuid(),
  date: z.string().datetime(),
  transits: z.array(majorTransitSchema),
  energyLevel: z.number().min(1).max(10),
  dominantThemes: z.array(z.string()),
});

// ============================================================================
// TRANSIT INTERPRETATION SCHEMAS
// ============================================================================

/**
 * Transit theme schema
 */
export const transitThemeSchema = z.object({
  primary: z.string(),
  secondary: z.array(z.string()),
});

/**
 * Transit influence detail schema
 */
export const transitInfluenceDetailSchema = z.object({
  overall: transitInfluenceSchema,
  intensity: energyLevelSchema,
  duration: z.string(),
});

/**
 * Transit interpretation schema
 */
export const transitInterpretationSchema = z.object({
  transitId: z.string().uuid(),
  userId: z.string().uuid(),
  chartId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  theme: transitThemeSchema,
  influence: transitInfluenceDetailSchema,
  opportunities: z.array(z.string()),
  challenges: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TransitSignificance = z.infer<typeof transitSignificanceSchema>;
export type TransitInfluence = z.infer<typeof transitInfluenceSchema>;
export type EnergyLevel = z.infer<typeof energyLevelSchema>;
export type LunarPhaseType = z.infer<typeof lunarPhaseTypeSchema>;

export type TransitAspect = z.infer<typeof transitAspectSchema>;
export type TransitMood = z.infer<typeof transitMoodSchema>;
export type DailyTransit = z.infer<typeof dailyTransitSchema>;
export type MajorTransit = z.infer<typeof majorTransitSchema>;
export type LunarPhase = z.infer<typeof lunarPhaseSchema>;
export type PlanetaryIngress = z.infer<typeof planetaryIngressSchema>;

export type TransitRequest = z.infer<typeof transitRequestSchema>;
export type TransitForecastRequest = z.infer<typeof transitForecastRequestSchema>;
export type TransitResponse = z.infer<typeof transitResponseSchema>;
export type TransitChart = z.infer<typeof transitChartSchema>;

export type TransitTheme = z.infer<typeof transitThemeSchema>;
export type TransitInfluenceDetail = z.infer<typeof transitInfluenceDetailSchema>;
export type TransitInterpretation = z.infer<typeof transitInterpretationSchema>;
