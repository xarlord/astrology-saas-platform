/**
 * Synastry API Service
 * Handles API calls for synastry and compatibility calculations
 */

import api from './api';

// Types from central location (imported for local use and re-exported)
import type { SynastryAspect, CompatibilityScores, ElementalBalance, SynastryChart, CompositeChart, CompatibilityReport, SynastryReport } from '../types/synastry.types';
export type { SynastryAspect, CompatibilityScores, ElementalBalance, SynastryChart, CompositeChart, CompatibilityReport, SynastryReport };

/**
 * Compare two charts and calculate synastry
 */
export async function compareCharts(chart1Id: string, chart2Id: string): Promise<SynastryChart> {
  const response = await api.post<{ data: SynastryChart }>('/synastry/compare', { chart1Id, chart2Id });
  return response.data.data;
}

/**
 * Calculate compatibility scores between two charts
 */
export async function getCompatibility(
  chart1Id: string,
  chart2Id: string,
  includeComposite = false
): Promise<{
  chart1Id: string;
  chart2Id: string;
  scores: CompatibilityScores;
  elementalBalance: ElementalBalance;
  compositeChart?: CompositeChart;
}> {
  const response = await api.post<{ data: {
    chart1Id: string;
    chart2Id: string;
    scores: CompatibilityScores;
    elementalBalance: ElementalBalance;
    compositeChart?: CompositeChart;
  } }>('/synastry/compatibility', {
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
export async function getSynastryReports(page = 1, limit = 10): Promise<{
  reports: SynastryReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get<{ data: {
    reports: SynastryReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } }>('/synastry/reports', {
    params: { page, limit },
  });
  return response.data.data;
}

/**
 * Get a specific synastry report
 */
export async function getSynastryReport(id: string): Promise<SynastryReport> {
  const response = await api.get<{ data: SynastryReport }>(`/synastry/reports/${id}`);
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
