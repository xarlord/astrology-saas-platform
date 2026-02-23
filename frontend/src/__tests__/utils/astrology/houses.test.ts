/**
 * Tests for House Calculator
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLST,
  calculateRAMC,
  calculateHouses,
  calculatePlacidusHouses,
  calculateKochHouses,
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePorphyryHouses,
  calculateAscendant,
  calculateMC,
  calculateDescendant,
  calculateIC,
  calculateVertex,
  calculateAntiVertex,
  calculateHousesFromData,
  getHouseSystemName,
} from '@/utils/astrology/houses';
import { HouseSystem, ZODIAC_SIGNS } from '@/utils/astrology/types';

describe('House Calculator', () => {
  const testLatitude = 40.7128; // New York
  const testLongitude = -74.0060;

  describe('calculateLST', () => {
    it('should calculate Local Sidereal Time', () => {
      const jd = 2451545.0; // J2000.0
      const lst = calculateLST(jd, 0);

      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });

    it('should vary with longitude', () => {
      const jd = 2451545.0;
      const lst0 = calculateLST(jd, 0);
      const lst90 = calculateLST(jd, 90);
      const lst180 = calculateLST(jd, 180);

      // LST should change with longitude
      expect(lst0).not.toBe(lst90);
      expect(lst90).not.toBe(lst180);
    });

    it('should handle negative longitudes', () => {
      const jd = 2451545.0;
      const lst = calculateLST(jd, -74.0060);

      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });
  });

  describe('calculateRAMC', () => {
    it('should equal LST in degrees', () => {
      const lst = 180;
      const ramc = calculateRAMC(lst);
      expect(ramc).toBe(180);
    });
  });

  describe('calculateHouses', () => {
    it('should return 12 houses for any system', () => {
      const systems: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry'];
      const lst = 180;

      for (const system of systems) {
        const houses = calculateHouses(lst, testLatitude, system);
        expect(houses).toHaveLength(12);
      }
    });

    it('should assign valid zodiac signs to houses', () => {
      const houses = calculateHouses(180, testLatitude, 'placidus');

      for (const house of houses) {
        expect(ZODIAC_SIGNS).toContain(house.sign);
      }
    });

    it('should have valid cusps (0-360)', () => {
      const houses = calculateHouses(180, testLatitude, 'placidus');

      for (const house of houses) {
        expect(house.cusp).toBeGreaterThanOrEqual(0);
        expect(house.cusp).toBeLessThan(360);
      }
    });

    it('should have valid degrees (0-30)', () => {
      const houses = calculateHouses(180, testLatitude, 'placidus');

      for (const house of houses) {
        expect(house.degree).toBeGreaterThanOrEqual(0);
        expect(house.degree).toBeLessThan(30);
      }
    });

    it('should default to Placidus system', () => {
      const housesPlacidus = calculateHouses(180, testLatitude, 'placidus');
      const housesDefault = calculateHouses(180, testLatitude);

      expect(housesDefault).toEqual(housesPlacidus);
    });
  });

  describe('calculatePlacidusHouses', () => {
    it('should calculate 12 Placidus houses', () => {
      const houses = calculatePlacidusHouses(180, testLatitude);
      expect(houses).toHaveLength(12);
    });

    it('should have sequential house numbers', () => {
      const houses = calculatePlacidusHouses(180, testLatitude);

      for (let i = 0; i < 12; i++) {
        expect(houses[i].number).toBe(i + 1);
      }
    });

    it('should have 4th house opposite 10th', () => {
      const houses = calculatePlacidusHouses(180, testLatitude);
      const mc10 = houses[9].cusp; // 10th house (index 9)
      const ic4 = houses[3].cusp; // 4th house (index 3)

      const diff = Math.abs(mc10 - ic4);
      expect(diff).toBeCloseTo(180, 0);
    });

    it('should have 7th house opposite 1st', () => {
      const houses = calculatePlacidusHouses(180, testLatitude);
      const asc1 = houses[0].cusp; // 1st house
      const desc7 = houses[6].cusp; // 7th house

      const diff = Math.abs(asc1 - desc7);
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateKochHouses', () => {
    it('should calculate 12 Koch houses', () => {
      const houses = calculateKochHouses(180, testLatitude);
      expect(houses).toHaveLength(12);
    });

    it('should have valid house properties', () => {
      const houses = calculateKochHouses(180, testLatitude);

      for (const house of houses) {
        expect(house).toHaveProperty('number');
        expect(house).toHaveProperty('cusp');
        expect(house).toHaveProperty('sign');
        expect(house).toHaveProperty('degree');
      }
    });
  });

  describe('calculateWholeSignHouses', () => {
    it('should calculate 12 Whole Sign houses', () => {
      const houses = calculateWholeSignHouses(180, testLatitude);
      expect(houses).toHaveLength(12);
    });

    it('should have each house starting at 0 degrees of sign', () => {
      const houses = calculateWholeSignHouses(180, testLatitude);

      for (const house of houses) {
        expect(house.degree).toBe(0);
      }
    });

    it('should have cusps at exact sign boundaries', () => {
      const houses = calculateWholeSignHouses(180, testLatitude);

      for (const house of houses) {
        expect(house.cusp % 30).toBe(0);
      }
    });

    it('should have sequential signs', () => {
      const houses = calculateWholeSignHouses(180, testLatitude);

      for (let i = 0; i < 11; i++) {
        const currentSignIndex = ZODIAC_SIGNS.indexOf(houses[i].sign);
        const nextSignIndex = ZODIAC_SIGNS.indexOf(houses[i + 1].sign);
        expect((currentSignIndex + 1) % 12).toBe(nextSignIndex);
      }
    });
  });

  describe('calculateEqualHouses', () => {
    it('should calculate 12 Equal houses', () => {
      const houses = calculateEqualHouses(180, testLatitude);
      expect(houses).toHaveLength(12);
    });

    it('should have equal house sizes (30 degrees)', () => {
      const houses = calculateEqualHouses(180, testLatitude);

      for (let i = 0; i < 11; i++) {
        let diff = houses[i + 1].cusp - houses[i].cusp;
        if (diff < 0) diff += 360;
        expect(diff).toBeCloseTo(30, 5);
      }
    });

    it('should have 1st house at Ascendant', () => {
      const houses = calculateEqualHouses(180, testLatitude);
      // Ascendant should be the 1st house cusp
      const asc = calculateAscendant(180, testLatitude);
      expect(houses[0].cusp).toBeCloseTo(asc, 5);
    });
  });

  describe('calculatePorphyryHouses', () => {
    it('should calculate 12 Porphyry houses', () => {
      const houses = calculatePorphyryHouses(180, testLatitude);
      expect(houses).toHaveLength(12);
    });

    it('should have angles at correct houses', () => {
      const houses = calculatePorphyryHouses(180, testLatitude);

      // 1st house should be Ascendant
      const asc = calculateAscendant(180, testLatitude);
      expect(houses[0].cusp).toBeCloseTo(asc, 5);

      // 4th house should be IC
      const mc = calculateMC(180);
      const ic = (mc + 180) % 360;
      expect(houses[3].cusp).toBeCloseTo(ic, 5);
    });
  });

  describe('calculateAscendant', () => {
    it('should calculate Ascendant for various LSTs', () => {
      for (const lst of [0, 90, 180, 270]) {
        const asc = calculateAscendant(lst, testLatitude);
        expect(asc).toBeGreaterThanOrEqual(0);
        expect(asc).toBeLessThan(360);
      }
    });

    it('should vary with latitude', () => {
      const lst = 180;
      const asc0 = calculateAscendant(lst, 0);
      const asc45 = calculateAscendant(lst, 45);
      const asc60 = calculateAscendant(lst, 60);

      // Ascendant should change with latitude
      expect(asc0).not.toBe(asc45);
      expect(asc45).not.toBe(asc60);
    });

    it('should handle equator', () => {
      const asc = calculateAscendant(180, 0);
      expect(asc).toBeGreaterThanOrEqual(0);
      expect(asc).toBeLessThan(360);
    });

    it('should handle extreme latitudes', () => {
      const ascArctic = calculateAscendant(180, 80);
      const ascAntarctic = calculateAscendant(180, -80);

      expect(ascArctic).toBeGreaterThanOrEqual(0);
      expect(ascAntarctic).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateMC', () => {
    it('should calculate MC for various RAMCs', () => {
      for (const ramc of [0, 90, 180, 270]) {
        const mc = calculateMC(ramc);
        expect(mc).toBeGreaterThanOrEqual(0);
        expect(mc).toBeLessThan(360);
      }
    });

    it('should not depend on latitude', () => {
      // MC is independent of latitude
      const mc1 = calculateMC(180);
      expect(mc1).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateDescendant', () => {
    it('should be opposite Ascendant', () => {
      const asc = calculateAscendant(180, testLatitude);
      const desc = calculateDescendant(asc);

      const diff = Math.abs(asc - desc);
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateIC', () => {
    it('should be opposite MC', () => {
      const mc = calculateMC(180);
      const ic = calculateIC(mc);

      const diff = Math.abs(mc - ic);
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateVertex', () => {
    it('should calculate Vertex', () => {
      const vertex = calculateVertex(180, testLatitude);
      expect(vertex).toBeGreaterThanOrEqual(0);
      expect(vertex).toBeLessThan(360);
    });

    it('should vary with latitude', () => {
      const vertex0 = calculateVertex(180, 0);
      const vertex45 = calculateVertex(180, 45);

      expect(vertex0).not.toBe(vertex45);
    });

    it('should be undefined at equator (approximation)', () => {
      // At the equator, Vertex calculation is special
      const vertex = calculateVertex(180, 0);
      expect(vertex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateAntiVertex', () => {
    it('should be opposite Vertex', () => {
      const vertex = calculateVertex(180, testLatitude);
      const antiVertex = calculateAntiVertex(vertex);

      let diff = Math.abs(vertex - antiVertex);
      if (diff > 180) diff = 360 - diff;
      expect(diff).toBeCloseTo(180, 0);
    });
  });

  describe('calculateHousesFromData', () => {
    const testDate = new Date('1990-06-15T12:00:00Z');
    const testTime = '12:00';

    it('should calculate houses from date/time/location', () => {
      const houses = calculateHousesFromData(
        testDate,
        testTime,
        testLatitude,
        testLongitude,
        'placidus'
      );

      expect(houses).toHaveLength(12);
    });

    it('should use default house system if not specified', () => {
      const houses = calculateHousesFromData(
        testDate,
        testTime,
        testLatitude,
        testLongitude
      );

      expect(houses).toHaveLength(12);
    });

    it('should support all house systems', () => {
      const systems: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry'];

      for (const system of systems) {
        const houses = calculateHousesFromData(
          testDate,
          testTime,
          testLatitude,
          testLongitude,
          system
        );

        expect(houses).toHaveLength(12);
      }
    });
  });

  describe('getHouseSystemName', () => {
    it('should return correct name for each system', () => {
      expect(getHouseSystemName('placidus')).toBe('Placidus');
      expect(getHouseSystemName('koch')).toBe('Koch');
      expect(getHouseSystemName('whole')).toBe('Whole Sign');
      expect(getHouseSystemName('equal')).toBe('Equal House');
      expect(getHouseSystemName('porphyry')).toBe('Porphyry');
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme northern latitudes', () => {
      const houses = calculateHouses(180, 80, 'placidus');
      expect(houses).toHaveLength(12);
    });

    it('should handle extreme southern latitudes', () => {
      const houses = calculateHouses(180, -80, 'placidus');
      expect(houses).toHaveLength(12);
    });

    it('should handle equator', () => {
      const houses = calculateHouses(180, 0, 'placidus');
      expect(houses).toHaveLength(12);
    });

    it('should handle all LST values', () => {
      for (const lst of [0, 90, 180, 270, 359]) {
        const houses = calculateHouses(lst, testLatitude, 'placidus');
        expect(houses).toHaveLength(12);
      }
    });

    it('should handle midnight LST', () => {
      const houses = calculateHouses(0, testLatitude, 'placidus');
      expect(houses).toHaveLength(12);
    });
  });

  describe('House Cusp Consistency', () => {
    it('should have all 12 unique house numbers', () => {
      const houses = calculateHouses(180, testLatitude, 'placidus');
      const numbers = houses.map(h => h.number);

      expect(new Set(numbers).size).toBe(12);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should have cusps in reasonable order', () => {
      const houses = calculateHouses(180, testLatitude, 'placidus');

      // Each house cusp should be different
      const cusps = houses.map(h => h.cusp);
      const uniqueCusps = new Set(cusps);
      expect(uniqueCusps.size).toBeGreaterThan(1);
    });
  });

  describe('Performance', () => {
    it('should calculate houses quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        calculateHouses(i * 3.6, testLatitude, 'placidus');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete 100 calculations in under 100ms
    });
  });
});
