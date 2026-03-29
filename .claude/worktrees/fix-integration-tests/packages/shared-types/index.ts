// Shared types stub for testing
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Chart Types
 * Common TypeScript interfaces for chart-related data
 */

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
  latitude?: number;
  longitude?: number;
  speed?: number;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  degree: number;
  minute: number;
  second: number;
  orb: number;
  applying: boolean;
  separating: boolean;
}

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semi-sextile';
