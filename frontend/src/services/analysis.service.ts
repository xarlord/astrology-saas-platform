/**
 * Analysis Service
 */

import api from './api';

interface SignInfo {
  sign: string;
  degree: number;
}

interface AspectInfo {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
}

interface PlanetInSign {
  planet: string;
  sign: string;
  degree: number;
  house: number;
}

interface ChartPatternInfo {
  name: string;
  description: string;
}

interface AspectAnalysisData {
  aspects: AspectInfo[];
  summary: string;
}

interface AspectPatternsData {
  patterns: ChartPatternInfo[];
}

interface HousesAnalysisData {
  houses: Record<string, { sign: string; planets: string[] }>;
  summary: string;
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
  chartPattern: ChartPatternInfo;
}

interface PersonalityAnalysisResponse {
  data: { analysis: PersonalityAnalysis };
}

interface AspectAnalysisResponse {
  data: { aspectAnalysis: AspectAnalysisData };
}

interface AspectPatternsResponse {
  data: { patterns: AspectPatternsData };
}

interface PlanetsInSignsResponse {
  data: { planetsInSigns: PlanetInSign[] };
}

interface HousesAnalysisResponse {
  data: { housesAnalysis: HousesAnalysisData };
}

export const analysisService = {
  /**
   * Get personality analysis
   */
  async getPersonalityAnalysis(chartId: string): Promise<{ analysis: PersonalityAnalysis }> {
    const { data } = await api.get<PersonalityAnalysisResponse>(`/analysis/${chartId}`);
    return data.data;
  },

  /**
   * Get aspect analysis
   */
  async getAspectAnalysis(chartId: string): Promise<{ aspectAnalysis: AspectAnalysisData }> {
    const { data } = await api.get<AspectAnalysisResponse>(`/analysis/${chartId}/aspects`);
    return data.data;
  },

  /**
   * Get aspect patterns
   */
  async getAspectPatterns(chartId: string): Promise<{ patterns: AspectPatternsData }> {
    const { data } = await api.get<AspectPatternsResponse>(`/analysis/${chartId}/patterns`);
    return data.data;
  },

  /**
   * Get planets in signs
   */
  async getPlanetsInSigns(chartId: string): Promise<{ planetsInSigns: PlanetInSign[] }> {
    const { data } = await api.get<PlanetsInSignsResponse>(`/analysis/${chartId}/planets`);
    return data.data;
  },

  /**
   * Get houses analysis
   */
  async getHousesAnalysis(chartId: string): Promise<{ housesAnalysis: HousesAnalysisData }> {
    const { data } = await api.get<HousesAnalysisResponse>(`/analysis/${chartId}/houses`);
    return data.data;
  },
};
