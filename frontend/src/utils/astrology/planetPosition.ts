/**
 * Planet Position Calculator
 * Calculates planet positions from date/time/location
 */

import { ZodiacSign, ZODIAC_SIGNS, PlanetData, CelestialBody, HouseData } from './types';

// Planet orbital periods in days (approximate)
const PLANET_PERIODS: Record<string, number> = {
  Sun: 365.25,
  Moon: 27.32,
  Mercury: 87.97,
  Venus: 224.7,
  Mars: 686.98,
  Jupiter: 4332.59,
  Saturn: 10759.22,
  Uranus: 30688.5,
  Neptune: 60182,
  Pluto: 90560,
};

// Mean daily motion in degrees
const MEAN_DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mercury: 4.09,
  Venus: 1.6,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.033,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004,
};

// Planet symbols
export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609',
  Moon: '\u263d',
  Mercury: '\u263f',
  Venus: '\u2640',
  Mars: '\u2642',
  Jupiter: '\u2643',
  Saturn: '\u2644',
  Uranus: '\u2645',
  Neptune: '\u2646',
  Pluto: '\u2647',
  NorthNode: '\u260a',
  SouthNode: '\u260b',
  Chiron: '\u2631',
  Lilith: '\u26b8',
};

// Retrograde periods (approximate days per year)
const RETROGRADE_DAYS: Record<string, number> = {
  Mercury: 21,
  Venus: 42,
  Mars: 80,
  Jupiter: 120,
  Saturn: 140,
  Uranus: 150,
  Neptune: 158,
  Pluto: 160,
};

/**
 * Calculate Julian Day from a date
 */
export function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  const decimalHour = hour + minute / 60 + second / 3600;

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5 +
    decimalHour / 24;

  return jd;
}

/**
 * Calculate T (Julian centuries from J2000.0)
 */
export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Get zodiac sign from ecliptic longitude
 */
export function getZodiacSign(longitude: number): ZodiacSign {
  const normalized = normalizeAngle(longitude);
  const index = Math.floor(normalized / 30) % 12;
  return ZODIAC_SIGNS[index];
}

/**
 * Get zodiac sign element
 */
export function getSignElement(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' {
  const index = ZODIAC_SIGNS.indexOf(sign);
  const elementIndex = index % 4;
  return (['fire', 'earth', 'air', 'water'] as const)[elementIndex];
}

/**
 * Get zodiac sign quality
 */
export function getSignQuality(sign: ZodiacSign): 'cardinal' | 'fixed' | 'mutable' {
  const index = ZODIAC_SIGNS.indexOf(sign);
  const qualityIndex = index % 3;
  return (['cardinal', 'fixed', 'mutable'] as const)[qualityIndex];
}

/**
 * Get degree within sign (0-29.99)
 */
export function getDegreeInSign(longitude: number): number {
  return normalizeAngle(longitude) % 30;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  // Handle the edge case where angle is exactly 360 or -360
  if (normalized >= 360 || Object.is(normalized, -0)) {
    normalized = 0;
  }
  // Ensure we return positive 0, not negative 0
  return normalized === 0 ? 0 : normalized;
}

/**
 * Calculate planet longitude using simplified algorithms
 * For production use, this should be replaced with Swiss Ephemeris
 */
export function calculatePlanetLongitude(
  planet: string,
  jd: number,
  latitude: number,
  longitude: number,
): number {
  const _t = julianCenturies(jd);

  // Simplified position calculation based on mean anomaly
  // This is an approximation - real ephemeris should be used for production
  const baseDate = new Date('2000-01-01T12:00:00Z');
  const baseJD = dateToJulianDay(baseDate);
  const daysSinceBase = jd - baseJD;

  // Get mean motion for planet
  const dailyMotion = MEAN_DAILY_MOTION[planet] || 1;

  // Base positions at J2000.0 (approximate)
  const basePositions: Record<string, number> = {
    Sun: 280.46,
    Moon: 218.32,
    Mercury: 252.25,
    Venus: 181.98,
    Mars: 355.45,
    Jupiter: 34.35,
    Saturn: 50.08,
    Uranus: 314.06,
    Neptune: 304.35,
    Pluto: 238.95,
  };

  const basePos = basePositions[planet] || 0;
  const longitudePos = normalizeAngle(basePos + dailyMotion * daysSinceBase);

  // Add some perturbation based on location for uniqueness
  const locationOffset = (latitude + longitude) * 0.0001;

  return normalizeAngle(longitudePos + locationOffset);
}

/**
 * Detect if planet is retrograde
 */
