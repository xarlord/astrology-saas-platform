/**
 * SwissEph Stub
 * Mock implementation of swisseph package for testing
 * Provides the same interface as the real swisseph package
 */

// Zodiac signs
// Exported for potential future use
export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Swiss Ephemeris constants (mock)
export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;

// Flag constants
export const SEFLG_SPEED = 2;
export const SEFLG_SWIEPH = 2;
export const SEFLG_SIDEREAL = 64;

// House system constants
export const SE_PLACIDUS = 'P';
export const SE_KOCH = 'K';
export const SE_PORPHYRY = 'O';
export const SE_WHOLE_SIGN = 'W';
export const SE_EQUAL = 'A';
export const SE_TOPOCENTRIC = 'T';

// Calculation flags
export const SE_CALC_RISE = 1;
export const SE_CALC_MTRANSIT = 2;
export const SE_CALC_ITRANSIT = 4;

/**
 * Set ephemeris path (mock)
 */
export function swe_set_ephe_path(_path: string): void {
  // Mock implementation - does nothing
}

/**
 * Calculate planet position (mock)
 */
export function swe_calc_ut(
  tjdut: number,
  ipl: number,
  _iflag: number
): [number, number, number, number] {
  // Mock: Return realistic planetary positions
  const baseLongitude = (tjdut % 360);
  const offset = ipl * 30; // Each planet offset by 30 degrees

  const longitude = (baseLongitude + offset) % 360;
  const latitude = (ipl % 3 - 1) * 2; // -2, 0, or 2 degrees
  const distance = 1 + (ipl * 0.1); // Slightly increasing distances

  return [longitude, latitude, distance, 0];
}

/**
 * Calculate houses (mock)
 */
export function swe_houses(
  _tjdut: number,
  _geolat: number,
  geolon: number,
  _hsys: string
): [number[], number, number] {
  // Mock: Generate 12 house cusps
  const cusps: number[] = [];
  const ascendant = (geolon % 360);
  const mc = (ascendant + 90) % 360;

  for (let i = 0; i < 12; i++) {
    cusps.push((ascendant + i * 30) % 360);
  }

  // Add armc (not used in most calculations)
  cusps.push(mc);

  return [cusps, ascendant, mc];
}

/**
 * Calculate julian day (mock)
 */
export function swe_julday(
  year: number,
  month: number,
  day: number,
  hour: number
): number {
  // Simplified Julian day calculation
  return year * 365 + month * 30 + day + hour / 24;
}

/**
 * Get zodiac sign from longitude
 */
// function _getZodiacSign(longitude: number): string {
//   const index = Math.floor(longitude / 30) % 12;
//   return ZODIAC_SIGNS[index];
// }

// Export all functions as a single object
export const swisseph = {
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SE_MEAN_NODE,
  SE_TRUE_NODE,
  SEFLG_SPEED,
  SEFLG_SWIEPH,
  SEFLG_SIDEREAL,
  SE_PLACIDUS,
  SE_KOCH,
  SE_PORPHYRY,
  SE_WHOLE_SIGN,
  SE_EQUAL,
  SE_TOPOCENTRIC,
  SE_CALC_RISE,
  SE_CALC_MTRANSIT,
  SE_CALC_ITRANSIT,
  swe_set_ephe_path,
  swe_calc_ut,
  swe_houses,
  swe_julday,
};

export default swisseph;
