/**
 * Swiss Ephemeris Service (Mock Implementation)
 * Provides mock astrological calculations for testing when native module is unavailable
 */

// Zodiac signs
export const ZODIAC_SIGNS = [
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
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Planet symbols for display
export const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  meanNode: '☋',
  trueNode: '☊',
};

// Aspect types with orbs
export const ASPECT_TYPES = {
  conjunction: { angle: 0, orb: 10, symbol: '☌', harmonious: false },
  opposition: { angle: 180, orb: 8, symbol: '☍', harmonious: false },
  trine: { angle: 120, orb: 8, symbol: '△', harmonious: true },
  square: { angle: 90, orb: 8, symbol: '□', harmonious: false },
  sextile: { angle: 60, orb: 6, symbol: '⚹', harmonious: true },
  quincunx: { angle: 150, orb: 3, symbol: '⚻', harmonious: false },
  semiSextile: { angle: 30, orb: 2, symbol: '⚼', harmonious: true },
} as const;

export type AspectType = keyof typeof ASPECT_TYPES;

/**
 * Calculate natal chart (mock)
 */
export function calculateNatalChart(params: {
  birthDate: Date;
  birthTime: string;
  latitude: number;
  longitude: number;
  houseSystem: string;
}) {
  // Generate realistic mock planetary positions
  const baseLongitude = (params.birthDate.getTime() % 360);

  return {
    planets: {
      sun: { longitude: (baseLongitude + 0) % 360, latitude: 0, speed: 1, sign: getZodiacSign((baseLongitude + 0) % 360) },
      moon: { longitude: (baseLongitude + 45) % 360, latitude: 5, speed: 13, sign: getZodiacSign((baseLongitude + 45) % 360) },
      mercury: { longitude: (baseLongitude + 20) % 360, latitude: 2, speed: 1.5, sign: getZodiacSign((baseLongitude + 20) % 360) },
      venus: { longitude: (baseLongitude + 60) % 360, latitude: -1, speed: 1.2, sign: getZodiacSign((baseLongitude + 60) % 360) },
      mars: { longitude: (baseLongitude + 90) % 360, latitude: 1, speed: 0.8, sign: getZodiacSign((baseLongitude + 90) % 360) },
      jupiter: { longitude: (baseLongitude + 120) % 360, latitude: -2, speed: 0.3, sign: getZodiacSign((baseLongitude + 120) % 360) },
      saturn: { longitude: (baseLongitude + 180) % 360, latitude: 2, speed: 0.2, sign: getZodiacSign((baseLongitude + 180) % 360) },
      uranus: { longitude: (baseLongitude + 240) % 360, latitude: -1, speed: 0.1, sign: getZodiacSign((baseLongitude + 240) % 360) },
      neptune: { longitude: (baseLongitude + 270) % 360, latitude: 1, speed: 0.08, sign: getZodiacSign((baseLongitude + 270) % 360) },
      pluto: { longitude: (baseLongitude + 300) % 360, latitude: -3, speed: 0.05, sign: getZodiacSign((baseLongitude + 300) % 360) },
    },
    houses: [
      { cusp: 0, size: 30 },
      { cusp: 30, size: 30 },
      { cusp: 60, size: 30 },
      { cusp: 90, size: 30 },
      { cusp: 120, size: 30 },
      { cusp: 150, size: 30 },
      { cusp: 180, size: 30 },
      { cusp: 210, size: 30 },
      { cusp: 240, size: 30 },
      { cusp: 270, size: 30 },
      { cusp: 300, size: 30 },
      { cusp: 330, size: 30 },
    ],
    ascendant: (baseLongitude + 15) % 360,
    midheaven: (baseLongitude + 90) % 360,
    elements: {
      fire: 3,
      earth: 2,
      air: 3,
      water: 2,
    },
    modalities: {
      cardinal: 3,
      fixed: 3,
      mutable: 4,
    },
  };
}

/**
 * Calculate transits (mock)
 */
export function calculateTransits(params: {
  birthDate: Date;
  transitDate: Date;
  latitude: number;
  longitude: number;
}) {
  const baseLongitude = (params.transitDate.getTime() % 360);

  return {
    transitPlanets: {
      sun: { longitude: (baseLongitude + 0) % 360, latitude: 0, speed: 1 },
      moon: { longitude: (baseLongitude + 50) % 360, latitude: 5, speed: 13 },
      mercury: { longitude: (baseLongitude + 25) % 360, latitude: 2, speed: 1.5 },
      venus: { longitude: (baseLongitude + 65) % 360, latitude: -1, speed: 1.2 },
      mars: { longitude: (baseLongitude + 95) % 360, latitude: 1, speed: 0.8 },
    },
    aspects: [
      {
        planet1: 'sun',
        planet2: 'moon',
        type: 'trine',
        orb: 3,
        applying: true,
      },
      {
        planet1: 'mercury',
        planet2: 'venus',
        type: 'sextile',
        orb: 2,
        applying: false,
      },
    ],
  };
}

/**
 * Calculate compatibility between two charts (mock)
 */
