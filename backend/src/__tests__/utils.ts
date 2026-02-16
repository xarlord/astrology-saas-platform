/**
 * Test Utilities and Helpers
 * Provides reusable test fixtures, mocks, and helper functions
 */

import { PlanetPosition, HouseCusp, Aspect } from '../../types/chart';

// ============================================================================
// TEST FIXTURES
// ============================================================================

/**
 * Sample chart data for testing
 */
export const mockChart = {
  id: 'test-chart-1',
  userId: 'test-user-1',
  name: 'Test Chart',
  type: 'natal',
  birthData: {
    date: new Date('1990-06-15T12:00:00Z'),
    time: '12:00',
    place: {
      name: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
    },
    timeUnknown: false,
  },
  settings: {
    houseSystem: 'placidus',
    zodiac: 'tropical',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Sample calculated chart data
 */
export const mockCalculatedData = {
  planets: [
    {
      planet: 'sun',
      sign: 'gemini',
      degree: 84,
      minute: 30,
      second: 0,
      house: 6,
      retrograde: false,
      latitude: 0,
      longitude: 84.5,
      speed: 0.95,
    },
    {
      planet: 'moon',
      sign: 'libra',
      degree: 184,
      minute: 15,
      second: 0,
      house: 11,
      retrograde: false,
      latitude: 5.2,
      longitude: 184.25,
      speed: 13.2,
    },
    {
      planet: 'mercury',
      sign: 'gemini',
      degree: 72,
      minute: 45,
      second: 0,
      house: 5,
      retrograde: false,
      latitude: -1.8,
      longitude: 72.75,
      speed: 1.2,
    },
  ] as PlanetPosition[],
  houses: [
    {
      house: 1,
      sign: 'aries',
      degree: 15,
      minute: 30,
      second: 0,
    },
    {
      house: 2,
      sign: 'taurus',
      degree: 45,
      minute: 15,
      second: 0,
    },
    {
      house: 3,
      sign: 'gemini',
      degree: 72,
      minute: 30,
      second: 0,
    },
    {
      house: 4,
      sign: 'cancer',
      degree: 95,
      minute: 45,
      second: 0,
    },
    {
      house: 5,
      sign: 'leo',
      degree: 125,
      minute: 15,
      second: 0,
    },
    {
      house: 6,
      sign: 'virgo',
      degree: 150,
      minute: 30,
      second: 0,
    },
    {
      house: 7,
      sign: 'libra',
      degree: 184,
      minute: 30,
      second: 0,
    },
    {
      house: 8,
      sign: 'scorpio',
      degree: 210,
      minute: 45,
      second: 0,
    },
    {
      house: 9,
      sign: 'sagittarius',
      degree: 240,
      minute: 30,
      second: 0,
    },
    {
      house: 10,
      sign: 'capricorn',
      degree: 270,
      minute: 15,
      second: 0,
    },
    {
      house: 11,
      sign: 'aquarius',
      degree: 300,
      minute: 30,
      second: 0,
    },
    {
      house: 12,
      sign: 'pisces',
      degree: 330,
      minute: 45,
      second: 0,
    },
  ] as HouseCusp[],
  aspects: [
    {
      planet1: 'sun',
      planet2: 'moon',
      type: 'square' as const,
      degree: 90,
      minute: 15,
      second: 0,
      orb: 0.25,
      applying: true,
      separating: false,
    },
    {
      planet1: 'mercury',
      planet2: 'sun',
      type: 'conjunction' as const,
      degree: 11,
      minute: 45,
      second: 0,
      orb: 2.5,
      applying: true,
      separating: false,
    },
  ] as Aspect[],
};

// ============================================================================
// MOCK HELPERS
// ============================================================================

/**
 * Mock authenticated user
 */
export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  timezone: 'America/New_York',
  createdAt: new Date('2024-01-01'),
  subscription: {
    plan: 'free' as const,
    status: 'active' as const,
  },
  preferences: {
    theme: 'light' as const,
    defaultHouseSystem: 'placidus' as const,
    defaultZodiac: 'tropical' as const,
    aspectOrbs: {
      conjunction: 10,
      opposition: 8,
      trine: 8,
      square: 8,
      sextile: 6,
    },
  },
};

/**
 * Mock JWT token
 */
export const mockAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

/**
 * Mock request with authenticated user
 */
export const mockRequest = (overrides = {}) => ({
  user: mockUser,
  headers: {
    authorization: `Bearer ${mockAuthToken}`,
  },
  params: {},
  query: {},
  body: {},
  ...overrides,
});

/**
 * Mock response object
 */
export const mockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    locals: {},
  };
  return res;
};

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Clean test database
 */
