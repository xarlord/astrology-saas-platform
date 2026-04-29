/**
 * Swiss Ephemeris Service (Real Implementation)
 * Provides astronomical calculations using the astronomy-engine library.
 * Functions delegate to AstronomyEngineService and NatalChartService.
 */

import { AstronomyEngineService } from './astronomyEngine.service';
import { NatalChartService } from './natalChart.service';

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

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

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
  semiSextile: { angle: 30, orb: 2, symbol: '⋶', harmonious: true },
} as const;

export type AspectType = keyof typeof ASPECT_TYPES;

// Singleton engine instances
const astronomyEngine = new AstronomyEngineService();
const natalChartService = new NatalChartService();

/**
 * Get zodiac sign from longitude
 */
function getZodiacSign(longitude: number): ZodiacSign {
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30) % 12;
  return ZODIAC_SIGNS[index];
}

/**
 * Calculate natal chart using real astronomy engine
 */
export function calculateNatalChart(params: {
  birthDate: Date;
  birthTime: string;
  latitude: number;
  longitude: number;
  houseSystem: string;
}) {
  const chart = natalChartService.calculateNatalChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    latitude: params.latitude,
    longitude: params.longitude,
    houseSystem: mapHouseSystem(params.houseSystem),
  });

  // Convert NatalChartService output to the legacy swissEphemeris shape
  const planets: Record<
    string,
    { longitude: number; latitude: number; speed: number; sign: string }
  > = {};
  for (const [name, pos] of chart.planets) {
    planets[name.toLowerCase()] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
      sign: pos.sign.toLowerCase(),
    };
  }

  return {
    planets,
    houses: chart.houses.cusps.map((cusp, i) => {
      const nextCusp = chart.houses.cusps[(i + 1) % 12];
      let size = nextCusp.longitude - cusp.longitude;
      if (size <= 0) size += 360;
      return { cusp: cusp.longitude, size };
    }),
    ascendant: chart.houses.ascendant,
    midheaven: chart.houses.midheaven,
    elements: chart.elements,
    modalities: chart.modalities,
  };
}

/**
 * Calculate transits using real planetary positions
 * birthDate is optional — if not provided, only transit positions are returned.
 */
export function calculateTransits(params: {
  birthDate?: Date;
  transitDate: Date;
  latitude: number;
  longitude: number;
}) {
  const transitPositions = astronomyEngine.calculatePlanetaryPositions(
    params.transitDate,
    params.latitude,
    params.longitude,
  );

  // Build transit planets object (lowercase keys)
  const transitPlanets: Record<string, { longitude: number; latitude: number; speed: number }> = {};
  for (const [name, pos] of transitPositions) {
    transitPlanets[name.toLowerCase()] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
    };
  }

  // Calculate aspects between natal and transit planets (if birthDate provided)
  const aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    applying: boolean;
  }> = [];

  if (params.birthDate) {
    const natalPositions = astronomyEngine.calculatePlanetaryPositions(
      params.birthDate,
      params.latitude,
      params.longitude,
    );

    for (const [natalName, natalPos] of natalPositions) {
      for (const [transitName, transitPos] of transitPositions) {
        if (natalName === transitName) continue;

        const diff = angularDistance(natalPos.longitude, transitPos.longitude);

        for (const [type, config] of Object.entries(ASPECT_TYPES)) {
          const deviation = Math.abs(diff - config.angle);
          if (deviation <= config.orb) {
            aspects.push({
              planet1: natalName.toLowerCase(),
              planet2: transitName.toLowerCase(),
              type,
              orb: Math.round(deviation * 100) / 100,
              applying: diff < config.angle,
            });
            break;
          }
        }
      }
    }
  }

  return { transitPlanets, aspects };
}

/**
 * Calculate compatibility between two charts
 * Uses real planetary positions from stored chart data.
 * Scoring is algorithmic (not mock) — aspects are calculated from actual longitudes.
 */
