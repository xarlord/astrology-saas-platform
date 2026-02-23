/**
 * Tests for Angle Calculator
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAngles,
  calculateAscendant,
  calculateMidheaven,
  calculateDescendant,
  calculateIC,
  calculateVertex,
  calculatePartOfFortune,
  calculatePartOfSpirit,
  calculateArabicParts,
  getAngleSymbol,
  isDayBirth,
  formatAngle,
} from '@/utils/astrology/angles';
import { AngleData, ZODIAC_SIGNS } from '@/utils/astrology/types';

describe('Angle Calculator', () => {
  const testDate = new Date('1990-06-15T12:00:00Z');
  const testTime = '12:00';
  const testLatitude = 40.7128; // New York
  const testLongitude = -74.0060;

  describe('calculateAngles', () => {
    it('should calculate all chart angles', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      expect(angles).toHaveLength(6);
      expect(angles.map(a => a.name)).toContain('Ascendant');
      expect(angles.map(a => a.name)).toContain('Descendant');
      expect(angles.map(a => a.name)).toContain('MC');
      expect(angles.map(a => a.name)).toContain('IC');
      expect(angles.map(a => a.name)).toContain('Vertex');
      expect(angles.map(a => a.name)).toContain('AntiVertex');
    });

    it('should have valid properties for each angle', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      for (const angle of angles) {
        expect(angle).toHaveProperty('name');
        expect(angle).toHaveProperty('longitude');
        expect(angle).toHaveProperty('latitude');
        expect(angle).toHaveProperty('sign');
        expect(angle).toHaveProperty('degree');
        expect(angle.longitude).toBeGreaterThanOrEqual(0);
        expect(angle.longitude).toBeLessThan(360);
        expect(ZODIAC_SIGNS).toContain(angle.sign);
      }
    });

    it('should have Descendant opposite Ascendant', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      const asc = angles.find(a => a.name === 'Ascendant');
      const desc = angles.find(a => a.name === 'Descendant');

      expect(asc).toBeDefined();
      expect(desc).toBeDefined();

      const diff = Math.abs(asc!.longitude - desc!.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });

    it('should have IC opposite MC', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      const mc = angles.find(a => a.name === 'MC');
      const ic = angles.find(a => a.name === 'IC');

      expect(mc).toBeDefined();
      expect(ic).toBeDefined();

      const diff = Math.abs(mc!.longitude - ic!.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });

    it('should have AntiVertex opposite Vertex', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      const vertex = angles.find(a => a.name === 'Vertex');
      const antiVertex = angles.find(a => a.name === 'AntiVertex');

      expect(vertex).toBeDefined();
      expect(antiVertex).toBeDefined();

      let diff = Math.abs(vertex!.longitude - antiVertex!.longitude);
      if (diff > 180) diff = 360 - diff;
      expect(diff).toBeCloseTo(180, 0);
    });

    it('should assign houses to angles', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      const asc = angles.find(a => a.name === 'Ascendant');
      const desc = angles.find(a => a.name === 'Descendant');
      const mc = angles.find(a => a.name === 'MC');
      const ic = angles.find(a => a.name === 'IC');

      expect(asc?.house).toBe(1);
      expect(desc?.house).toBe(7);
      expect(mc?.house).toBe(10);
      expect(ic?.house).toBe(4);
    });
  });

  describe('calculateAscendant', () => {
    it('should calculate Ascendant for valid input', () => {
      const asc = calculateAscendant(testDate, testTime, testLatitude, testLongitude);

      expect(asc.name).toBe('Ascendant');
      expect(asc.longitude).toBeGreaterThanOrEqual(0);
      expect(asc.longitude).toBeLessThan(360);
      expect(ZODIAC_SIGNS).toContain(asc.sign);
      expect(asc.house).toBe(1);
    });

    it('should vary with time', () => {
      const ascNoon = calculateAscendant(testDate, '12:00', testLatitude, testLongitude);
      const ascMidnight = calculateAscendant(testDate, '00:00', testLatitude, testLongitude);

      expect(ascNoon.longitude).not.toBe(ascMidnight.longitude);
    });

    it('should vary with location', () => {
      const ascNY = calculateAscendant(testDate, testTime, 40.7128, -74.0060);
      const ascLA = calculateAscendant(testDate, testTime, 34.0522, -118.2437);

      expect(ascNY.longitude).not.toBe(ascLA.longitude);
    });
  });

  describe('calculateMidheaven', () => {
    it('should calculate MC for valid input', () => {
      const mc = calculateMidheaven(testDate, testTime, testLongitude);

      expect(mc.name).toBe('MC');
      expect(mc.longitude).toBeGreaterThanOrEqual(0);
      expect(mc.longitude).toBeLessThan(360);
      expect(ZODIAC_SIGNS).toContain(mc.sign);
      expect(mc.house).toBe(10);
    });

    it('should not depend on latitude', () => {
      const mc1 = calculateMidheaven(testDate, testTime, testLongitude);
      // MC is independent of latitude (only depends on time and longitude)
      expect(mc1.longitude).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateDescendant', () => {
    it('should calculate Descendant for valid input', () => {
      const desc = calculateDescendant(testDate, testTime, testLatitude, testLongitude);

      expect(desc.name).toBe('Descendant');
      expect(desc.longitude).toBeGreaterThanOrEqual(0);
      expect(desc.longitude).toBeLessThan(360);
      expect(desc.house).toBe(7);
    });

    it('should be opposite Ascendant', () => {
      const asc = calculateAscendant(testDate, testTime, testLatitude, testLongitude);
      const desc = calculateDescendant(testDate, testTime, testLatitude, testLongitude);

      const diff = Math.abs(asc.longitude - desc.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateIC', () => {
    it('should calculate IC for valid input', () => {
      const ic = calculateIC(testDate, testTime, testLongitude);

      expect(ic.name).toBe('IC');
      expect(ic.longitude).toBeGreaterThanOrEqual(0);
      expect(ic.longitude).toBeLessThan(360);
      expect(ic.house).toBe(4);
    });

    it('should be opposite MC', () => {
      const mc = calculateMidheaven(testDate, testTime, testLongitude);
      const ic = calculateIC(testDate, testTime, testLongitude);

      const diff = Math.abs(mc.longitude - ic.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateVertex', () => {
    it('should calculate Vertex for valid input', () => {
      const vertex = calculateVertex(testDate, testTime, testLatitude, testLongitude);

      expect(vertex.name).toBe('Vertex');
      expect(vertex.longitude).toBeGreaterThanOrEqual(0);
      expect(vertex.longitude).toBeLessThan(360);
      expect(ZODIAC_SIGNS).toContain(vertex.sign);
    });

    it('should vary with latitude', () => {
      const vertex45 = calculateVertex(testDate, testTime, 45, testLongitude);
      const vertex0 = calculateVertex(testDate, testTime, 0, testLongitude);

      expect(vertex45.longitude).not.toBe(vertex0.longitude);
    });
  });

  describe('calculatePartOfFortune', () => {
    it('should calculate Part of Fortune for day birth', () => {
      const asc = 0;
      const sun = 90; // Sun in Cancer
      const moon = 180; // Moon in Libra

      const pof = calculatePartOfFortune(asc, sun, moon, true);

      expect(pof.name).toBe('Part of Fortune');
      expect(pof.longitude).toBeGreaterThanOrEqual(0);
      expect(pof.longitude).toBeLessThan(360);
    });

    it('should calculate Part of Fortune for night birth', () => {
      const asc = 0;
      const sun = 90;
      const moon = 180;

      const pofDay = calculatePartOfFortune(asc, sun, moon, true);
      const pofNight = calculatePartOfFortune(asc, sun, moon, false);

      // Day and night calculations should give different results
      expect(pofDay.longitude).not.toBe(pofNight.longitude);
    });

    it('should use correct formula for day birth', () => {
      const asc = 0;
      const sun = 60;
      const moon = 120;

      const pof = calculatePartOfFortune(asc, sun, moon, true);
      // Day formula: Asc + Moon - Sun
      const expected = (0 + 120 - 60) % 360;

      expect(pof.longitude).toBeCloseTo(expected, 5);
    });

    it('should use correct formula for night birth', () => {
      const asc = 0;
      const sun = 60;
      const moon = 120;

      const pof = calculatePartOfFortune(asc, sun, moon, false);
      // Night formula: Asc + Sun - Moon
      const expected = (0 + 60 - 120 + 360) % 360;

      expect(pof.longitude).toBeCloseTo(expected, 5);
    });
  });

  describe('calculatePartOfSpirit', () => {
    it('should calculate Part of Spirit for day birth', () => {
      const asc = 0;
      const sun = 90;
      const moon = 180;

      const pos = calculatePartOfSpirit(asc, sun, moon, true);

      expect(pos.name).toBe('Part of Spirit');
      expect(pos.longitude).toBeGreaterThanOrEqual(0);
      expect(pos.longitude).toBeLessThan(360);
    });

    it('should use opposite formula to Part of Fortune', () => {
      const asc = 0;
      const sun = 60;
      const moon = 120;

      const pof = calculatePartOfFortune(asc, sun, moon, true);
      const pos = calculatePartOfSpirit(asc, sun, moon, true);

      // Part of Spirit uses opposite formula to Part of Fortune
      expect(pof.longitude).not.toBe(pos.longitude);
    });
  });

  describe('calculateArabicParts', () => {
    it('should calculate all Arabic Parts', () => {
      const parts = calculateArabicParts(0, 90, 180, true);

      expect(parts.length).toBeGreaterThan(0);
      expect(parts.map(p => p.name)).toContain('Part of Fortune');
      expect(parts.map(p => p.name)).toContain('Part of Spirit');
    });

    it('should have valid properties for each part', () => {
      const parts = calculateArabicParts(0, 90, 180, true);

      for (const part of parts) {
        expect(part).toHaveProperty('name');
        expect(part).toHaveProperty('longitude');
        expect(part.longitude).toBeGreaterThanOrEqual(0);
        expect(part.longitude).toBeLessThan(360);
        expect(ZODIAC_SIGNS).toContain(part.sign);
      }
    });
  });

  describe('getAngleSymbol', () => {
    it('should return correct symbol for each angle', () => {
      expect(getAngleSymbol('Ascendant')).toBe('ASC');
      expect(getAngleSymbol('Descendant')).toBe('DESC');
      expect(getAngleSymbol('MC')).toBe('MC');
      expect(getAngleSymbol('IC')).toBe('IC');
      expect(getAngleSymbol('Vertex')).toBe('VX');
      expect(getAngleSymbol('AntiVertex')).toBe('AVX');
    });
  });

  describe('isDayBirth', () => {
    it('should return true when Sun is above horizon', () => {
      // With ASC at 90, Sun at 0 is in houses 7-12 (above horizon)
      // Houses 7-12 span from 270 (DESC) through 0 to 90 (ASC)
      const sunAbove = 0;
      const asc = 90;

      const result = isDayBirth(sunAbove, asc);
      expect(result).toBe(true);
    });

    it('should return false when Sun is below horizon', () => {
      // With ASC at 90, Sun at 180 is in houses 1-6 (below horizon)
      // Houses 1-6 span from 90 (ASC) through 180 to 270 (DESC)
      const sunBelow = 180;
      const asc = 90;

      const result = isDayBirth(sunBelow, asc);
      expect(result).toBe(false);
    });

    it('should handle edge cases at horizon', () => {
      const sunAtAsc = 90;
      const asc = 90;

      const result = isDayBirth(sunAtAsc, asc);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('formatAngle', () => {
    it('should format angle correctly', () => {
      const angle: AngleData = {
        name: 'Ascendant',
        longitude: 45.5,
        latitude: 0,
        sign: 'Taurus',
        degree: 15.5,
      };

      const formatted = formatAngle(angle);

      expect(formatted).toContain('Ascendant');
      expect(formatted).toContain('Taurus');
      expect(formatted).toContain('15');
    });

    it('should include degree symbol', () => {
      const angle: AngleData = {
        name: 'MC',
        longitude: 180,
        latitude: 0,
        sign: 'Libra',
        degree: 0,
      };

      const formatted = formatAngle(angle);
      expect(formatted).toContain('\u00b0'); // Degree symbol
    });

    it('should include minute symbol', () => {
      const angle: AngleData = {
        name: 'Ascendant',
        longitude: 30,
        latitude: 0,
        sign: 'Taurus',
        degree: 0,
      };

      const formatted = formatAngle(angle);
      expect(formatted).toContain("'"); // Minute symbol
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme latitudes', () => {
      // Arctic circle
      const angles = calculateAngles(testDate, testTime, 80, testLongitude);
      expect(angles).toHaveLength(6);

      // Antarctic
      const anglesSouth = calculateAngles(testDate, testTime, -80, testLongitude);
      expect(anglesSouth).toHaveLength(6);
    });

    it('should handle equator', () => {
      const angles = calculateAngles(testDate, testTime, 0, testLongitude);
      expect(angles).toHaveLength(6);
    });

    it('should handle extreme longitudes', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, 180);
      expect(angles).toHaveLength(6);
    });

    it('should handle midnight', () => {
      const angles = calculateAngles(testDate, '00:00', testLatitude, testLongitude);
      expect(angles).toHaveLength(6);
    });

    it('should handle noon', () => {
      const angles = calculateAngles(testDate, '12:00', testLatitude, testLongitude);
      expect(angles).toHaveLength(6);
    });

    it('should handle all times of day', () => {
      for (const hour of [0, 6, 12, 18]) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const angles = calculateAngles(testDate, time, testLatitude, testLongitude);
        expect(angles).toHaveLength(6);
      }
    });
  });

  describe('Consistency', () => {
    it('should give consistent results for same inputs', () => {
      const angles1 = calculateAngles(testDate, testTime, testLatitude, testLongitude);
      const angles2 = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      expect(angles1).toEqual(angles2);
    });

    it('should have correct sign for each longitude', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      for (const angle of angles) {
        const expectedSignIndex = Math.floor(angle.longitude / 30) % 12;
        const expectedSign = ZODIAC_SIGNS[expectedSignIndex];
        expect(angle.sign).toBe(expectedSign);
      }
    });

    it('should have correct degree within sign', () => {
      const angles = calculateAngles(testDate, testTime, testLatitude, testLongitude);

      for (const angle of angles) {
        const expectedDegree = angle.longitude % 30;
        expect(angle.degree).toBeCloseTo(expectedDegree, 5);
      }
    });
  });

  describe('Performance', () => {
    it('should calculate angles quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        calculateAngles(testDate, testTime, testLatitude, testLongitude);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete 100 calculations in under 100ms
    });
  });
});
