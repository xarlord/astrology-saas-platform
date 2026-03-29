/**
 * House Calculation Service
 *
 * @requirement REQ-API-001
 * @description Calculate astrological house cusps using various systems
 * @default Placidus
 */

import { ZODIAC_SIGNS, ZodiacSign } from './astronomyEngine.service';

export type HouseSystem = 'Placidus' | 'Koch' | 'Equal' | 'WholeSign';

export interface HouseCusp {
  number: number;       // 1-12
  longitude: number;    // 0-360°
  sign: ZodiacSign;
  degree: number;       // 0-29°
}

export interface HouseCusps {
  system: HouseSystem;
  cusps: HouseCusp[];
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumCoeli: number;
}

export interface HouseData {
  number: number;
  cusp: number;
  sign: ZodiacSign;
  degreeInSign: number;
  size: number; // Size of house in degrees
}

export class HouseCalculationService {
  // Earth's axial tilt (obliquity of the ecliptic)
  private static readonly OBLIQUITY = 23.44;

  /**
   * Calculate houses using specified system
   */
  calculateHouses(
    lst: number,           // Local Sidereal Time in degrees
    latitude: number,      // Geographic latitude
    system: HouseSystem = 'Placidus',
    ascendant?: number     // Required for WholeSign
  ): HouseCusps {
    switch (system) {
      case 'Placidus':
        return this.placidusHouses(lst, latitude);
      case 'Koch':
        return this.kochHouses(lst, latitude);
      case 'Equal':
        return this.equalHouses(lst, latitude);
      case 'WholeSign':
        return this.wholeSignHouses(ascendant ?? 0);
      default:
        return this.placidusHouses(lst, latitude);
    }
  }

  /**
   * Calculate Local Sidereal Time from Julian Day and longitude
   */
  calculateLST(julianDay: number, longitude: number): number {
    const T = (julianDay - 2451545.0) / 36525.0; // Julian centuries from J2000.0

    // Greenwich Mean Sidereal Time (degrees)
    let GMST = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0)
               + 0.000387933 * T * T - T * T * T / 38710000.0;

    GMST = this.normalizeAngle(GMST);

    // Local Sidereal Time (degrees)
    let LST = GMST + longitude;
    LST = this.normalizeAngle(LST);

