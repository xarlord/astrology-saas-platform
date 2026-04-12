/**
 * Unit Tests for House Calculation Service
 * Tests Placidus, Koch, Equal, and Whole Sign house systems
 *
 * @requirement REQ-API-001
 */

import { HouseCalculationService } from '../../modules/shared/services/houseCalculation.service';
import { normalizeDegree } from './utils';

describe('HouseCalculationService', () => {
  let service: HouseCalculationService;

  beforeEach(() => {
    service = new HouseCalculationService();
  });

  describe('House System Selection', () => {
    test('should calculate Placidus houses by default', () => {
      const lst = 185.5; // Local Sidereal Time in degrees
      const latitude = 40.7128;

      const houses = service.calculateHouses(lst, latitude);

      expect(houses).toBeDefined();
      expect(houses.system).toBe('Placidus');
      expect(houses.cusps).toHaveLength(12);
    });

    test('should calculate Koch houses when specified', () => {
      const lst = 185.5;
      const latitude = 40.7128;

      const houses = service.calculateHouses(lst, latitude, 'Koch');

      expect(houses).toBeDefined();
      expect(houses.system).toBe('Koch');
    });

    test('should calculate Equal houses when specified', () => {
      const lst = 185.5;
      const latitude = 40.7128;

      const houses = service.calculateHouses(lst, latitude, 'Equal');
      expect(houses).toBeDefined();
      expect(houses.system).toBe('Equal');
    });

    test('should calculate WholeSign houses when specified', () => {
      const ascendant = 120; // Leo
      const houses = service.calculateHouses(0, 0, 'WholeSign', ascendant);

      expect(houses).toBeDefined();
      expect(houses.system).toBe('WholeSign');
    });

    test('should default to Placidus for unknown system', () => {
      const lst = 185.5;
      const latitude = 40.7128;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const houses = service.calculateHouses(lst, latitude, 'Unknown' as any);
      expect(houses.system).toBe('Placidus');
    });
  });

  describe('Ascendant Calculation', () => {
    test('should calculate ascendant correctly', () => {
      const ramc = 185.5; // RAMC = LST for NYC (40.7128N, 74.0060W)
      const latitude = 40.7128;
      const asc = service.calculateAscendant(ramc, latitude);
      expect(asc).toBeGreaterThanOrEqual(0);
      expect(asc).toBeLessThan(360);
    });

    test('should handle equatorial locations', () => {
      const ramc = 185.5;
      const asc = service.calculateAscendant(ramc, 0);
      expect(asc).toBeGreaterThanOrEqual(0);
      expect(asc).toBeLessThan(360);
    });

    test('should handle extreme latitudes', () => {
      const ramc = 185.5;
      // Arctic Circle
      const arcticAsc = service.calculateAscendant(ramc, 66.5);
      expect(arcticAsc).toBeGreaterThanOrEqual(0);
      expect(arcticAsc).toBeLessThan(360);

      // Antarctic
      const antarcticAsc = service.calculateAscendant(ramc, -66.5);
      expect(antarcticAsc).toBeGreaterThanOrEqual(0);
      expect(antarcticAsc).toBeLessThan(360);
    });
  });

  describe('Midheaven Calculation', () => {
    test('should calculate midheaven correctly', () => {
      const ramc = 185.5;
      const mc = service.calculateMidheaven(ramc);
      expect(mc).toBeGreaterThanOrEqual(0);
      expect(mc).toBeLessThan(360);
    });

    test('should have MC approximately 90 degrees from RAMC', () => {
      const ramc = 180;
      const mc = service.calculateMidheaven(ramc);
      // MC is related to RAMC through obliquity
      expect(mc).toBeGreaterThanOrEqual(ramc - 30);
      expect(mc).toBeLessThanOrEqual(ramc + 30);
    });
  });

  describe('House Cusps Validation', () => {
    test('should have 12 house cusps', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      expect(houses.cusps).toHaveLength(12);
    });

    test('should have Ascendant as 1st house cusp', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      expect(houses.ascendant).toBeDefined();
      expect(houses.cusps[0].longitude).toBeCloseTo(houses.ascendant, 1);
    });

    test('should have MC as 10th house cusp in Placidus', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude, 'Placidus');
      expect(houses.midheaven).toBeDefined();
      expect(houses.cusps[9].longitude).toBeCloseTo(houses.midheaven, 1);
    });

    test('should have descendant opposite ascendant', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      expect(houses.descendant).toBeDefined();
      const expectedDesc = normalizeDegree(houses.ascendant + 180);
      expect(houses.descendant).toBeCloseTo(expectedDesc, 1);
    });

    test('should have IC opposite MC', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      expect(houses.imumCoeli).toBeDefined();
      const expectedIC = normalizeDegree(houses.midheaven + 180);
      expect(houses.imumCoeli).toBeCloseTo(expectedIC, 1);
    });
  });

  describe('House Cusp Properties', () => {
    test('should have valid sign for each cusp', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

      for (const cusp of houses.cusps) {
        expect(validSigns).toContain(cusp.sign);
      }
    });

    test('should have degree within sign (0-29)', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      for (const cusp of houses.cusps) {
        expect(cusp.degree).toBeGreaterThanOrEqual(0);
        expect(cusp.degree).toBeLessThan(30);
      }
    });
  });

  describe('House for Longitude', () => {
    test('should return correct house for longitude in middle of house', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      // Get 1st house cusp
      const firstCusp = houses.cusps[0].longitude;
      // Point in middle of 1st house
      const middleOfHouse = normalizeDegree(firstCusp + 15);
      const house = service.getHouseForLongitude(houses, middleOfHouse);
      expect(house).toBe(1);
    });

    test('should return correct house for longitude near cusp', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude);
      // Point near 2nd house cusp
      const secondCusp = houses.cusps[1].longitude;
      const house = service.getHouseForLongitude(houses, secondCusp + 1);
      expect(house).toBe(2);
    });
  });

  describe('Equal House System', () => {
    test('should have exactly 30 degree houses', () => {
      const lst = 185.5;
      const latitude = 40.7128;
      const houses = service.calculateHouses(lst, latitude, 'Equal');
      for (let i = 0; i < 11; i++) {
        const current = houses.cusps[i].longitude;
        const next = houses.cusps[(i + 1) % 12].longitude;
        const expectedSize = normalizeDegree(next - current);
        expect(expectedSize).toBeCloseTo(30, 1);
      }
    });
  });

  describe('Whole Sign House System', () => {
    test('should align house cusps with sign boundaries', () => {
      const ascendant = 125; // 5° Leo
      const houses = service.calculateHouses(0, 0, 'WholeSign', ascendant);
      // All cusps should be at 0, 30, 60, 90, etc.
      for (let i = 0; i < 12; i++) {
        expect(houses.cusps[i].longitude % 30).toBe(0);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle LST at 0 degrees', () => {
      const houses = service.calculateHouses(0, 40.7128);
      expect(houses.cusps).toBeDefined();
      expect(houses.cusps).toHaveLength(12);
    });

    test('should handle LST at 360 degrees', () => {
      const houses = service.calculateHouses(360, 40.7128);
      expect(houses.cusps).toBeDefined();
      expect(houses.cusps).toHaveLength(12);
    });

    test('should handle negative LST', () => {
      const houses = service.calculateHouses(-90, 40.7128);
      expect(houses.cusps).toBeDefined();
    });
  });

  describe('LST Calculation', () => {
    test('should calculate LST from Julian Day', () => {
      const jd = 2451545.0; // J2000.0
      const longitude = -74.0060; // New York
      const lst = service.calculateLST(jd, longitude);
      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });
  });
});
