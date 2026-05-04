/**
 * Synastry Schema Tests
 * Unit tests for synastry Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  synastryAspectInfluenceSchema,
  synastrySignificanceSchema,
  synastryAspectSchema,
  compatibilityAnalysisSchema,
  synastryBreakdownSchema,
  relationshipDynamicSchema,
  synastryRequestSchema,
  synastryResponseSchema,
  synastryComparisonSchema,
} from '../synastry.schema';

describe('Synastry Schemas', () => {
  describe('synastryAspectInfluenceSchema', () => {
    it('should validate all influence types', () => {
      const types = ['harmonious', 'tense', 'neutral'];
      types.forEach((type) => {
        expect(synastryAspectInfluenceSchema.safeParse(type).success).toBe(true);
      });
    });

    it('should reject invalid influence', () => {
      expect(synastryAspectInfluenceSchema.safeParse('positive').success).toBe(false);
    });
  });

  describe('synastrySignificanceSchema', () => {
    it('should validate all significance levels', () => {
      const levels = ['minor', 'moderate', 'major'];
      levels.forEach((level) => {
        expect(synastrySignificanceSchema.safeParse(level).success).toBe(true);
      });
    });

    it('should reject invalid significance', () => {
      expect(synastrySignificanceSchema.safeParse('critical').success).toBe(false);
    });
  });

  describe('synastryAspectSchema', () => {
    const validAspect = {
      planet1: {
        planet: 'sun',
        chart: '1' as const,
      },
      planet2: {
        planet: 'moon',
        chart: '2' as const,
      },
      type: 'conjunction' as const,
      degree: 5,
      orb: 3,
      influence: 'harmonious' as const,
      significance: 'major' as const,
    };

    it('should validate a valid synastry aspect', () => {
      const result = synastryAspectSchema.safeParse(validAspect);
      expect(result.success).toBe(true);
    });

    it('should validate with chart1/chart2 format', () => {
      const result = synastryAspectSchema.safeParse({
        ...validAspect,
        planet1: { planet: 'sun', chart: 'chart1' },
        planet2: { planet: 'moon', chart: 'chart2' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate with optional interpretation', () => {
      const result = synastryAspectSchema.safeParse({
        ...validAspect,
        interpretation: 'Strong emotional connection',
        harmonic: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid chart indicator', () => {
      const result = synastryAspectSchema.safeParse({
        ...validAspect,
        planet1: { planet: 'sun', chart: '3' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('compatibilityAnalysisSchema', () => {
    const validAnalysis = {
      overallScore: 78,
      romanticScore: 85,
      communicationScore: 72,
      emotionalScore: 80,
      valuesScore: 75,
      longTermPotential: 70,
      keyFactors: ['Strong emotional bond', 'Good communication'],
    };

    it('should validate a valid compatibility analysis', () => {
      const result = compatibilityAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    it('should reject scores out of range', () => {
      const result = compatibilityAnalysisSchema.safeParse({
        ...validAnalysis,
        overallScore: 101, // Out of range
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative scores', () => {
      const result = compatibilityAnalysisSchema.safeParse({
        ...validAnalysis,
        romanticScore: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('synastryBreakdownSchema', () => {
    const validBreakdown = {
      romance: 85,
      communication: 72,
      values: 75,
      emotional: 80,
      intellectual: 68,
      overall: 76,
    };

    it('should validate a valid synastry breakdown', () => {
      const result = synastryBreakdownSchema.safeParse(validBreakdown);
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const result = synastryBreakdownSchema.safeParse({
        romance: 85,
        communication: 72,
        // Missing other fields
      });
      expect(result.success).toBe(false);
    });
  });

  describe('relationshipDynamicSchema', () => {
    const validDynamic = {
      category: 'Communication',
      description: 'How you communicate with each other',
      positiveIndicators: ['Good listener', 'Expressive'],
      challengingIndicators: ['Can be argumentative'],
      advice: 'Practice active listening',
    };

    it('should validate a valid relationship dynamic', () => {
      const result = relationshipDynamicSchema.safeParse(validDynamic);
      expect(result.success).toBe(true);
    });

    it('should require all fields', () => {
      const result = relationshipDynamicSchema.safeParse({
        category: 'Communication',
        // Missing other fields
      });
      expect(result.success).toBe(false);
    });
  });

  describe('synastryRequestSchema', () => {
    const validRequest = {
      chart1Id: '123e4567-e89b-12d3-a456-426614174000',
      chart2Id: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should validate a basic synastry request', () => {
      const result = synastryRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate with options', () => {
      const result = synastryRequestSchema.safeParse({
        ...validRequest,
        options: {
          orbTolerance: 10,
          includeMinorAspects: true,
          includeHouseOverlays: true,
          includeInterpretations: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const result = synastryRequestSchema.safeParse({
        chart1Id: 'not-a-uuid',
        chart2Id: '123e4567-e89b-12d3-a456-426614174001',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid orb tolerance', () => {
      const result = synastryRequestSchema.safeParse({
        ...validRequest,
        options: {
          orbTolerance: 20, // Out of range
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('synastryComparisonSchema', () => {
    const validComparison = {
      chart1Id: '123e4567-e89b-12d3-a456-426614174000',
      chart2Id: '123e4567-e89b-12d3-a456-426614174001',
      overallCompatibility: 78,
      breakdown: {
        romance: 85,
        communication: 72,
        values: 75,
        emotional: 80,
        intellectual: 68,
        overall: 76,
      },
      aspects: [],
      themeAnalysis: {
        romantic: 'Strong romantic connection',
        communication: 'Good mental rapport',
      },
    };

    it('should validate a valid synastry comparison', () => {
      const result = synastryComparisonSchema.safeParse(validComparison);
      expect(result.success).toBe(true);
    });

    it('should validate with optional theme analysis', () => {
      const result = synastryComparisonSchema.safeParse({
        ...validComparison,
        themeAnalysis: {
          romantic: 'Strong romantic connection',
          communication: 'Good mental rapport',
          values: 'Shared values',
          emotional: 'Deep emotional bond',
          intellectual: 'Stimulating conversations',
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('synastryResponseSchema', () => {
    const validChart = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Test Chart',
      type: 'natal' as const,
      birthData: {
        name: 'Test',
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'New York',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isDefault: false,
    };

    const validResponse = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      chart1: validChart,
      chart2: { ...validChart, id: '123e4567-e89b-12d3-a456-426614174001' },
      synastryAspects: [],
      compatibilityAnalysis: {
        overallScore: 78,
        romanticScore: 85,
        communicationScore: 72,
        emotionalScore: 80,
        valuesScore: 75,
        longTermPotential: 70,
        keyFactors: ['Strong bond'],
      },
      strengths: ['Emotional connection', 'Shared values'],
      challenges: ['Communication styles', 'Different approaches'],
      recommendations: ['Practice patience', 'Open communication'],
      generatedAt: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid synastry response', () => {
      const result = synastryResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = synastryResponseSchema.safeParse({
        ...validResponse,
        compositeChart: undefined,
        relationshipDynamics: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = synastryResponseSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174002',
        // Missing required fields
      });
      expect(result.success).toBe(false);
    });
  });
});
