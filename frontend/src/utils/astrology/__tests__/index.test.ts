/**
 * Astrology Utilities Index Tests
 */

import { describe, it, expect } from 'vitest';
import * as astrology from '../index';

describe('astrology index', () => {
  it('should export all expected utilities', () => {
    // Types
    expect(typeof astrology).toBe('object');

    // Check that key functions are exported
    expect(typeof astrology.calculatePlanetPosition).toBe('function');
    expect(typeof astrology.calculateAllPlanetPositions).toBe('function');
    expect(typeof astrology.assignPlanetsToHouses).toBe('function');
    expect(typeof astrology.getZodiacSign).toBe('function');
    expect(typeof astrology.getSignElement).toBe('function');
    expect(typeof astrology.getSignQuality).toBe('function');
    expect(typeof astrology.getDegreeInSign).toBe('function');
    expect(typeof astrology.normalizeAngle).toBe('function');
    expect(typeof astrology.dateToJulianDay).toBe('function');
    expect(typeof astrology.julianCenturies).toBe('function');
    expect(typeof astrology.formatPosition).toBe('function');
    expect(typeof astrology.getPlanetSymbol).toBe('function');
    expect(typeof astrology.isRetrograde).toBe('function');

    // Aspect exports
    expect(typeof astrology.angularDifference).toBe('function');
    expect(typeof astrology.findAspect).toBe('function');
    expect(typeof astrology.isAspectApplying).toBe('function');
    expect(typeof astrology.calculateAspects).toBe('function');
    expect(typeof astrology.calculateNatalAspects).toBe('function');
    expect(typeof astrology.getAspectDefinition).toBe('function');
    expect(typeof astrology.getMajorAspects).toBe('function');
    expect(typeof astrology.detectAspectPatterns).toBe('function');

    // House exports
    expect(typeof astrology.calculateLST).toBe('function');
    expect(typeof astrology.calculateRAMC).toBe('function');
    expect(typeof astrology.calculateHouses).toBe('function');
    expect(typeof astrology.calculatePlacidusHouses).toBe('function');
    expect(typeof astrology.calculateKochHouses).toBe('function');
    expect(typeof astrology.calculateWholeSignHouses).toBe('function');
    expect(typeof astrology.calculateEqualHouses).toBe('function');
    expect(typeof astrology.calculatePorphyryHouses).toBe('function');
    expect(typeof astrology.calculateHousesFromData).toBe('function');
    expect(typeof astrology.getHouseSystemName).toBe('function');

    // Angle exports
    expect(typeof astrology.calculateAngles).toBe('function');
    expect(typeof astrology.calculateAscendantAngle).toBe('function');
    expect(typeof astrology.calculateMidheaven).toBe('function');
    expect(typeof astrology.calculateDescendantAngle).toBe('function');
    expect(typeof astrology.calculateIC).toBe('function');
    expect(typeof astrology.calculateVertex).toBe('function');
    expect(typeof astrology.calculatePartOfFortune).toBe('function');
    expect(typeof astrology.calculatePartOfSpirit).toBe('function');
    expect(typeof astrology.calculateArabicParts).toBe('function');
    expect(typeof astrology.getAngleSymbol).toBe('function');
    expect(typeof astrology.isDayBirth).toBe('function');
    expect(typeof astrology.formatAngle).toBe('function');

    // Constants
    expect(typeof astrology.PLANET_SYMBOLS).toBe('object');
  });

  it('should export PLANET_SYMBOLS constant', () => {
    expect(astrology.PLANET_SYMBOLS).toBeDefined();
    expect(typeof astrology.PLANET_SYMBOLS).toBe('object');
  });
});