export async function cleanDatabase(db: any) {
  // Clean tables in order of dependencies
  await db('audit_log').del();
  await db('transit_readings').del();
  await db('interpretations').del();
  await db('charts').del();
  await db('refresh_tokens').del();
  await db('users').del();
}

/**
 * Create a test user in the database
 */
export async function createTestUser(db: any, userData = {}) {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const [user] = await db('users').insert({
    email: userData.email || 'test@example.com',
    password: hashedPassword,
    name: userData.name || 'Test User',
    timezone: userData.timezone || 'UTC',
    created_at: new Date(),
    updated_at: new Date(),
  }).returning('*');

  return user;
}

/**
 * Create a test chart in the database
 */
export async function createTestChart(db: any, userId: string, chartData = {}) {
  const [chart] = await db('charts').insert({
    user_id: userId,
    name: chartData.name || 'Test Chart',
    type: chartData.type || 'natal',
    birth_date: chartData.birth_date || new Date('1990-01-01'),
    birth_time: chartData.birth_time || '12:00',
    birth_place: chartData.birth_place || 'New York',
    latitude: chartData.latitude || 40.7128,
    longitude: chartData.longitude || -74.0060,
    timezone: chartData.timezone || 'America/New_York',
    time_unknown: chartData.time_unknown || false,
    house_system: chartData.house_system || 'placidus',
    zodiac: chartData.zodiac || 'tropical',
    calculated_data: chartData.calculated_data || {},
    created_at: new Date(),
    updated_at: new Date(),
  }).returning('*');

  return chart;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Convert date string to Julian Day
 */
export function toJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    367 * year -
    Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
    Math.floor(275 * month / 9) +
    day +
    (hour + minute / 60 + second / 3600) / 24 -
    730531.5
  );
}

/**
 * Normalize degree to 0-360 range
 */
export function normalizeDegree(degree: number): number {
  let normalized = degree % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Calculate angular distance between two points
 */
export function angularDistance(deg1: number, deg2: number): number {
  const diff = Math.abs(deg1 - deg2);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Get sign from degree
 */
export function getSignFromDegree(degree: number): string {
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  return signs[Math.floor(degree / 30)];
}

/**
 * Get house from degree and house cusps
 */
export function getHouseFromDegree(degree: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];

    if (currentCusp < nextCusp) {
      if (degree >= currentCusp && degree < nextCusp) {
        return i + 1;
      }
    } else {
      // House crosses 0°
      if (degree >= currentCusp || degree < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1; // Default
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that a value is a valid planet position
 */
export function assertPlanetPosition(planet: any): asserts planet is PlanetPosition {
  expect(planet).toHaveProperty('planet');
  expect(planet).toHaveProperty('sign');
  expect(planet).toHaveProperty('degree');
  expect(planet).toHaveProperty('minute');
  expect(planet).toHaveProperty('second');
  expect(planet).toHaveProperty('house');
  expect(planet.planet).toMatch(/^(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)$/);
  expect(planet.sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
  expect(planet.degree).toBeGreaterThanOrEqual(0);
  expect(planet.degree).toBeLessThan(360);
  expect(planet.minute).toBeGreaterThanOrEqual(0);
  expect(planet.minute).toBeLessThan(60);
  expect(planet.house).toBeGreaterThanOrEqual(1);
  expect(planet.house).toBeLessThanOrEqual(12);
}

/**
 * Assert that a value is a valid aspect
 */
export function assertAspect(aspect: any): asserts aspect is Aspect {
  expect(aspect).toHaveProperty('planet1');
  expect(aspect).toHaveProperty('planet2');
  expect(aspect).toHaveProperty('type');
  expect(aspect).toHaveProperty('orb');
  expect(aspect.type).toMatch(/^(conjunction|opposition|trine|square|sextile|quincunx|semi-sextile)$/);
  expect(aspect.orb).toBeGreaterThanOrEqual(0);
}

/**
 * Assert that a value is a valid house cusp
 */
export function assertHouseCusp(house: any): asserts house is HouseCusp {
  expect(house).toHaveProperty('house');
  expect(house).toHaveProperty('sign');
  expect(house).toHaveProperty('degree');
  expect(house.house).toBeGreaterThanOrEqual(1);
  expect(house.house).toBeLessThanOrEqual(12);
  expect(house.sign).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/);
  expect(house.degree).toBeGreaterThanOrEqual(0);
  expect(house.degree).toBeLessThan(360);
}
