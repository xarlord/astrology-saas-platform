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
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx' | 'semisextile';
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
  timezone?: string;
  houseSystem?: HouseSystem;
  includeChiron?: boolean;
  includeNodes?: boolean;
}

// Aspect orbs (allowable deviation in degrees)
const ASPECT_ORBS: Record<string, number> = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 6,
  sextile: 4,
  quincunx: 3,
  semisextile: 2,
};

// Aspect angles
const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  semisextile: 30,
  sextile: 60,
  square: 90,
  trine: 120,
  quincunx: 150,
  opposition: 180,
};

// Element mapping
const ELEMENT_MAP: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

// Modality mapping
const MODALITY_MAP: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
  Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
  Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
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
    const {
      birthDate,
      birthTime,
      latitude,
      longitude,
    } = input;

    const houseSystem = input.houseSystem || 'Placidus';
    const includeChiron = input.includeChiron ?? true;
    const includeNodes = input.includeNodes ?? true;

    // Convert birthDate to Date if it's a string
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

    // Parse birth time or use noon
    const birthDateTime = birthTime
      ? this.parseBirthTime(birthDateObj, birthTime)
      : new Date(birthDateObj);
    birthDateTime.setHours(12, 0, 0, 0);

    // Calculate Julian Day
    const julianDay = this.astronomyEngine.calculateJulianDay(birthDateTime);

    // Calculate Local Sidereal Time (in degrees)
    const lst = this.astronomyEngine.calculateLocalSiderealTime(birthDateTime, longitude);

    // Calculate planetary positions
    const planets = this.astronomyEngine.calculatePlanetaryPositions(
      birthDateTime,
      latitude,
      longitude
    );

    // Calculate houses
    const houses = this.houseCalculator.calculateHouses(lst, latitude, houseSystem);

    // Assign planets to houses
    this.assignPlanetsToHouses(planets, houses);

    // Calculate aspects between planets
    const aspects = this.calculateAspects(planets);

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
    };
  }

  /**
   * Parse birth time string (HH:MM format)
   */
  private parseBirthTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours || 0, minutes || 0, 0, 0);
    return result;
  }

  /**
   * Assign planets to their houses
   */
  private assignPlanetsToHouses(
    planets: Map<string, PlanetaryPosition>,
    houses: HouseCusps
  ): void {
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
  private calculateAspects(planets: Map<string, PlanetaryPosition>): Aspect[] {
    const aspects: Aspect[] = [];
    const planetArray = Array.from(planets.entries());

    for (let i = 0; i < planetArray.length; i++) {
      for (let j = i + 1; j < planetArray.length; j++) {
        const [name1, pos1] = planetArray[i];
        const [name2, pos2] = planetArray[j];

        const aspect = this.calculateAspect(name1, pos1.longitude, name2, pos2.longitude);
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
    longitude2: number
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
