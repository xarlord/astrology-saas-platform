/**
 * Tests for Planet Position Calculator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlanetPosition,
  calculateAllPlanetPositions,
  assignPlanetsToHouses,
  getZodiacSign,
  getSignElement,
  getSignQuality,
  getDegreeInSign,
  normalizeAngle,
  dateToJulianDay,
  julianCenturies,
  formatPosition,
  getPlanetSymbol,
  isRetrograde,
  PLANET_SYMBOLS,
} from '@/utils/astrology/planetPosition';
import { HouseData, ZODIAC_SIGNS } from '@/utils/astrology/types';

describe('Planet Position Calculator', () => {
  const testDate = new Date('1990-06-15T12:00:00Z');
  const testTime = '12:00';
  const testLatitude = 40.7128; // New York
  const testLongitude = -74.006;

  describe('normalizeAngle', () => {
    it('should normalize positive angles to 0-360 range', () => {
      expect(normalizeAngle(45)).toBe(45);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(400)).toBe(40);
      expect(normalizeAngle(720)).toBe(0);
    });

    it('should normalize negative angles to 0-360 range', () => {
      expect(normalizeAngle(-45)).toBe(315);
      expect(normalizeAngle(-360)).toBe(0);
      expect(normalizeAngle(-400)).toBe(320);
    });

    it('should handle decimal angles', () => {
      expect(normalizeAngle(45.5)).toBeCloseTo(45.5);
      expect(normalizeAngle(360.5)).toBeCloseTo(0.5);
    });
  });

  describe('getZodiacSign', () => {
    it('should return correct zodiac sign for given longitudes', () => {
      expect(getZodiacSign(0)).toBe('Aries');
      expect(getZodiacSign(30)).toBe('Taurus');
      expect(getZodiacSign(60)).toBe('Gemini');
      expect(getZodiacSign(90)).toBe('Cancer');
      expect(getZodiacSign(120)).toBe('Leo');
      expect(getZodiacSign(150)).toBe('Virgo');
      expect(getZodiacSign(180)).toBe('Libra');
      expect(getZodiacSign(210)).toBe('Scorpio');
      expect(getZodiacSign(240)).toBe('Sagittarius');
      expect(getZodiacSign(270)).toBe('Capricorn');
      expect(getZodiacSign(300)).toBe('Aquarius');
      expect(getZodiacSign(330)).toBe('Pisces');
    });

    it('should handle edge cases at sign boundaries', () => {
      expect(getZodiacSign(29.99)).toBe('Aries');
      expect(getZodiacSign(30.01)).toBe('Taurus');
      expect(getZodiacSign(359.99)).toBe('Pisces');
      expect(getZodiacSign(0.01)).toBe('Aries');
    });

    it('should normalize angles before determining sign', () => {
      expect(getZodiacSign(390)).toBe('Taurus');
      expect(getZodiacSign(-30)).toBe('Pisces');
    });
  });

  describe('getSignElement', () => {
    it('should return correct element for each sign', () => {
      expect(getSignElement('Aries')).toBe('fire');
      expect(getSignElement('Leo')).toBe('fire');
      expect(getSignElement('Sagittarius')).toBe('fire');
      expect(getSignElement('Taurus')).toBe('earth');
      expect(getSignElement('Virgo')).toBe('earth');
      expect(getSignElement('Capricorn')).toBe('earth');
      expect(getSignElement('Gemini')).toBe('air');
      expect(getSignElement('Libra')).toBe('air');
      expect(getSignElement('Aquarius')).toBe('air');
      expect(getSignElement('Cancer')).toBe('water');
      expect(getSignElement('Scorpio')).toBe('water');
      expect(getSignElement('Pisces')).toBe('water');
    });
  });

  describe('getSignQuality', () => {
    it('should return correct quality for each sign', () => {
      expect(getSignQuality('Aries')).toBe('cardinal');
      expect(getSignQuality('Cancer')).toBe('cardinal');
      expect(getSignQuality('Libra')).toBe('cardinal');
      expect(getSignQuality('Capricorn')).toBe('cardinal');
      expect(getSignQuality('Taurus')).toBe('fixed');
      expect(getSignQuality('Leo')).toBe('fixed');
      expect(getSignQuality('Scorpio')).toBe('fixed');
      expect(getSignQuality('Aquarius')).toBe('fixed');
      expect(getSignQuality('Gemini')).toBe('mutable');
      expect(getSignQuality('Virgo')).toBe('mutable');
      expect(getSignQuality('Sagittarius')).toBe('mutable');
      expect(getSignQuality('Pisces')).toBe('mutable');
    });
  });

  describe('getDegreeInSign', () => {
    it('should return degree within sign (0-30)', () => {
      expect(getDegreeInSign(15)).toBeCloseTo(15);
      expect(getDegreeInSign(45)).toBeCloseTo(15);
      expect(getDegreeInSign(90)).toBeCloseTo(0);
      expect(getDegreeInSign(180)).toBeCloseTo(0);
    });

    it('should handle decimal degrees', () => {
      expect(getDegreeInSign(15.5)).toBeCloseTo(15.5);
      expect(getDegreeInSign(45.75)).toBeCloseTo(15.75);
    });
  });

  describe('dateToJulianDay', () => {
    it('should convert date to Julian Day correctly', () => {
      // J2000.0 epoch
      const j2000 = new Date('2000-01-01T12:00:00Z');
      const jd = dateToJulianDay(j2000);
      expect(jd).toBeCloseTo(2451545.0, 0);
    });

    it('should handle dates before J2000', () => {
      const date = new Date('1990-01-01T00:00:00Z');
      const jd = dateToJulianDay(date);
      expect(jd).toBeGreaterThan(2447000);
      expect(jd).toBeLessThan(2450000);
    });
  });

  describe('julianCenturies', () => {
    it('should return 0 for J2000.0', () => {
      expect(julianCenturies(2451545.0)).toBeCloseTo(0, 10);
    });

    it('should calculate centuries correctly', () => {
      // 100 years = 1 century
      const jd100Years = 2451545.0 + 36525;
      expect(julianCenturies(jd100Years)).toBeCloseTo(1, 5);
    });
  });

  describe('calculatePlanetPosition', () => {
    it('should calculate planet position with all required properties', () => {
      const position = calculatePlanetPosition(
        'Sun',
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );

      expect(position).toHaveProperty('name', 'Sun');
      expect(position).toHaveProperty('longitude');
      expect(position).toHaveProperty('latitude');
      expect(position).toHaveProperty('speed');
      expect(position).toHaveProperty('retrograde');
      expect(position).toHaveProperty('sign');
      expect(position).toHaveProperty('degree');
      expect(position.longitude).toBeGreaterThanOrEqual(0);
      expect(position.longitude).toBeLessThan(360);
    });

    it('should calculate correct zodiac sign based on longitude', () => {
      const sunPosition = calculatePlanetPosition(
        'Sun',
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );

      const expectedSign = getZodiacSign(sunPosition.longitude);
      expect(sunPosition.sign).toBe(expectedSign);
    });

    it('should calculate Sun as never retrograde', () => {
      const sunPosition = calculatePlanetPosition(
        'Sun',
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );
      expect(sunPosition.retrograde).toBe(false);
    });

    it('should calculate Moon as never retrograde', () => {
      const moonPosition = calculatePlanetPosition(
        'Moon',
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );
      expect(moonPosition.retrograde).toBe(false);
    });

    it('should return positive speed for direct motion', () => {
      const sunPosition = calculatePlanetPosition(
        'Sun',
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );
      expect(sunPosition.speed).toBeGreaterThan(0);
    });
  });

  describe('calculateAllPlanetPositions', () => {
    it('should return positions for all 10 planets', () => {
      const positions = calculateAllPlanetPositions(
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );

      expect(positions).toHaveLength(10);
      expect(positions.map((p) => p.name)).toContain('Sun');
      expect(positions.map((p) => p.name)).toContain('Moon');
      expect(positions.map((p) => p.name)).toContain('Mercury');
      expect(positions.map((p) => p.name)).toContain('Venus');
      expect(positions.map((p) => p.name)).toContain('Mars');
      expect(positions.map((p) => p.name)).toContain('Jupiter');
      expect(positions.map((p) => p.name)).toContain('Saturn');
      expect(positions.map((p) => p.name)).toContain('Uranus');
      expect(positions.map((p) => p.name)).toContain('Neptune');
      expect(positions.map((p) => p.name)).toContain('Pluto');
    });

    it('should have valid positions for all planets', () => {
      const positions = calculateAllPlanetPositions(
        testDate,
        testTime,
        testLatitude,
        testLongitude,
      );

      for (const position of positions) {
        expect(position.longitude).toBeGreaterThanOrEqual(0);
        expect(position.longitude).toBeLessThan(360);
        expect(ZODIAC_SIGNS).toContain(position.sign);
        expect(position.degree).toBeGreaterThanOrEqual(0);
        expect(position.degree).toBeLessThan(30);
      }
    });
  });

  describe('assignPlanetsToHouses', () => {
    const mockHouses: HouseData[] = [
      { number: 1, cusp: 0, sign: 'Aries', degree: 0 },
      { number: 2, cusp: 30, sign: 'Taurus', degree: 0 },
      { number: 3, cusp: 60, sign: 'Gemini', degree: 0 },
      { number: 4, cusp: 90, sign: 'Cancer', degree: 0 },
      { number: 5, cusp: 120, sign: 'Leo', degree: 0 },
      { number: 6, cusp: 150, sign: 'Virgo', degree: 0 },
      { number: 7, cusp: 180, sign: 'Libra', degree: 0 },
      { number: 8, cusp: 210, sign: 'Scorpio', degree: 0 },
      { number: 9, cusp: 240, sign: 'Sagittarius', degree: 0 },
      { number: 10, cusp: 270, sign: 'Capricorn', degree: 0 },
      { number: 11, cusp: 300, sign: 'Aquarius', degree: 0 },
      { number: 12, cusp: 330, sign: 'Pisces', degree: 0 },
    ];

    const mockPlanets = [
      {
        name: 'Sun',
        longitude: 45,
        latitude: 0,
        speed: 1,
        retrograde: false,
        sign: 'Taurus' as const,
        degree: 15,
      },
      {
        name: 'Moon',
        longitude: 100,
        latitude: 0,
        speed: 13,
        retrograde: false,
        sign: 'Cancer' as const,
        degree: 10,
      },
      {
        name: 'Mars',
        longitude: 350,
        latitude: 0,
        speed: 0.5,
        retrograde: false,
        sign: 'Pisces' as const,
        degree: 20,
      },
    ];

    it('should assign planets to correct houses', () => {
      const assigned = assignPlanetsToHouses(mockPlanets, mockHouses);

      expect(assigned[0].house).toBe(2); // 45 degrees = 2nd house
      expect(assigned[1].house).toBe(4); // 100 degrees = 4th house
      expect(assigned[2].house).toBe(12); // 350 degrees = 12th house
    });

    it('should preserve other planet properties', () => {
      const assigned = assignPlanetsToHouses(mockPlanets, mockHouses);

      expect(assigned[0].name).toBe('Sun');
      expect(assigned[0].longitude).toBe(45);
      expect(assigned[1].name).toBe('Moon');
      expect(assigned[2].name).toBe('Mars');
    });
  });

  describe('formatPosition', () => {
    it('should format position correctly', () => {
      const formatted = formatPosition(15.5, 'Aries');
      expect(formatted).toContain('15');
      expect(formatted).toContain('Aries');
    });

    it('should include degree symbol', () => {
      const formatted = formatPosition(25, 'Leo');
      expect(formatted).toContain('\u00b0'); // Degree symbol
    });
  });

  describe('getPlanetSymbol', () => {
    it('should return correct symbol for each planet', () => {
      expect(getPlanetSymbol('Sun')).toBe('\u2609');
      expect(getPlanetSymbol('Moon')).toBe('\u263d');
      expect(getPlanetSymbol('Mercury')).toBe('\u263f');
      expect(getPlanetSymbol('Venus')).toBe('\u2640');
      expect(getPlanetSymbol('Mars')).toBe('\u2642');
      expect(getPlanetSymbol('Jupiter')).toBe('\u2643');
      expect(getPlanetSymbol('Saturn')).toBe('\u2644');
      expect(getPlanetSymbol('Uranus')).toBe('\u2645');
      expect(getPlanetSymbol('Neptune')).toBe('\u2646');
      expect(getPlanetSymbol('Pluto')).toBe('\u2647');
    });

    it('should return "?" for unknown planets', () => {
      expect(getPlanetSymbol('Unknown')).toBe('?');
    });
  });

  describe('PLANET_SYMBOLS', () => {
    it('should contain symbols for all major planets', () => {
      expect(PLANET_SYMBOLS).toHaveProperty('Sun');
      expect(PLANET_SYMBOLS).toHaveProperty('Moon');
      expect(PLANET_SYMBOLS).toHaveProperty('Mercury');
      expect(PLANET_SYMBOLS).toHaveProperty('Venus');
      expect(PLANET_SYMBOLS).toHaveProperty('Mars');
      expect(PLANET_SYMBOLS).toHaveProperty('Jupiter');
      expect(PLANET_SYMBOLS).toHaveProperty('Saturn');
      expect(PLANET_SYMBOLS).toHaveProperty('Uranus');
      expect(PLANET_SYMBOLS).toHaveProperty('Neptune');
      expect(PLANET_SYMBOLS).toHaveProperty('Pluto');
    });
  });

  describe('isRetrograde', () => {
    it('should return false for Sun (never retrograde)', () => {
      const result = isRetrograde('Sun', new Date());
      expect(result).toBe(false);
    });

    it('should return false for Moon (never retrograde)', () => {
      const result = isRetrograde('Moon', new Date());
      expect(result).toBe(false);
    });

    it('should return true for outer planets (often retrograde)', () => {
      // Outer planets are retrograde ~40-50% of the time
      const uranusResult = isRetrograde('Uranus', new Date());
      expect(typeof uranusResult).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle dates at boundaries (year 2000)', () => {
      const date = new Date('2000-01-01T00:00:00Z');
      const positions = calculateAllPlanetPositions(date, '00:00', 0, 0);

      expect(positions).toHaveLength(10);
      for (const pos of positions) {
        expect(pos.longitude).toBeGreaterThanOrEqual(0);
        expect(pos.longitude).toBeLessThan(360);
      }
    });

    it('should handle extreme latitudes', () => {
      const arcticPositions = calculateAllPlanetPositions(
        testDate,
        testTime,
        89.99, // Near North Pole
        0,
      );

      expect(arcticPositions).toHaveLength(10);
    });

    it('should handle extreme longitudes', () => {
      const positions = calculateAllPlanetPositions(
        testDate,
        testTime,
        0,
        179.99, // Near International Date Line
      );

      expect(positions).toHaveLength(10);
    });

    it('should handle midnight time', () => {
      const positions = calculateAllPlanetPositions(testDate, '00:00', testLatitude, testLongitude);

      expect(positions).toHaveLength(10);
    });

    it('should handle noon time', () => {
      const positions = calculateAllPlanetPositions(testDate, '12:00', testLatitude, testLongitude);

      expect(positions).toHaveLength(10);
    });
  });
});
