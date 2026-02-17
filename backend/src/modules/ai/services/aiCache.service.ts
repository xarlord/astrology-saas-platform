/**
 * AI Cache Service
 * Caches AI-generated interpretations to reduce API costs
 * Implements cache-aside pattern with SHA-256 key generation
 */

import crypto from 'crypto';
import aiCacheModel from '../models/aiCache.model';
import logger from '../../../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

class AICacheService {
  /**
   * Get cached interpretation
   */
  async get(key: string): Promise<any | null> {
    try {
      return await aiCacheModel.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache entry
   */
  async set(key: string, data: any, options?: CacheOptions): Promise<void> {
    try {
      await aiCacheModel.set(key, data, options?.ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      await aiCacheModel.delete(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await aiCacheModel.clear();
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Clear expired entries
   * Returns number of entries deleted
   */
  async clearExpired(): Promise<number> {
    try {
      return await aiCacheModel.clearExpired();
    } catch (error) {
      logger.error('Cache clearExpired error:', error);
      return 0;
    }
  }

  /**
   * Generate cache key from data using SHA-256
   * Creates consistent hash for identical inputs
   */
  generateKey(data: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    return `ai:${hash}`;
  }

  /**
   * Get or generate pattern (cache-aside)
   * Tries cache first, generates on miss, then caches result
   */
  async getOrGenerate(
    key: string,
    generator: () => Promise<any>,
    options?: CacheOptions
  ): Promise<any> {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached) {
      logger.info('Cache hit:', key);
      return cached;
    }

    // Generate new data
    logger.info('Cache miss, generating:', key);
    const data = await generator();

    // Store in cache
    await this.set(key, data, options);

    return data;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  }> {
    try {
      return await aiCacheModel.getStats();
    } catch (error) {
      logger.error('Cache getStats error:', error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
        activeEntries: 0,
      };
    }
  }
}

export default new AICacheService();
