/**
 * Angle Calculator
 * Calculate chart angles: Ascendant, Midheaven, Descendant, IC, Vertex
 */

import {
  AngleData,
  ChartAngle,
} from './types';
import {
  normalizeAngle,
  getZodiacSign,
  getDegreeInSign,
  dateToJulianDay,
} from './planetPosition';
import {
  calculateLST,
  calculateMC as calcMC,
  calculateAscendant as calcAsc,
  calculateVertex as calcVertex,
  calculateDescendant as calcDesc,
  calculateIC as calcIC,
  calculateAntiVertex as calcAntiVertex,
} from './houses';

/**
 * Calculate all chart angles
 */
export function calculateAngles(
  date: Date,
  time: string,
  latitude: number,
  longitude: number
): AngleData[] {
  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  const jd = dateToJulianDay(dateTime);
  const lst = calculateLST(jd, longitude);
  const ramc = lst; // RAMC equals LST in degrees

  const ascendant = calcAsc(ramc, latitude);
  const midheaven = calcMC(ramc);
  const descendant = calcDesc(ascendant);
  const ic = calcIC(midheaven);
  const vertex = calcVertex(ramc, latitude);
  const antiVertex = calcAntiVertex(vertex);

  return [
    {
      name: 'Ascendant',
      longitude: ascendant,
      latitude: 0,
      sign: getZodiacSign(ascendant),
      degree: getDegreeInSign(ascendant),
      house: 1,
    },
    {
      name: 'Descendant',
      longitude: descendant,
      latitude: 0,
      sign: getZodiacSign(descendant),
      degree: getDegreeInSign(descendant),
      house: 7,
    },
    {
      name: 'MC',
      longitude: midheaven,
      latitude: 0,
      sign: getZodiacSign(midheaven),
      degree: getDegreeInSign(midheaven),
      house: 10,
    },
    {
      name: 'IC',
      longitude: ic,
      latitude: 0,
      sign: getZodiacSign(ic),
      degree: getDegreeInSign(ic),
      house: 4,
    },
    {
      name: 'Vertex',
      longitude: vertex,
      latitude: 0,
      sign: getZodiacSign(vertex),
      degree: getDegreeInSign(vertex),
    },
    {
      name: 'AntiVertex',
      longitude: antiVertex,
      latitude: 0,
      sign: getZodiacSign(antiVertex),
      degree: getDegreeInSign(antiVertex),
    },
  ];
}

/**
 * Calculate Ascendant only
 */
export function calculateAscendant(
  date: Date,
  time: string,
  latitude: number,
  longitude: number
): AngleData {
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  const jd = dateToJulianDay(dateTime);
  const lst = calculateLST(jd, longitude);
  const ascendant = calcAsc(lst, latitude);

  return {
    name: 'Ascendant',
    longitude: ascendant,
    latitude: 0,
    sign: getZodiacSign(ascendant),
    degree: getDegreeInSign(ascendant),
    house: 1,
  };
}

/**
 * Calculate Midheaven only
 */
export function calculateMidheaven(
  date: Date,
  time: string,
  longitude: number
): AngleData {
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  const jd = dateToJulianDay(dateTime);
  const lst = calculateLST(jd, longitude);
  const mc = calcMC(lst);

  return {
    name: 'MC',
    longitude: mc,
    latitude: 0,
    sign: getZodiacSign(mc),
    degree: getDegreeInSign(mc),
    house: 10,
  };
}

/**
 * Calculate Descendant only
 */
export function calculateDescendant(
  date: Date,
  time: string,
  latitude: number,
  longitude: number
): AngleData {
  const ascendant = calculateAscendant(date, time, latitude, longitude);
  const descendant = normalizeAngle(ascendant.longitude + 180);

  return {
    name: 'Descendant',
    longitude: descendant,
    latitude: 0,
    sign: getZodiacSign(descendant),
    degree: getDegreeInSign(descendant),
    house: 7,
  };
}

/**
 * Calculate IC (Imum Coeli) only
 */
export function calculateIC(
  date: Date,
  time: string,
  longitude: number
): AngleData {
  const mc = calculateMidheaven(date, time, longitude);
  const ic = normalizeAngle(mc.longitude + 180);

  return {
    name: 'IC',
    longitude: ic,
    latitude: 0,
    sign: getZodiacSign(ic),
    degree: getDegreeInSign(ic),
    house: 4,
  };
}

/**
 * Calculate Vertex only
 */
export function calculateVertex(
  date: Date,
  time: string,
  latitude: number,
  longitude: number
): AngleData {
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  const jd = dateToJulianDay(dateTime);
  const lst = calculateLST(jd, longitude);
  const vertex = calcVertex(lst, latitude);

  return {
    name: 'Vertex',
    longitude: vertex,
    latitude: 0,
    sign: getZodiacSign(vertex),
    degree: getDegreeInSign(vertex),
  };
}

