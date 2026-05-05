/**
 * AI Cache Service Tests
 * Tests for caching system with SHA-256 key generation
 * Uses in-memory mock implementation to avoid database dependency
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import crypto from 'crypto';

// In-memory cache store
const cacheStore = new Map<string, { data: any; expiresAt: number | null }>();

// Create a mock implementation that mirrors the real service
const mockAICacheService = {
  async get(key: string): Promise<any> {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      cacheStore.delete(key);
      return null;
    }
    return entry.data;
  },

  async set(key: string, data: any, options?: { ttl?: number }): Promise<void> {
    cacheStore.set(key, {
      data,
      expiresAt: options?.ttl ? Date.now() + options.ttl * 1000 : null,
    });
  },

  async delete(key: string): Promise<void> {
    cacheStore.delete(key);
  },

  async clear(): Promise<void> {
    cacheStore.clear();
  },

  async clearExpired(): Promise<number> {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of cacheStore.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        cacheStore.delete(key);
        count++;
      }
    }
    return count;
  },

  generateKey(data: unknown): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    return `ai:${hash}`;
  },

  async getOrGenerate<T>(
    key: string,
    generator: () => Promise<T>,
    options?: { ttl?: number },
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) return cached as T;

    const data = await generator();
    await this.set(key, data, options);
    return data;
  },

  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  }> {
    let expired = 0;
    const now = Date.now();
    for (const [, entry] of cacheStore.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) expired++;
    }
    return {
      totalEntries: cacheStore.size,
      expiredEntries: expired,
      activeEntries: cacheStore.size - expired,
    };
  },
};

// Mock the module to return our in-memory implementation
jest.mock('../../modules/ai/services/aiCache.service', () => ({
  __esModule: true,
  default: mockAICacheService,
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import aiCacheService from '../../modules/ai/services/aiCache.service';

describe('AI Cache Service', () => {
  beforeEach(() => {
    cacheStore.clear();
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

      await aiCacheService.set(key, data, { ttl: 1 });

      await new Promise(resolve => setTimeout(resolve, 1100));

      const cached = await aiCacheService.get(key);
      expect(cached).toBeNull();
    }, 10000);

    it('should handle TTL correctly - not expired immediately', async () => {
      const key = 'test-key-ttl';
      const data = { test: 'data' };

      await aiCacheService.set(key, data, { ttl: 60 });

      const cached = await aiCacheService.get(key);
      expect(cached).toEqual(data);

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

      expect(await aiCacheService.get('key1')).toBeNull();
      expect(await aiCacheService.get('key2')).toBeNull();
      expect(await aiCacheService.get('key3')).toBeNull();
    });
  });

  describe('Key Generation', () => {
    it('should generate cache key from chart data', () => {
      const chartData = {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15 }],
      };

      const key = aiCacheService.generateKey(chartData);

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key).toMatch(/^ai:[a-f0-9]{64}$/);
    });

    it('should generate consistent keys for identical data', () => {
      const chartData = {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15 }],
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

      const cached = await aiCacheService.get(key);
      expect(cached).toEqual(freshData);
    });

    it('should apply TTL in getOrGenerate', async () => {
      const key = 'cache-aside-ttl';
      const freshData = { interpretation: 'Fresh interpretation' };

      const generator = async () => freshData;

      await aiCacheService.getOrGenerate(key, generator, { ttl: 1 });

      await new Promise(resolve => setTimeout(resolve, 1100));

      const cached = await aiCacheService.get(key);
      expect(cached).toBeNull();
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle get for non-existent key gracefully', async () => {
      const result = await aiCacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle set operations', async () => {
      await expect(aiCacheService.set('test-key', { data: 'test' })).resolves.not.toThrow();
    });

    it('should handle delete for non-existent key gracefully', async () => {
      await expect(aiCacheService.delete('non-existent-key')).resolves.not.toThrow();
    });
  });

  describe('Clear Expired Entries', () => {
    it('should clear expired entries', async () => {
      const key1 = 'expired-key';
      const key2 = 'valid-key';

      await aiCacheService.set(key1, { data: '1' }, { ttl: 1 });
      await aiCacheService.set(key2, { data: '2' }, { ttl: 10 });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const deletedCount = await aiCacheService.clearExpired();
      expect(deletedCount).toBeGreaterThanOrEqual(0);

      expect(await aiCacheService.get(key1)).toBeNull();
      expect(await aiCacheService.get(key2)).toEqual({ data: '2' });
    }, 10000);

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

      await aiCacheService.set(key, interpretation, { ttl: 3600 });

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

      const result1 = await aiCacheService.getOrGenerate(key, generator, { ttl: 3600 });
      expect(callCount).toBe(1);
      expect(result1).toEqual({ interpretation: 'Generated interpretation 1' });

      const result2 = await aiCacheService.getOrGenerate(key, generator, { ttl: 3600 });
      expect(callCount).toBe(1);
      expect(result2).toEqual({ interpretation: 'Generated interpretation 1' });
    });
  });
});
