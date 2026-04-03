/**
 * Analysis Service
 */

import api from './api';

/** Matches backend PlanetInSignInterpretation from data/interpretations.ts */
interface PlanetInSignInterpretation {
  planet: string;
  sign: string;
  keywords: string[];
  general: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

/** Matches backend PersonalityAnalysisResponse from interpretation.service.ts */
interface PersonalityAnalysisResponse {
  overview: {
    sunSign: PlanetInSignInterpretation | null;
    moonSign: PlanetInSignInterpretation | null;
    ascendantSign?: PlanetInSignInterpretation;
  };
  planetsInSigns: Array<{
    planet: string;
    sign: string;
    house: number;
    interpretation: PlanetInSignInterpretation;
  }>;
  houses: Array<{
    house: number;
    signOnCusp: string;
    planetsInHouse: string[];
    themes: string[];
    interpretation: string;
    advice: string[];
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    harmonious: boolean | null;
    keywords: string[];
    interpretation: string;
    expression: string;
    advice: string[];
  }>;
  patterns: Array<{
    type: string;
    description: string;
    planets: string[];
    intensity: number;
  }>;
}

interface AspectAnalysis {
  chartId: string;
  aspectsByType: Record<string, unknown[]>;
  aspectGrid: Record<string, unknown>;
  majorAspects: unknown[];
  harmonicAspects: unknown[];
  challengingAspects: unknown[];
}

interface HousesAnalysis {
  houses: Array<{ cusp: number }>;
  planetsInHouses: Record<string, number>;
  houseRulers: Record<string, unknown>;
  emptyHouses: number[];
  stelliums: unknown[];
}

interface ChartPattern {
  type: string;
  planets: string[];
  strength: number;
}

export type { PersonalityAnalysisResponse, PlanetInSignInterpretation };

export const analysisService = {
  /**
   * Get personality analysis
   */
  async getPersonalityAnalysis(chartId: string): Promise<{ analysis: PersonalityAnalysisResponse }> {
    const { data } = await api.get<{ data: { analysis: PersonalityAnalysisResponse } }>(`/analysis/${chartId}`);
    return data.data;
  },

  /**
   * Get aspect analysis
   */
  async getAspectAnalysis(chartId: string): Promise<{ aspectAnalysis: AspectAnalysis }> {
    const { data } = await api.get<{ data: { aspectAnalysis: AspectAnalysis } }>(`/analysis/${chartId}/aspects`);
    return data.data;
  },

  /**
   * Get aspect patterns
   */
  async getAspectPatterns(chartId: string): Promise<{ patterns: ChartPattern[] }> {
    const { data } = await api.get<{ data: { patterns: ChartPattern[] } }>(`/analysis/${chartId}/patterns`);
    return data.data;
  },

  /**
   * Get planets in signs
   */
  async getPlanetsInSigns(chartId: string): Promise<{ planetsInSigns: unknown[] }> {
    const { data } = await api.get<{ data: { planetsInSigns: unknown[] } }>(`/analysis/${chartId}/planets`);
    return data.data;
  },

  /**
   * Get houses analysis
   */
  async getHousesAnalysis(chartId: string): Promise<{ housesAnalysis: HousesAnalysis }> {
    const { data } = await api.get<{ data: { housesAnalysis: HousesAnalysis } }>(`/analysis/${chartId}/houses`);
    return data.data;
  },
};
