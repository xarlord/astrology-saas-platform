/**
 * Chart Schemas
 * Zod validation schemas for chart API requests and responses
 *
 * @module types/schemas/chart.schema
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Zodiac sign schema
 */
export const zodiacSignSchema = z.enum([
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]);

/**
 * Element schema
 */
export const elementSchema = z.enum(['fire', 'earth', 'air', 'water']);

/**
 * Quality schema
 */
export const qualitySchema = z.enum(['cardinal', 'fixed', 'mutable']);

/**
 * Chart type schema
 */
export const chartTypeSchema = z.enum(['natal', 'draconic', 'harmonic', 'composite', 'synastry']);

/**
 * House system schema
 */
export const houseSystemSchema = z.enum([
  'placidus',
  'koch',
  'porphyry',
  'equal',
  'whole-sign',
  'topocentric',
]);

/**
 * Aspect type schema
 */
export const aspectTypeSchema = z.enum([
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
  'semisextile',
  'sesquisquare',
  'semisquare',
  'quintile',
  'biquintile',
]);

/**
 * Planet name schema
 */
export const planetNameSchema = z.enum([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'north-node',
  'south-node',
  'chiron',
  'lilith',
  'ascendant',
  'mc',
  'descendant',
  'ic',
]);

// ============================================================================
// BIRTH DATA SCHEMA
// ============================================================================

/**
 * Birth data schema for chart creation
 */
export const birthDataSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format'),
  birthTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Birth time must be in HH:MM format'),
  birthPlace: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
});

// ============================================================================
// CHART SCHEMA
// ============================================================================

/**
 * Chart schema (metadata only, no calculated data)
 */
export const chartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: chartTypeSchema,
  birthData: birthDataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isDefault: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});

// ============================================================================
// PLANET POSITION SCHEMA
// ============================================================================

/**
 * Planet position schema
 */
export const planetPositionSchema = z.object({
  planet: planetNameSchema,
  sign: zodiacSignSchema,
  degree: z.number().min(0).max(30),
  minute: z.number().min(0).max(59),
  second: z.number().min(0).max(59).optional().default(0),
  house: z.number().int().min(1).max(12),
  retrograde: z.boolean().default(false),
  element: elementSchema.optional(),
  quality: qualitySchema.optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  speed: z.number().optional(),
  position: z.string().optional(), // e.g., "15Aries30"
});

// ============================================================================
// ASPECT SCHEMA
// ============================================================================

/**
 * Dignity score schema for aspects
 */
export const dignityScoreSchema = z
  .object({
    rulership: z.number().default(0),
    exaltation: z.number().default(0),
    detriment: z.number().default(0),
    fall: z.number().default(0),
    triplicity: z.number().default(0),
    terms: z.number().default(0),
    face: z.number().default(0),
  })
  .optional();

/**
 * Aspect schema
 */
export const aspectSchema = z.object({
  id: z.string().optional(),
  planet1: z.string().optional(), // For backward compatibility
  planet2: z.string().optional(), // For backward compatibility
  planets: z.tuple([z.string(), z.string()]).optional(),
  type: aspectTypeSchema,
  degree: z.number().min(0).max(30),
  minute: z.number().min(0).max(59).optional().default(0),
  orb: z.number().min(0).max(15),
  applying: z.boolean(),
  major: z.boolean().optional(),
  dignities: dignityScoreSchema,
});

// ============================================================================
// HOUSE SCHEMA
// ============================================================================

/**
 * House schema
 */
export const houseSchema = z.object({
  number: z.number().int().min(1).max(12),
  sign: zodiacSignSchema,
  cuspDegree: z.number().min(0).max(30),
  cuspMinute: z.number().min(0).max(59).optional().default(0),
  planets: z.array(z.string()).default([]),
});

/**
 * House cusp schema (simpler version)
 */
export const houseCuspSchema = z.object({
  house: z.number().int().min(1).max(12),
  longitude: z.number().min(0).max(360),
  sign: zodiacSignSchema,
  position: z.string(),
});

