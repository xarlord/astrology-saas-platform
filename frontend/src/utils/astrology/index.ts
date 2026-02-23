/**
 * Astrology Utilities Index
 * Export all calculation utilities
 */

// Types
export * from './types';

// Planet Position Calculator
export {
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
} from './planetPosition';

// Aspect Calculator
export {
  angularDifference,
  findAspect,
  isAspectApplying,
  calculateAspects,
  calculateNatalAspects,
  getAspectDefinition,
  getMajorAspects,
  detectAspectPatterns,
} from './aspects';

// House Calculator
export {
  calculateLST,
  calculateRAMC,
  calculateHouses,
  calculatePlacidusHouses,
  calculateKochHouses,
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePorphyryHouses,
  calculateHousesFromData,
  getHouseSystemName,
} from './houses';

// Angle Calculator
export {
  calculateAngles,
  calculateAscendant as calculateAscendantAngle,
  calculateMidheaven,
  calculateDescendant as calculateDescendantAngle,
  calculateIC,
  calculateVertex,
  calculatePartOfFortune,
  calculatePartOfSpirit,
  calculateArabicParts,
  getAngleSymbol,
  isDayBirth,
  formatAngle,
} from './angles';
