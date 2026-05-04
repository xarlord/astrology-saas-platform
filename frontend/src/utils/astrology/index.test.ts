/**
 * Astrology Utilities Barrel File Tests
 * Verify all astrology utility exports are available
 */

import { describe, it, expect } from 'vitest';
import * as astrology from './index';

describe('astrology utilities barrel exports', () => {
  describe('planet position exports', () => {
    it('should export calculatePlanetPosition', () => {
      expect(astrology.calculatePlanetPosition).toBeDefined();
      expect(typeof astrology.calculatePlanetPosition).toBe('function');
    });

    it('should export calculateAllPlanetPositions', () => {
      expect(astrology.calculateAllPlanetPositions).toBeDefined();
      expect(typeof astrology.calculateAllPlanetPositions).toBe('function');
    });

    it('should export assignPlanetsToHouses', () => {
      expect(astrology.assignPlanetsToHouses).toBeDefined();
      expect(typeof astrology.assignPlanetsToHouses).toBe('function');
    });

    it('should export getZodiacSign', () => {
      expect(astrology.getZodiacSign).toBeDefined();
      expect(typeof astrology.getZodiacSign).toBe('function');
    });

    it('should export getSignElement', () => {
      expect(astrology.getSignElement).toBeDefined();
      expect(typeof astrology.getSignElement).toBe('function');
    });

    it('should export getSignQuality', () => {
      expect(astrology.getSignQuality).toBeDefined();
      expect(typeof astrology.getSignQuality).toBe('function');
    });

    it('should export getDegreeInSign', () => {
      expect(astrology.getDegreeInSign).toBeDefined();
      expect(typeof astrology.getDegreeInSign).toBe('function');
    });

    it('should export normalizeAngle', () => {
      expect(astrology.normalizeAngle).toBeDefined();
      expect(typeof astrology.normalizeAngle).toBe('function');
    });

    it('should export dateToJulianDay', () => {
      expect(astrology.dateToJulianDay).toBeDefined();
      expect(typeof astrology.dateToJulianDay).toBe('function');
    });

    it('should export julianCenturies', () => {
      expect(astrology.julianCenturies).toBeDefined();
      expect(typeof astrology.julianCenturies).toBe('function');
    });

    it('should export formatPosition', () => {
      expect(astrology.formatPosition).toBeDefined();
      expect(typeof astrology.formatPosition).toBe('function');
    });

    it('should export getPlanetSymbol', () => {
      expect(astrology.getPlanetSymbol).toBeDefined();
      expect(typeof astrology.getPlanetSymbol).toBe('function');
    });

    it('should export isRetrograde', () => {
      expect(astrology.isRetrograde).toBeDefined();
      expect(typeof astrology.isRetrograde).toBe('function');
    });

    it('should export PLANET_SYMBOLS constant', () => {
      expect(astrology.PLANET_SYMBOLS).toBeDefined();
      expect(typeof astrology.PLANET_SYMBOLS).toBe('object');
    });
  });

  describe('aspect calculator exports', () => {
    it('should export angularDifference', () => {
      expect(astrology.angularDifference).toBeDefined();
      expect(typeof astrology.angularDifference).toBe('function');
    });

    it('should export findAspect', () => {
      expect(astrology.findAspect).toBeDefined();
      expect(typeof astrology.findAspect).toBe('function');
    });

    it('should export isAspectApplying', () => {
      expect(astrology.isAspectApplying).toBeDefined();
      expect(typeof astrology.isAspectApplying).toBe('function');
    });

    it('should export calculateAspects', () => {
      expect(astrology.calculateAspects).toBeDefined();
      expect(typeof astrology.calculateAspects).toBe('function');
    });

    it('should export calculateNatalAspects', () => {
      expect(astrology.calculateNatalAspects).toBeDefined();
      expect(typeof astrology.calculateNatalAspects).toBe('function');
    });

    it('should export getAspectDefinition', () => {
      expect(astrology.getAspectDefinition).toBeDefined();
      expect(typeof astrology.getAspectDefinition).toBe('function');
    });

    it('should export getMajorAspects', () => {
      expect(astrology.getMajorAspects).toBeDefined();
      expect(typeof astrology.getMajorAspects).toBe('function');
    });

    it('should export detectAspectPatterns', () => {
      expect(astrology.detectAspectPatterns).toBeDefined();
      expect(typeof astrology.detectAspectPatterns).toBe('function');
    });
  });

  describe('house calculator exports', () => {
    it('should export calculateLST', () => {
      expect(astrology.calculateLST).toBeDefined();
      expect(typeof astrology.calculateLST).toBe('function');
    });

    it('should export calculateRAMC', () => {
      expect(astrology.calculateRAMC).toBeDefined();
      expect(typeof astrology.calculateRAMC).toBe('function');
    });

    it('should export calculateHouses', () => {
      expect(astrology.calculateHouses).toBeDefined();
      expect(typeof astrology.calculateHouses).toBe('function');
    });

    it('should export calculatePlacidusHouses', () => {
      expect(astrology.calculatePlacidusHouses).toBeDefined();
      expect(typeof astrology.calculatePlacidusHouses).toBe('function');
    });

    it('should export calculateKochHouses', () => {
      expect(astrology.calculateKochHouses).toBeDefined();
      expect(typeof astrology.calculateKochHouses).toBe('function');
    });

    it('should export calculateWholeSignHouses', () => {
      expect(astrology.calculateWholeSignHouses).toBeDefined();
      expect(typeof astrology.calculateWholeSignHouses).toBe('function');
    });

    it('should export calculateEqualHouses', () => {
      expect(astrology.calculateEqualHouses).toBeDefined();
      expect(typeof astrology.calculateEqualHouses).toBe('function');
    });

    it('should export calculatePorphyryHouses', () => {
      expect(astrology.calculatePorphyryHouses).toBeDefined();
      expect(typeof astrology.calculatePorphyryHouses).toBe('function');
    });

    it('should export calculateHousesFromData', () => {
      expect(astrology.calculateHousesFromData).toBeDefined();
      expect(typeof astrology.calculateHousesFromData).toBe('function');
    });

    it('should export getHouseSystemName', () => {
      expect(astrology.getHouseSystemName).toBeDefined();
      expect(typeof astrology.getHouseSystemName).toBe('function');
    });
  });

  describe('angle calculator exports', () => {
    it('should export calculateAngles', () => {
      expect(astrology.calculateAngles).toBeDefined();
      expect(typeof astrology.calculateAngles).toBe('function');
    });

    it('should export calculateAscendantAngle', () => {
      expect(astrology.calculateAscendantAngle).toBeDefined();
      expect(typeof astrology.calculateAscendantAngle).toBe('function');
    });

    it('should export calculateMidheaven', () => {
      expect(astrology.calculateMidheaven).toBeDefined();
      expect(typeof astrology.calculateMidheaven).toBe('function');
    });

    it('should export calculateDescendantAngle', () => {
      expect(astrology.calculateDescendantAngle).toBeDefined();
      expect(typeof astrology.calculateDescendantAngle).toBe('function');
    });

    it('should export calculateIC', () => {
      expect(astrology.calculateIC).toBeDefined();
      expect(typeof astrology.calculateIC).toBe('function');
    });

    it('should export calculateVertex', () => {
      expect(astrology.calculateVertex).toBeDefined();
      expect(typeof astrology.calculateVertex).toBe('function');
    });

    it('should export calculatePartOfFortune', () => {
      expect(astrology.calculatePartOfFortune).toBeDefined();
      expect(typeof astrology.calculatePartOfFortune).toBe('function');
    });

    it('should export calculatePartOfSpirit', () => {
      expect(astrology.calculatePartOfSpirit).toBeDefined();
      expect(typeof astrology.calculatePartOfSpirit).toBe('function');
    });

    it('should export calculateArabicParts', () => {
      expect(astrology.calculateArabicParts).toBeDefined();
      expect(typeof astrology.calculateArabicParts).toBe('function');
    });

    it('should export getAngleSymbol', () => {
      expect(astrology.getAngleSymbol).toBeDefined();
      expect(typeof astrology.getAngleSymbol).toBe('function');
    });

    it('should export isDayBirth', () => {
      expect(astrology.isDayBirth).toBeDefined();
      expect(typeof astrology.isDayBirth).toBe('function');
    });

    it('should export formatAngle', () => {
      expect(astrology.formatAngle).toBeDefined();
      expect(typeof astrology.formatAngle).toBe('function');
    });
  });
});
