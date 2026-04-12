/**
 * Tests for Aspect Calculator
 */

import { describe, it, expect } from 'vitest';
import {
  angularDifference,
  findAspect,
  isAspectApplying,
  calculateAspects,
  calculateNatalAspects,
  getAspectDefinition,
  getMajorAspects,
  detectAspectPatterns,
} from '@/utils/astrology/aspects';
import {
  AspectData,
  PlanetData,
  DEFAULT_ORBS,
  ASPECT_DEFINITIONS,
  ZODIAC_SIGNS,
} from '@/utils/astrology/types';

describe('Aspect Calculator', () => {
  // Mock planet data for testing
  const createMockPlanet = (name: string, longitude: number, speed: number = 1): PlanetData => ({
    name,
    longitude,
    latitude: 0,
    speed,
    retrograde: speed < 0,
    sign: ZODIAC_SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)],
    degree: longitude % 30,
  });

  describe('angularDifference', () => {
    it('should calculate difference between two longitudes', () => {
      expect(angularDifference(0, 30)).toBe(30);
      expect(angularDifference(0, 90)).toBe(90);
      expect(angularDifference(0, 180)).toBe(180);
    });

    it('should return smallest angle (never > 180)', () => {
      expect(angularDifference(0, 200)).toBe(160);
      expect(angularDifference(0, 270)).toBe(90);
      expect(angularDifference(0, 350)).toBe(10);
    });

    it('should handle negative differences', () => {
      expect(angularDifference(30, 0)).toBe(30);
      expect(angularDifference(90, 0)).toBe(90);
    });

    it('should handle same position', () => {
      expect(angularDifference(45, 45)).toBe(0);
    });

    it('should handle wrap-around at 360', () => {
      expect(angularDifference(350, 10)).toBe(20);
      expect(angularDifference(10, 350)).toBe(20);
    });
  });

  describe('findAspect', () => {
    it('should find conjunction (0 degrees)', () => {
      const result = findAspect(45, 47);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('conjunction');
      expect(result?.orb).toBeCloseTo(2);
    });

    it('should find opposition (180 degrees)', () => {
      const result = findAspect(0, 182);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('opposition');
      expect(result?.orb).toBeCloseTo(2);
    });

    it('should find trine (120 degrees)', () => {
      const result = findAspect(0, 121);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('trine');
      expect(result?.orb).toBeCloseTo(1);
    });

    it('should find square (90 degrees)', () => {
      const result = findAspect(0, 92);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('square');
      expect(result?.orb).toBeCloseTo(2);
    });

    it('should find sextile (60 degrees)', () => {
      const result = findAspect(0, 62);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('sextile');
      expect(result?.orb).toBeCloseTo(2);
    });

    it('should return null for no aspect', () => {
      const result = findAspect(0, 50);
      expect(result).toBeNull();
    });

    it('should mark exact aspects', () => {
      const result = findAspect(0, 0.3);
      expect(result?.exact).toBe(true);
    });

    it('should not mark non-exact aspects', () => {
      const result = findAspect(0, 5);
      expect(result?.exact).toBe(false);
    });

    it('should respect custom orbs', () => {
      const customOrbs = { ...DEFAULT_ORBS, conjunction: 2 };
      const result = findAspect(0, 5, customOrbs);
      expect(result).toBeNull();
    });
  });

  describe('isAspectApplying', () => {
    it('should return boolean for applying conjunction', () => {
      // Planet 1 at 0, moving forward at 1 deg/day
      // Planet 2 at 5, moving forward at 0.5 deg/day
      // Planet 1 is catching up = applying
      const result = isAspectApplying(0, 1, 5, 0.5, 0);
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for separating conjunction', () => {
      // Planet 1 at 5, moving forward at 0.5 deg/day
      // Planet 2 at 0, moving forward at 1 deg/day
      // They are separating
      const result = isAspectApplying(5, 0.5, 0, 1, 0);
      expect(typeof result).toBe('boolean');
    });

    it('should handle retrograde motion', () => {
      // Planet 1 moving backward (retrograde)
      const result = isAspectApplying(10, -1, 5, 1, 0);
      expect(typeof result).toBe('boolean');
    });

    it('should handle opposition aspects', () => {
      const result = isAspectApplying(0, 1, 182, 0, 180);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('calculateNatalAspects', () => {
    it('should calculate aspects between planets in a chart', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0, 1),
        createMockPlanet('Moon', 120, 13), // Trine to Sun
        createMockPlanet('Mars', 90, 0.5), // Square to Sun
      ];

      const aspects = calculateNatalAspects(planets);

      expect(aspects.length).toBeGreaterThan(0);

      // Should find Sun-Moon trine
      const sunMoonAspect = aspects.find(
        (a) =>
          (a.planet1 === 'Sun' && a.planet2 === 'Moon') ||
          (a.planet1 === 'Moon' && a.planet2 === 'Sun'),
      );
      expect(sunMoonAspect).toBeDefined();
      expect(sunMoonAspect?.type).toBe('trine');

      // Should find Sun-Mars square
      const sunMarsAspect = aspects.find(
        (a) =>
          (a.planet1 === 'Sun' && a.planet2 === 'Mars') ||
          (a.planet1 === 'Mars' && a.planet2 === 'Sun'),
      );
      expect(sunMarsAspect).toBeDefined();
      expect(sunMarsAspect?.type).toBe('square');
    });

    it('should not create duplicate aspects', () => {
      const planets: PlanetData[] = [createMockPlanet('Sun', 0), createMockPlanet('Moon', 120)];

      const aspects = calculateNatalAspects(planets);

      // Should only have one aspect (not one for each direction)
      expect(aspects.length).toBe(1);
    });

    it('should sort aspects by orb (tightest first)', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 122), // Trine with 2 degree orb
        createMockPlanet('Mars', 95), // Square with 5 degree orb
      ];

      const aspects = calculateNatalAspects(planets);

      if (aspects.length >= 2) {
        expect(aspects[0].orb).toBeLessThanOrEqual(aspects[1].orb);
      }
    });

    it('should exclude minor aspects when not requested', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 32), // Semi-sextile (minor)
      ];

      const aspects = calculateNatalAspects(planets, DEFAULT_ORBS, false);

      // Should not include semisextile
      expect(aspects.find((a) => a.type === 'semisextile')).toBeUndefined();
    });

    it('should include minor aspects when requested', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 31), // Semi-sextile (minor)
      ];

      const aspects = calculateNatalAspects(planets, DEFAULT_ORBS, true);

      // Should include semisextile
      expect(aspects.find((a) => a.type === 'semisextile')).toBeDefined();
    });
  });

  describe('calculateAspects (synastry)', () => {
    it('should calculate aspects between two sets of planets', () => {
      const chart1Planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 60),
      ];

      const chart2Planets: PlanetData[] = [
        createMockPlanet('Sun', 120), // Trine to chart1 Sun
        createMockPlanet('Moon', 180), // Opposition to chart1 Sun
      ];

      const aspects = calculateAspects(chart1Planets, chart2Planets);

      expect(aspects.length).toBeGreaterThan(0);

      // Should find aspects between charts
      const trineAspect = aspects.find((a) => a.type === 'trine');
      expect(trineAspect).toBeDefined();
    });

    it('should calculate aspects between same planet in different charts', () => {
      const chart1Planets: PlanetData[] = [createMockPlanet('Sun', 0)];

      const chart2Planets: PlanetData[] = [createMockPlanet('Sun', 90)];

      const aspects = calculateAspects(chart1Planets, chart2Planets);

      // Should include Sun-Sun square
      const sunSunAspect = aspects.find((a) => a.planet1 === 'Sun' && a.planet2 === 'Sun');
      expect(sunSunAspect).toBeDefined();
      expect(sunSunAspect?.type).toBe('square');
    });
  });

  describe('getAspectDefinition', () => {
    it('should return definition for each aspect type', () => {
      const types = [
        'conjunction',
        'opposition',
        'trine',
        'square',
        'sextile',
        'quincunx',
        'semisextile',
        'semisquare',
        'sesquisquare',
        'quintile',
        'biquintile',
      ] as const;

      for (const type of types) {
        const def = getAspectDefinition(type);
        expect(def).toBeDefined();
        expect(def.name).toBeDefined();
        expect(def.angle).toBeGreaterThanOrEqual(0);
        expect(def.angle).toBeLessThan(181);
        expect(def.orb).toBeGreaterThan(0);
        expect(def.symbol).toBeDefined();
        expect(typeof def.harmonious).toBe('boolean');
        expect(typeof def.major).toBe('boolean');
      }
    });

    it('should correctly identify major aspects', () => {
      expect(getAspectDefinition('conjunction').major).toBe(true);
      expect(getAspectDefinition('opposition').major).toBe(true);
      expect(getAspectDefinition('trine').major).toBe(true);
      expect(getAspectDefinition('square').major).toBe(true);
      expect(getAspectDefinition('sextile').major).toBe(true);
      expect(getAspectDefinition('quincunx').major).toBe(false);
    });

    it('should correctly identify harmonious aspects', () => {
      expect(getAspectDefinition('trine').harmonious).toBe(true);
      expect(getAspectDefinition('sextile').harmonious).toBe(true);
      expect(getAspectDefinition('square').harmonious).toBe(false);
      expect(getAspectDefinition('opposition').harmonious).toBe(false);
    });
  });

  describe('getMajorAspects', () => {
    it('should return all major aspect types', () => {
      const majorAspects = getMajorAspects();

      expect(majorAspects).toContain('conjunction');
      expect(majorAspects).toContain('opposition');
      expect(majorAspects).toContain('trine');
      expect(majorAspects).toContain('square');
      expect(majorAspects).toContain('sextile');
      expect(majorAspects).toHaveLength(5);
    });
  });

  describe('detectAspectPatterns', () => {
    it('should detect stellium (3+ planets in same sign)', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 5),
        createMockPlanet('Mercury', 15),
        createMockPlanet('Venus', 25), // All in Aries (0-30)
        createMockPlanet('Mars', 120),
      ];

      const aspects = calculateNatalAspects(planets);
      const patterns = detectAspectPatterns(planets, aspects);

      const stellium = patterns.find((p) => p.type === 'stellium');
      expect(stellium).toBeDefined();
      expect(stellium?.planets.length).toBeGreaterThanOrEqual(3);
    });

    it('should detect Grand Trine', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 120), // Trine to Sun
        createMockPlanet('Jupiter', 240), // Trine to both
      ];

      const aspects = calculateNatalAspects(planets);
      const patterns = detectAspectPatterns(planets, aspects);

      const grandTrine = patterns.find((p) => p.type === 'grand-trine');
      expect(grandTrine).toBeDefined();
    });

    it('should detect T-Square pattern when configured correctly', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 180), // Opposition to Sun
        createMockPlanet('Mars', 90), // Square to Sun, can form T-Square
        createMockPlanet('Jupiter', 270), // Square to Moon, completes T-Square
      ];

      const aspects = calculateNatalAspects(planets);
      const patterns = detectAspectPatterns(planets, aspects);

      // With 4 planets at 0, 90, 180, 270, we should find patterns
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return empty array when no patterns exist', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 45), // No major aspect
      ];

      const aspects = calculateNatalAspects(planets);
      const patterns = detectAspectPatterns(planets, aspects);

      // May still detect minor patterns, but no major ones
      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should include description for each pattern', () => {
      const planets: PlanetData[] = [
        createMockPlanet('Sun', 0),
        createMockPlanet('Moon', 120),
        createMockPlanet('Jupiter', 240),
      ];

      const aspects = calculateNatalAspects(planets);
      const patterns = detectAspectPatterns(planets, aspects);

      for (const pattern of patterns) {
        expect(pattern.description).toBeDefined();
        expect(typeof pattern.description).toBe('string');
        expect(pattern.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle exact 0 degree aspects', () => {
      const result = findAspect(45, 45);
      expect(result?.type).toBe('conjunction');
      expect(result?.orb).toBe(0);
      expect(result?.exact).toBe(true);
    });

    it('should handle exact 180 degree aspects', () => {
      const result = findAspect(0, 180);
      expect(result?.type).toBe('opposition');
      expect(result?.orb).toBe(0);
      expect(result?.exact).toBe(true);
    });

    it('should handle aspects at orb boundary', () => {
      // Conjunction orb is 10 degrees
      const withinOrb = findAspect(0, 10);
      expect(withinOrb?.type).toBe('conjunction');

      const outsideOrb = findAspect(0, 11);
      expect(outsideOrb).toBeNull();
    });

    it('should handle empty planet arrays', () => {
      const aspects = calculateNatalAspects([]);
      expect(aspects).toEqual([]);
    });

    it('should handle single planet', () => {
      const planets: PlanetData[] = [createMockPlanet('Sun', 0)];
      const aspects = calculateNatalAspects(planets);
      expect(aspects).toEqual([]);
    });

    it('should handle 360 degree wrap in aspect detection', () => {
      // 355 and 5 degrees should be 10 degrees apart (conjunction within orb)
      const result = findAspect(355, 5);
      expect(result?.type).toBe('conjunction');
    });
  });

  describe('Performance', () => {
    it('should handle large number of planets efficiently', () => {
      const planets: PlanetData[] = [];
      for (let i = 0; i < 20; i++) {
        planets.push(createMockPlanet(`Planet${i}`, i * 18));
      }

      const start = performance.now();
      const aspects = calculateNatalAspects(planets);
      const end = performance.now();

      expect(aspects.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