export function calculateCompatibility(_chart1: Record<string, unknown>, _chart2: Record<string, unknown>) {
  return {
    overallScore: 75,
    romanticScore: 80,
    communicationScore: 70,
    emotionalScore: 75,
    valuesScore: 72,
    aspects: [
      {
        planet1: { chart: 1, planet: 'sun' },
        planet2: { chart: 2, planet: 'moon' },
        type: 'trine',
        orb: 5,
        harmonious: true,
      },
      {
        planet1: { chart: 1, planet: 'venus' },
        planet2: { chart: 2, planet: 'mars' },
        type: 'sextile',
        orb: 3,
        harmonious: true,
      },
    ],
    strengths: [
      'Strong emotional connection',
      'Good communication',
      'Shared values',
    ],
    challenges: [
      'Different approaches to conflict',
      'Need for compromise',
    ],
  };
}

/**
 * Calculate lunar return (mock)
 */
export function calculateLunarReturn(params: {
  birthDate: Date;
  birthTime: string;
  birthLatitude: number;
  birthLongitude: number;
  targetMonth: Date;
}) {
  const baseLongitude = (params.targetMonth.getTime() % 360);

  return {
    returnDate: params.targetMonth,
    moonPosition: {
      longitude: (baseLongitude + 45) % 360,
      latitude: 5,
      sign: getZodiacSign((baseLongitude + 45) % 360),
    },
    planets: {
      sun: { longitude: (baseLongitude + 0) % 360, sign: getZodiacSign((baseLongitude + 0) % 360) },
      moon: { longitude: (baseLongitude + 45) % 360, sign: getZodiacSign((baseLongitude + 45) % 360) },
      mercury: { longitude: (baseLongitude + 20) % 360, sign: getZodiacSign((baseLongitude + 20) % 360) },
    },
    houses: [
      { cusp: 0, size: 30 },
      { cusp: 30, size: 30 },
      { cusp: 60, size: 30 },
      { cusp: 90, size: 30 },
      { cusp: 120, size: 30 },
      { cusp: 150, size: 30 },
      { cusp: 180, size: 30 },
      { cusp: 210, size: 30 },
      { cusp: 240, size: 30 },
      { cusp: 270, size: 30 },
      { cusp: 300, size: 30 },
      { cusp: 330, size: 30 },
    ],
    interpretation: {
      theme: 'Emotional renewal and focus',
      keyAreas: ['Home', 'Family', 'Emotions'],
      advice: 'Focus on emotional needs and domestic matters this month.',
    },
  };
}

/**
 * Calculate composite chart (mock)
 */
export function calculateCompositeChart(chart1: Record<string, unknown>, chart2: Record<string, unknown>) {
  const getSunLongitude = (chart: Record<string, unknown>): number => {
    const planets = chart.planets as Record<string, { longitude: number }> | undefined;
    return planets?.sun?.longitude ?? 0;
  };
  const baseLongitude = (getSunLongitude(chart1) + getSunLongitude(chart2)) / 2;

  return {
    planets: {
      sun: { longitude: baseLongitude % 360, sign: getZodiacSign(baseLongitude % 360) },
      moon: { longitude: (baseLongitude + 45) % 360, sign: getZodiacSign((baseLongitude + 45) % 360) },
      mercury: { longitude: (baseLongitude + 20) % 360, sign: getZodiacSign((baseLongitude + 20) % 360) },
    },
    houses: [
      { cusp: 0, size: 30 },
      { cusp: 30, size: 30 },
      { cusp: 60, size: 30 },
      { cusp: 90, size: 30 },
      { cusp: 120, size: 30 },
      { cusp: 150, size: 30 },
      { cusp: 180, size: 30 },
      { cusp: 210, size: 30 },
      { cusp: 240, size: 30 },
      { cusp: 270, size: 30 },
      { cusp: 300, size: 30 },
      { cusp: 330, size: 30 },
    ],
    ascendant: (baseLongitude + 15) % 360,
    midheaven: (baseLongitude + 90) % 360,
  };
}

/**
 * Get zodiac sign from longitude
 */
function getZodiacSign(longitude: number): ZodiacSign {
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC_SIGNS[index];
}

/**
 * Convert Julian day to date/time
 * Uses the standard astronomical algorithm
 */
export function juldayToDate(jd: number): Date {
  // Julian Day to Gregorian calendar conversion
  let z = Math.floor(jd + 0.5);
  let f = jd + 0.5 - z;

  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  // Day including fractional part
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const dayInt = Math.floor(day);
  const hours = Math.floor((day - dayInt) * 24);

  return new Date(Date.UTC(year, month - 1, dayInt, hours, 0, 0));
}

/**
 * Calculate aspects between two points
 */
export function calculateAspects(longitude1: number, longitude2: number) {
  const diff = Math.abs(longitude1 - longitude2);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;

  for (const [type, config] of Object.entries(ASPECT_TYPES)) {
    if (Math.abs(normalizedDiff - config.angle) <= config.orb) {
      return {
        type,
        orb: Math.abs(normalizedDiff - config.angle),
        angle: config.angle,
      };
    }
  }

  return null;
}

// Export all functions and constants as swissEphemeris object
export const swissEphemeris = {
  calculateNatalChart,
  calculateTransits,
  calculateCompatibility,
  calculateLunarReturn,
  calculateCompositeChart,
  calculateAspects,
  juldayToDate,
  ZODIAC_SIGNS,
  PLANET_SYMBOLS,
  ASPECT_TYPES,
};

export default swissEphemeris;
