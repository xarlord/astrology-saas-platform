/**
 * AI Usage Model
 * Tracks API usage, tokens, and costs for AI interpretations
 */

import knex from '../../../config/database';

export interface AIUsage {
  id: string;
  user_id: string;
  type: 'natal' | 'transit' | 'compatibility' | 'lunar-return' | 'solar-return';
  tokens_used: number;
  cost: number;
  metadata?: any;
  created_at: Date;
}

export interface CreateAIUsageData {
  userId: string;
  type: string;
  tokensUsed: number;
  cost: number;
  metadata?: any;
}

class AIUsageModel {
  private tableName = 'ai_usage';

  /**
   * Record AI usage entry
   */
  async record(data: CreateAIUsageData): Promise<AIUsage> {
    const [usage] = await knex(this.tableName)
      .insert({
        user_id: data.userId,
        type: data.type,
        tokens_used: data.tokensUsed,
        cost: data.cost,
        metadata: data.metadata,
      })
      .returning('*');

    return usage;
  }

  /**
   * Get usage history for a user
   */
  async getByUserId(userId: string, limit = 100): Promise<AIUsage[]> {
    return knex(this.tableName)
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  /**
   * Get total cost for a user (optionally filtered by start date)
   */
  async getTotalCost(userId: string, startDate?: Date): Promise<number> {
    let query = knex(this.tableName).where('user_id', userId);

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    const result = await query.sum('cost as total').first();
    return parseFloat((result?.total || 0).toString());
  }

  /**
   * Get total tokens used by a user
   */
  async getTotalTokens(userId: string): Promise<number> {
    const result = await knex(this.tableName)
      .where('user_id', userId)
      .sum('tokens_used as total')
      .first();

    return (result?.total || 0) as number;
  }

  /**
   * Get usage breakdown by interpretation type
   */
  async getUsageByType(userId: string): Promise<Record<string, number>> {
    const results = await knex(this.tableName)
      .where('user_id', userId)
      .select('type')
      .count('* as count')
      .groupBy('type');

    return results.reduce((acc: Record<string, number>, row: any) => {
      acc[row.type] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get cost breakdown by interpretation type
   */
  async getCostByType(userId: string): Promise<Record<string, number>> {
    const results = await knex(this.tableName)
      .where('user_id', userId)
      .select('type')
      .sum('cost as total')
      .groupBy('type');

    return results.reduce((acc: Record<string, number>, row: any) => {
      acc[row.type] = parseFloat(row.total || '0');
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get usage statistics for a date range
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AIUsage[]> {
    return knex(this.tableName)
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .where('created_at', '<=', endDate)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  /**
   * Get daily usage statistics for a user
   */
  async getDailyUsage(userId: string, days = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return knex(this.tableName)
      .where('user_id', userId)
      .where('created_at', '>=', startDate)
      .select(knex.raw('DATE(created_at) as date'))
      .sum('tokens_used as tokens')
      .sum('cost as cost')
      .count('* as requests')
      .groupBy('date')
      .orderBy('date', 'desc');
  }
}

export default new AIUsageModel();
