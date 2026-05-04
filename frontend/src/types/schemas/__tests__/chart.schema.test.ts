/**
 * Chart Schema Tests
 * Unit tests for chart Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  zodiacSignSchema,
  elementSchema,
  qualitySchema,
  chartTypeSchema,
  houseSystemSchema,
  aspectTypeSchema,
  planetNameSchema,
  birthDataSchema,
  chartSchema,
  planetPositionSchema,
  aspectSchema,
  houseSchema,
  chartAnglesSchema,
  zodiacPositionSchema,
  calculatedChartSchema,
  createChartRequestSchema,
  updateChartRequestSchema,
} from '../chart.schema';

describe('Chart Schemas', () => {
  describe('zodiacSignSchema', () => {
    it('should validate all zodiac signs', () => {
      const signs = [
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
      ];
      signs.forEach((sign) => {
        expect(zodiacSignSchema.safeParse(sign).success).toBe(true);
      });
    });

    it('should reject invalid signs', () => {
      expect(zodiacSignSchema.safeParse('invalid').success).toBe(false);
      expect(zodiacSignSchema.safeParse('Aries').success).toBe(false); // case-sensitive
    });
  });

  describe('elementSchema', () => {
    it('should validate all elements', () => {
      const elements = ['fire', 'earth', 'air', 'water'];
      elements.forEach((element) => {
        expect(elementSchema.safeParse(element).success).toBe(true);
      });
    });

    it('should reject invalid elements', () => {
      expect(elementSchema.safeParse('metal').success).toBe(false);
    });
  });

  describe('qualitySchema', () => {
    it('should validate all qualities', () => {
      const qualities = ['cardinal', 'fixed', 'mutable'];
      qualities.forEach((quality) => {
        expect(qualitySchema.safeParse(quality).success).toBe(true);
      });
    });

    it('should reject invalid qualities', () => {
      expect(qualitySchema.safeParse('flexible').success).toBe(false);
    });
  });

  describe('chartTypeSchema', () => {
    it('should validate all chart types', () => {
      const types = ['natal', 'draconic', 'harmonic', 'composite', 'synastry'];
      types.forEach((type) => {
        expect(chartTypeSchema.safeParse(type).success).toBe(true);
      });
    });

    it('should reject invalid chart types', () => {
      expect(chartTypeSchema.safeParse('solar-return').success).toBe(false);
    });
  });

  describe('houseSystemSchema', () => {
    it('should validate all house systems', () => {
      const systems = ['placidus', 'koch', 'porphyry', 'equal', 'whole-sign', 'topocentric'];
      systems.forEach((system) => {
        expect(houseSystemSchema.safeParse(system).success).toBe(true);
      });
    });

    it('should reject invalid house systems', () => {
      expect(houseSystemSchema.safeParse('campanus').success).toBe(false);
    });
  });

  describe('aspectTypeSchema', () => {
    it('should validate major aspects', () => {
      const aspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
      aspects.forEach((aspect) => {
        expect(aspectTypeSchema.safeParse(aspect).success).toBe(true);
      });
    });

    it('should validate minor aspects', () => {
      const aspects = [
        'quincunx',
        'semisextile',
        'sesquisquare',
        'semisquare',
        'quintile',
        'biquintile',
      ];
      aspects.forEach((aspect) => {
        expect(aspectTypeSchema.safeParse(aspect).success).toBe(true);
      });
    });

    it('should reject invalid aspects', () => {
      expect(aspectTypeSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('planetNameSchema', () => {
    it('should validate all planets', () => {
      const planets = [
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
      ];
      planets.forEach((planet) => {
        expect(planetNameSchema.safeParse(planet).success).toBe(true);
      });
    });

    it('should validate points and nodes', () => {
      const points = [
        'north-node',
        'south-node',
        'chiron',
        'lilith',
        'ascendant',
        'mc',
        'descendant',
        'ic',
      ];
      points.forEach((point) => {
        expect(planetNameSchema.safeParse(point).success).toBe(true);
      });
    });

    it('should reject invalid planets', () => {
      expect(planetNameSchema.safeParse('earth').success).toBe(false);
      expect(planetNameSchema.safeParse('ceres').success).toBe(false);
    });
  });

  describe('birthDataSchema', () => {
    const validBirthData = {
      name: 'John Doe',
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: 'New York, NY, USA',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    };

    it('should validate valid birth data', () => {
      const result = birthDataSchema.safeParse(validBirthData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid birth date format', () => {
      const result = birthDataSchema.safeParse({
        ...validBirthData,
        birthDate: '01-15-1990', // Wrong format
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid birth time format', () => {
      const result = birthDataSchema.safeParse({
        ...validBirthData,
        birthTime: '25:00', // Invalid hour
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const result = birthDataSchema.safeParse({
        ...validBirthData,
        latitude: 91, // Out of range
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const result = birthDataSchema.safeParse({
        ...validBirthData,
        longitude: 181, // Out of range
      });
      expect(result.success).toBe(false);
    });
  });

  describe('planetPositionSchema', () => {
    const validPosition = {
      planet: 'sun' as const,
      sign: 'aries' as const,
      degree: 15,
      minute: 30,
      house: 1,
      retrograde: false,
    };

    it('should validate a valid planet position', () => {
      const result = planetPositionSchema.safeParse(validPosition);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const result = planetPositionSchema.safeParse({
        planet: 'sun',
        sign: 'aries',
        degree: 15,
        minute: 30,
        house: 1,
      });
      if (result.success) {
        expect(result.data.retrograde).toBe(false);
      }
    });

    it('should validate with optional fields', () => {
      const result = planetPositionSchema.safeParse({
        ...validPosition,
        element: 'fire',
        quality: 'cardinal',
        longitude: 15.5,
        latitude: 0,
        speed: 0.95,
        position: '15Aries30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid degree', () => {
      const result = planetPositionSchema.safeParse({
        ...validPosition,
        degree: 31, // Out of range
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid house', () => {
      const result = planetPositionSchema.safeParse({
        ...validPosition,
        house: 13, // Out of range
      });
      expect(result.success).toBe(false);
    });
  });

  describe('aspectSchema', () => {
    const validAspect = {
      type: 'conjunction' as const,
      degree: 5,
      orb: 3,
      applying: true,
      planet1: 'sun',
      planet2: 'moon',
    };

    it('should validate a valid aspect', () => {
      const result = aspectSchema.safeParse(validAspect);
      expect(result.success).toBe(true);
    });

    it('should reject invalid degree', () => {
      const result = aspectSchema.safeParse({
        ...validAspect,
        degree: 31,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid orb', () => {
      const result = aspectSchema.safeParse({
        ...validAspect,
        orb: 16, // Too wide
      });
      expect(result.success).toBe(false);
    });
  });

  describe('houseSchema', () => {
    const validHouse = {
      number: 1,
      sign: 'aries' as const,
      cuspDegree: 15,
      planets: ['sun', 'mercury'],
    };

    it('should validate a valid house', () => {
      const result = houseSchema.safeParse(validHouse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid house number', () => {
      const result = houseSchema.safeParse({
        ...validHouse,
        number: 13,
      });
      expect(result.success).toBe(false);
    });

    it('should apply default for planets array', () => {
      const result = houseSchema.safeParse({
        number: 1,
        sign: 'aries',
        cuspDegree: 15,
      });
      if (result.success) {
        expect(result.data.planets).toEqual([]);
      }
    });
  });

  describe('zodiacPositionSchema', () => {
    const validPosition = {
      sign: 'aries' as const,
      degree: 15,
      minute: 30,
      exactDegree: 15.5,
    };

    it('should validate a valid zodiac position', () => {
      const result = zodiacPositionSchema.safeParse(validPosition);
      expect(result.success).toBe(true);
    });

    it('should apply default for second', () => {
      const result = zodiacPositionSchema.safeParse(validPosition);
      if (result.success) {
        expect(result.data.second).toBe(0);
      }
    });
  });

  describe('chartAnglesSchema', () => {
    const validAngles = {
      ascendant: {
        sign: 'aries' as const,
        degree: 15,
        minute: 30,
        exactDegree: 15.5,
      },
      midheaven: {
        sign: 'capricorn' as const,
        degree: 10,
        minute: 0,
        exactDegree: 280,
      },
      descendant: {
        sign: 'libra' as const,
        degree: 15,
        minute: 30,
        exactDegree: 195.5,
      },
      ic: {
        sign: 'cancer' as const,
        degree: 10,
        minute: 0,
        exactDegree: 100,
      },
    };

    it('should validate valid chart angles', () => {
      const result = chartAnglesSchema.safeParse(validAngles);
      expect(result.success).toBe(true);
    });

    it('should reject missing angles', () => {
      const result = chartAnglesSchema.safeParse({
        ascendant: validAngles.ascendant,
        midheaven: validAngles.midheaven,
        // Missing descendant and ic
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createChartRequestSchema', () => {
    const validRequest = {
      name: 'My Natal Chart',
      type: 'natal' as const,
      birthData: {
        name: 'John Doe',
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'New York, NY, USA',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
      },
    };

    it('should validate a valid create chart request', () => {
      const result = createChartRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const result = createChartRequestSchema.safeParse(validRequest);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
        expect(result.data.houseSystem).toBe('placidus');
        expect(result.data.zodiacType).toBe('tropical');
      }
    });

    it('should validate with all optional fields', () => {
      const result = createChartRequestSchema.safeParse({
        ...validRequest,
        isDefault: true,
        notes: 'Some notes',
        houseSystem: 'whole-sign',
        zodiacType: 'sidereal',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateChartRequestSchema', () => {
    it('should validate partial updates', () => {
      expect(updateChartRequestSchema.safeParse({ name: 'New Name' }).success).toBe(true);
      expect(updateChartRequestSchema.safeParse({ isDefault: true }).success).toBe(true);
      expect(updateChartRequestSchema.safeParse({ notes: 'Updated notes' }).success).toBe(true);
    });

    it('should allow empty updates', () => {
      const result = updateChartRequestSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('calculatedChartSchema', () => {
    const validChart = {
      chart: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Chart',
        type: 'natal',
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
      },
      positions: [],
      aspects: [],
      houses: [],
      angles: {
        ascendant: { sign: 'aries', degree: 0, minute: 0, exactDegree: 0 },
        midheaven: { sign: 'capricorn', degree: 0, minute: 0, exactDegree: 270 },
        descendant: { sign: 'libra', degree: 0, minute: 0, exactDegree: 180 },
        ic: { sign: 'cancer', degree: 0, minute: 0, exactDegree: 90 },
      },
    };

    it('should validate a valid calculated chart', () => {
      const result = calculatedChartSchema.safeParse(validChart);
      expect(result.success).toBe(true);
    });

    it('should apply default for patterns', () => {
      const result = calculatedChartSchema.safeParse(validChart);
      if (result.success) {
        expect(result.data.patterns).toEqual([]);
      }
    });
  });
});
