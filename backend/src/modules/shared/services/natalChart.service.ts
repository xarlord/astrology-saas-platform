/**
 * Natal Chart Service
 *
 * @requirement REQ-API-001
 * @description Complete natal chart calculation combining planetary positions,
 * Houses, and aspects
 */

import { AstronomyEngineService, PlanetaryPosition, ZodiacSign } from './astronomyEngine.service';
import { HouseCalculationService, HouseCusps, HouseSystem } from './houseCalculation.service';

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx' | 'semisextile' | 'semisquare' | 'sesquiquadrate' | 'biquintile';
  orb: number;
  exact: boolean;
  applying?: boolean;
  harmonious: boolean;
}

export interface NatalChart {
  birthData: {
    date: Date;
    latitude: number;
    longitude: number;
    location?: string;
    timezone?: string;
  };
  julianDay: number;
  localSiderealTime: number;
  planets: Map<string, PlanetaryPosition>;
  houses: HouseCusps;
  aspects: Aspect[];
  elements: ElementalBalance;
  modalities: ModalityBalance;
  lunarNodes?: {
    northNode: { longitude: number; sign: ZodiacSign; degree: number };
    southNode: { longitude: number; sign: ZodiacSign; degree: number };
  };
  chiron?: {
    longitude: number;
    sign: ZodiacSign;
    degree: number;
    isRetrograde: boolean;
  };
  partOfFortune?: number;
}

export interface ElementalBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}
export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}
export interface NatalChartInput {
  birthDate: Date | string;
  birthTime?: string;
  latitude: number;
  longitude: number;
  location?: string;
  /** IANA timezone name, e.g. "Europe/Istanbul". Used to convert local birth time to UTC. */
  timezone?: string;
  houseSystem?: HouseSystem;
  includeChiron?: boolean;
  includeNodes?: boolean;
}

// Aspect orbs (allowable deviation in degrees)
const ASPECT_ORBS: Record<string, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6,
  quincunx: 3,
  semisquare: 2,
  sesquiquadrate: 2,
  biquintile: 2,
  semisextile: 2,
};

// Aspect angles
const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  semisextile: 30,
  sextile: 60,
  semisquare: 45,
  square: 90,
  sesquiquadrate: 135,
  trine: 120,
  biquintile: 144,
  quincunx: 150,
  opposition: 180,
};

// Element mapping
const ELEMENT_MAP: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire',
  Leo: 'fire',
  Sagittarius: 'fire',
  Taurus: 'earth',
  Virgo: 'earth',
  Capricorn: 'earth',
  Gemini: 'air',
  Libra: 'air',
  Aquarius: 'air',
  Cancer: 'water',
  Scorpio: 'water',
  Pisces: 'water',
};

// Modality mapping
const MODALITY_MAP: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal',
  Cancer: 'cardinal',
  Libra: 'cardinal',
  Capricorn: 'cardinal',
  Taurus: 'fixed',
  Leo: 'fixed',
  Scorpio: 'fixed',
  Aquarius: 'fixed',
  Gemini: 'mutable',
  Virgo: 'mutable',
  Sagittarius: 'mutable',
  Pisces: 'mutable',
};

export class NatalChartService {
  private astronomyEngine: AstronomyEngineService;
  private houseCalculator: HouseCalculationService;

  constructor() {
    this.astronomyEngine = new AstronomyEngineService();
    this.houseCalculator = new HouseCalculationService();
  }

