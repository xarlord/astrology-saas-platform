/**
 * AI Cache Model
 * Handles database operations for AI interpretation caching
 * Uses PostgreSQL JSONB for flexible data storage
 */

import knex from '../../../config/database';
import type { Knex } from 'knex';

export interface AICacheEntry {
  id: string;
  cache_key: string;
  data: any;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCacheData {
  cache_key: string;
  data: any;
  expires_at?: Date | null;
}

class AICacheModel {
  private tableName = 'ai_cache';

  /**
   * Set cache entry (insert or update on conflict)
   */
  async set(cacheKey: string, data: any, ttlSeconds?: number): Promise<AICacheEntry> {
    const expiresAt = ttlSeconds
      ? new Date(Date.now() + ttlSeconds * 1000)
      : null;

    const [entry] = await knex(this.tableName)
      .insert({
        cache_key: cacheKey,
        data,
        expires_at: expiresAt,
      })
      .onConflict('cache_key')
      .merge({
        data: data,
        expires_at: expiresAt,
        updated_at: new Date(),
      })
      .returning('*');

    return entry;
  }

  /**
   * Get cache entry by key
   * Returns null if not found or expired
   */
  async get(cacheKey: string): Promise<any | null> {
    const entry = await knex(this.tableName)
      .where('cache_key', cacheKey)
      .where((builder: Knex.QueryBuilder) =>
        builder
          .whereNull('expires_at')
          .orWhere('expires_at', '>', new Date())
      )
      .first();

    return entry?.data || null;
  }

  /**
   * Delete cache entry by key
   */
  async delete(cacheKey: string): Promise<boolean> {
    const count = await knex(this.tableName)
      .where('cache_key', cacheKey)
      .delete();

    return count > 0;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await knex(this.tableName).truncate();
  }

  /**
   * Clear expired entries
   * Returns count of deleted entries
   */
  async clearExpired(): Promise<number> {
    return knex(this.tableName)
      .where('expires_at', '<', new Date())
      .delete();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  }> {
    const [totalResult] = await knex(this.tableName).count('* as count');
    const [expiredResult] = await knex(this.tableName)
      .where('expires_at', '<', new Date())
      .count('* as count');
    const [activeResult] = await knex(this.tableName)
      .where((builder: Knex.QueryBuilder) =>
        builder
          .whereNull('expires_at')
          .orWhere('expires_at', '>', new Date())
      )
      .count('* as count');

    return {
      totalEntries: parseInt(totalResult.count as string, 10),
      expiredEntries: parseInt(expiredResult.count as string, 10),
      activeEntries: parseInt(activeResult.count as string, 10),
    };
  }
}

export default new AICacheModel();
