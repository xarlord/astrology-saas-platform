/**
 * Tests for CacheManager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheManager, getGlobalCache, clearGlobalCache } from '../../utils/cache/CacheManager';

describe('CacheManager', () => {
  let cache: CacheManager<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new CacheManager<string>({
      ttl: 1000,
      staleTime: 500,
      maxEntries: 10,
    });
  });

  afterEach(() => {
    cache.destroy();
    vi.useRealTimers();
  });

  describe('get/set', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should return null for expired entries', () => {
      cache.set('key1', 'value1');

      vi.advanceTimersByTime(1001);

      expect(cache.get('key1')).toBeNull();
    });

    it('should support custom TTL per entry', () => {
      cache.set('key1', 'value1', 500);

      vi.advanceTimersByTime(501);

      expect(cache.get('key1')).toBeNull();
    });

    it('should override entries with same key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('has', () => {
    it('should return true for existing entries', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent entries', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired entries', () => {
      cache.set('key1', 'value1');

      vi.advanceTimersByTime(1001);

      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('isStale', () => {
    it('should return false for fresh entries', () => {
      cache.set('key1', 'value1');
      expect(cache.isStale('key1')).toBe(false);
    });

    it('should return true for stale entries', () => {
      cache.set('key1', 'value1');

      vi.advanceTimersByTime(600);

      expect(cache.isStale('key1')).toBe(true);
    });

    it('should return false for expired entries', () => {
      cache.set('key1', 'value1');

      vi.advanceTimersByTime(1001);

      expect(cache.isStale('key1')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete entries', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for non-existent keys', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('deletePattern', () => {
    it('should delete entries matching pattern', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('chart:1', 'value3');

      const deleted = cache.deletePattern(/^user:/);

      expect(deleted).toBe(2);
      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('chart:1')).toBe('value3');
    });

    it('should support string patterns', () => {
      cache.set('user:1', 'value1');
      cache.set('chart:1', 'value2');

      cache.deletePattern('user');

      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('chart:1')).toBe('value2');
    });
  });

  describe('invalidateByPrefix', () => {
    it('should invalidate entries by prefix', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('chart:1', 'value3');

      const deleted = cache.invalidateByPrefix('user');

      expect(deleted).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('chart:1')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.size()).toBe(0);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entries when maxEntries is reached', () => {
      const smallCache = new CacheManager<string>({
        maxEntries: 3,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      smallCache.set('key4', 'value4');

      expect(smallCache.has('key1')).toBe(false);
      expect(smallCache.has('key4')).toBe(true);

      smallCache.destroy();
    });

    it('should update LRU order on access', () => {
      const smallCache = new CacheManager<string>({
        maxEntries: 3,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 to make it most recently used
      smallCache.get('key1');

      // Add new entry
      smallCache.set('key4', 'value4');

      // key1 should still exist, key2 should be evicted
      expect(smallCache.has('key1')).toBe(true);
      expect(smallCache.has('key2')).toBe(false);

      smallCache.destroy();
    });
  });

  describe('getWithRevalidate', () => {
    it('should fetch fresh data when no entry exists', async () => {
      const fetcher = vi.fn().mockResolvedValue('fresh-data');

      const data = await cache.getWithRevalidate('key1', fetcher);

      expect(data).toBe('fresh-data');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should return cached data when fresh', async () => {
      const fetcher = vi.fn().mockResolvedValue('fresh-data');

      cache.set('key1', 'cached-data');

      const data = await cache.getWithRevalidate('key1', fetcher);

      expect(data).toBe('cached-data');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should return stale data and revalidate in background', async () => {
      const fetcher = vi.fn().mockResolvedValue('fresh-data');

      cache.set('key1', 'stale-data');

      // Make entry stale
      vi.advanceTimersByTime(600);

      const data = await cache.getWithRevalidate('key1', fetcher);

      // Should return stale data immediately
      expect(data).toBe('stale-data');

      // Wait for background revalidation
      await vi.advanceTimersByTimeAsync(10);

      // Fetcher should have been called
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Cache should now have fresh data
      expect(cache.get('key1')).toBe('fresh-data');
    });

    it('should fetch fresh data when entry is expired', async () => {
      const fetcher = vi.fn().mockResolvedValue('fresh-data');

      cache.set('key1', 'expired-data');

      // Expire the entry
      vi.advanceTimersByTime(1001);

      const data = await cache.getWithRevalidate('key1', fetcher);

      expect(data).toBe('fresh-data');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate concurrent fetches', async () => {
      let resolveFetch: () => void;
      const fetcher = vi.fn().mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveFetch = () => resolve('data');
          }),
      );

      // Start multiple concurrent fetches
      const promises = [
        cache.getWithRevalidate('key1', fetcher),
        cache.getWithRevalidate('key1', fetcher),
        cache.getWithRevalidate('key1', fetcher),
      ];

      // Resolve the fetch
      resolveFetch!();

      const results = await Promise.all(promises);

      // All should get the same result
      expect(results).toEqual(['data', 'data', 'data']);

      // But fetcher should only be called once
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track stale hits', () => {
      cache.set('key1', 'value1');

      vi.advanceTimersByTime(600);

      cache.get('key1'); // stale hit

      const stats = cache.getStats();

      expect(stats.staleHits).toBe(1);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key2');

      cache.resetStats();

      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('utility methods', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const keys = cache.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.size()).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should cleanup expired entries periodically', () => {
      cache.set('key1', 'value1');

      // Advance past TTL
      vi.advanceTimersByTime(1001);

      // Trigger cleanup (every 60 seconds)
      vi.advanceTimersByTime(60000);

      // Entry should be removed
      expect(cache.size()).toBe(0);
    });

    it('should destroy cache and cleanup resources', () => {
      cache.set('key1', 'value1');

      cache.destroy();

      expect(cache.size()).toBe(0);
    });
  });
});

describe('Global cache', () => {
  afterEach(() => {
    clearGlobalCache();
  });

  it('should create and return global cache instance', () => {
    const cache1 = getGlobalCache();
    const cache2 = getGlobalCache();

    expect(cache1).toBe(cache2);
  });

  it('should clear global cache', () => {
    const cache = getGlobalCache();
    cache.set('key1', 'value1');

    clearGlobalCache();

    // Get new instance
    const newCache = getGlobalCache();
    expect(newCache.has('key1')).toBe(false);
  });
});
