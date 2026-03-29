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
  calculated_data?: ChartCalculatedData;
  created_at: string;
}

// Calculated chart data (opaque)
export type ChartCalculatedData = Record<string, unknown>;

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
}

// Aspect between two planets
export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile';
  degree: number;
  minute: number;
  orb: number;
  applying: boolean;
  separating: boolean;
}

// Complete chart wheel data
export interface ChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
}

// House system options
export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