  /**
   * Calculate complete natal chart
   */
  calculateNatalChart(input: NatalChartInput): NatalChart {
    const { birthDate, birthTime, latitude, longitude } = input;

    const houseSystem = input.houseSystem || 'Placidus';
    const includeChiron = input.includeChiron ?? true;
    const includeNodes = input.includeNodes ?? true;

    // Convert birthDate to Date if it's a string
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

    // Parse birth time or use noon
    let birthDateTime: Date;
    if (birthTime) {
      birthDateTime = this.parseBirthTime(birthDateObj, birthTime);
      // Convert local birth time to UTC using timezone offset
      if (input.timezone) {
        birthDateTime = this.localTimeToUTC(birthDateTime, input.timezone);
      }
    } else {
      birthDateTime = new Date(birthDateObj);
      birthDateTime.setUTCHours(12, 0, 0, 0);
    }

    // Calculate Julian Day
    const julianDay = this.astronomyEngine.calculateJulianDay(birthDateTime);

    // Calculate Local Sidereal Time (in degrees)
    const lst = this.astronomyEngine.calculateLocalSiderealTime(birthDateTime, longitude);

    // Calculate planetary positions
    const planets = this.astronomyEngine.calculatePlanetaryPositions(
      birthDateTime,
      latitude,
      longitude,
    );

    // Calculate houses
    // Whole Sign system requires the ascendant to determine the 1st house sign
    const ascendant = this.houseCalculator.calculateAscendant(lst, latitude);
    const houses = this.houseCalculator.calculateHouses(lst, latitude, houseSystem, ascendant);

    // Assign planets to houses
    this.assignPlanetsToHouses(planets, houses);

    // Calculate aspects between planets (including ASC and MC as points)
    const mc = this.houseCalculator.calculateMidheaven(lst);
    const aspects = this.calculateAspects(planets, ascendant, mc);

    // Calculate Part of Fortune (always use day formula: ASC + Moon - Sun)
    const sunPos = planets.get('Sun');
    const moonPos = planets.get('Moon');
    let partOfFortune: number | undefined;
    if (sunPos && moonPos) {
      partOfFortune = this.normalizeAngle(ascendant + moonPos.longitude - sunPos.longitude);
    }

    // Calculate elemental and modality balance
    const elements = this.calculateElements(planets);
    const modalities = this.calculateModalities(planets);

    // Calculate lunar nodes if requested
    let lunarNodes;
    if (includeNodes) {
      const nodes = this.astronomyEngine.calculateLunarNodes(birthDateTime);
      lunarNodes = {
        northNode: {
          longitude: nodes.northNode.longitude,
          sign: nodes.northNode.sign as ZodiacSign,
          degree: nodes.northNode.degree,
        },
        southNode: {
          longitude: nodes.southNode.longitude,
          sign: nodes.southNode.sign as ZodiacSign,
          degree: nodes.southNode.degree,
        },
      };
    }

    // Calculate Chiron if requested
    let chiron;
    if (includeChiron) {
      const chironPos = this.astronomyEngine.calculateChiron(birthDateTime);
      chiron = {
        longitude: chironPos.longitude,
        sign: chironPos.sign as ZodiacSign,
        degree: chironPos.degree,
        isRetrograde: chironPos.isRetrograde,
      };
    }

    return {
      birthData: {
        date: birthDateTime,
        latitude,
        longitude,
        location: input.location,
        timezone: input.timezone,
      },
      julianDay,
      localSiderealTime: lst,
      planets,
      houses,
      aspects,
      elements,
      modalities,
      lunarNodes,
      chiron,
      partOfFortune,
    };
  }

