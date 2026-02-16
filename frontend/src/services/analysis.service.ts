/**
 * Analysis Service
 */

import api from './api';

export interface PersonalityAnalysis {
  chartId: string;
  chartName: string;
  overview: {
    sunSign: any;
    moonSign: any;
    ascendant: any;
  };
  planetsInSigns: any[];
  planetsInHouses: Record<string, number>;
  majorAspects: any[];
  dominantElements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  chartPattern: any;
}

export const analysisService = {
  /**
   * Get personality analysis
   */
  async getPersonalityAnalysis(chartId: string): Promise<{ analysis: PersonalityAnalysis }> {
    const { data } = await api.get(`/analysis/${chartId}`);
    return data.data;
  },

  /**
   * Get aspect analysis
   */
  async getAspectAnalysis(chartId: string): Promise<{ aspectAnalysis: any }> {
    const { data } = await api.get(`/analysis/${chartId}/aspects`);
    return data.data;
  },

  /**
   * Get aspect patterns
   */
  async getAspectPatterns(chartId: string): Promise<{ patterns: any }> {
    const { data } = await api.get(`/analysis/${chartId}/patterns`);
    return data.data;
  },

  /**
   * Get planets in signs
   */
  async getPlanetsInSigns(chartId: string): Promise<{ planetsInSigns: any[] }> {
    const { data } = await api.get(`/analysis/${chartId}/planets`);
    return data.data;
  },

  /**
   * Get houses analysis
   */
  async getHousesAnalysis(chartId: string): Promise<{ housesAnalysis: any }> {
    const { data } = await api.get(`/analysis/${chartId}/houses`);
    return data.data;
  },
};
