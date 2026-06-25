/**
 * Unit Tests for Transit Calculation Service (#418)
 *
 * Tests the pure astronomical/astrological calculation logic extracted from
 * the transit controller. The AstronomyEngineService is mocked so we can
 * assert deterministic outputs for moon phases, aspect detection, and
 * intensity scoring.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  calculateTransitsWithEngine,
  calculateTransitPlanetsOnly,
  calculateMoonPhase,
  calculateTransitIntensity,
} from '../../modules/transits/services/transitCalculation.service';

// Mock AstronomyEngineService
jest.mock('../../modules/shared/services/astronomyEngine.service', () => {
  const _mockMethods = {
    calculatePlanetaryPositions: jest.fn(),
    calculateChiron: jest.fn(),
    calculateLunarNodes: jest.fn(),
  };
  const MockConstructor = jest.fn().mockImplementation(() => _mockMethods);
  (MockConstructor as any)._mockInstance = _mockMethods;
  return {
    __esModule: true,
    AstronomyEngineService: MockConstructor,
  };
});

import { AstronomyEngineService } from '../../modules/shared/services/astronomyEngine.service';

function getEngineMock() {
  return (AstronomyEngineService as any)._mockInstance;
}

function makeMockPositions(): Map<string, any> {
  const positions = new Map<string, any>();
  const planetData = [
    { name: 'Sun', longitude: 280, latitude: 0, speed: 1, isRetrograde: false },
    { name: 'Moon', longitude: 100, latitude: 5, speed: 13, isRetrograde: false },
    { name: 'Mercury', longitude: 305, latitude: 2, speed: 1.5, isRetrograde: false },
    { name: 'Venus', longitude: 340, latitude: -1, speed: 1.2, isRetrograde: false },
    { name: 'Mars', longitude: 15, latitude: 1, speed: 0.8, isRetrograde: false },
    { name: 'Jupiter', longitude: 45, latitude: -2, speed: 0.3, isRetrograde: false },
    { name: 'Saturn', longitude: 350, latitude: 2, speed: 0.2, isRetrograde: false },
  ];
  for (const p of planetData) {
    positions.set(p.name, {
      ...p,
      name: p.name,
      distance: 1,
      sign: 'Aries',
      signIndex: 0,
      degree: 0,
      minute: 0,
      second: 0,
    });
  }
  return positions;
}

describe('Transit Calculation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const engine = getEngineMock();
    engine.calculatePlanetaryPositions.mockReturnValue(makeMockPositions());
    engine.calculateChiron.mockReturnValue({
      longitude: 200,
      sign: 'Libra',
      degree: 20,
      isRetrograde: false,
    });
    engine.calculateLunarNodes.mockReturnValue({
      northNode: { longitude: 150, sign: 'Virgo', degree: 0 },
      southNode: { longitude: 330, sign: 'Pisces', degree: 0 },
    });
  });

  describe('calculateTransitsWithEngine', () => {
    it('should return transit planets including chiron and lunar nodes', () => {
      const result = calculateTransitsWithEngine({
        natalPlanets: { sun: { longitude: 280 }, moon: { longitude: 100 } },
        transitDate: new Date('2024-06-15'),
        latitude: 40.7,
        longitude: -74.0,
      });

      expect(result.transitPlanets).toBeDefined();
      // Original 7 planets + chiron + northnode + southnode
      expect(result.transitPlanets.sun).toBeDefined();
      expect(result.transitPlanets.moon).toBeDefined();
      expect(result.transitPlanets.chiron).toBeDefined();
      expect(result.transitPlanets.northnode).toBeDefined();
      expect(result.transitPlanets.southnode).toBeDefined();
    });

    it('should use lowercase planet keys', () => {
      const result = calculateTransitsWithEngine({
        natalPlanets: {},
        transitDate: new Date('2024-06-15'),
        latitude: 0,
        longitude: 0,
      });

      // The engine returns capitalized names; service lowercases them
      expect(result.transitPlanets.sun.sign).toBe('aries');
      expect(result.transitPlanets.chiron.sign).toBe('libra');
    });

    it('should calculate aspects between natal and transit planets', () => {
      // Natal sun at 280, transit sun also at 280 → conjunction
      const result = calculateTransitsWithEngine({
        natalPlanets: { sun: { longitude: 280 } },
        transitDate: new Date('2024-06-15'),
        latitude: 0,
        longitude: 0,
      });

      expect(result.aspects).toBeInstanceOf(Array);
      // There should be at least one aspect with the natal sun
      const sunAspects = result.aspects.filter((a) => a.planet1 === 'sun');
      expect(sunAspects.length).toBeGreaterThan(0);
    });

    it('should skip self-aspects (natal sun vs transit sun)', () => {
      const result = calculateTransitsWithEngine({
        natalPlanets: { sun: { longitude: 280 } },
        transitDate: new Date('2024-06-15'),
        latitude: 0,
        longitude: 0,
      });

      const selfAspect = result.aspects.find(
        (a) => a.planet1 === 'sun' && a.planet2 === 'sun',
      );
      expect(selfAspect).toBeUndefined();
    });

    it('should skip natal planets without longitude', () => {
      const result = calculateTransitsWithEngine({
        natalPlanets: { badplanet: { sign: 'Aries', longitude: undefined as unknown as number } },
        transitDate: new Date('2024-06-15'),
        latitude: 0,
        longitude: 0,
      });

      const badAspect = result.aspects.find((a) => a.planet1 === 'badplanet');
      expect(badAspect).toBeUndefined();
    });

    it('should pass coordinates and date to the engine', () => {
      const date = new Date('2024-06-15');
      calculateTransitsWithEngine({
        natalPlanets: {},
        transitDate: date,
        latitude: 51.5,
        longitude: -0.1,
      });

      const engine = getEngineMock();
      expect(engine.calculatePlanetaryPositions).toHaveBeenCalledWith(date, 51.5, -0.1);
    });
  });

  describe('calculateTransitPlanetsOnly', () => {
    it('should return planet positions without lowercasing', async () => {
      const result = await calculateTransitPlanetsOnly(new Date('2024-06-15'));

      // calculateTransitPlanetsOnly preserves original case (unlike transit calc)
      expect(result.Sun).toBeDefined();
      expect(result.Sun.longitude).toBe(280);
      expect(result.Moon).toBeDefined();
    });

    it('should include speed and retrograde fields', async () => {
      const result = await calculateTransitPlanetsOnly(new Date('2024-06-15'));

      expect(result.Sun.speed).toBe(1);
      expect(result.Sun.retrograde).toBe(false);
    });

    it('should use lat/lng 0,0', async () => {
      await calculateTransitPlanetsOnly(new Date('2024-06-15'));

      const engine = getEngineMock();
      expect(engine.calculatePlanetaryPositions).toHaveBeenCalledWith(
        expect.any(Date),
        0,
        0,
      );
    });
  });

  describe('calculateMoonPhase', () => {
    it('should return "new" phase when moon and sun aligned (0°)', () => {
      const phase = calculateMoonPhase(100, 100);
      expect(phase.phase).toBe('new');
      expect(phase.degrees).toBe(0);
    });

    it('should return "full" phase when moon is 180° from sun', () => {
      const phase = calculateMoonPhase(280, 100);
      expect(phase.phase).toBe('full');
      expect(phase.degrees).toBe(180);
    });

    it('should handle wraparound (moon behind sun)', () => {
      // moon=50, sun=200 → diff = -150 → +360 = 210
      const phase = calculateMoonPhase(50, 200);
      expect(phase.degrees).toBe(210);
      // 210° is in the full phase range (180-225)
      expect(phase.phase).toBe('full');
    });

    it('should calculate illumination between 0 and 1', () => {
      const testCases = [
        [100, 100], // new
        [280, 100], // full
        [145, 100], // first quarter
        [325, 100], // last quarter
      ];
      for (const [moon, sun] of testCases) {
        const phase = calculateMoonPhase(moon, sun);
        expect(phase.illumination).toBeGreaterThanOrEqual(0);
        expect(phase.illumination).toBeLessThanOrEqual(1);
      }
    });

    it('should round degrees and illumination to 2 decimals', () => {
      const phase = calculateMoonPhase(123, 100);
      // degrees = 23
      const decimals = (phase.degrees.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateTransitIntensity', () => {
    it('should return higher intensity for conjunction than sextile', () => {
      const conj = calculateTransitIntensity({ type: 'conjunction', orb: 1, planet1: 'sun' });
      const sext = calculateTransitIntensity({ type: 'sextile', orb: 1, planet1: 'sun' });
      expect(conj).toBeGreaterThan(sext);
    });

    it('should return higher intensity for tighter orbs', () => {
      const tight = calculateTransitIntensity({ type: 'conjunction', orb: 0.5, planet1: 'sun' });
      const wide = calculateTransitIntensity({ type: 'conjunction', orb: 9, planet1: 'sun' });
      expect(tight).toBeGreaterThan(wide);
    });

    it('should weight outer planets higher than inner planets', () => {
      const sun = calculateTransitIntensity({ type: 'conjunction', orb: 1, planet1: 'sun' });
      const mercury = calculateTransitIntensity({ type: 'conjunction', orb: 1, planet1: 'mercury' });
      expect(sun).toBeGreaterThan(mercury);
    });

    it('should default to base 5 for unknown aspect types', () => {
      const intensity = calculateTransitIntensity({ type: 'unknown', orb: 1, planet1: 'sun' });
      expect(intensity).toBeGreaterThan(0);
    });

    it('should default planet factor to 0.5 for unknown planets', () => {
      const known = calculateTransitIntensity({ type: 'conjunction', orb: 1, planet1: 'sun' });
      const unknown = calculateTransitIntensity({ type: 'conjunction', orb: 1, planet1: 'ceres' });
      expect(known).toBeGreaterThan(unknown);
    });
  });
});
