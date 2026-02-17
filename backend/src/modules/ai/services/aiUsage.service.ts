/**
 * AI Usage Tracking Service
 * Tracks OpenAI API usage, calculates costs, and provides usage statistics
 */

import aiUsageModel from '../models/aiUsage.model';
import logger from '../../../utils/logger';

// Approximate OpenAI pricing (as of 2024)
const PRICING = {
  'gpt-4-turbo-preview': {
    input: 0.01 / 1000, // $0.01 per 1K tokens
    output: 0.03 / 1000, // $0.03 per 1K tokens
  },
  'gpt-4': {
    input: 0.03 / 1000, // $0.03 per 1K tokens
    output: 0.06 / 1000, // $0.06 per 1K tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000, // $0.0005 per 1K tokens
    output: 0.0015 / 1000, // $0.0015 per 1K tokens
  },
};

class AIUsageService {
  /**
   * Record AI usage after an API call
   */
  async record(data: {
    userId: string;
    type: string;
    inputTokens: number;
    outputTokens: number;
    metadata?: any;
  }): Promise<void> {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
      const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-4-turbo-preview'];

      const inputCost = data.inputTokens * pricing.input;
      const outputCost = data.outputTokens * pricing.output;
      const totalCost = inputCost + outputCost;
      const totalTokens = data.inputTokens + data.outputTokens;

      await aiUsageModel.record({
        userId: data.userId,
        type: data.type,
        tokensUsed: totalTokens,
        cost: totalCost,
        metadata: {
          ...data.metadata,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          model,
        },
      });

      logger.info('AI usage recorded', {
        userId: data.userId,
        type: data.type,
        tokens: totalTokens,
        cost: totalCost,
      });
    } catch (error) {
      logger.error('Failed to record AI usage:', error);
      // Don't throw - recording failures shouldn't break the main flow
    }
  }

  /**
   * Get comprehensive usage statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalCost: number;
    totalTokens: number;
    byType: Record<string, number>;
    costByType: Record<string, number>;
    recent: any[];
  }> {
    try {
      const totalCost = await aiUsageModel.getTotalCost(userId);
      const totalTokens = await aiUsageModel.getTotalTokens(userId);
      const byType = await aiUsageModel.getUsageByType(userId);
      const costByType = await aiUsageModel.getCostByType(userId);
      const recent = await aiUsageModel.getByUserId(userId, 10);

      return {
        totalCost,
        totalTokens,
        byType,
        costByType,
        recent,
      };
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Get usage history with pagination
   */
  async getUsageHistory(userId: string, limit = 50): Promise<any[]> {
    try {
      return await aiUsageModel.getByUserId(userId, limit);
    } catch (error) {
      logger.error('Failed to get usage history:', error);
      throw error;
    }
  }

  /**
   * Get daily usage statistics
   */
  async getDailyUsage(userId: string, days = 30): Promise<any[]> {
    try {
      return await aiUsageModel.getDailyUsage(userId, days);
    } catch (error) {
      logger.error('Failed to get daily usage:', error);
      throw error;
    }
  }

  /**
   * Check if user has exceeded usage cost limit
   */
  async checkLimit(userId: string, limit: number): Promise<boolean> {
    try {
      const totalCost = await aiUsageModel.getTotalCost(userId);
      return totalCost < limit;
    } catch (error) {
      logger.error('Failed to check usage limit:', error);
      // On error, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get usage for a specific date range
   */
  async getUsageByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      return await aiUsageModel.getByDateRange(userId, startDate, endDate);
    } catch (error) {
      logger.error('Failed to get usage by date range:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated cost before making API call
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-4-turbo-preview'];

    const inputCost = inputTokens * pricing.input;
    const outputCost = outputTokens * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get pricing information
   */
  getPricing(): Record<string, { input: number; output: number }> {
    return PRICING;
  }
}

export default new AIUsageService();
