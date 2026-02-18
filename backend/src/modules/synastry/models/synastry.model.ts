/**
 * Synastry Model Interfaces
 * TypeScript interfaces for synastry/compatibility feature
 */

// Re-export commonly used types from calendar module
export { Planet, ZodiacSign } from '../../calendar/models/calendar.model';

export interface NatalChart {
  id: string;
  userId: string;
  planets: {
    sun?: PlanetPosition;
    moon?: PlanetPosition;
    mercury?: PlanetPosition;
    venus?: PlanetPosition;
    mars?: PlanetPosition;
    jupiter?: PlanetPosition;
    saturn?: PlanetPosition;
    uranus?: PlanetPosition;
    neptune?: PlanetPosition;
    pluto?: PlanetPosition;
  };
}

export interface PlanetPosition {
  name: string;
  degree: number;
  minute: number;
  second: number;
  sign: ZodiacSign;
}

export interface SynastryChart {
  id: string;
  chart1Id: string;
  chart2Id: string;
  synastryAspects: SynastryAspect[];
  overallCompatibility: number;
  relationshipTheme: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

export interface SynastryAspect {
  planet1: string;
  planet2: string;
  aspect: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
  weight: number;
  soulmateIndicator: boolean;
}

export interface CompositePlanet {
  name: string;
  degree: number;
  minute: number;
  second: number;
  sign: ZodiacSign;
}

export interface CompositeChart {
  chart1Id: string;
  chart2Id: string;
  planets: {
    sun?: CompositePlanet;
    moon?: CompositePlanet;
    mercury?: CompositePlanet;
    venus?: CompositePlanet;
    mars?: CompositePlanet;
    jupiter?: CompositePlanet;
    saturn?: CompositePlanet;
    uranus?: CompositePlanet;
    neptune?: CompositePlanet;
    pluto?: CompositePlanet;
  };
  interpretation: string;
}

export interface CompatibilityScores {
  overall: number;
  romantic: number;
  communication: number;
  emotional: number;
  intellectual: number;
  spiritual: number;
  values: number;
}

export interface ElementalBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  balance: 'well-balanced' | 'balanced' | 'imbalanced';
}

export interface CompatibilityReport {
  user1Id: string;
  user2Id: string;
  scores: CompatibilityScores;
  elementalBalance: ElementalBalance;
  relationshipDynamics: string[];
  strengths: string[];
  challenges: string[];
  growthOpportunities: string[];
  detailedReport: string;
}

export interface SynastryComparisonRequest {
  chart1Id: string;
  chart2Id: string;
}

export interface SynastryComparisonResponse {
  synastryChart: SynastryChart;
  compositeChart?: CompositeChart;
  compatibilityReport: CompatibilityReport;
}

export interface SynastryRequest {
  targetUserId: string; // Compare current user with this user
}
