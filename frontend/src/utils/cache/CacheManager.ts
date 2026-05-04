/**
 * CacheManager - In-memory cache with TTL and stale-while-revalidate pattern
 *
 * Provides efficient caching for real-time data with automatic expiration
 * and background refresh capabilities.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  isStale: boolean;
}

export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Stale time in milliseconds - data is stale but still usable */
  staleTime?: number;
  /** Maximum number of entries in cache */
  maxEntries?: number;
  /** Whether to use stale-while-revalidate pattern */
  staleWhileRevalidate?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  size: number;
  hitRate: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_STALE_TIME = 60 * 1000; // 1 minute
const DEFAULT_MAX_ENTRIES = 100;

/**
 * CacheManager class for managing in-memory cache with TTL
 */
export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    size: 0,
    hitRate: 0,
  };
  private revalidationPromises = new Map<string, Promise<T | null>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? DEFAULT_TTL,
      staleTime: options.staleTime ?? DEFAULT_STALE_TIME,
      maxEntries: options.maxEntries ?? DEFAULT_MAX_ENTRIES,
      staleWhileRevalidate: options.staleWhileRevalidate ?? true,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss();
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if entry is expired (use entry's TTL, not global)
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.recordMiss();
      return null;
    }

    // Check if entry is stale
    if (age > this.options.staleTime) {
      entry.isStale = true;
      this.stats.staleHits++;
    }

    this.stats.hits++;
    this.updateHitRate();

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Get a value with stale-while-revalidate pattern
   * Returns stale data immediately while revalidating in background
   */
  async getWithRevalidate(key: string, fetcher: () => Promise<T>): Promise<T | null> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // No entry - fetch fresh data
    if (!entry) {
      this.recordMiss();
      return this.fetchAndCache(key, fetcher);
    }

    const age = now - entry.timestamp;

    // Entry is expired - fetch fresh data (use entry's TTL)
    if (age > entry.ttl) {
      this.recordMiss();
      return this.fetchAndCache(key, fetcher);
    }

    // Entry is stale but usable - return stale and revalidate in background
    if (age > this.options.staleTime && this.options.staleWhileRevalidate) {
      entry.isStale = true;
      this.stats.staleHits++;
      this.stats.hits++;
      this.updateHitRate();

      // Start background revalidation (don't await)
      this.revalidateInBackground(key, fetcher);

      return entry.data;
    }

    // Entry is fresh
    this.stats.hits++;
    this.updateHitRate();
    return entry.data;
  }

  /**
   * Set a value in cache
   */
  set(key: string, data: T, customTtl?: number): void {
    // Enforce max entries (LRU eviction)
    if (this.cache.size >= this.options.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl ?? this.options.ttl,
      isStale: false,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Check if key exists but is stale
   */
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age > this.options.staleTime && age <= this.options.ttl;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return result;
  }

  /**
   * Clear all entries matching a pattern
   */
  deletePattern(pattern: string | RegExp): number {
    let deleted = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    this.stats.size = this.cache.size;
    return deleted;
  }

  /**
   * Invalidate entries by tags or prefix
   */
  invalidateByPrefix(prefix: string): number {
    return this.deletePattern(`^${prefix}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.revalidationPromises.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      size: this.cache.size,
      hitRate: 0,
    };
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Destroy cache manager and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Fetch data and cache it
   */
  private async fetchAndCache(key: string, fetcher: () => Promise<T>): Promise<T | null> {
    // Check if there's already a pending request
    const pending = this.revalidationPromises.get(key);
    if (pending) {
      return pending;
    }

    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .catch((error) => {
        console.error(`Cache fetch error for key "${key}":`, error);
        return null;
      })
      .finally(() => {
        this.revalidationPromises.delete(key);
      });

    this.revalidationPromises.set(key, promise);
    return promise;
  }

  /**
   * Revalidate in background without blocking
   */
  private revalidateInBackground(key: string, fetcher: () => Promise<T>): void {
    // Don't start if already revalidating
    if (this.revalidationPromises.has(key)) {
      return;
    }

    const promise = fetcher()
      .then((data) => {
        if (data !== null && data !== undefined) {
          this.set(key, data);
        }
        return data;
      })
      .catch((error) => {
        console.error(`Background revalidation error for key "${key}":`, error);
        return null;
      })
      .finally(() => {
        this.revalidationPromises.delete(key);
      });

    this.revalidationPromises.set(key, promise);
  }

  /**
   * Record a cache miss
   */
  private recordMiss(): void {
    this.stats.misses++;
    this.updateHitRate();
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000);
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
    this.stats.size = this.cache.size;
  }
}

// Singleton instance for global cache
let globalCache: CacheManager | null = null;

/**
 * Get or create the global cache instance
 */
export function getGlobalCache<T = unknown>(options?: CacheOptions): CacheManager<T> {
  globalCache ??= new CacheManager<T>(options);
  return globalCache as CacheManager<T>;
}

/**
 * Clear the global cache instance
 */
export function clearGlobalCache(): void {
  if (globalCache) {
    globalCache.destroy();
    globalCache = null;
  }
}

export default CacheManager;
