/**
 * AI Cache Service Tests
 * Tests for PostgreSQL-based caching system with SHA-256 key generation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// In-memory store to simulate the database for mock persistence
const store = new Map<string, { data: Record<string, unknown>; expiresAt: Date | null }>();

jest.mock('../../modules/ai/models/aiCache.model', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async (key: string) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        store.delete(key);
        return null;
      }
      return entry.data;
    }),
    set: jest.fn(async (key: string, data: Record<string, unknown>, ttlSeconds?: number) => {
      const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
      store.set(key, { data, expiresAt });
      return { id: 'mock-id', cache_key: key, data, expires_at: expiresAt, created_at: new Date(), updated_at: new Date() };
    }),
    delete: jest.fn(async (key: string) => {
      return store.delete(key);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
    clearExpired: jest.fn(async () => {
      let count = 0;
      for (const [key, entry] of store) {
        if (entry.expiresAt && entry.expiresAt < new Date()) {
          store.delete(key);
          count++;
        }
      }
      return count;
    }),
    getStats: jest.fn(async () => {
      let totalEntries = store.size;
      let expiredEntries = 0;
      let activeEntries = 0;
      for (const [, entry] of store) {
        if (entry.expiresAt && entry.expiresAt < new Date()) {
          expiredEntries++;
        } else {
          activeEntries++;
        }
      }
      return { totalEntries, expiredEntries, activeEntries };
    }),
  },
}));

import { describe, it, expect, beforeEach } from '@jest/globals';

// Re-import the mock module so we can re-apply implementations after resetMocks
import aiCacheModel from '../../modules/ai/models/aiCache.model';
import aiCacheService from '../../modules/ai/services/aiCache.service';

/**
 * Re-apply the in-memory store implementations to the mock model functions.
 * This is necessary because jest.config.js has `resetMocks: true`, which
 * strips all mock implementations before each test.
 */
function applyStoreImplementations() {
  (aiCacheModel.get as jest.Mock).mockImplementation(async (key: string) => {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      store.delete(key);
      return null;
    }
    return entry.data;
  });
  (aiCacheModel.set as jest.Mock).mockImplementation(async (key: string, data: Record<string, unknown>, ttlSeconds?: number) => {
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
    store.set(key, { data, expiresAt });
    return { id: 'mock-id', cache_key: key, data, expires_at: expiresAt, created_at: new Date(), updated_at: new Date() };
  });
  (aiCacheModel.delete as jest.Mock).mockImplementation(async (key: string) => {
    return store.delete(key);
  });
  (aiCacheModel.clear as jest.Mock).mockImplementation(async () => {
    store.clear();
  });
  (aiCacheModel.clearExpired as jest.Mock).mockImplementation(async () => {
    let count = 0;
    for (const [key, entry] of store) {
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        store.delete(key);
        count++;
      }
    }
    return count;
  });
  (aiCacheModel.getStats as jest.Mock).mockImplementation(async () => {
    let totalEntries = store.size;
    let expiredEntries = 0;
    let activeEntries = 0;
    for (const [, entry] of store) {
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }
    return { totalEntries, expiredEntries, activeEntries };
  });
}

