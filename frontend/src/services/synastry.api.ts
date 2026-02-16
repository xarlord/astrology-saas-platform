/**
 * Synastry API Service
 * Handles API calls for synastry and compatibility calculations
 */

import api from './api';

// Types
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
  planets: {
    [key: string]: {
      name: string;
      degree: number;
      minute: number;
      second: number;
      sign: string;
    };
  };
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

/**
 * Compare two charts and calculate synastry
 */
export async function compareCharts(chart1Id: string, chart2Id: string): Promise<SynastryChart> {
  const response = await api.post('/synastry/compare', { chart1Id, chart2Id });
  return response.data.data;
}

/**
 * Calculate compatibility scores between two charts
 */
export async function getCompatibility(
  chart1Id: string,
  chart2Id: string,
  includeComposite: boolean = false
): Promise<{
  chart1Id: string;
  chart2Id: string;
  scores: CompatibilityScores;
  elementalBalance: ElementalBalance;
  compositeChart?: CompositeChart;
}> {
  const response = await api.post('/synastry/compatibility', {
    chart1Id,
    chart2Id,
    includeComposite,
  });
  return response.data.data;
}

/**
 * Generate full compatibility report
 */
export async function generateCompatibilityReport(
  chart1Id: string,
  chart2Id: string
): Promise<CompatibilityReport> {
  const [synastryData, compatibilityData] = await Promise.all([
    compareCharts(chart1Id, chart2Id),
    getCompatibility(chart1Id, chart2Id, true),
  ]);

  return {
    user1Id: compatibilityData.chart1Id,
    user2Id: compatibilityData.chart2Id,
    scores: compatibilityData.scores,
    elementalBalance: compatibilityData.elementalBalance,
    relationshipDynamics: [], // Will be populated from interpretations
    strengths: synastryData.strengths,
    challenges: synastryData.challenges,
    growthOpportunities: [], // Will be populated from interpretations
    detailedReport: synastryData.advice,
  };
}

/**
 * Get all synastry reports for the current user
 */
export async function getSynastryReports(page: number = 1, limit: number = 10): Promise<{
  reports: SynastryReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get('/synastry/reports', {
    params: { page, limit },
  });
  return response.data.data;
}

/**
 * Get a specific synastry report
 */
export async function getSynastryReport(id: string): Promise<SynastryReport> {
  const response = await api.get(`/synastry/reports/${id}`);
  return response.data.data;
}

/**
 * Update synastry report (notes, favorite status)
 */
export async function updateSynastryReport(
  id: string,
  updates: {
    isFavorite?: boolean;
    notes?: string;
  }
): Promise<void> {
  await api.patch(`/synastry/reports/${id}`, updates);
}

/**
 * Delete a synastry report
 */
export async function deleteSynastryReport(id: string): Promise<void> {
  await api.delete(`/synastry/reports/${id}`);
}

export default {
  compareCharts,
  getCompatibility,
  generateCompatibilityReport,
  getSynastryReports,
  getSynastryReport,
  updateSynastryReport,
  deleteSynastryReport,
};
