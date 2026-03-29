/**
 * Synastry Schemas
 * Zod validation schemas for synastry (relationship compatibility) API requests and responses
 *
 * @module types/schemas/synastry.schema
 */

import { z } from 'zod';
import { aspectTypeSchema, chartSchema, calculatedChartSchema } from './chart.schema';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Synastry aspect influence schema
 */
export const synastryAspectInfluenceSchema = z.enum(['harmonious', 'tense', 'neutral']);

/**
 * Synastry significance schema
 */
export const synastrySignificanceSchema = z.enum(['minor', 'moderate', 'major']);

// ============================================================================
// SYNASTRY ASPECT SCHEMA
// ============================================================================

/**
 * Synastry planet reference schema
 */
export const synastryPlanetRefSchema = z.object({
  planet: z.string(),
  chart: z.enum(['1', '2', 'chart1', 'chart2']),
});

/**
 * Synastry aspect schema (aspect between planets from two different charts)
 */
export const synastryAspectSchema = z.object({
  planet1: z.object({
    planet: z.string(),
    chart: z.enum(['1', '2', 'chart1', 'chart2']),
  }),
  planet2: z.object({
    planet: z.string(),
    chart: z.enum(['1', '2', 'chart1', 'chart2']),
  }),
  type: aspectTypeSchema,
  degree: z.number().min(0).max(30),
  orb: z.number().min(0).max(15),
  influence: synastryAspectInfluenceSchema,
  significance: synastrySignificanceSchema,
  interpretation: z.string().optional(),
  harmonic: z.boolean().optional(),
});

// ============================================================================
// COMPATIBILITY ANALYSIS SCHEMA
// ============================================================================

/**
 * Compatibility analysis schema (scores and factors)
 */
export const compatibilityAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  romanticScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  emotionalScore: z.number().min(0).max(100),
  valuesScore: z.number().min(0).max(100),
  longTermPotential: z.number().min(0).max(100),
  keyFactors: z.array(z.string()),
});

/**
 * Synastry breakdown schema (legacy compatibility)
 */
export const synastryBreakdownSchema = z.object({
  romance: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  values: z.number().min(0).max(100),
  emotional: z.number().min(0).max(100),
  intellectual: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});

// ============================================================================
// RELATIONSHIP DYNAMIC SCHEMA
// ============================================================================

/**
 * Relationship dynamic schema (category-specific analysis)
 */
export const relationshipDynamicSchema = z.object({
  category: z.string(),
  description: z.string(),
  positiveIndicators: z.array(z.string()),
  challengingIndicators: z.array(z.string()),
  advice: z.string(),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Synastry request schema
 */
export const synastryRequestSchema = z.object({
  chart1Id: z.string().uuid(),
  chart2Id: z.string().uuid(),
  options: z.object({
    orbTolerance: z.number().min(1).max(15).optional().default(8),
    includeMinorAspects: z.boolean().optional().default(false),
    includeHouseOverlays: z.boolean().optional().default(true),
    includeInterpretations: z.boolean().optional().default(true),
  }).optional(),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Full synastry response schema
 */
export const synastryResponseSchema = z.object({
  id: z.string().uuid(),
  chart1: chartSchema,
  chart2: chartSchema,
  compositeChart: calculatedChartSchema.optional(),
  synastryAspects: z.array(synastryAspectSchema),
  compatibilityAnalysis: compatibilityAnalysisSchema,
  relationshipDynamics: z.array(relationshipDynamicSchema).optional(),
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  recommendations: z.array(z.string()),
  generatedAt: z.string().datetime(),
});

/**
 * Legacy synastry comparison schema
 */
export const synastryComparisonSchema = z.object({
  chart1Id: z.string().uuid(),
  chart2Id: z.string().uuid(),
  overallCompatibility: z.number().min(0).max(100),
  breakdown: synastryBreakdownSchema,
  aspects: z.array(synastryAspectSchema),
  themeAnalysis: z.object({
    romantic: z.string().optional(),
    communication: z.string().optional(),
    values: z.string().optional(),
    emotional: z.string().optional(),
    intellectual: z.string().optional(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SynastryAspectInfluence = z.infer<typeof synastryAspectInfluenceSchema>;
export type SynastrySignificance = z.infer<typeof synastrySignificanceSchema>;
export type SynastryPlanetRef = z.infer<typeof synastryPlanetRefSchema>;
export type SynastryAspect = z.infer<typeof synastryAspectSchema>;
export type CompatibilityAnalysis = z.infer<typeof compatibilityAnalysisSchema>;
export type SynastryBreakdown = z.infer<typeof synastryBreakdownSchema>;
export type RelationshipDynamic = z.infer<typeof relationshipDynamicSchema>;

export type SynastryRequest = z.infer<typeof synastryRequestSchema>;
export type SynastryResponse = z.infer<typeof synastryResponseSchema>;
export type SynastryComparison = z.infer<typeof synastryComparisonSchema>;