/**
 * Calculate Part of Fortune
 * Formula: Ascendant + Moon - Sun (for day birth)
 *          Ascendant + Sun - Moon (for night birth)
 */
export function calculatePartOfFortune(
  ascendant: number,
  sunLongitude: number,
  moonLongitude: number,
  isDayBirth: boolean
): AngleData {
  let longitude: number;

  if (isDayBirth) {
    longitude = normalizeAngle(ascendant + moonLongitude - sunLongitude);
  } else {
    longitude = normalizeAngle(ascendant + sunLongitude - moonLongitude);
  }

  return {
    name: 'Part of Fortune',
    longitude,
    latitude: 0,
    sign: getZodiacSign(longitude),
    degree: getDegreeInSign(longitude),
  };
}

/**
 * Calculate Part of Spirit
 * Formula: Ascendant + Sun - Moon (for day birth)
 *          Ascendant + Moon - Sun (for night birth)
 */
export function calculatePartOfSpirit(
  ascendant: number,
  sunLongitude: number,
  moonLongitude: number,
  isDayBirth: boolean
): AngleData {
  let longitude: number;

  if (isDayBirth) {
    longitude = normalizeAngle(ascendant + sunLongitude - moonLongitude);
  } else {
    longitude = normalizeAngle(ascendant + moonLongitude - sunLongitude);
  }

  return {
    name: 'Part of Spirit',
    longitude,
    latitude: 0,
    sign: getZodiacSign(longitude),
    degree: getDegreeInSign(longitude),
  };
}

/**
 * Calculate all Arabic Parts
 */
export function calculateArabicParts(
  ascendant: number,
  sunLongitude: number,
  moonLongitude: number,
  isDayBirth: boolean
): AngleData[] {
  return [
    calculatePartOfFortune(ascendant, sunLongitude, moonLongitude, isDayBirth),
    calculatePartOfSpirit(ascendant, sunLongitude, moonLongitude, isDayBirth),
    calculatePartOfLove(ascendant, sunLongitude, moonLongitude),
    calculatePartOfMarriage(ascendant, sunLongitude, moonLongitude),
  ];
}

/**
 * Calculate Part of Love (Eros)
 */
export function calculatePartOfLove(
  ascendant: number,
  _sunLongitude: number,
  moonLongitude: number
): AngleData {
  // Part of Eros: Ascendant + Venus - Moon (using simplified formula)
  const venusLongitude = moonLongitude + 60; // Approximate Venus position
  const longitude = normalizeAngle(ascendant + venusLongitude - moonLongitude);

  return {
    name: 'Part of Love',
    longitude,
    latitude: 0,
    sign: getZodiacSign(longitude),
    degree: getDegreeInSign(longitude),
  };
}

/**
 * Calculate Part of Marriage
 */
export function calculatePartOfMarriage(
  ascendant: number,
  sunLongitude: number,
  _moonLongitude: number
): AngleData {
  // Part of Marriage: Ascendant + 7th House - Venus (simplified)
  const longitude = normalizeAngle(ascendant + 180 - sunLongitude);

  return {
    name: 'Part of Marriage',
    longitude,
    latitude: 0,
    sign: getZodiacSign(longitude),
    degree: getDegreeInSign(longitude),
  };
}

/**
 * Get angle symbol
 */
export function getAngleSymbol(angle: ChartAngle): string {
  const symbols: Record<ChartAngle, string> = {
    Ascendant: 'ASC',
    Descendant: 'DESC',
    MC: 'MC',
    IC: 'IC',
    Vertex: 'VX',
    AntiVertex: 'AVX',
  };
  return symbols[angle];
}

/**
 * Check if Sun is above horizon (day birth)
 */
export function isDayBirth(
  sunLongitude: number,
  ascendant: number
): boolean {
  // Calculate the Sun's house position relative to ascendant
  const distance = normalizeAngle(sunLongitude - ascendant);

  // Sun in houses 1-6 (below ascendant) = night birth
  // Sun in houses 7-12 (above ascendant) = day birth
  return distance >= 180 && distance < 360;
}

/**
 * Format angle for display
 */
export function formatAngle(angle: AngleData): string {
  const degree = Math.floor(angle.degree);
  const minutes = Math.round((angle.degree - degree) * 60);
  return `${angle.name}: ${degree}\u00b0${minutes.toString().padStart(2, '0')}' ${angle.sign}`;
}

export default {
  calculateAngles,
  calculateAscendant,
  calculateMidheaven,
  calculateDescendant,
  calculateIC,
  calculateVertex,
  calculatePartOfFortune,
  calculatePartOfSpirit,
  calculateArabicParts,
  getAngleSymbol,
  isDayBirth,
  formatAngle,
};
