/**
 * Synastry API Service
 * Handles API calls for synastry and compatibility calculations
 * Includes timeout handling, error recovery, and retry logic
 */

import api from './api';

// Error class for synastry-specific errors
export class SynastryServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable = false,
  ) {
    super(message);
    this.name = 'SynastryServiceError';
  }
}

// Configuration
const SYNASTRY_TIMEOUT = 60000; // 60 seconds for complex calculations
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

// Helper: delay for retry
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: retry with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      // Only retry on timeout or 5xx errors
      if (error instanceof SynastryServiceError) {
        if (!error.retryable && error.statusCode && error.statusCode < 500) {
          throw error;
        }
      }

      await delay(RETRY_DELAY * Math.pow(2, attempt));
    }
  }
  throw new SynastryServiceError('Max retries exceeded', 'MAX_RETRIES');
}

// Types
export interface SynastryAspect {
  planet1: string;
  planet2: string;
  aspect:
    | 'conjunction'
    | 'opposition'
    | 'trine'
    | 'square'
    | 'sextile'
    | 'quincunx'
    | 'semi-sextile';
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
  planets: Record<
    string,
    {
      name: string;
      degree: number;
      minute: number;
      second: number;
      sign: string;
    }
  >;
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
 * @throws SynastryServiceError on failure
 * @param retryAttempts Number of retry attempts for timeout errors
 */
export async function compareCharts(
  chart1Id: string,
  chart2Id: string,
  retryAttempts = MAX_RETRIES,
): Promise<SynastryChart> {
  return retryWithBackoff(async () => {
    try {
      const response = await api.post<{ data: SynastryChart }>(
        '/synastry/compare',
        { chart1Id, chart2Id },
        { timeout: SYNASTRY_TIMEOUT },
      );

      if (!response.data?.data) {
        throw new SynastryServiceError('Invalid response from synastry API', 'INVALID_RESPONSE');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof SynastryServiceError) throw error;

      const isTimeout =
        error instanceof Error &&
        (error.message.includes('timeout') || error.message.includes('ECONNABORTED'));

      throw new SynastryServiceError(
        error instanceof Error ? error.message : 'Failed to compare charts',
        'COMPARE_FAILED',
        undefined,
        isTimeout, // Retryable if it's a timeout
      );
    }
  }, retryAttempts);
}

/**
 * Calculate compatibility scores between two charts
 * @throws SynastryServiceError on failure
 */
export async function getCompatibility(
  chart1Id: string,
  chart2Id: string,
  includeComposite = false,
  signal?: AbortSignal,
): Promise<{
  chart1Id: string;
  chart2Id: string;
  scores: CompatibilityScores;
  elementalBalance: ElementalBalance;
  compositeChart?: CompositeChart;
}> {
  return retryWithBackoff(async () => {
    try {
      const response = await api.post<{
        data: {
          chart1Id: string;
          chart2Id: string;
          scores: CompatibilityScores;
          elementalBalance: ElementalBalance;
          compositeChart?: CompositeChart;
        };
      }>(
        '/synastry/compatibility',
        { chart1Id, chart2Id, includeComposite },
        {
          timeout: SYNASTRY_TIMEOUT,
          signal, // Allow cancellation via AbortController
        },
      );

      if (!response.data?.data) {
        throw new SynastryServiceError(
          'Invalid response from compatibility API',
          'INVALID_RESPONSE',
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof SynastryServiceError) throw error;

      const isTimeout =
        error instanceof Error &&
        (error.message.includes('timeout') || error.message.includes('ECONNABORTED'));

      throw new SynastryServiceError(
        error instanceof Error ? error.message : 'Failed to calculate compatibility',
        'COMPATIBILITY_FAILED',
        undefined,
        isTimeout,
      );
    }
  });
}

/**
 * Create an AbortController for cancellation
 * Useful for cancelling long-running synastry calculations
 */
export function createSynastryController(): AbortController {
  return new AbortController();
}

/**
 * Generate full compatibility report
 */
export async function generateCompatibilityReport(
  chart1Id: string,
  chart2Id: string,
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
export async function getSynastryReports(
  page = 1,
  limit = 10,
): Promise<{
  reports: SynastryReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get<{
    data: {
      reports: SynastryReport[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }>('/synastry/reports', {
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
  },
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