export function isRetrograde(planet: string, date: Date): boolean {
  // Outer planets are often retrograde
  if (['Uranus', 'Neptune', 'Pluto'].includes(planet)) {
    return true; // Simplified - these are retrograde ~40-50% of the time
  }

  // Inner planets have periodic retrograde
  if (['Mercury', 'Venus', 'Mars'].includes(planet)) {
    const dayOfYear = getDayOfYear(date);
    const retrogradeDays = RETROGRADE_DAYS[planet] || 0;
    const periodDays = PLANET_PERIODS[planet] || 365;

    // Simplified retrograde detection
    const phase = (dayOfYear % periodDays) / periodDays;
    const retrogradeStart = 0.3;
    const retrogradeEnd = 0.3 + retrogradeDays / periodDays;

    return phase >= retrogradeStart && phase <= retrogradeEnd;
  }

  // Sun and Moon never retrograde
  return false;
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate planet position
 */
export function calculatePlanetPosition(
  planet: CelestialBody,
  date: Date,
  time: string,
  latitude: number,
  longitude: number,
): PlanetData {
  // Parse time string (HH:MM format)
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  // Adjust for timezone offset (simplified)
  const jd = dateToJulianDay(dateTime);

  // Calculate longitude
  const planetLongitude = calculatePlanetLongitude(planet, jd, latitude, longitude);

  // Calculate latitude (simplified - most planets stay close to ecliptic)
  const planetLatitude = calculatePlanetLatitude(planet, jd);

  // Calculate speed
  const speed = MEAN_DAILY_MOTION[planet] || 1;

  // Check retrograde
  const retrograde = isRetrograde(planet, dateTime);

  return {
    name: planet,
    longitude: planetLongitude,
    latitude: planetLatitude,
    speed: retrograde ? -speed : speed,
    retrograde,
    sign: getZodiacSign(planetLongitude),
    degree: getDegreeInSign(planetLongitude),
  };
}

/**
 * Calculate planet latitude (simplified)
 */
function calculatePlanetLatitude(planet: string, _jd: number): number {
  // Most planets stay close to the ecliptic
  // Moon has the largest inclination (~5 degrees)
  const inclinations: Record<string, number> = {
    Sun: 0,
    Moon: 5.14,
    Mercury: 7.0,
    Venus: 3.39,
    Mars: 1.85,
    Jupiter: 1.31,
    Saturn: 2.49,
    Uranus: 0.77,
    Neptune: 1.77,
    Pluto: 17.16,
  };

  const maxInclination = inclinations[planet] || 0;
  // Return a fraction of max inclination based on orbital position
  const fraction = Math.sin(_jd * 0.1) * 0.5 + 0.5;
  return maxInclination * fraction * (Math.random() > 0.5 ? 1 : -1);
}

/**
 * Calculate all planet positions for a chart
 */
export function calculateAllPlanetPositions(
  date: Date,
  time: string,
  latitude: number,
  longitude: number,
): PlanetData[] {
  const planets: CelestialBody[] = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  return planets.map((planet) => calculatePlanetPosition(planet, date, time, latitude, longitude));
}

/**
 * Assign planets to houses
 */
export function assignPlanetsToHouses(planets: PlanetData[], houses: HouseData[]): PlanetData[] {
  return planets.map((planet) => {
    const house = findHouseForLongitude(planet.longitude, houses);
    return { ...planet, house };
  });
}

/**
 * Find which house a longitude falls in
 */
export function findHouseForLongitude(longitude: number, houses: HouseData[]): number {
  const normalized = normalizeAngle(longitude);

  for (let i = 0; i < houses.length; i++) {
    const currentCusp = normalizeAngle(houses[i].cusp);
    const nextCusp = normalizeAngle(houses[(i + 1) % 12].cusp);

    // Handle wrap-around (e.g., from house 12 to house 1)
    if (nextCusp < currentCusp) {
      // House spans 0 degrees
      if (normalized >= currentCusp || normalized < nextCusp) {
        return i + 1;
      }
    } else {
      // Normal case
      if (normalized >= currentCusp && normalized < nextCusp) {
        return i + 1;
      }
    }
  }

  return 1; // Default to first house
}

/**
 * Format position string (e.g., "15 Aries 30")
 */
export function formatPosition(degree: number, sign: ZodiacSign): string {
  const wholeDegrees = Math.floor(degree);
  const minutes = Math.round((degree - wholeDegrees) * 60);
  return `${wholeDegrees}\u00b0${minutes.toString().padStart(2, '0')}' ${sign}`;
}

/**
 * Get planet symbol
 */
export function getPlanetSymbol(planet: string): string {
  return PLANET_SYMBOLS[planet] || '?';
}

export default {
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
};
