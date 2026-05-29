/* eslint-disable */
/**
 * Chart-related types
 * Central type definitions for chart data, birth data, and chart rendering
 */

// Birth data for chart creation
export interface BirthData {
  name: string;
  type?: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: string;
  birth_time: string;
  birth_time_unknown?: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system?: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac?: 'tropical' | 'sidereal';
  sidereal_mode?: string;
}

// Chart record from API
export interface Chart {
  id: string;
  name: string;
  type: string;
  birth_date: string;
  birth_time: string;
  birth_place_name: string;
  birth_data?: {
    birth_date: string;
    birth_time: string;
    birth_place_name: string;
    birth_latitude?: number;
    birth_longitude?: number;
    birth_timezone?: string;
  };
  calculated_data?: CalculatedChartData;
  positions?: Record<string, PlanetPosition>;
  tags?: string[];
  element?: string;
  created_at: string;
  createdAt?: string;
  birthData?: BirthData;
  house_system?: string;
  zodiac?: string;
}

// Calculated chart data from API
export interface CalculatedChartData {
  planets?: {
    name: string;
    planet?: string;
    sign: string;
    degree: number;
    house: number;
    element?: string;
    quality?: string;
    longitude?: number;
    speed?: number;
    retrograde?: boolean;
  }[];
  aspects?: {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }[];
  houses?: HouseCusp[];
  ascendant?: number;
  midheaven?: number;
}

// Planet position in a chart wheel
export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
  latitude: number;
  longitude: number;
  speed: number;
}

// House cusp in a chart wheel
export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  cusp?: number; // Ecliptic longitude 0-360
}

// Aspect between two planets
export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semisextile' | 'semisquare' | 'sesquiquadrate' | 'biquintile';
  degree: number;
  minute: number;
  orb: number;
  applying: boolean;
  separating: boolean;
}

// Planet data returned by backend as a Record (keyed by lowercase name)
export interface PlanetData {
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  isRetrograde: boolean;
  house: number;
  distance?: number;
}

// Complete chart wheel data
export interface ChartData {
  planets: PlanetPosition[] | Record<string, PlanetData>;
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant?: number;
  midheaven?: number;
}

// House system options
export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