// ============================================================================
// CHART ANGLES SCHEMA
// ============================================================================

/**
 * Zodiac position schema
 */
export const zodiacPositionSchema = z.object({
  sign: zodiacSignSchema,
  degree: z.number().min(0).max(30),
  minute: z.number().min(0).max(59),
  second: z.number().min(0).max(59).optional().default(0),
  exactDegree: z.number().min(0).max(360),
});

/**
 * Chart angles schema (ASC, MC, DSC, IC)
 */
export const chartAnglesSchema = z.object({
  ascendant: zodiacPositionSchema,
  midheaven: zodiacPositionSchema,
  descendant: zodiacPositionSchema,
  ic: zodiacPositionSchema,
});

// ============================================================================
// ASPECT PATTERN SCHEMA
// ============================================================================

/**
 * Aspect pattern type schema
 */
export const aspectPatternTypeSchema = z.enum([
  'grand-trine',
  'grand-cross',
  'tsquare',
  'ystod',
  'kite',
  'mystic-rectangle',
]);

/**
 * Aspect pattern schema
 */
export const aspectPatternSchema = z.object({
  type: aspectPatternTypeSchema,
  planets: z.array(z.string()),
  aspects: z.array(z.string()),
  strength: z.number().min(0).max(100),
});

// ============================================================================
// CALCULATED CHART SCHEMA
// ============================================================================

/**
 * Full calculated chart schema with all positions, aspects, and houses
 */
export const calculatedChartSchema = z.object({
  chart: chartSchema,
  positions: z.array(planetPositionSchema),
  aspects: z.array(aspectSchema),
  houses: z.array(houseSchema),
  angles: chartAnglesSchema,
  patterns: z.array(aspectPatternSchema).optional().default([]),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Create chart request schema
 */
export const createChartRequestSchema = z.object({
  name: z.string().min(1).max(100),
  type: chartTypeSchema,
  birthData: birthDataSchema,
  isDefault: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional(),
  houseSystem: houseSystemSchema.optional().default('placidus'),
  zodiacType: z.enum(['tropical', 'sidereal']).optional().default('tropical'),
});

/**
 * Update chart request schema
 */
export const updateChartRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Chart response schema
 */
export const chartResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  type: chartTypeSchema,
  birthData: birthDataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isDefault: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Charts list response schema
 */
export const chartsListResponseSchema = z.object({
  charts: z.array(chartResponseSchema),
  total: z.number().int().nonnegative(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ZodiacSign = z.infer<typeof zodiacSignSchema>;
export type Element = z.infer<typeof elementSchema>;
export type Quality = z.infer<typeof qualitySchema>;
export type ChartType = z.infer<typeof chartTypeSchema>;
export type HouseSystem = z.infer<typeof houseSystemSchema>;
export type AspectType = z.infer<typeof aspectTypeSchema>;
export type PlanetName = z.infer<typeof planetNameSchema>;

export type BirthData = z.infer<typeof birthDataSchema>;
export type Chart = z.infer<typeof chartSchema>;
export type PlanetPosition = z.infer<typeof planetPositionSchema>;
export type DignityScore = z.infer<typeof dignityScoreSchema>;
export type Aspect = z.infer<typeof aspectSchema>;
export type House = z.infer<typeof houseSchema>;
export type HouseCusp = z.infer<typeof houseCuspSchema>;
export type ZodiacPosition = z.infer<typeof zodiacPositionSchema>;
export type ChartAngles = z.infer<typeof chartAnglesSchema>;
export type AspectPatternType = z.infer<typeof aspectPatternTypeSchema>;
export type AspectPattern = z.infer<typeof aspectPatternSchema>;
export type CalculatedChart = z.infer<typeof calculatedChartSchema>;

export type CreateChartRequest = z.infer<typeof createChartRequestSchema>;
export type UpdateChartRequest = z.infer<typeof updateChartRequestSchema>;
export type ChartResponse = z.infer<typeof chartResponseSchema>;
export type ChartsListResponse = z.infer<typeof chartsListResponseSchema>;
