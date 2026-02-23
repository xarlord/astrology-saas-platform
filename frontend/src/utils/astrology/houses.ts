/**
 * House Calculator
 * Calculate house cusps using various house systems
 */

import {
  HouseSystem,
  HouseData,
  ZodiacSign,
  ZODIAC_SIGNS,
} from './types';
import {
  normalizeAngle,
  getZodiacSign,
  getDegreeInSign,
  dateToJulianDay,
  julianCenturies,
} from './planetPosition';

/**
 * Calculate Local Sidereal Time
 */
export function calculateLST(jd: number, longitude: number): number {
  const T = julianCenturies(jd);

  // Greenwich Mean Sidereal Time at 0h UT
  let GMST = 280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    T * T * T / 38710000.0;

  GMST = normalizeAngle(GMST);

  // Local Sidereal Time
  const LST = normalizeAngle(GMST + longitude);

  return LST;
}

/**
 * Calculate RAMC (Right Ascension of Medium Coeli)
 */
export function calculateRAMC(lst: number): number {
  return lst; // LST in degrees equals RAMC in degrees
}

/**
 * Calculate all house cusps using specified house system
 */
export function calculateHouses(
  lst: number,
  latitude: number,
  system: HouseSystem = 'placidus'
): HouseData[] {
  switch (system) {
    case 'placidus':
      return calculatePlacidusHouses(lst, latitude);
    case 'koch':
      return calculateKochHouses(lst, latitude);
    case 'whole':
      return calculateWholeSignHouses(lst, latitude);
    case 'equal':
      return calculateEqualHouses(lst, latitude);
    case 'porphyry':
      return calculatePorphyryHouses(lst, latitude);
    default:
      return calculatePlacidusHouses(lst, latitude);
  }
}

/**
 * Calculate Placidus house cusps
 * The most common house system
 */
export function calculatePlacidusHouses(lst: number, latitude: number): HouseData[] {
  const houses: HouseData[] = [];
  const ramc = calculateRAMC(lst);

  // Calculate MC (10th house cusp)
  const mc = calculateMC(ramc);
  const asc = calculateAscendant(ramc, latitude);

  // For Placidus, we need to interpolate between angles
  // This is a simplified implementation
  const e = 23.44; // Obliquity of ecliptic (approximate)

  // Calculate intermediate house cusps using Placidus formulas
  // This is a simplified algorithm
  for (let i = 0; i < 12; i++) {
    let cusp: number;

    if (i === 0) {
      // 1st house (Ascendant)
      cusp = asc;
    } else if (i === 9) {
      // 10th house (MC)
      cusp = mc;
    } else if (i === 6) {
      // 7th house (Descendant)
      cusp = normalizeAngle(asc + 180);
    } else if (i === 3) {
      // 4th house (IC)
      cusp = normalizeAngle(mc + 180);
    } else {
      // Interpolate for other houses
      // Simplified Placidus calculation
      const ratio = getPlacidusRatio(i, latitude);
      if (i < 6) {
        // Houses above horizon (12, 11, 10, 9, 8, 7)
        cusp = normalizeAngle(asc + ratio * 30);
      } else {
        // Houses below horizon (6, 5, 4, 3, 2, 1)
        cusp = normalizeAngle(mc + 180 + ratio * 30);
      }
    }

    houses.push({
      number: i + 1,
      cusp: normalizeAngle(cusp),
      sign: getZodiacSign(cusp),
      degree: getDegreeInSign(cusp),
    });
  }

  return houses;
}

/**
 * Get Placidus interpolation ratio
 */
function getPlacidusRatio(houseIndex: number, _latitude: number): number {
  // Simplified ratios for Placidus houses
  const ratios = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5];
  return ratios[houseIndex] + 1;
}

/**
 * Calculate Koch house cusps
 */