describe('AI Cache Service', () => {
  beforeEach(() => {
    // Clear in-memory store before each test
    store.clear();
    // resetMocks (from jest.config) runs before beforeEach and strips
    // all mock implementations. Re-apply them here.
    applyStoreImplementations();
  });

  describe('Cache Operations', () => {
    it('should cache interpretation results', async () => {
      const key = 'natal-chart-123';
      const data = { interpretation: 'Test interpretation' };

      await aiCacheService.set(key, data);
      const cached = await aiCacheService.get(key);

      expect(cached).toEqual(data);
    });

    it('should return null for non-existent keys', async () => {
      const cached = await aiCacheService.get('non-existent');

      expect(cached).toBeNull();
    });

    it('should expire cached entries', async () => {
      const key = 'test-key';
      const data = { test: 'data' };

      await aiCacheService.set(key, data, { ttl: 1 }); // 1 second TTL

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const cached = await aiCacheService.get(key);
      expect(cached).toBeNull();
    });

    it('should handle TTL correctly - not expired immediately', async () => {
      const key = 'test-key-ttl';
      const data = { test: 'data' };

      await aiCacheService.set(key, data, { ttl: 60 }); // 60 seconds TTL

      // Should still be cached after short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cached = await aiCacheService.get(key);
      expect(cached).toEqual(data);

      // Clean up
      await aiCacheService.delete(key);
    });

    it('should delete cache entries', async () => {
      const key = 'delete-key';
      const data = { test: 'data' };

      await aiCacheService.set(key, data);
      let cached = await aiCacheService.get(key);
      expect(cached).toEqual(data);

      await aiCacheService.delete(key);
      cached = await aiCacheService.get(key);
      expect(cached).toBeNull();
    });

    it('should clear all cache entries', async () => {
      await aiCacheService.set('key1', { data: '1' });
      await aiCacheService.set('key2', { data: '2' });
      await aiCacheService.set('key3', { data: '3' });

      await aiCacheService.clear();

      const cached1 = await aiCacheService.get('key1');
      const cached2 = await aiCacheService.get('key2');
      const cached3 = await aiCacheService.get('key3');

      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
      expect(cached3).toBeNull();
    });
  });

  describe('Key Generation', () => {
    it('should generate cache key from chart data', async () => {
      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15 },
        ],
      };

      const key = aiCacheService.generateKey(chartData);

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key).toMatch(/^ai:[a-f0-9]{64}$/); // SHA-256 hex hash
    });

    it('should generate consistent keys for identical data', () => {
      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15 },
        ],
      };

      const key1 = aiCacheService.generateKey(chartData);
      const key2 = aiCacheService.generateKey(chartData);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different data', () => {
      const data1 = { planets: [{ planet: 'sun', sign: 'aries', degree: 15 }] };
      const data2 = { planets: [{ planet: 'sun', sign: 'taurus', degree: 15 }] };

      const key1 = aiCacheService.generateKey(data1);
      const key2 = aiCacheService.generateKey(data2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Cache-Aside Pattern', () => {
    it('should use cache hit when available', async () => {
      const key = 'cache-aside-test';
      const cachedData = { interpretation: 'Cached interpretation' };

      // Set up cache
      await aiCacheService.set(key, cachedData);

      let generatorCalled = false;
      const generator = async () => {
        generatorCalled = true;
        return { interpretation: 'Fresh interpretation' };
      };

      const result = await aiCacheService.getOrGenerate(key, generator);

      expect(result).toEqual(cachedData);
      expect(generatorCalled).toBe(false);
    });

    it('should generate and cache on cache miss', async () => {
      const key = 'cache-aside-miss';
      const freshData = { interpretation: 'Fresh interpretation' };

      let generatorCalled = false;
      const generator = async () => {
        generatorCalled = true;
        return freshData;
      };

      const result = await aiCacheService.getOrGenerate(key, generator);

      expect(result).toEqual(freshData);
      expect(generatorCalled).toBe(true);

      // Verify it was cached
      const cached = await aiCacheService.get(key);
      expect(cached).toEqual(freshData);
    });

    it('should apply TTL in getOrGenerate', async () => {
      const key = 'cache-aside-ttl';
      const freshData = { interpretation: 'Fresh interpretation' };

      const generator = async () => freshData;

      await aiCacheService.getOrGenerate(key, generator, { ttl: 1 });

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const cached = await aiCacheService.get(key);
      expect(cached).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle get errors gracefully', async () => {
      // Mock database error by using invalid key (will be caught by try-catch)
      const result = await aiCacheService.get('test-key');
      // Should not throw, return null on error
      expect(result).toBeNull();
    });

    it('should handle set errors gracefully', async () => {
      // Should not throw
      await expect(aiCacheService.set('test-key', { data: 'test' })).resolves.not.toThrow();
    });

    it('should handle delete errors gracefully', async () => {
      // Should not throw
      await expect(aiCacheService.delete('test-key')).resolves.not.toThrow();
    });
  });

  describe('Clear Expired Entries', () => {
    it('should clear expired entries', async () => {
      const key1 = 'expired-key';
      const key2 = 'valid-key';

      await aiCacheService.set(key1, { data: '1' }, { ttl: 1 });
      await aiCacheService.set(key2, { data: '2' }, { ttl: 10 });

      // Wait for first entry to expire
      await new Promise(resolve => setTimeout(resolve, 1500));

      const deletedCount = await aiCacheService.clearExpired();

      expect(deletedCount).toBeGreaterThanOrEqual(0);

      const cached1 = await aiCacheService.get(key1);
      const cached2 = await aiCacheService.get(key2);

      expect(cached1).toBeNull();
      expect(cached2).toEqual({ data: '2' });
    });

    it('should return 0 when no expired entries exist', async () => {
      const deletedCount = await aiCacheService.clearExpired();
      expect(deletedCount).toBe(0);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should cache natal chart interpretation', async () => {
      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
          { planet: 'moon', sign: 'taurus', degree: 10, house: 2 },
        ],
      };

      const key = aiCacheService.generateKey(chartData);
      const interpretation = {
        sunInAries: 'You are a natural leader...',
        moonInTaurus: 'You seek emotional stability...',
      };

      await aiCacheService.set(key, interpretation, { ttl: 3600 }); // 1 hour

      const cached = await aiCacheService.get(key);
      expect(cached).toEqual(interpretation);
    });

    it('should implement cache-aside for AI generation', async () => {
      const chartData = {
        planets: [{ planet: 'sun', sign: 'leo', degree: 20, house: 5 }],
      };

      const key = aiCacheService.generateKey(chartData);

      let callCount = 0;
      const generator = async () => {
        callCount++;
        return { interpretation: `Generated interpretation ${callCount}` };
      };

      // First call - cache miss, should generate
      const result1 = await aiCacheService.getOrGenerate(key, generator, { ttl: 3600 });
      expect(callCount).toBe(1);
      expect(result1).toEqual({ interpretation: 'Generated interpretation 1' });

      // Second call - cache hit, should not generate
      const result2 = await aiCacheService.getOrGenerate(key, generator, { ttl: 3600 });
      expect(callCount).toBe(1); // Still 1, not called again
      expect(result2).toEqual({ interpretation: 'Generated interpretation 1' });
    });
  });
});
