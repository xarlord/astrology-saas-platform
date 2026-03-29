/**
 * AI Service
 * Handles AI-powered interpretation API calls
 */

import api from './api';
import type { Chart } from './api.types';

interface NatalChartData {
  chartId: string;
  birthData: unknown;
}

interface TransitForecastData {
  chartId: string;
  startDate: string;
  endDate: string;
}

interface SynastryChartData {
  chartA: Chart;
  chartB: Chart;
}

interface AIUsageStats {
  totalRequests: number;
  remainingRequests: number;
  resetDate: string;
}

export interface AIInterpretationResponse {
  interpretation: string;
  enhanced?: string;
  ai: boolean;
  source: string;
  generatedAt?: string;
}

type NatalChartData = Record<string, unknown>;
type TransitData = Record<string, unknown>;
type ChartData = Record<string, unknown>;
type UsageStats = Record<string, unknown>;

class AIService {
  /**
   * Generate AI natal interpretation
   */
  async generateNatal(chartData: NatalChartData): Promise<AIInterpretationResponse> {
    const response = await api.post<{ data: AIInterpretationResponse }>('/ai/natal', chartData);
    return response.data.data;
  }

  /**
   * Generate AI transit forecast
   */
  async generateTransit(transitData: TransitForecastData): Promise<AIInterpretationResponse> {
    const response = await api.post<{ data: AIInterpretationResponse }>('/ai/transit', transitData);
    return response.data.data;
  }

  /**
   * Generate AI compatibility analysis
   */
  async generateCompatibility(synastryData: SynastryChartData): Promise<AIInterpretationResponse> {
    const response = await api.post<{ data: AIInterpretationResponse }>('/ai/compatibility', synastryData);
    return response.data.data;
  }

  /**
   * Check AI service status
   */
  async checkStatus(): Promise<{ available: boolean; service: string | null }> {
    const response = await api.get<{ data: { available: boolean; service: string | null } }>('/ai/status');
    return response.data.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<AIUsageStats> {
    const response = await api.get<{ data: AIUsageStats }>('/ai/usage');
    return response.data.data;
  }
}

export default new AIService();