export function calculateKochHouses(lst: number, latitude: number): HouseData[] {
  const houses: HouseData[] = [];
  const ramc = calculateRAMC(lst);

  const mc = calculateMC(ramc);
  const asc = calculateAscendant(ramc, latitude);

  // Koch uses a different interpolation method
  const ascMc = angularDistance(asc, mc);

  for (let i = 0; i < 12; i++) {
    let cusp: number;

    if (i === 0) {
      cusp = asc;
    } else if (i === 9) {
      cusp = mc;
    } else if (i === 6) {
      cusp = normalizeAngle(asc + 180);
    } else if (i === 3) {
      cusp = normalizeAngle(mc + 180);
    } else {
      // Koch divides the semi-arc proportionally
      const division = ascMc / 3;

      if (i === 1 || i === 2) {
        // Houses 2, 3
        cusp = normalizeAngle(asc - division * (3 - i));
      } else if (i === 4 || i === 5) {
        // Houses 5, 6
        cusp = normalizeAngle(mc + 180 + division * (i - 3));
      } else if (i === 7 || i === 8) {
        // Houses 8, 9
        cusp = normalizeAngle(asc + 180 - division * (9 - i));
      } else {
        // Houses 11, 12
        cusp = normalizeAngle(mc + division * (i - 9));
      }
    }

    houses.push({
      number: i + 1,
      cusp: normalizeAngle(cusp),
      sign: getZodiacSign(cusp),
      degree: getDegreeInSign(cusp),
    });
  }

  return houses;
}

/**
 * Calculate Whole Sign house cusps
 * Each sign is a house, starting with the rising sign
 */
export function calculateWholeSignHouses(lst: number, latitude: number): HouseData[] {
  const houses: HouseData[] = [];
  const ramc = calculateRAMC(lst);
  const asc = calculateAscendant(ramc, latitude);

  // Get the sign of the Ascendant
  const ascSignIndex = Math.floor(asc / 30);

  for (let i = 0; i < 12; i++) {
    const signIndex = (ascSignIndex + i) % 12;
    const cusp = signIndex * 30;

    houses.push({
      number: i + 1,
      cusp: normalizeAngle(cusp),
      sign: ZODIAC_SIGNS[signIndex],
      degree: 0,
    });
  }

  return houses;
}

/**
 * Calculate Equal house cusps
 * Each house is exactly 30 degrees, starting from Ascendant
 */
export function calculateEqualHouses(lst: number, latitude: number): HouseData[] {
  const houses: HouseData[] = [];
  const ramc = calculateRAMC(lst);
  const asc = calculateAscendant(ramc, latitude);

  for (let i = 0; i < 12; i++) {
    const cusp = normalizeAngle(asc + i * 30);

    houses.push({
      number: i + 1,
      cusp,
      sign: getZodiacSign(cusp),
      degree: getDegreeInSign(cusp),
    });
  }

  return houses;
}

/**
 * Calculate Porphyry house cusps
 * Divides space between angles into equal parts
 */
export function calculatePorphyryHouses(lst: number, latitude: number): HouseData[] {
  const houses: HouseData[] = [];
  const ramc = calculateRAMC(lst);

  const mc = calculateMC(ramc);
  const asc = calculateAscendant(ramc, latitude);
  const desc = normalizeAngle(asc + 180);
  const ic = normalizeAngle(mc + 180);

  // Calculate quadrant sizes
  let q1 = angularDistance(asc, ic);
  let q2 = angularDistance(ic, desc);
  let q3 = angularDistance(desc, mc);
  let q4 = angularDistance(mc, asc);

  // House cusps
  const cusps: number[] = new Array(12);

  cusps[0] = asc; // 1st house
  cusps[3] = ic;  // 4th house
  cusps[6] = desc; // 7th house
  cusps[9] = mc;   // 10th house

  // Fill in intermediate houses
  cusps[1] = normalizeAngle(asc - q1 / 3);
  cusps[2] = normalizeAngle(asc - 2 * q1 / 3);
  cusps[4] = normalizeAngle(ic - q2 / 3);
  cusps[5] = normalizeAngle(ic - 2 * q2 / 3);
  cusps[7] = normalizeAngle(desc - q3 / 3);
  cusps[8] = normalizeAngle(desc - 2 * q3 / 3);
  cusps[10] = normalizeAngle(mc - q4 / 3);
  cusps[11] = normalizeAngle(mc - 2 * q4 / 3);

  for (let i = 0; i < 12; i++) {
    houses.push({
      number: i + 1,
      cusp: normalizeAngle(cusps[i]),
      sign: getZodiacSign(cusps[i]),
      degree: getDegreeInSign(cusps[i]),
    });
  }

  return houses;
}

