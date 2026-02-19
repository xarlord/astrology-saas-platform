/**
 * Test utility functions for Swiss Ephemeris service tests
 */

/**
 * Convert JavaScript Date to Julian Day
 */
export function toJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  // Algorithm to convert to Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Add fractional day for time
  const fractionalDay = (hour + minute / 60 + second / 3600) / 24;
  jd += fractionalDay - 0.5;

  return jd;
}

/**
 * Normalize degree to 0-360 range
 */
export function normalizeDegree(degree: number): number {
  let normalized = degree % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  // Handle edge case of -0
  if (Object.is(normalized, -0)) {
    normalized = 0;
  }
  return normalized;
}

/**
 * Calculate angular distance between two degrees
 */
export function angularDistance(deg1: number, deg2: number): number {
  const diff = Math.abs(deg1 - deg2);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Assert planet position is valid
 */
export function assertPlanetPosition(position: any, planetName: string) {
  expect(position).toBeDefined();
  expect(position).toHaveProperty('longitude');
  expect(position.longitude).toBeGreaterThanOrEqual(0);
  expect(position.longitude).toBeLessThan(360);
  expect(position).toHaveProperty('latitude');
  expect(position).toHaveProperty('speed');
  expect(position).toHaveProperty('sign');
}

/**
 * Assert aspect is valid
 */
export function assertAspect(aspect: any) {
  expect(aspect).toBeDefined();
  expect(aspect).toHaveProperty('planet1');
  expect(aspect).toHaveProperty('planet2');
  expect(aspect).toHaveProperty('aspect');
  expect(aspect).toHaveProperty('orb');
  expect(aspect.orb).toBeGreaterThanOrEqual(0);
}

/**
 * Assert house cusp is valid
 */
export function assertHouseCusp(house: any, houseNumber: number) {
  expect(house).toBeDefined();
  expect(house).toHaveProperty('cusp');
  expect(house.cusp).toBeGreaterThanOrEqual(0);
  expect(house.cusp).toBeLessThan(360);
}
