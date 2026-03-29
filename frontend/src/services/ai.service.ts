/**
 * AI Service
 * Handles AI-powered interpretation API calls
 */

import api from './api';

export interface AIInterpretationResponse {
  interpretation: Record<string, unknown>;
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
    const response = await api.post('/ai/natal', chartData);
    const responseData = response.data as { data: AIInterpretationResponse };
    return responseData.data;
  }

  /**
   * Generate AI transit forecast
   */
  async generateTransit(transitData: TransitData): Promise<AIInterpretationResponse> {
    const response = await api.post('/ai/transit', transitData);
    const responseData = response.data as { data: AIInterpretationResponse };
    return responseData.data;
  }

  /**
   * Generate AI compatibility analysis
   */
  async generateCompatibility(synastryData: {
    chartA: ChartData;
    chartB: ChartData;
  }): Promise<AIInterpretationResponse> {
    const response = await api.post('/ai/compatibility', synastryData);
    const responseData = response.data as { data: AIInterpretationResponse };
    return responseData.data;
  }

  /**
   * Check AI service status
   */
  async checkStatus(): Promise<{ available: boolean; service: string | null }> {
    const response = await api.get('/ai/status');
    const responseData = response.data as { data: { available: boolean; service: string | null } };
    return responseData.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await api.get('/ai/usage');
    const responseData = response.data as { data: UsageStats };
    return responseData.data;
  }
}

export default new AIService();
