/**
 * Transit Schema Tests
 * Unit tests for transit Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  transitSignificanceSchema,
  transitInfluenceSchema,
  energyLevelSchema,
  lunarPhaseTypeSchema,
  transitAspectSchema,
  transitMoodSchema,
  dailyTransitSchema,
  majorTransitSchema,
  lunarPhaseSchema,
  planetaryIngressSchema,
  transitRequestSchema,
  transitForecastRequestSchema,
  transitResponseSchema,
  transitInterpretationSchema,
} from '../transit.schema';

describe('Transit Schemas', () => {
  describe('transitSignificanceSchema', () => {
    it('should validate all significance levels', () => {
      const levels = ['minor', 'moderate', 'major'];
      levels.forEach(level => {
        expect(transitSignificanceSchema.safeParse(level).success).toBe(true);
      });
    });

    it('should reject invalid significance', () => {
      expect(transitSignificanceSchema.safeParse('critical').success).toBe(false);
    });
  });

  describe('transitInfluenceSchema', () => {
    it('should validate all influence types', () => {
      const types = ['positive', 'neutral', 'challenging'];
      types.forEach(type => {
        expect(transitInfluenceSchema.safeParse(type).success).toBe(true);
      });
    });

    it('should reject invalid influence', () => {
      expect(transitInfluenceSchema.safeParse('negative').success).toBe(false);
    });
  });

  describe('energyLevelSchema', () => {
    it('should validate all energy levels', () => {
      const levels = ['low', 'moderate', 'high'];
      levels.forEach(level => {
        expect(energyLevelSchema.safeParse(level).success).toBe(true);
      });
    });

    it('should reject invalid energy level', () => {
      expect(energyLevelSchema.safeParse('extreme').success).toBe(false);
    });
  });

  describe('lunarPhaseTypeSchema', () => {
    it('should validate all lunar phases', () => {
      const phases = [
        'new-moon', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
        'full-moon', 'waning-gibbous', 'last-quarter', 'waning-crescent'
      ];
      phases.forEach(phase => {
        expect(lunarPhaseTypeSchema.safeParse(phase).success).toBe(true);
      });
    });

    it('should reject invalid phase', () => {
      expect(lunarPhaseTypeSchema.safeParse('half-moon').success).toBe(false);
    });
  });

  describe('transitAspectSchema', () => {
    const validAspect = {
      transitPlanet: 'saturn',
      natalPlanet: 'sun',
      type: 'square' as const,
      degree: 5,
      orb: 2,
      applying: true,
      peakDate: '2024-06-15T12:00:00Z',
      influence: 'challenging' as const,
    };

    it('should validate a valid transit aspect', () => {
      const result = transitAspectSchema.safeParse(validAspect);
      expect(result.success).toBe(true);
    });

    it('should reject invalid influence', () => {
      const result = transitAspectSchema.safeParse({
        ...validAspect,
        influence: 'bad',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid peak date', () => {
      const result = transitAspectSchema.safeParse({
        ...validAspect,
        peakDate: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transitMoodSchema', () => {
    const validMood = {
      overall: 'Productive day for focused work',
      energy: 'high' as const,
      focus: ['career', 'communication'],
    };

    it('should validate a valid transit mood', () => {
      const result = transitMoodSchema.safeParse(validMood);
      expect(result.success).toBe(true);
    });

    it('should reject invalid energy level', () => {
      const result = transitMoodSchema.safeParse({
        ...validMood,
        energy: 'extreme',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('dailyTransitSchema', () => {
    const validDailyTransit = {
      date: '2024-06-15',
      aspects: [],
      mood: {
        overall: 'Good day',
        energy: 'moderate' as const,
        focus: ['relationships'],
      },
      keyEvents: ['Moon enters Leo'],
    };

    it('should validate a valid daily transit', () => {
      const result = dailyTransitSchema.safeParse(validDailyTransit);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = dailyTransitSchema.safeParse({
        ...validDailyTransit,
        date: '06-15-2024', // Wrong format
      });
      expect(result.success).toBe(false);
    });
  });

  describe('majorTransitSchema', () => {
    const validMajorTransit = {
      planet: 'saturn',
      type: 'Saturn Return',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      peakDate: '2024-06-15T12:00:00Z',
      significance: 'major' as const,
      description: 'Major life restructuring period',
    };

    it('should validate a valid major transit', () => {
      const result = majorTransitSchema.safeParse(validMajorTransit);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = majorTransitSchema.safeParse({
        ...validMajorTransit,
        aspects: [],
        influence: {
          overall: 'Transformation period',
          career: 'Focus on long-term goals',
          relationships: 'Commitment themes',
        },
        intensity: 8,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid significance', () => {
      const result = majorTransitSchema.safeParse({
        ...validMajorTransit,
        significance: 'critical',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('lunarPhaseSchema', () => {
    const validLunarPhase = {
      date: '2024-06-15T12:00:00Z',
      phase: 'full-moon' as const,
      sign: 'sagittarius' as const,
      degree: 23,
      influence: 'Time for completion and harvest',
    };

    it('should validate a valid lunar phase', () => {
      const result = lunarPhaseSchema.safeParse(validLunarPhase);
      expect(result.success).toBe(true);
    });

    it('should validate with optional illumination', () => {
      const result = lunarPhaseSchema.safeParse({
        ...validLunarPhase,
        illumination: 100,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid illumination', () => {
      const result = lunarPhaseSchema.safeParse({
        ...validLunarPhase,
        illumination: 101, // Out of range
      });
      expect(result.success).toBe(false);
    });
  });

  describe('planetaryIngressSchema', () => {
    const validIngress = {
      date: '2024-03-21T00:00:00Z',
      planet: 'sun',
      sign: 'aries' as const,
      degree: 0,
      influence: 'New beginnings and fresh starts',
    };

    it('should validate a valid planetary ingress', () => {
      const result = planetaryIngressSchema.safeParse(validIngress);
      expect(result.success).toBe(true);
    });
  });

  describe('transitRequestSchema', () => {
    const validRequest = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    };

    it('should validate a valid transit request', () => {
      const result = transitRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid chartId', () => {
      const result = transitRequestSchema.safeParse({
        ...validRequest,
        chartId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transitForecastRequestSchema', () => {
    it('should validate a valid forecast request', () => {
      const result = transitForecastRequestSchema.safeParse({
        chartId: '123e4567-e89b-12d3-a456-426614174000',
        duration: 30,
      });
      expect(result.success).toBe(true);
    });

    it('should reject duration > 365', () => {
      const result = transitForecastRequestSchema.safeParse({
        chartId: '123e4567-e89b-12d3-a456-426614174000',
        duration: 366,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative duration', () => {
      const result = transitForecastRequestSchema.safeParse({
        chartId: '123e4567-e89b-12d3-a456-426614174000',
        duration: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transitResponseSchema', () => {
    const validResponse = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
      period: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z',
      },
      dailyTransits: [],
      majorTransits: [],
      lunarPhases: [],
    };

    it('should validate a valid transit response', () => {
      const result = transitResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate with optional planetary ingresses', () => {
      const result = transitResponseSchema.safeParse({
        ...validResponse,
        planetaryIngresses: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('transitInterpretationSchema', () => {
    const validInterpretation = {
      transitId: '123e4567-e89b-12d3-a456-426614174002',
      userId: '123e4567-e89b-12d3-a456-426614174003',
      chartId: '123e4567-e89b-12d3-a456-426614174004',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      theme: {
        primary: 'Career Transformation',
        secondary: ['Relationship Growth', 'Self-Discovery'],
      },
      influence: {
        overall: 'positive' as const,
        intensity: 'high' as const,
        duration: '6 months',
      },
      opportunities: ['Career advancement', 'New partnerships'],
      challenges: ['Time management', 'Work-life balance'],
      recommendations: ['Focus on long-term goals', 'Practice self-care'],
    };

    it('should validate a valid transit interpretation', () => {
      const result = transitInterpretationSchema.safeParse(validInterpretation);
      expect(result.success).toBe(true);
    });

    it('should require all mandatory fields', () => {
      const result = transitInterpretationSchema.safeParse({
        transitId: '123e4567-e89b-12d3-a456-426614174002',
        // Missing required fields
      });
      expect(result.success).toBe(false);
    });
  });
});
