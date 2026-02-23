/**
 * Returns Schema Tests
 * Unit tests for solar and lunar return Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  returnLocationSchema,
  solarReturnRequestSchema,
  solarReturnAnalysisSchema,
  solarReturnResponseSchema,
  lunarReturnRequestSchema,
  lunarReturnAnalysisSchema,
  lunarReturnResponseSchema,
  lunarForecastRequestSchema,
  lunarForecastResponseSchema,
} from '../returns.schema';

describe('Returns Schemas', () => {
  describe('returnLocationSchema', () => {
    const validLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      placeName: 'New York, NY, USA',
    };

    it('should validate a valid return location', () => {
      const result = returnLocationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = returnLocationSchema.safeParse({
        ...validLocation,
        timezone: 'America/New_York',
        country: 'USA',
        region: 'New York',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const result = returnLocationSchema.safeParse({
        ...validLocation,
        latitude: 91, // Out of range
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const result = returnLocationSchema.safeParse({
        ...validLocation,
        longitude: 181, // Out of range
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty place name', () => {
      const result = returnLocationSchema.safeParse({
        ...validLocation,
        placeName: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('solarReturnRequestSchema', () => {
    const validRequest = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
      year: 2024,
    };

    it('should validate a basic solar return request', () => {
      const result = solarReturnRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate with location', () => {
      const result = solarReturnRequestSchema.safeParse({
        ...validRequest,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          placeName: 'New York, NY',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should apply default house system', () => {
      const result = solarReturnRequestSchema.safeParse(validRequest);
      if (result.success) {
        expect(result.data.houseSystem).toBe('placidus');
      }
    });

    it('should reject year below 1900', () => {
      const result = solarReturnRequestSchema.safeParse({
        ...validRequest,
        year: 1899,
      });
      expect(result.success).toBe(false);
    });

    it('should reject year above 2100', () => {
      const result = solarReturnRequestSchema.safeParse({
        ...validRequest,
        year: 2101,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid chartId', () => {
      const result = solarReturnRequestSchema.safeParse({
        ...validRequest,
        chartId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('solarReturnAnalysisSchema', () => {
    const validAnalysis = {
      overview: 'A year of transformation and growth',
      dominantThemes: ['Career', 'Relationships', 'Self-discovery'],
      houseEmphasis: [1, 4, 7, 10],
      majorAspects: [],
      recommendations: ['Focus on personal development', 'Build stronger relationships'],
    };

    it('should validate a valid solar return analysis', () => {
      const result = solarReturnAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    it('should validate with optional sun house analysis', () => {
      const result = solarReturnAnalysisSchema.safeParse({
        ...validAnalysis,
        sunHouse: {
          house: 10,
          interpretation: 'Career focus this year',
          focus: ['Professional achievements', 'Public recognition'],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate with optional moon phase analysis', () => {
      const result = solarReturnAnalysisSchema.safeParse({
        ...validAnalysis,
        moonPhase: {
          phase: 'First Quarter',
          interpretation: 'Time for action and decisions',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate with lucky days', () => {
      const result = solarReturnAnalysisSchema.safeParse({
        ...validAnalysis,
        luckyDays: [
          {
            date: '2024-06-15T00:00:00Z',
            reason: 'Jupiter trine Sun',
            intensity: 8,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should validate with challenges and opportunities', () => {
      const result = solarReturnAnalysisSchema.safeParse({
        ...validAnalysis,
        challenges: [
          {
            area: 'Career',
            description: 'Possible setbacks',
            advice: 'Stay patient and persistent',
          },
        ],
        opportunities: [
          {
            area: 'Relationships',
            description: 'New romantic possibilities',
            timing: 'Spring 2024',
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('solarReturnResponseSchema', () => {
    const validChart = {
      chart: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Solar Return 2024',
        type: 'natal' as const,
        birthData: {
          name: 'Test',
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'New York',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isDefault: false,
      },
      positions: [],
      aspects: [],
      houses: [],
      angles: {
        ascendant: { sign: 'aries' as const, degree: 0, minute: 0, exactDegree: 0 },
        midheaven: { sign: 'capricorn' as const, degree: 0, minute: 0, exactDegree: 270 },
        descendant: { sign: 'libra' as const, degree: 0, minute: 0, exactDegree: 180 },
        ic: { sign: 'cancer' as const, degree: 0, minute: 0, exactDegree: 90 },
      },
    };

    const validResponse = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      chartId: '123e4567-e89b-12d3-a456-426614174001',
      year: 2024,
      returnDate: '2024-01-15T12:00:00Z',
      solarReturnChart: validChart,
      analysis: {
        overview: 'A transformative year',
        dominantThemes: ['Growth'],
        houseEmphasis: [1],
        majorAspects: [],
        recommendations: [],
      },
      themes: ['Career advancement', 'Personal growth'],
      createdAt: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid solar return response', () => {
      const result = solarReturnResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate with optional location', () => {
      const result = solarReturnResponseSchema.safeParse({
        ...validResponse,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          placeName: 'New York, NY',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate with key dates', () => {
      const result = solarReturnResponseSchema.safeParse({
        ...validResponse,
        keyDates: [
          {
            date: '2024-06-15T00:00:00Z',
            event: 'Jupiter transit',
            significance: 'Expansion period',
            activatedHouses: [10],
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('lunarReturnRequestSchema', () => {
    const validRequest = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
      date: '2024-06-15T00:00:00Z',
    };

    it('should validate a basic lunar return request', () => {
      const result = lunarReturnRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate with location', () => {
      const result = lunarReturnRequestSchema.safeParse({
        ...validRequest,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          placeName: 'New York, NY',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should apply default house system', () => {
      const result = lunarReturnRequestSchema.safeParse(validRequest);
      if (result.success) {
        expect(result.data.houseSystem).toBe('placidus');
      }
    });
  });

  describe('lunarReturnAnalysisSchema', () => {
    const validAnalysis = {
      emotionalOverview: 'A month of emotional introspection',
      moodThemes: ['Reflection', 'Nurturing', 'Security'],
      focusAreas: ['Home', 'Family', 'Inner self'],
      houseEmphasis: [4, 5, 8],
      aspects: [],
      recommendations: ['Practice self-care', 'Spend time with family'],
    };

    it('should validate a valid lunar return analysis', () => {
      const result = lunarReturnAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = lunarReturnAnalysisSchema.safeParse({
        ...validAnalysis,
        emotionalGuidance: 'Focus on emotional needs',
        innerNeeds: ['Security', 'Comfort'],
        nurturingStyle: 'Through acts of service',
        homeFamilyFocus: 'Improving domestic harmony',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('lunarReturnResponseSchema', () => {
    const validChart = {
      chart: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Lunar Return',
        type: 'natal' as const,
        birthData: {
          name: 'Test',
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'New York',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isDefault: false,
      },
      positions: [],
      aspects: [],
      houses: [],
      angles: {
        ascendant: { sign: 'aries' as const, degree: 0, minute: 0, exactDegree: 0 },
        midheaven: { sign: 'capricorn' as const, degree: 0, minute: 0, exactDegree: 270 },
        descendant: { sign: 'libra' as const, degree: 0, minute: 0, exactDegree: 180 },
        ic: { sign: 'cancer' as const, degree: 0, minute: 0, exactDegree: 90 },
      },
    };

    const validResponse = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      chartId: '123e4567-e89b-12d3-a456-426614174001',
      returnDate: '2024-06-15T12:00:00Z',
      lunarReturnChart: validChart,
      analysis: {
        emotionalOverview: 'A nurturing month',
        moodThemes: ['Care'],
        focusAreas: ['Home'],
        houseEmphasis: [4],
        aspects: [],
        recommendations: [],
      },
      emotionalThemes: ['Nurturing', 'Security'],
      createdAt: '2024-06-01T00:00:00Z',
    };

    it('should validate a valid lunar return response', () => {
      const result = lunarReturnResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate with optional moon details', () => {
      const result = lunarReturnResponseSchema.safeParse({
        ...validResponse,
        moonPhase: 'Full Moon',
        moonSign: 'cancer' as const,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('lunarForecastRequestSchema', () => {
    const validRequest = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should validate a basic lunar forecast request', () => {
      const result = lunarForecastRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should apply default months', () => {
      const result = lunarForecastRequestSchema.safeParse(validRequest);
      if (result.success) {
        expect(result.data.months).toBe(1);
      }
    });

    it('should validate with custom months', () => {
      const result = lunarForecastRequestSchema.safeParse({
        ...validRequest,
        months: 6,
      });
      expect(result.success).toBe(true);
    });

    it('should reject months > 12', () => {
      const result = lunarForecastRequestSchema.safeParse({
        ...validRequest,
        months: 13,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('lunarForecastResponseSchema', () => {
    const validResponse = {
      chartId: '123e4567-e89b-12d3-a456-426614174000',
      returns: [],
      nextReturnDate: '2024-07-15T00:00:00Z',
      currentPhase: 'Waxing Gibbous',
      daysUntilNextReturn: 14,
    };

    it('should validate a valid lunar forecast response', () => {
      const result = lunarForecastResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject negative days', () => {
      const result = lunarForecastResponseSchema.safeParse({
        ...validResponse,
        daysUntilNextReturn: -1,
      });
      expect(result.success).toBe(false);
    });
  });
});
