/**
 * AI Service
 * Handles AI-powered interpretation API calls
 */

import api from './api';

export interface AIInterpretationResponse {
  interpretation: any;
  enhanced?: string;
  ai: boolean;
  source: string;
  generatedAt?: string;
}

class AIService {
  /**
   * Generate AI natal interpretation
   */
  async generateNatal(chartData: any): Promise<AIInterpretationResponse> {
    const response = await api.post('/ai/natal', chartData);
    return response.data.data;
  }

  /**
   * Generate AI transit forecast
   */
  async generateTransit(transitData: any): Promise<AIInterpretationResponse> {
    const response = await api.post('/ai/transit', transitData);
    return response.data.data;
  }

  /**
   * Generate AI compatibility analysis
   */
  async generateCompatibility(synastryData: {
    chartA: any;
    chartB: any;
  }): Promise<AIInterpretationResponse> {
    const response = await api.post('/ai/compatibility', synastryData);
    return response.data.data;
  }

  /**
   * Check AI service status
   */
  async checkStatus(): Promise<{ available: boolean; service: string | null }> {
    const response = await api.get('/ai/status');
    return response.data.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<any> {
    const response = await api.get('/ai/usage');
    return response.data.data;
  }
}

export default new AIService();
