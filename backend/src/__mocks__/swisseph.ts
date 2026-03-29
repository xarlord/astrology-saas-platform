/**
 * Mock for swisseph module
 * Used in mutation testing to avoid native dependency issues
 */

export const swisseph = {
  swe_julday: jest.fn().mockReturnValue(2451545.0),
  swe_calc_ut: jest.fn().mockReturnValue({
    longitude: 0,
    latitude: 0,
    distance: 1,
    longitudeSpeed: 0,
    latitudeSpeed: 0,
    distanceSpeed: 0,
    error: null,
  }),
  swe_houses: jest.fn().mockReturnValue({
    houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
    ascendant: 0,
    mc: 90,
    armc: 90,
    vertex: 180,
  }),
  swe_set_ephe_path: jest.fn(),
  swe_close: jest.fn(),
  SE_SUN: 0,
  SE_MOON: 1,
  SE_MERCURY: 2,
  SE_VENUS: 3,
  SE_MARS: 4,
  SE_JUPITER: 5,
  SE_SATURN: 6,
  SE_URANUS: 7,
  SE_NEPTUNE: 8,
  SE_PLUTO: 9,
  SE_TRUE_NODE: 11,
  SEFLG_SPEED: 256,
  SEFLG_SWIEPH: 2,
};

export default swisseph;