export function calculateCompatibility(
  chart1: Record<string, unknown>,
  chart2: Record<string, unknown>,
) {
  const planets1 = (chart1?.planets ?? {}) as Record<string, { longitude: number }>;
  const planets2 = (chart2?.planets ?? {}) as Record<string, { longitude: number }>;

  // Calculate real aspects between the two charts
  const crossAspects: Array<{
    planet1: { chart: number; planet: string };
    planet2: { chart: number; planet: string };
    type: string;
    orb: number;
    harmonious: boolean;
  }> = [];

  let harmoniousCount = 0;
  let challengingCount = 0;

  for (const [name1, pos1] of Object.entries(planets1)) {
    for (const [name2, pos2] of Object.entries(planets2)) {
      if (typeof pos1?.longitude !== 'number' || typeof pos2?.longitude !== 'number') continue;

      const diff = angularDistance(pos1.longitude, pos2.longitude);

      for (const [type, config] of Object.entries(ASPECT_TYPES)) {
        const deviation = Math.abs(diff - config.angle);
        if (deviation <= config.orb) {
          const isHarmonious = type === 'trine' || type === 'sextile' || type === 'semiSextile';
          if (isHarmonious) harmoniousCount++;
          else challengingCount++;

          crossAspects.push({
            planet1: { chart: 1, planet: name1 },
            planet2: { chart: 2, planet: name2 },
            type,
            orb: Math.round(deviation * 100) / 100,
            harmonious: isHarmonious,
          });
          break;
        }
      }
    }
  }

  // Score based on aspect ratios
  const total = harmoniousCount + challengingCount || 1;
  const overallScore = Math.round(50 + (harmoniousCount / total) * 50);

  // Deterministic category scores based on planet-domain associations
  const romanticPlanets = ['Venus', 'Mars', 'Moon'];
  const communicationPlanets = ['Mercury', 'Jupiter'];
  const emotionalPlanets = ['Moon', 'Venus', 'Neptune'];
  const valuesPlanets = ['Venus', 'Saturn', 'Jupiter'];

  function categoryScore(relevantPlanets: string[]): number {
    const relevant = crossAspects.filter(
      (a) =>
        relevantPlanets.includes(a.planet1.planet) || relevantPlanets.includes(a.planet2.planet),
    );
    if (relevant.length === 0) return overallScore; // Fall back to overall if no relevant aspects
    const harm = relevant.filter((a) => a.harmonious).length;
    const challenge = relevant.filter((a) => !a.harmonious).length;
    const catTotal = harm + challenge || 1;
    return Math.min(100, Math.max(0, Math.round(50 + (harm / catTotal) * 50)));
  }

  const romanticScore = categoryScore(romanticPlanets);
  const communicationScore = categoryScore(communicationPlanets);
  const emotionalScore = categoryScore(emotionalPlanets);
  const valuesScore = categoryScore(valuesPlanets);

  // Generate strengths and challenges from actual aspects
  const strengths = crossAspects
    .filter((a) => a.harmonious)
    .slice(0, 3)
    .map((a) => `${a.planet1.planet} ${a.type} ${a.planet2.planet} — harmonious connection`);

  const challenges = crossAspects
    .filter((a) => !a.harmonious)
    .slice(0, 2)
    .map((a) => `${a.planet1.planet} ${a.type} ${a.planet2.planet} — tension area`);

  return {
    overallScore,
    romanticScore,
    communicationScore,
    emotionalScore,
    valuesScore,
    aspects: crossAspects,
    strengths,
    challenges,
  };
}

/**
 * Calculate lunar return using real planetary positions
 */