/**
 * Calculate Ascendant
 */
export function calculateAscendant(ramc: number, latitude: number): number {
  const e = 23.44; // Obliquity of ecliptic (approximate)
  const latRad = latitude * Math.PI / 180;
  const eRad = e * Math.PI / 180;
  const ramcRad = ramc * Math.PI / 180;

  // Ascendant formula
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(eRad) + Math.tan(latRad) * Math.sin(eRad);

  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = normalizeAngle(asc);

  return asc;
}

/**
 * Calculate Midheaven (MC)
 */
export function calculateMC(ramc: number): number {
  const e = 23.44; // Obliquity of ecliptic
  const eRad = e * Math.PI / 180;
  const ramcRad = ramc * Math.PI / 180;

  // MC formula
  const mc = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eRad)) * 180 / Math.PI;

  return normalizeAngle(mc);
}

/**
 * Calculate Descendant
 */
export function calculateDescendant(ascendant: number): number {
  return normalizeAngle(ascendant + 180);
}

/**
 * Calculate IC (Imum Coeli)
 */
export function calculateIC(midheaven: number): number {
  return normalizeAngle(midheaven + 180);
}

/**
 * Calculate Vertex
 */
export function calculateVertex(ramc: number, latitude: number): number {
  const e = 23.44; // Obliquity of ecliptic
  const latRad = latitude * Math.PI / 180;
  const eRad = e * Math.PI / 180;
  const ramcRad = (ramc + 180) * Math.PI / 180; // Add 180 for Vertex

  // Vertex formula
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(eRad) - Math.tan(latRad) * Math.sin(eRad);

  let vertex = Math.atan2(y, x) * 180 / Math.PI;
  vertex = normalizeAngle(vertex);

  return vertex;
}

/**
 * Calculate Anti-Vertex
 */
export function calculateAntiVertex(vertex: number): number {
  return normalizeAngle(vertex + 180);
}

/**
 * Get angular distance between two points
 */
function angularDistance(a: number, b: number): number {
  let diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Calculate house system from date/time/location
 */
export function calculateHousesFromData(
  date: Date,
  time: string,
  latitude: number,
  longitude: number,
  system: HouseSystem = 'placidus'
): HouseData[] {
  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setUTCHours(hours, minutes, 0, 0);

  const jd = dateToJulianDay(dateTime);
  const lst = calculateLST(jd, longitude);

  return calculateHouses(lst, latitude, system);
}

/**
 * Get house system name
 */
export function getHouseSystemName(system: HouseSystem): string {
  const names: Record<HouseSystem, string> = {
    placidus: 'Placidus',
    koch: 'Koch',
    whole: 'Whole Sign',
    equal: 'Equal House',
    porphyry: 'Porphyry',
  };
  return names[system];
}

export default {
  calculateLST,
  calculateRAMC,
  calculateHouses,
  calculatePlacidusHouses,
  calculateKochHouses,
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePorphyryHouses,
  calculateAscendant,
  calculateMC,
  calculateDescendant,
  calculateIC,
  calculateVertex,
  calculateAntiVertex,
  calculateHousesFromData,
  getHouseSystemName,
};
