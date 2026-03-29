/**
 * Synastry Types
 * Centralized type definitions for synastry and compatibility calculations
 */

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

export interface CompositeChart {
  chart1Id: string;
  chart2Id: string;
  planets: Record<string, {
      name: string;
      degree: number;
      minute: number;
      second: number;
      sign: string;
    }>;
  interpretation: string;
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

export interface SynastryReport {
  id: string;
  chart1Id: string;
  chart2Id: string;
  synastryAspects: SynastryAspect[];
  overallCompatibility: number;
  relationshipTheme: string;
  strengths: string[];
  challenges: string[];
  advice: string;
  isFavorite?: boolean;
  notes?: string;
  createdAt: string;
}