export function calculateLunarReturn(params: {
  birthDate: Date;
  birthTime: string;
  birthLatitude: number;
  birthLongitude: number;
  targetMonth: Date;
}) {
  // Find the natal Moon position
  const natalPositions = astronomyEngine.calculatePlanetaryPositions(
    params.birthDate,
    params.birthLatitude,
    params.birthLongitude,
  );
  const natalMoon = natalPositions.get('Moon');
  const natalMoonLongitude = natalMoon?.longitude ?? 0;

  // Binary search for the lunar return date within the target month
  const year = params.targetMonth.getFullYear();
  const month = params.targetMonth.getMonth();
  const searchStart = new Date(year, month, 1);
  const searchEnd = new Date(year, month + 1, 0);

  let low = searchStart;
  let high = searchEnd;

  for (let i = 0; i < 30; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const positions = astronomyEngine.calculatePlanetaryPositions(mid, 0, 0);
    const moonLon = positions.get('Moon')?.longitude ?? 0;

    const diff = angularDistance(moonLon, natalMoonLongitude);
    if (diff < 0.01) break;

    // Determine direction — Moon moves forward through zodiac
    if (isAngleIncreasing(moonLon, natalMoonLongitude)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const returnDate = new Date((low.getTime() + high.getTime()) / 2);
  const returnPositions = astronomyEngine.calculatePlanetaryPositions(returnDate, 0, 0);

  // Build output in legacy format
  const planets: Record<string, { longitude: number; sign: string }> = {};
  for (const [name, pos] of returnPositions) {
    planets[name.toLowerCase()] = {
      longitude: pos.longitude,
      sign: pos.sign.toLowerCase(),
    };
  }

  return {
    returnDate,
    moonPosition: {
      longitude: returnPositions.get('Moon')?.longitude ?? 0,
      latitude: returnPositions.get('Moon')?.latitude ?? 0,
      sign: returnPositions.get('Moon')?.sign.toLowerCase() ?? 'aries',
    },
    planets,
    houses: Array.from({ length: 12 }, (_, i) => ({ cusp: i * 30, size: 30 })),
    interpretation: {
      theme: 'Emotional renewal and focus',
      keyAreas: ['Home', 'Family', 'Emotions'],
      advice: 'Focus on emotional needs and domestic matters this month.',
    },
  };
}

/**
 * Calculate composite chart from two real natal charts
 */
export function calculateCompositeChart(
  chart1: Record<string, unknown>,
  chart2: Record<string, unknown>,
) {
  const planets1 = (chart1?.planets ?? {}) as Record<string, { longitude: number }>;
  const planets2 = (chart2?.planets ?? {}) as Record<string, { longitude: number }>;

  // Composite = midpoint of each planet pair
  const compositePlanets: Record<string, { longitude: number; sign: string }> = {};
  for (const key of Object.keys(planets1)) {
    const lon1 = planets1[key]?.longitude;
    const lon2 = planets2[key]?.longitude;
    if (typeof lon1 === 'number' && typeof lon2 === 'number') {
      let mid = (lon1 + lon2) / 2;
      // Use shorter arc midpoint
      if (Math.abs(lon1 - lon2) > 180) mid = (mid + 180) % 360;
      compositePlanets[key] = {
        longitude: mid,
        sign: getZodiacSign(mid),
      };
    }
  }

  // Calculate composite ascendant and midheaven from chart data
  const asc1 = (chart1 as { ascendant?: number })?.ascendant ?? 0;
  const asc2 = (chart2 as { ascendant?: number })?.ascendant ?? 0;
  let compositeAsc = (asc1 + asc2) / 2;
  if (Math.abs(asc1 - asc2) > 180) compositeAsc = (compositeAsc + 180) % 360;

  const mc1 = (chart1 as { midheaven?: number })?.midheaven ?? 90;
  const mc2 = (chart2 as { midheaven?: number })?.midheaven ?? 90;
  let compositeMc = (mc1 + mc2) / 2;
  if (Math.abs(mc1 - mc2) > 180) compositeMc = (compositeMc + 180) % 360;

  return {
    planets: compositePlanets,
    houses: Array.from({ length: 12 }, (_, i) => ({ cusp: i * 30, size: 30 })),
    ascendant: compositeAsc,
    midheaven: compositeMc,
  };
}

/**
 * Convert Julian day to date/time
 */
export function juldayToDate(jd: number): Date {
  // Standard Julian Day to Gregorian calendar conversion
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
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

  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const hours = (day % 1) * 24;
  const minutes = (hours % 1) * 60;

  return new Date(
    Math.floor(year),
    Math.floor(month) - 1,
    Math.floor(day),
    Math.floor(hours),
    Math.floor(minutes),
  );
}

/**
 * Calculate aspects between two points
 */
export function calculateAspects(longitude1: number, longitude2: number) {
  const diff = angularDistance(longitude1, longitude2);

  for (const [type, config] of Object.entries(ASPECT_TYPES)) {
    if (Math.abs(diff - config.angle) <= config.orb) {
      return {
        type,
        orb: Math.abs(diff - config.angle),
        angle: config.angle,
      };
    }
  }

  return null;
}

/**
 * Get daily transits (all planetary positions for a date)
 * Now uses real astronomical calculations.
 */
export function getDailyTransits(date: Date) {
  return astronomyEngine.getDailyTransits(date);
}

// Helper: Angular distance between two ecliptic longitudes
function angularDistance(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// Helper: Check if an angle is increasing toward a target
function isAngleIncreasing(current: number, target: number): boolean {
  let diff = target - current;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff > 0;
}

// Helper: Map house system string to NatalChartService format
function mapHouseSystem(system: string): 'Placidus' | 'Koch' | 'Equal' | 'WholeSign' {
  const map: Record<string, 'Placidus' | 'Koch' | 'Equal' | 'WholeSign'> = {
    placidus: 'Placidus',
    koch: 'Koch',
    equal: 'Equal',
    equal_house: 'Equal',
    whole: 'WholeSign',
    whole_sign: 'WholeSign',
  };
  return map[(system ?? 'placidus').toLowerCase()] ?? 'Placidus';
}

// Export all functions and constants as swissEphemeris object
export const swissEphemeris = {
  calculateNatalChart,
  calculateTransits,
  calculateCompatibility,
  calculateLunarReturn,
  calculateCompositeChart,
  calculateAspects,
  getDailyTransits,
  juldayToDate,
  ZODIAC_SIGNS,
  PLANET_SYMBOLS,
  ASPECT_TYPES,
};

export default swissEphemeris;
