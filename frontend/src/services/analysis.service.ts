/**
 * Analysis Service
 */

import api from './api';

interface SignInfo {
  sign: string;
  degree: number;
}

interface PlanetInSign {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface AspectInfo {
  planet1: string;
  planet2: string;
  type: string;
  degree: number;
  orb: number;
}

interface ChartPattern {
  type: string;
  planets: string[];
  strength: number;
}

export interface PersonalityAnalysis {
  chartId: string;
  chartName: string;
  overview: {
    sunSign: SignInfo;
    moonSign: SignInfo;
    ascendant: SignInfo;
  };
  planetsInSigns: PlanetInSign[];
  planetsInHouses: Record<string, number>;
  majorAspects: AspectInfo[];
  dominantElements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  chartPattern: ChartPattern;
}

interface AspectAnalysis {
  aspects: AspectInfo[];
  patterns: ChartPattern[];
  dominantModality: 'cardinal' | 'fixed' | 'mutable';
}

interface HousesAnalysis {
  houses: {
    number: number;
    sign: string;
    planets: string[];
  }[];
  emphasis: number[];
}

export const analysisService = {
  /**
   * Get personality analysis
   */
  async getPersonalityAnalysis(chartId: string): Promise<{ analysis: PersonalityAnalysis }> {
    const { data } = await api.get<{ data: { analysis: PersonalityAnalysis } }>(`/analysis/${chartId}`);
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
  async getPlanetsInSigns(chartId: string): Promise<{ planetsInSigns: PlanetInSign[] }> {
    const { data } = await api.get<{ data: { planetsInSigns: PlanetInSign[] } }>(`/analysis/${chartId}/planets`);
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