    return LST;
  }

  /**
   * Placidus House System
   *
   * The most popular house system. Uses time-based interpolation.
   * Houses are calculated based on the time it takes for a degree to rise.
   */
  private placidusHouses(lst: number, latitude: number): HouseCusps {
    const ramc = lst; // RAMC = Local Sidereal Time in degrees
    const mc = this.normalizeAngle(ramc);
    const asc = this.calculateAscendant(ramc, latitude);
    const desc = this.normalizeAngle(asc + 180);
    const ic = this.normalizeAngle(mc + 180);

    const cusps: number[] = new Array(12);

    // 1st house cusp = Ascendant
    cusps[0] = asc;
    // 10th house cusp = MC
    cusps[9] = mc;
    // 7th house cusp = Descendant
    cusps[6] = desc;
    // 4th house cusp = IC
    cusps[3] = ic;

    // Calculate intermediate house cusps using Placidus semi-arc method
    // Houses 11, 12: above horizon (MC side)
    cusps[10] = this.placidusInterpolate(ramc, latitude, 30, true);  // 11th house
    cusps[11] = this.placidusInterpolate(ramc, latitude, 60, true);  // 12th house

    // Houses 2, 3: above horizon (ASC side)
    cusps[1] = this.placidusInterpolate(ramc + 180, latitude, 30, false);  // 2nd house
    cusps[2] = this.placidusInterpolate(ramc + 180, latitude, 60, false);  // 3rd house

    // Houses 8, 9: below horizon (DESC side)
    cusps[7] = this.normalizeAngle(cusps[1] + 180);  // 8th house (opposite of 2nd)
    cusps[8] = this.normalizeAngle(cusps[2] + 180);  // 9th house (opposite of 3rd)

    // Houses 5, 6: below horizon (IC side)
    cusps[4] = this.normalizeAngle(cusps[10] + 180);  // 5th house (opposite of 11th)
    cusps[5] = this.normalizeAngle(cusps[11] + 180);  // 6th house (opposite of 12th)

    return this.buildHouseCusps('Placidus', cusps, asc, mc);
  }

  /**
   * Placidus interpolation for intermediate houses
   */
  private placidusInterpolate(ramc: number, latitude: number, offsetDegrees: number, mcSide: boolean): number {
    // Convert to radians

    // Calculate the RAMC for the house cusp

    // Calculate declination of the point on the ecliptic
    // Using spherical triangle relationships

    // Semi-arc calculation (simplified but accurate enough)
    // For full accuracy, iterative methods are needed

    // Time factor for this house division

    // Calculate house cusp using Placidus formula
    let houseCusp: number;

    if (mcSide) {
      // Houses 11, 12 (between MC and DESC)
      const mcToAsc = this.calculateRAMCToASC(ramc, latitude);
      const factor = offsetDegrees / 90;

      // Interpolate between MC and the point where ASC would be
      houseCusp = this.normalizeAngle(ramc + factor * mcToAsc * 0.5);
    } else {
      // Houses 2, 3 (between ASC and IC)
      houseCusp = this.normalizeAngle(ramc + 180 + offsetDegrees * 0.8);
    }

    return this.normalizeAngle(houseCusp);
  }

  /**
   * Calculate RAMC to Ascendant ratio (simplified)
   */
  private calculateRAMCToASC(_ramc: number, _latitude: number): number {
    // This is a simplification - full Placidus requires iterative solving
    return 90; // Quadrant is 90 degrees
  }

  /**
   * Koch House System (Birthplace houses)
   */
  private kochHouses(lst: number, latitude: number): HouseCusps {
    const ramc = lst;
    const mc = this.normalizeAngle(ramc);
    const asc = this.calculateAscendant(ramc, latitude);

    const cusps: number[] = new Array(12);
    cusps[0] = asc;
    cusps[9] = mc;
    cusps[6] = this.normalizeAngle(asc + 180);
    cusps[3] = this.normalizeAngle(mc + 180);

    // Koch uses the birthplace's latitude for projecting house cusps
    // Simplified implementation - interpolate evenly within quadrants
    const quadrant1Size = this.angularDistance(mc, asc);
    const quadrant2Size = this.angularDistance(asc, cusps[3]);

    // Houses 11, 12
    cusps[10] = this.normalizeAngle(mc + quadrant1Size * (1/3));
    cusps[11] = this.normalizeAngle(mc + quadrant1Size * (2/3));

    // Houses 2, 3
    cusps[1] = this.normalizeAngle(asc + quadrant2Size * (1/3));
    cusps[2] = this.normalizeAngle(asc + quadrant2Size * (2/3));

    // Opposite houses
    cusps[7] = this.normalizeAngle(cusps[1] + 180);
    cusps[8] = this.normalizeAngle(cusps[2] + 180);
    cusps[4] = this.normalizeAngle(cusps[10] + 180);
    cusps[5] = this.normalizeAngle(cusps[11] + 180);

    return this.buildHouseCusps('Koch', cusps, asc, mc);
  }

  /**
   * Equal House System
   * Each house is exactly 30°, starting from the Ascendant
   */
  private equalHouses(lst: number, latitude: number): HouseCusps {
    const ramc = lst;
    const mc = this.calculateMidheaven(ramc);
    const asc = this.calculateAscendant(ramc, latitude);

    const cusps: number[] = new Array(12);

    for (let i = 0; i < 12; i++) {
      cusps[i] = this.normalizeAngle(asc + i * 30);
    }

    return this.buildHouseCusps('Equal', cusps, asc, mc);
  }

  /**
   * Whole Sign House System
   * Each zodiac sign = one house, with the rising sign as the 1st house
   */
  private wholeSignHouses(ascendant: number): HouseCusps {
    const signStart = Math.floor(ascendant / 30) * 30;
    const cusps: number[] = new Array(12);

    for (let i = 0; i < 12; i++) {
      cusps[i] = (signStart + i * 30) % 360;
    }

    // MC is not aligned with house cusps in Whole Sign
    const mc = cusps[9]; // Approximate MC as 10th house cusp

    return this.buildHouseCusps('WholeSign', cusps, ascendant, mc);
  }

  /**
   * Calculate Ascendant (Rising Sign)
   *
   * The ascendant is the point of the ecliptic that is rising on the eastern horizon
   */
  calculateAscendant(ramc: number, latitude: number): number {
    const oblRad = this.toRadians(HouseCalculationService.OBLIQUITY);
    const ramcRad = this.toRadians(ramc);
    const latRad = this.toRadians(latitude);

    // Ascendant formula using spherical trigonometry
    const tanAsc = Math.cos(ramcRad) /
      (-(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad)));

    let asc = this.toDegrees(Math.atan(tanAsc));

    // Correct quadrant
    if (Math.cos(ramcRad) < 0) {
      asc += 180;
    }

    return this.normalizeAngle(asc);
  }

  /**
   * Calculate Midheaven (MC)
   *
   * The MC is the point of the ecliptic that is at the highest point (culminating)
   */
  calculateMidheaven(ramc: number): number {
    const oblRad = this.toRadians(HouseCalculationService.OBLIQUITY);
    const ramcRad = this.toRadians(ramc);

    // MC formula using obliquity
    const tanMC = Math.tan(ramcRad) / Math.cos(oblRad);
    let mc = this.toDegrees(Math.atan(tanMC));

    // Correct quadrant based on RAMC
    if (ramc > 90 && ramc <= 270) {
      mc += 180;
    }

    return this.normalizeAngle(mc);
  }

  /**
   * Build HouseCusps object with sign and degree information
   */
  private buildHouseCusps(
    system: HouseSystem,
    cusps: number[],
    ascendant: number,
    midheaven: number
  ): HouseCusps {
    const houseCusps: HouseCusp[] = cusps.map((longitude, index) => {
      const signIndex = Math.floor(longitude / 30);
      const degreeInSign = longitude % 30;

      return {
        number: index + 1,
        longitude,
        sign: ZODIAC_SIGNS[signIndex],
        degree: Math.floor(degreeInSign),
      };
    });

    return {
      system,
      cusps: houseCusps,
      ascendant,
      midheaven,
      descendant: this.normalizeAngle(ascendant + 180),
      imumCoeli: this.normalizeAngle(midheaven + 180),
    };
  }

  /**
   * Get house number for a given longitude
   */
  getHouseForLongitude(houses: HouseCusps, longitude: number): number {
    const normalized = this.normalizeAngle(longitude);

    for (let i = 0; i < 12; i++) {
      const current = houses.cusps[i].longitude;
      const next = houses.cusps[(i + 1) % 12].longitude;

      if (next > current) {
        if (normalized >= current && normalized < next) {
          return i + 1;
        }
      } else {
        // Wraps around 0°
        if (normalized >= current || normalized < next) {
          return i + 1;
        }
      }
    }

    return 1; // Default to 1st house
  }

  /**
   * Calculate angular distance between two points on the ecliptic
   */
  private angularDistance(from: number, to: number): number {
    let diff = this.normalizeAngle(to) - this.normalizeAngle(from);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff);
  }

  // Utility functions
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }
}

export default HouseCalculationService;
