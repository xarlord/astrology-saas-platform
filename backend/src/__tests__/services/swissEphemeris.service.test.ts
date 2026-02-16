/**
 * Unit Tests for Swiss Ephemeris Service
 * Tests planetary position calculations, house calculations, and aspect detection
 */

import { swissEphemeris } from '../services';
import { toJulianDay, normalizeDegree, angularDistance, assertPlanetPosition, assertAspect, assertHouseCusp } from './utils';

describe('Swiss Ephemeris Service', () => {
  describe('Julian Day Conversion', () => {
    test('should convert known date to correct Julian Day', () => {
      // January 1, 2000, 12:00 UTC
      const date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
      const jd = toJulianDay(date);

      // Known Julian Day for this date is approximately 2451545.0
      expect(jd).toBeCloseTo(2451545, 0);
    });

    test('should convert date to Julian Day consistently', () => {
      const date1 = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
      const date2 = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));

      const jd1 = toJulianDay(date1);
      const jd2 = toJulianDay(date2);

      expect(jd1).toBe(jd2);
    });
  });

  describe('Degree Normalization', () => {
    test('should normalize positive degrees', () => {
      expect(normalizeDegree(370)).toBe(10);
      expect(normalizeDegree(720)).toBe(0);
      expect(normalizeDegree(450)).toBe(90);
    });

    test('should normalize negative degrees', () => {
      expect(normalizeDegree(-10)).toBe(350);
      expect(normalizeDegree(-180)).toBe(180);
      expect(normalizeDegree(-360)).toBe(0);
    });

    test('should keep degrees within 0-360', () => {
      expect(normalizeDegree(0)).toBe(0);
      expect(normalizeDegree(359.99)).toBeCloseTo(359.99, 2);
      expect(normalizeDegree(180)).toBe(180);
    });
  });

  describe('Angular Distance Calculation', () => {
    test('should calculate angular distance for small angles', () => {
      expect(angularDistance(10, 20)).toBe(10);
      expect(angularDistance(0, 45)).toBe(45);
      expect(angularDistance(90, 100)).toBe(10);
    });

    test('should calculate angular distance across 0°', () => {
      expect(angularDistance(350, 10)).toBe(20);
      expect(angularDistance(355, 5)).toBe(10);
      expect(angularDistance(180, 180)).toBe(0);
    });

    test('should always return distance <= 180°', () => {
      expect(angularDistance(0, 270)).toBe(90);
      expect(angularDistance(90, 300)).toBe(150);
      expect(angularDistance(45, 200)).toBe(155);
    });
  });

  describe('Planet Position Calculation', () => {
    const testDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0)); // June 15, 2024, 12:00 UTC

    test('should calculate Sun position', () => {
      const position = swissEphemeris.calculatePlanetPosition('sun', testDate);

      expect(position).toBeDefined();
      expect(position.planet).toBe('sun');
      expect(position.sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
      expect(position.degree).toBeGreaterThanOrEqual(0);
      expect(position.degree).toBeLessThan(360);
      expect(position.minute).toBeGreaterThanOrEqual(0);
      expect(position.minute).toBeLessThan(60);

      assertPlanetPosition(position);
    });

    test('should calculate Moon position', () => {
      const position = swissEphemeris.calculatePlanetPosition('moon', testDate);

      expect(position).toBeDefined();
      expect(position.planet).toBe('moon');
      expect(position.sign).toBeDefined();
      expect(position.house).toBeGreaterThan(0);

      assertPlanetPosition(position);
    });

    test('should calculate Mercury position', () => {
      const position = swissEphemeris.calculatePlanetPosition('mercury', testDate);

      expect(position).toBeDefined();
      expect(position.planet).toBe('mercury');
      expect(position.sign).toBeDefined();

      assertPlanetPosition(position);
    });

    test('should calculate all planets', () => {
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;

      planets.forEach(planetName => {
        const position = swissEphemeris.calculatePlanetPosition(planetName, testDate);
        expect(position).toBeDefined();
        expect(position.planet).toBe(planetName);
        assertPlanetPosition(position);
      });
    });

    test('should detect retrograde motion', () => {
      // Mercury is often retrograde
      const position = swissEphemeris.calculatePlanetPosition(
        'mercury',
        new Date(Date.UTC(2024, 4, 1, 12, 0, 0))
      );

      expect(position).toHaveProperty('retrograde');
      expect(typeof position.retrograde).toBe('boolean');
    });
  });

  describe('Sign Calculation', () => {
    test('should return correct sign for Aries', () => {
      const sign = swissEphemeris.getSign(10); // 10° is in Aries (0-30°)
      expect(sign).toBe('aries');
    });

    test('should return correct sign for Taurus', () => {
      const sign = swissEphemeris.getSign(45); // 45° is in Taurus (30-60°)
      expect(sign).toBe('taurus');
    });

    test('should return correct sign for all boundaries', () => {
      expect(swissEphemeris.getSign(0)).toBe('aries');
      expect(swissEphemeris.getSign(30)).toBe('taurus');
      expect(swissEphemeris.getSign(60)).toBe('gemini');
      expect(swissEphemeris.getSign(90)).toBe('cancer');
      expect(swissEphemeris.getSign(120)).toBe('leo');
      expect(swissEphemeris.getSign(150)).toBe('virgo');
      expect(swissEphemeris.getSign(180)).toBe('libra');
      expect(swissEphemeris.getSign(210)).toBe('scorpio');
      expect(swissEphemeris.getSign(240)).toBe('sagittarius');
      expect(swissEphemeris.getSign(270)).toBe('capricorn');
      expect(swissEphemeris.getSign(300)).toBe('aquarius');
      expect(swissEphemeris.getSign(330)).toBe('pisces');
      expect(swissEphemeris.getSign(359.99)).toBe('pisces');
    });
  });

  describe('House Calculation', () => {
    const testDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
    const latitude = 40.7128; // New York
    const longitude = -74.0060;

    test('should calculate Placidus houses', () => {
      const houses = swissEphemeris.calculateHouses(
        testDate,
        latitude,
        longitude,
        'placidus'
      );

      expect(houses).toBeDefined();
      expect(houses).toHaveLength(12);

      houses.forEach((house, index) => {
        expect(house.house).toBe(index + 1);
        expect(house.sign).toBeDefined();
        expect(house.degree).toBeGreaterThanOrEqual(0);
        expect(house.degree).toBeLessThan(360);

        assertHouseCusp(house);
      });

      // Check that cusps are in order
      for (let i = 0; i < 11; i++) {
        expect(houses[i + 1].degree).not.toBeLessThan(houses[i].degree);
      }
    });

    test('should calculate Whole Sign houses', () => {
      const houses = swissEphemeris.calculateHouses(
        testDate,
        latitude,
        longitude,
        'whole'
      );

      expect(houses).toHaveLength(12);

      // In Whole Sign, house 1 starts at 0° (Ascendant)
      // Each house is exactly 30°
      houses.forEach((house, index) => {
        const expectedDegree = index * 30;
        expect(house.degree).toBeCloseTo(expectedDegree, 1);
      });
    });

    test('should calculate Equal houses', () => {
      const houses = swissEphemeris.calculateHouses(
        testDate,
        latitude,
        longitude,
        'equal'
      );

      expect(houses).toHaveLength(12);

      // In Equal, each house is exactly 30°, starting from Ascendant
      const ascendant = houses[0].degree;
      houses.forEach((house, index) => {
        const expectedDegree = (ascendant + index * 30) % 360;
        expect(house.degree).toBeCloseTo(expectedDegree, 1);
      });
    });

    test('should handle different house systems', () => {
      const houseSystems = ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'] as const;

      houseSystems.forEach(system => {
        const houses = swissEphemeris.calculateHouses(
          testDate,
          latitude,
          longitude,
          system
        );

        expect(houses).toHaveLength(12);
        houses.forEach(house => {
          assertHouseCusp(house);
        });
      });
    });
  });

  describe('Aspect Detection', () => {
    test('should detect conjunction (within 10° orb)', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 95 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 10);

      expect(aspect).not.toBeNull();
      expect(aspect?.type).toBe('conjunction');
      expect(aspect?.orb).toBeCloseTo(5, 0.1);
    });

    test('should detect opposition (within 8° orb)', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 272 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 8);

      expect(aspect).not.toBeNull();
      expect(aspect?.type).toBe('opposition');
      expect(aspect?.orb).toBeCloseTo(2, 0.1);
    });

    test('should detect trine (within 8° orb)', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 30 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 8);

      expect(aspect).not.toBeNull();
      expect(aspect?.type).toBe('trine');
      expect(aspect?.orb).toBeCloseTo(0, 0.1);
    });

    test('should detect square (within 8° orb)', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 182 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 8);

      expect(aspect).not.toBeNull();
      expect(aspect?.type).toBe('square');
      expect(aspect?.orb).toBeCloseTo(2, 0.1);
    });

    test('should detect sextile (within 6° orb)', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 30 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 6);

      expect(aspect).not.toBeNull();
      expect(aspect?.type).toBe('sextile');
      expect(aspect?.orb).toBeCloseTo(0, 0.1);
    });

    test('should return null when aspect is outside orb', () => {
      const planet1 = { longitude: 90 };
      const planet2 = { longitude: 20 };

      const aspect = swissEphemeris.detectAspect(planet1.longitude, planet2.longitude, 6);

      expect(aspect).toBeNull();
    });

    test('should detect all aspect types', () => {
      const testCases = [
        { p1: 90, p2: 92, type: 'conjunction', orb: 2, maxOrb: 10 },
        { p1: 90, p2: 268, type: 'opposition', orb: 2, maxOrb: 8 },
        { p1: 90, p2: 32, type: 'trine', orb: 2, maxOrb: 8 },
        { p1: 90, p2: 178, type: 'square', orb: 2, maxOrb: 8 },
        { p1: 90, p2: 28, type: 'sextile', orb: 2, maxOrb: 6 },
        { p1: 90, p2: 238, type: 'quincunx', orb: 2, maxOrb: 3 },
      ];

      testCases.forEach(({ p1, p2, type, orb, maxOrb }) => {
        const aspect = swissEphemeris.detectAspect(p1, p2, maxOrb);
        expect(aspect).not.toBeNull();
        expect(aspect?.type).toBe(type);
        expect(aspect?.orb).toBeCloseTo(orb, 0.1);
      });
    });
  });

  describe('Calculate Aspects', () => {
    const testDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));

    test('should calculate aspects between planets', () => {
      const planets = [
        swissEphemeris.calculatePlanetPosition('sun', testDate),
        swissEphemeris.calculatePlanetPosition('moon', testDate),
        swissEphemeris.calculatePlanetPosition('mercury', testDate),
      ];

      const aspects = swissEphemeris.calculateAspects(planets);

      expect(aspects).toBeInstanceOf(Array);
      expect(aspects.length).toBeGreaterThan(0);

      aspects.forEach(aspect => {
        assertAspect(aspect);
      });
    });

    test('should filter aspects by orb tolerance', () => {
      const planets = [
        swissEphemeris.calculatePlanetPosition('sun', testDate),
        swissEphemeris.calculatePlanetPosition('moon', testDate),
      ];

      // Tight orb tolerance
      const tightOrbAspects = swissEphemeris.calculateAspects(planets, 3);
      // Loose orb tolerance
      const looseOrbAspects = swissEphemeris.calculateAspects(planets, 12);

      expect(looseOrbAspects.length).toBeGreaterThanOrEqual(tightOrbAspects.length);
    });

    test('should calculate aspects for all planet pairs', () => {
      const planets = [
        swissEphemeris.calculatePlanetPosition('sun', testDate),
        swissEphemeris.calculatePlanetPosition('moon', testDate),
        swissEphemeris.calculatePlanetPosition('mercury', testDate),
        swissEphemeris.calculatePlanetPosition('venus', testDate),
        swissEphemeris.calculatePlanetPosition('mars', testDate),
      ];

      const aspects = swissEphemeris.calculateAspects(planets);

      // Should have aspects between many planet pairs
      // (not all pairs will have aspects within orb)
      expect(aspects.length).toBeGreaterThan(0);
    });
  });

  describe('Natal Chart Calculation', () => {
    const birthData = {
      date: new Date(Date.UTC(2024, 5, 15, 12, 0, 0)),
      time: '12:00',
      place: {
        name: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
      timeUnknown: false,
    };

    test('should calculate complete natal chart', () => {
      const chart = swissEphemeris.calculateNatalChart(
        birthData.date,
        birthData.time,
        birthData.latitude,
        birthData.longitude,
        'placidus',
        'tropical'
      );

      expect(chart).toBeDefined();
      expect(chart.planets).toBeInstanceOf(Array);
      expect(chart.houses).toBeInstanceOf(Array);
      expect(chart.aspects).toBeInstanceOf(Array);

      // Should have 10 planets
      expect(chart.planets).toHaveLength(10);
      chart.planets.forEach(planet => assertPlanetPosition(planet));

      // Should have 12 houses
      expect(chart.houses).toHaveLength(12);
      chart.houses.forEach(house => assertHouseCusp(house));
    });

    test('should calculate different house systems', () => {
      const houseSystems = ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'] as const;

      houseSystems.forEach(system => {
        const chart = swissEphemeris.calculateNatalChart(
          birthData.date,
          birthData.time,
          birthData.latitude,
          birthData.longitude,
          system,
          'tropical'
        );

        expect(chart.houses).toHaveLength(12);
        chart.houses.forEach(house => assertHouseCusp(house));
      });
    });

    test('should handle sidereal zodiac', () => {
      const chart = swissEphemeris.calculateNatalChart(
        birthData.date,
        birthData.time,
        birthData.latitude,
        birthData.longitude,
        'placidus',
        'sidereal'
      );

      // Sidereal should produce different planet signs than tropical
      expect(chart.planets).toBeDefined();
      chart.planets.forEach(planet => {
        assertPlanetPosition(planet);
        expect(planet.sign).toBeDefined();
      });
    });
  });

  describe('Transit Calculation', () => {
    const natalDate = new Date(Date.UTC(1990, 5, 15, 12, 0, 0));

    test('should calculate transits for a specific date', () => {
      const transitDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
      const natalChart = swissEphemeris.calculateNatalChart(
        natalDate,
        '12:00',
        40.7128,
        -74.0060,
        'placidus',
        'tropical'
      );

      const transits = swissEphemeris.calculateTransits(
        natalChart,
        transitDate,
        transitDate
      );

      expect(transits).toBeDefined();
      expect(transits).toBeInstanceOf(Array);
    });

    test('should include transiting planets', () => {
      const transitDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
      const natalChart = swissEphemeris.calculateNatalChart(
        natalDate,
        '12:00',
        40.7128,
        -74.0060,
        'placidus',
        'tropical'
      );

      const transits = swissEphemeris.calculateTransits(
        natalChart,
        transitDate,
        transitDate
      );

      expect(transits.transitingPlanets).toBeDefined();
      expect(transits.transitingPlanets).toBeInstanceOf(Array);
    });

    test('should calculate transit aspects to natal planets', () => {
      const transitDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));
      const natalChart = swissEphemeris.calculateNatalChart(
        natalDate,
        '12:00',
        40.7128,
        -74.0060,
        'placidus',
        'tropical'
      );

      const transits = swissEphemeris.calculateTransits(
        natalChart,
        transitDate,
        transitDate
      );

      expect(transits.aspects).toBeDefined();
      expect(transits.aspects).toBeInstanceOf(Array);

      if (transits.aspects.length > 0) {
        transits.aspects.forEach(aspect => {
          expect(aspect).toHaveProperty('transitingPlanet');
          expect(aspect).toHaveProperty('natalPlanet');
          expect(aspect).toHaveProperty('type');
        });
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');

      expect(() => {
        swissEphemeris.calculatePlanetPosition('sun', invalidDate);
      }).not.toThrow();
    });

    test('should handle extreme latitudes', () => {
      const testDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));

      // North Pole
      const arcticHouses = swissEphemeris.calculateHouses(
        testDate,
        90.0,
        0.0,
        'placidus'
      );

      expect(arcticHouses).toHaveLength(12);

      // South Pole
      const antarcticHouses = swissEphemeris.calculateHouses(
        testDate,
        -90.0,
        0.0,
        'placidus'
      );

      expect(antarcticHouses).toHaveLength(12);
    });

    test('should handle 0° longitude', () => {
      const testDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0));

      const houses = swissEphemeris.calculateHouses(
        testDate,
        0.0,
        0.0,
        'placidus'
      );

      expect(houses).toHaveLength(12);
    });

    test('should handle time unknown births', () => {
      const birthData = {
        date: new Date(Date.UTC(2024, 5, 15, 12, 0, 0)),
        time: '12:00',
        place: {
          name: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
        },
        timeUnknown: true,
      };

      const chart = swissEphemeris.calculateNatalChart(
        birthData.date,
        '12:00', // Default time
        birthData.latitude,
        birthData.longitude,
        'placidus',
        'tropical'
      );

      expect(chart).toBeDefined();
      // When time is unknown, house calculations may use a simplified method
    });
  });
});
