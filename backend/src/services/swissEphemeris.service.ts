/**
 * Swiss Ephemeris Service
 * Handles all astronomical calculations using Swiss Ephemeris
 */

import swisseph from 'swisseph';
import config from '../config';

// Initialize Swiss Ephemeris
const ephemerisPath = config.ephemeris.path;
swisseph.swe_set_ephe_path(ephemerisPath);

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

// Planets (Swiss Ephemeris codes)
export const PLANETS = {
  sun: swisseph.SE_SUN,
  moon: swisseph.SE_MOON,
  mercury: swisseph.SE_MERCURY,
  venus: swisseph.SE_VENUS,
  mars: swisseph.SE_MARS,
  jupiter: swisseph.SE_JUPITER,
  saturn: swisseph.SE_SATURN,
  uranus: swisseph.SE_URANUS,
  neptune: swisseph.SE_NEPTUNE,
  pluto: swisseph.SE_PLUTO,
  meanNode: swisseph.SE_MEAN_NODE,
  trueNode: swisseph.SE_TRUE_NODE,
} as const;

export type PlanetKey = keyof typeof PLANETS;

// Planet symbols for display
export const PLANET_SYMBOLS: Record<PlanetKey, string> = {
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

// House systems
export const HOUSE_SYSTEMS = {
  placidus: 'P', // Placidus
  koch: 'K',     // Koch
  porphyry: 'O', // Porphyry
  whole: 'W',    // Whole Sign
  equal: 'A',    // Equal (Ascendant = 1st house cusp)
  topocentric: 'T', // Topocentric
} as const;

export type HouseSystem = keyof typeof HOUSE_SYSTEMS;

/**
 * Convert Julian day to date/time
 */
export function juldayToDate(jd: number): Date {
  const year = Math.floor(jd);
  const month = Math.floor((jd - year) * 12) + 1;
  const day = Math.floor((jd - year - (month - 1) / 12) * 30) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Calculate Julian day from date and time
 */
export function dateToJulianDay(date: Date, time: string): number {
  const [hours, minutes, seconds = 0] = time.split(':').map(Number);
  const adjustedDate = new Date(date);
  adjustedDate.setHours(hours, minutes, seconds);

  const year = adjustedDate.getFullYear();
  const month = adjustedDate.getMonth() + 1;
  const day = adjustedDate.getDate();
  const hour = adjustedDate.getHours() + adjustedDate.getMinutes() / 60 + adjustedDate.getSeconds() / 3600;

  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

/**
 * Get zodiac sign from degree
 */
export function getZodiacSign(degree: number): { sign: ZodiacSign; position: number } {
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  const position = normalizedDegree % 30;

  return {
    sign: ZODIAC_SIGNS[signIndex],
    position: Math.round(position * 100) / 100,
  };
}

/**
 * Format degree as DMS (degrees, minutes, seconds)
 */
export function formatDegree(degree: number): {
  degree: number;
  minute: number;
  second: number;
  sign: ZodiacSign;
} {
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const deg = Math.floor(normalizedDegree);
  const minFloat = (normalizedDegree - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 100) / 100;
  const { sign } = getZodiacSign(degree);

  return { degree: deg, minute: min, second: sec, sign };
}

/**
 * Calculate planetary position
 */
export function calculatePlanet(
  planet: PlanetKey,
  jd: number,
  geoLatitude?: number,
  geoLongitude?: number
): {
  planet: PlanetKey;
  longitude: number;
  latitude: number;
  distance: number;
  longitudeStr: string;
  sign: ZodiacSign;
  position: number;
  retrograde: boolean;
  speed: number;
} {
  const planetCode = PLANETS[planet];

  // Calculate position
  const result = swisseph.swe_calc_ut(
    jd,
    planetCode,
    swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED
  );

  if (result.error !== '') {
    throw new Error(`Swiss Ephemeris error for ${planet}: ${result.error}`);
  }

  const longitude = result.data[0];
  const latitude = result.data[1];
  const distance = result.data[2];
  const speed = result.data[3];

  // Get sign and position
  const { sign, position } = getZodiacSign(longitude);

  // Format as DMS
  const { degree, minute, second } = formatDegree(longitude);
  const longitudeStr = `${degree}°${minute}'${second}" ${sign.charAt(0).toUpperCase() + sign.slice(1)}`;

  // Check if retrograde (negative speed)
  const retrograde = speed < 0;

  return {
    planet,
    longitude,
    latitude,
    distance,
    longitudeStr,
    sign,
    position: Math.round(position * 100) / 100,
    retrograde,
    speed: Math.round(speed * 10000) / 10000,
  };
}

/**
 * Calculate all planetary positions
 */
export function calculateAllPlanets(
  jd: number,
  latitude?: number,
  longitude?: number
): Record<PlanetKey, ReturnType<typeof calculatePlanet>> {
  const planets: Record<string, any> = {};

  for (const planetKey of Object.keys(PLANETS) as PlanetKey[]) {
    planets[planetKey] = calculatePlanet(planetKey, jd, latitude, longitude);
  }

  return planets as any;
}

/**
 * Calculate houses
 */
export function calculateHouses(
  jd: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = 'placidus'
): {
  system: HouseSystem;
  houses: Array<{
    number: number;
    cusp: number;
    sign: ZodiacSign;
    degree: number;
    minute: number;
  }>;
  ascendant: {
    degree: number;
    sign: ZodiacSign;
  };
  mc: {
    degree: number;
    sign: ZodiacSign;
  };
} {
  const houseCode = HOUSE_SYSTEMS[houseSystem];

  // Calculate houses
  const result = swisseph.swe_houses(jd, latitude, longitude, houseCode);

  const houses = result.house.map((cusp, index) => {
    const { sign, position } = getZodiacSign(cusp);
    const { degree, minute } = formatDegree(cusp);

    return {
      number: index + 1,
      cusp: Math.round(cusp * 100) / 100,
      sign,
      degree,
      minute,
    };
  });

  // Ascendant and MC
  const { sign: ascSign } = getZodiacSign(result.ascendant);
  const { sign: mcSign } = getZodiacSign(result.mc);

  return {
    system: houseSystem,
    houses: houses.slice(0, 12), // Only 12 houses
    ascendant: {
      degree: Math.round(result.ascendant * 100) / 100,
      sign: ascSign,
    },
    mc: {
      degree: Math.round(result.mc * 100) / 100,
      sign: mcSign,
    },
  };
}

/**
 * Calculate aspect between two planets
 */
export function calculateAspect(
  planet1Pos: number,
  planet2Pos: number,
  customOrbs?: Partial<Record<AspectType, number>>
): {
  aspect: AspectType | null;
  orb: number;
  applying: boolean;
} {
  const diff = Math.abs(planet1Pos - planet2Pos);

  // Check each aspect type
  for (const [aspectName, aspectData] of Object.entries(ASPECT_TYPES)) {
    const orb = customOrbs?.[aspectName as AspectType] ?? aspectData.orb;
    const angle = aspectData.angle;

    // Calculate difference from exact aspect
    let aspectDiff = Math.abs(diff - angle);
    if (aspectDiff > 180) aspectDiff = 360 - aspectDiff;

    if (aspectDiff <= orb) {
      return {
        aspect: aspectName as AspectType,
        orb: Math.round(aspectDiff * 100) / 100,
        applying: true, // TODO: Calculate applying vs separating
      };
    }
  }

  return { aspect: null, orb: 0, applying: false };
}

/**
 * Calculate all aspects between planets
 */
export function calculateAllAspects(
  positions: Record<PlanetKey, { longitude: number }>
): Array<{
  planet1: PlanetKey;
  planet2: PlanetKey;
  aspect: AspectType;
  orb: number;
  applying: boolean;
}> {
  const aspects: Array<{
    planet1: PlanetKey;
    planet2: PlanetKey;
    aspect: AspectType;
    orb: number;
    applying: boolean;
  }> = [];

  const planetKeys = Object.keys(positions) as PlanetKey[];

  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const planet1 = planetKeys[i];
      const planet2 = planetKeys[j];
      const pos1 = positions[planet1].longitude;
      const pos2 = positions[planet2].longitude;

      const result = calculateAspect(pos1, pos2);

      if (result.aspect) {
        aspects.push({
          planet1,
          planet2,
          aspect: result.aspect,
          orb: result.orb,
          applying: result.applying,
        });
      }
    }
  }

  return aspects;
}

/**
 * Calculate complete natal chart
 */
export function calculateNatalChart(params: {
  birthDate: Date;
  birthTime: string;
  latitude: number;
  longitude: number;
  houseSystem?: HouseSystem;
}): {
  planets: Record<PlanetKey, ReturnType<typeof calculatePlanet>>;
  houses: ReturnType<typeof calculateHouses>;
  aspects: ReturnType<typeof calculateAllAspects>;
  jd: number;
} {
  const { birthDate, birthTime, latitude, longitude, houseSystem = 'placidus' } = params;

  // Calculate Julian day
  const jd = dateToJulianDay(birthDate, birthTime);

  // Calculate planets
  const planets = calculateAllPlanets(jd, latitude, longitude);

  // Calculate houses
  const houses = calculateHouses(jd, latitude, longitude, houseSystem);

  // Calculate aspects
  const aspects = calculateAllAspects(planets);

  return {
    planets,
    houses,
    aspects,
    jd,
  };
}

/**
 * Calculate transit positions for a given date
 */
export function calculateTransits(params: {
  transitDate: Date;
  transitTime: string;
  natalChart: {
    jd: number;
    planets: Record<PlanetKey, { longitude: number }>;
    houses: ReturnType<typeof calculateHouses>;
  };
}): {
  transitPlanets: Record<PlanetKey, ReturnType<typeof calculatePlanet>>;
  aspectsToNatal: Array<{
    transitPlanet: PlanetKey;
    natalPlanet: PlanetKey;
    aspect: AspectType;
    orb: number;
  }>;
  housePositions: Record<PlanetKey, number>;
} {
  const { transitDate, transitTime, natalChart } = params;

  // Calculate Julian day for transit
  const transitJd = dateToJulianDay(transitDate, transitTime);

  // Calculate transit planets
  const transitPlanets = calculateAllPlanets(transitJd);

  // Calculate aspects to natal planets
  const aspectsToNatal: Array<{
    transitPlanet: PlanetKey;
    natalPlanet: PlanetKey;
    aspect: AspectType;
    orb: number;
  }> = [];

  for (const [transitKey, transitPos] of Object.entries(transitPlanets)) {
    for (const [natalKey, natalPos] of Object.entries(natalChart.planets)) {
      const result = calculateAspect(transitPos.longitude, natalPos.longitude);

      if (result.aspect) {
        aspectsToNatal.push({
          transitPlanet: transitKey as PlanetKey,
          natalPlanet: natalKey as PlanetKey,
          aspect: result.aspect,
          orb: result.orb,
        });
      }
    }
  }

  // Calculate which house each transit planet is in
  const housePositions: Record<string, number> = {};
  for (const [key, pos] of Object.entries(transitPlanets)) {
    const houses = natalChart.houses.houses;
    for (let i = 0; i < houses.length; i++) {
      const currentCusp = houses[i].cusp;
      const nextCusp = houses[(i + 1) % 12].cusp;

      // Handle house boundaries
      let inHouse = false;
      if (currentCusp < nextCusp) {
        inHouse = pos.longitude >= currentCusp && pos.longitude < nextCusp;
      } else {
        // House spans 0° Aries
        inHouse = pos.longitude >= currentCusp || pos.longitude < nextCusp;
      }

      if (inHouse) {
        housePositions[key] = i + 1;
        break;
      }
    }
  }

  return {
    transitPlanets,
    aspectsToNatal,
    housePositions: housePositions as any,
  };
}

export default {
  calculateNatalChart,
  calculateTransits,
  calculatePlanet,
  calculateAllPlanets,
  calculateHouses,
  calculateAspect,
  calculateAllAspects,
  ZODIAC_SIGNS,
  PLANET_SYMBOLS,
  ASPECT_TYPES,
};
