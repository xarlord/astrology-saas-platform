/**
 * Unit Tests for Astronomy Engine Service
 * @requirement REQ-API-001
 * Tests real planetary position calculations using astronomy-engine library
 */

import { AstronomyEngineService, ZODIAC_SIGNS, PLANET_SYMBOLS } from '../../modules/shared/services/astronomyEngine.service';

describe('Astronomy Engine Service', () => {
  let service: AstronomyEngineService;

  beforeEach(() => {
    service = new AstronomyEngineService();
  });

  describe('Constants', () => {
    test('should export 12 zodiac signs in order', () => {
      expect(ZODIAC_SIGNS).toBeDefined();
      expect(ZODIAC_SIGNS.length).toBe(12);
      expect(ZODIAC_SIGNS[0]).toBe('Aries');
      expect(ZODIAC_SIGNS[11]).toBe('Pisces');
    });

    test('should export planet symbols', () => {
      expect(PLANET_SYMBOLS).toBeDefined();
      expect(PLANET_SYMBOLS.Sun).toBe('☉');
      expect(PLANET_SYMBOLS.Moon).toBe('☽');
      expect(PLANET_SYMBOLS.Mercury).toBe('☿');
      expect(PLANET_SYMBOLS.Venus).toBe('♀');
      expect(PLANET_SYMBOLS.Mars).toBe('♂');
      expect(PLANET_SYMBOLS.Jupiter).toBe('♃');
      expect(PLANET_SYMBOLS.Saturn).toBe('♄');
      expect(PLANET_SYMBOLS.Uranus).toBe('♅');
      expect(PLANET_SYMBOLS.Neptune).toBe('♆');
      expect(PLANET_SYMBOLS.Pluto).toBe('♇');
      expect(PLANET_SYMBOLS.Chiron).toBe('⚷');
      expect(PLANET_SYMBOLS.NorthNode).toBe('☊');
      expect(PLANET_SYMBOLS.SouthNode).toBe('☋');
    });
  });

  describe('Planetary Position Calculations', () => {
    test('should calculate positions for all major planets', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const positions = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      expect(positions).toBeDefined();
      expect(positions.size).toBe(10); // Sun through Pluto

      // Check all expected planets are present
      expect(positions.has('Sun')).toBe(true);
      expect(positions.has('Moon')).toBe(true);
      expect(positions.has('Mercury')).toBe(true);
      expect(positions.has('Venus')).toBe(true);
      expect(positions.has('Mars')).toBe(true);
      expect(positions.has('Jupiter')).toBe(true);
      expect(positions.has('Saturn')).toBe(true);
      expect(positions.has('Uranus')).toBe(true);
      expect(positions.has('Neptune')).toBe(true);
      expect(positions.has('Pluto')).toBe(true);
    });

    test('should return valid position structure for each planet', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const positions = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      for (const [name, pos] of positions) {
        expect(pos.name).toBe(name);
        expect(pos.longitude).toBeGreaterThanOrEqual(0);
        expect(pos.longitude).toBeLessThan(360);
        expect(pos.latitude).toBeGreaterThanOrEqual(-90);
        expect(pos.latitude).toBeLessThanOrEqual(90);
        expect(typeof pos.sign).toBe('string');
        expect(ZODIAC_SIGNS).toContain(pos.sign);
        expect(pos.signIndex).toBeGreaterThanOrEqual(0);
        expect(pos.signIndex).toBeLessThan(12);
        expect(pos.degree).toBeGreaterThanOrEqual(0);
        expect(pos.degree).toBeLessThan(30);
        expect(pos.minute).toBeGreaterThanOrEqual(0);
        expect(pos.minute).toBeLessThan(60);
        expect(typeof pos.isRetrograde).toBe('boolean');
      }
    });

    test('should calculate correct zodiac sign for known positions', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0)); // Jan 1, 2024
      const positions = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      const sun = positions.get('Sun');
      expect(sun).toBeDefined();

      // Sun should be in Capricorn or Sagittarius around Jan 1
      // (Capricorn: Dec 22 - Jan 19)
      expect(['Sagittarius', 'Capricorn']).toContain(sun!.sign);
    });

    test('should detect retrograde motion correctly', () => {
      // Use a date when Mercury is known to be retrograde
      // Mercury retrograde periods in 2024 include Apr 1-25
      const retroDate = new Date(Date.UTC(2024, 3, 15, 12, 0, 0)); // April 15, 2024
      const positions = service.calculatePlanetaryPositions(retroDate, 40.7128, -74.0060);

      const mercury = positions.get('Mercury');
      expect(mercury).toBeDefined();
      // Mercury should be retrograde around this date
      expect(mercury!.isRetrograde).toBe(true);
    });

    test('should calculate different positions for different dates', () => {
      const date1 = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const date2 = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));

      const positions1 = service.calculatePlanetaryPositions(date1, 40.7128, -74.0060);
      const positions2 = service.calculatePlanetaryPositions(date2, 40.7128, -74.0060);

      // Moon moves quickly - should be in different positions
      const moon1 = positions1.get('Moon');
      const moon2 = positions2.get('Moon');

      expect(moon1!.longitude).not.toBeCloseTo(moon2!.longitude, 0);
    });

    test('should calculate positions consistently for same date', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      const positions1 = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);
      const positions2 = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      const sun1 = positions1.get('Sun');
      const sun2 = positions2.get('Sun');

      expect(sun1!.longitude).toBeCloseTo(sun2!.longitude, 6);
    });
  });

  describe('Lunar Nodes Calculation', () => {
    test('should calculate lunar nodes', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const nodes = service.calculateLunarNodes(date);

      expect(nodes).toBeDefined();
      expect(nodes.northNode).toBeDefined();
      expect(nodes.southNode).toBeDefined();
    });

    test('should have valid node positions', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const nodes = service.calculateLunarNodes(date);

      expect(nodes.northNode.longitude).toBeGreaterThanOrEqual(0);
      expect(nodes.northNode.longitude).toBeLessThan(360);
      expect(nodes.southNode.longitude).toBeGreaterThanOrEqual(0);
      expect(nodes.southNode.longitude).toBeLessThan(360);
    });

    test('should have nodes 180 degrees apart', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const nodes = service.calculateLunarNodes(date);

      const diff = Math.abs(nodes.northNode.longitude - nodes.southNode.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });

    test('should have valid sign and degree for nodes', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const nodes = service.calculateLunarNodes(date);

      expect(ZODIAC_SIGNS).toContain(nodes.northNode.sign);
      expect(ZODIAC_SIGNS).toContain(nodes.southNode.sign);
      expect(nodes.northNode.degree).toBeGreaterThanOrEqual(0);
      expect(nodes.northNode.degree).toBeLessThan(30);
    });
  });

  describe('Chiron Calculation', () => {
    test('should calculate Chiron position', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const chiron = service.calculateChiron(date);

      expect(chiron).toBeDefined();
      expect(chiron.longitude).toBeGreaterThanOrEqual(0);
      expect(chiron.longitude).toBeLessThan(360);
      expect(ZODIAC_SIGNS).toContain(chiron.sign);
      expect(chiron.degree).toBeGreaterThanOrEqual(0);
      expect(chiron.degree).toBeLessThan(30);
      expect(typeof chiron.isRetrograde).toBe('boolean');
    });

    test('should calculate Chiron consistently', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const chiron1 = service.calculateChiron(date);
      const chiron2 = service.calculateChiron(date);

      expect(chiron1.longitude).toBeCloseTo(chiron2.longitude, 4);
    });
  });

  describe('Julian Day Calculation', () => {
    test('should calculate Julian Day for known date', () => {
      // J2000.0 epoch: January 1, 2000, 12:00 TT (approximately)
      const date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
      const jd = service.calculateJulianDay(date);

      // Known Julian Day for J2000.0 is 2451545.0
      expect(jd).toBeCloseTo(2451545, 0);
    });

    test('should calculate different Julian Days for different dates', () => {
      const date1 = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const date2 = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));

      const jd1 = service.calculateJulianDay(date1);
      const jd2 = service.calculateJulianDay(date2);

      expect(jd1).not.toBe(jd2);
      expect(jd2).toBeGreaterThan(jd1);
    });
  });

  describe('Local Sidereal Time Calculation', () => {
    test('should calculate LST for given date and longitude', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const lst = service.calculateLocalSiderealTime(date, -74.0060);

      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });

    test('should return different LST for different longitudes', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      const lstNY = service.calculateLocalSiderealTime(date, -74.0060); // New York
      const lstLondon = service.calculateLocalSiderealTime(date, -0.1278); // London

      expect(lstNY).not.toBe(lstLondon);
    });

    test('should advance LST by approximately 15 degrees per hour (~1 degree per 4 minutes)', () => {
      const date1 = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const date2 = new Date(Date.UTC(2024, 0, 1, 13, 0, 0)); // 1 hour later

      const lst1 = service.calculateLocalSiderealTime(date1, 0);
      const lst2 = service.calculateLocalSiderealTime(date2, 0);

      // LST advances ~15.04 degrees per hour (≈ 1 degree per 4 minutes)
      const diff = lst2 - lst1;
      expect(diff).toBeCloseTo(15, 0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle dates at extreme latitudes', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      // Arctic Circle
      const arcticPositions = service.calculatePlanetaryPositions(date, 66.5, 0);
      expect(arcticPositions.size).toBe(10);

      // Antarctic
      const antarcticPositions = service.calculatePlanetaryPositions(date, -66.5, 0);
      expect(antarcticPositions.size).toBe(10);
    });

    test('should handle dates in the past', () => {
      const date = new Date(Date.UTC(1900, 0, 1, 12, 0, 0));
      const positions = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      expect(positions.size).toBe(10);
      const sun = positions.get('Sun');
      expect(sun).toBeDefined();
    });

    test('should handle dates in the future', () => {
      const date = new Date(Date.UTC(2050, 0, 1, 12, 0, 0));
      const positions = service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      expect(positions.size).toBe(10);
      const sun = positions.get('Sun');
      expect(sun).toBeDefined();
    });

    test('should handle International Date Line', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));

      // Just west of date line
      const westPositions = service.calculatePlanetaryPositions(date, 0, 179);
      // Just east of date line
      const eastPositions = service.calculatePlanetaryPositions(date, 0, -179);

      expect(westPositions.size).toBe(10);
      expect(eastPositions.size).toBe(10);
    });
  });

  describe('Performance', () => {
    test('should calculate planetary positions within acceptable time', () => {
      const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
      const startTime = Date.now();

      service.calculatePlanetaryPositions(date, 40.7128, -74.0060);

      const elapsed = Date.now() - startTime;
      // Should complete in under 100ms
      expect(elapsed).toBeLessThan(100);
    });
  });
});
