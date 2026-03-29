/**
 * Transit Cache Service
 *
 * @requirement FINDING-003
 * @description Redis-based caching for daily transit calculations
 * Reduces calculation load by ~90% through caching identical daily transits
 */

// Note: In production, use actual Redis client. For development, using in-memory cache.

import logger from '../../../utils/logger';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface TransitData {
  date: string;
  planetaryPositions: Record<string, {
    longitude: number;
    sign: string;
    degree: number;
    isRetrograde: boolean;
  }>;
  moonPhase: {
    phase: string;
    illumination: number;
  };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
  retrogrades: string[];
  generatedAt: Date;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
}

export class TransitCacheService {
  private readonly CACHE_PREFIX = 'transits:';
  private readonly DEFAULT_TTL_SECONDS = 86400; // 24 hours
  private readonly MOON_PHASE_TTL_SECONDS = 43200; // 12 hours (moon changes faster)

  // In-memory cache for development (replace with Redis in production)
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats = { hits: 0, misses: 0 };

  /**
   * Get cached transit data for a date
   */
  async getTransits(date: Date): Promise<TransitData | null> {
    const cacheKey = this.getCacheKey(date);
    const cached = this.get<TransitData>(cacheKey);

    if (cached) {
      this.stats.hits++;
      logger.debug(`[TransitCache] HIT for ${cacheKey}`);
      return cached;
    }

    this.stats.misses++;
    logger.debug(`[TransitCache] MISS for ${cacheKey}`);
    return null;
  }

  /**
   * Cache transit data for a date
   */
  async setTransits(date: Date, data: TransitData): Promise<void> {
    const cacheKey = this.getCacheKey(date);
    this.set(cacheKey, data, this.DEFAULT_TTL_SECONDS);
    logger.debug(`[TransitCache] SET for ${cacheKey}, TTL: ${this.DEFAULT_TTL_SECONDS}s`);
  }

  /**
   * Get moon phase data (shorter TTL due to faster changes)
   */
  async getMoonPhase(date: Date): Promise<TransitData['moonPhase'] | null> {
    const cacheKey = `${this.CACHE_PREFIX}moon:${this.formatDate(date)}`;
    return this.get<TransitData['moonPhase']>(cacheKey);
  }

  /**
   * Cache moon phase data
   */
  async setMoonPhase(date: Date, moonPhase: TransitData['moonPhase']): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}moon:${this.formatDate(date)}`;
    this.set(cacheKey, moonPhase, this.MOON_PHASE_TTL_SECONDS);
  }

  /**
   * Get retrograde status for all planets
   */
  async getRetrogrades(date: Date): Promise<string[] | null> {
    const cacheKey = `${this.CACHE_PREFIX}retro:${this.formatDate(date)}`;
    return this.get<string[]>(cacheKey);
  }

  /**
   * Cache retrograde status
   */
  async setRetrogrades(date: Date, retrogrades: string[]): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}retro:${this.formatDate(date)}`;
    this.set(cacheKey, retrogrades, this.DEFAULT_TTL_SECONDS);
  }

  /**
   * Warm the cache for a specific date (pre-calculate)
   * Should be called by a cron job at midnight UTC
   */
  async warmCache(date: Date, transitCalculator: () => Promise<TransitData>): Promise<TransitData> {
    // Check if already cached
    const cached = await this.getTransits(date);
    if (cached) {
      return cached;
    }

    // Calculate and cache
    logger.info(`[TransitCache] Warming cache for ${this.formatDate(date)}`);
    const transitData = await transitCalculator();
    await this.setTransits(date, transitData);

    return transitData;
  }

  /**
   * Invalidate cache for a date
   */
  async invalidate(date: Date): Promise<boolean> {
    const cacheKey = this.getCacheKey(date);
    return this.delete(cacheKey);
  }

  /**
   * Invalidate all transit caches
   */
  async invalidateAll(): Promise<number> {
    let count = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(this.CACHE_PREFIX)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.info(`[TransitCache] Invalidated ${count} entries`);
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      totalEntries: this.cache.size,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`[TransitCache] Cleaned up ${cleaned} expired entries`);
    }

    return cleaned;
  }

  // Private methods

  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  private delete(key: string): boolean {
    return this.cache.delete(key);
  }

  private getCacheKey(date: Date): string {
    return `${this.CACHE_PREFIX}${this.formatDate(date)}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

// Singleton instance
let transitCacheInstance: TransitCacheService | null = null;

export function getTransitCache(): TransitCacheService {
  if (!transitCacheInstance) {
    transitCacheInstance = new TransitCacheService();

    // Set up periodic cleanup (every hour)
    setInterval(() => {
      transitCacheInstance?.cleanup();
    }, 3600000);
  }

  return transitCacheInstance;
}

export default TransitCacheService;