  /**
   * Parse birth time string (HH:MM format)
   */
  private parseBirthTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setUTCHours(hours || 0, minutes || 0, 0, 0);
    return result;
  }

  /**
   * Convert a Date that has local wall-clock time in UTC fields
   * to the correct UTC Date, using the IANA timezone for offset.
   *
   * E.g. birthTime "15:20" in "Europe/Istanbul" (UTC+3):
   *   - parseBirthTime creates 1982-12-14T15:20:00Z (wrong - treated as UTC)
   *   - This method returns 1982-12-14T12:20:00Z (correct - adjusted for UTC+3)
   */
  private localTimeToUTC(localDate: Date, timezone: string): Date {
    try {
      const y = localDate.getUTCFullYear();
      const m = localDate.getUTCMonth();
      const d = localDate.getUTCDate();
      const h = localDate.getUTCHours();
      const min = localDate.getUTCMinutes();

      // Wall-clock time as UTC (e.g. 15:20 UTC)
      const wallUTC = new Date(Date.UTC(y, m, d, h, min, 0));

      // Check what this UTC moment looks like in the target timezone
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(wallUTC);

      const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0');
      const tzMin = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');

      // Offset in minutes: how far ahead the timezone is from UTC
      // e.g. Istanbul shows 18:20 when UTC is 15:20 → offset = +180min (+3h)
      const offsetMin = (tzHour * 60 + tzMin) - (h * 60 + min);

      // True UTC = wallUTC - offset (to show 15:20 in tz, UTC must be 12:20)
      return new Date(wallUTC.getTime() - offsetMin * 60 * 1000);
    } catch {
      return localDate;
    }
  }

  /**
   * Assign planets to their houses
   */
  private assignPlanetsToHouses(planets: Map<string, PlanetaryPosition>, houses: HouseCusps): void {
    for (const planet of planets.values()) {
      const house = this.getHouseForLongitude(planet.longitude, houses);
      planet.house = house;
    }
  }

  /**
   * Get house number for a given longitude
   */
  private getHouseForLongitude(longitude: number, houses: HouseCusps): number {
    const normalized = this.normalizeAngle(longitude);

    for (let i = 0; i < 12; i++) {
      const currentCusp = houses.cusps[i].longitude;
      const nextCusp = houses.cusps[(i + 1) % 12].longitude;

      let endCusp = nextCusp;
      if (i === 11) {
        // 12th house ends at 1st house cusp + 30°
        endCusp = this.normalizeAngle(houses.cusps[0].longitude + 30);
      }

      // Check if longitude is between current cusp and next cusp
      if (currentCusp <= endCusp) {
        if (normalized >= currentCusp && normalized < endCusp) {
          return i + 1;
        }
      } else {
        // Handle wrap-around at 0st house (0°)
        if (normalized >= currentCusp || normalized < endCusp) {
          return i + 1;
        }
      }
    }
    return 1; // Default to 1st house
  }

  /**
   * Calculate aspects between all planets
   */
  private calculateAspects(planets: Map<string, PlanetaryPosition>, ascendant?: number, mc?: number): Aspect[] {
    const aspects: Aspect[] = [];
    const planetArray = Array.from(planets.entries());

    // Build extended list including ASC and MC as aspect points
    const allPoints: Array<[string, number]> = planetArray.map(([name, pos]) => [name, pos.longitude]);
    if (ascendant !== undefined) allPoints.push(['Ascendant', ascendant]);
    if (mc !== undefined) allPoints.push(['Midheaven', mc]);

    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        const [name1, lon1] = allPoints[i];
        const [name2, lon2] = allPoints[j];

        const aspect = this.calculateAspect(name1, lon1, name2, lon2);
        if (aspect) {
          aspects.push(aspect);
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate aspect between two planets
   */
  private calculateAspect(
    planet1: string,
    longitude1: number,
    planet2: string,
    longitude2: number,
  ): Aspect | null {
    const diff = this.angularDistance(longitude1, longitude2);

    for (const [type, angle] of Object.entries(ASPECT_ANGLES)) {
      const orb = ASPECT_ORBS[type];
      const deviation = Math.abs(diff - angle);

      if (deviation <= orb) {
        return {
          planet1,
          planet2,
          type: type as Aspect['type'],
          orb: deviation,
          exact: deviation < 1,
          applying: this.isApplying(longitude1, longitude2, diff, angle),
          harmonious: type === 'trine' || type === 'sextile' || type === 'semisextile',
        };
      }
    }

    return null;
  }

  /**
   * Check if aspect is applying (getting tighter)
   */
  private isApplying(lon1: number, lon2: number, actualDiff: number, targetAngle: number): boolean {
    // Determine if the aspect is applying or separating
    // This is simplified - a more accurate approach would compare speeds
    const diff1 = this.angularDistance(lon1, lon2);
    // If the difference is moving toward the target angle, it's applying
    return Math.abs(diff1 - targetAngle) < Math.abs(actualDiff - targetAngle);
  }

  /**
   * Calculate angular distance between two points
   */
  private angularDistance(lon1: number, lon2: number): number {
    let diff = Math.abs(lon1 - lon2);
    if (diff > 180) diff = 360 - diff;
    return diff;
  }

  /**
   * Calculate elemental balance
   */
  private calculateElements(planets: Map<string, PlanetaryPosition>): ElementalBalance {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };

    for (const planet of Array.from(planets.values())) {
      const element = ELEMENT_MAP[planet.sign];
      if (element) {
        elements[element]++;
      }
    }

    return elements;
  }

  /**
   * Calculate modality balance
   */
  private calculateModalities(planets: Map<string, PlanetaryPosition>): ModalityBalance {
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };

    for (const planet of Array.from(planets.values())) {
      const modality = MODALITY_MAP[planet.sign];
      if (modality) {
        modalities[modality]++;
      }
    }

    return modalities;
  }

  /**
   * Normalize angle to 0-360°
   */
  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }
}

export default NatalChartService;
