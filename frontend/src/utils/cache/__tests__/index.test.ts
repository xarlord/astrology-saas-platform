/**
 * Cache Utilities Index Tests
 */

import { describe, it, expect } from 'vitest';
import * as cache from '../index';

describe('cache index', () => {
  it('should export CacheManager class', () => {
    expect(cache.CacheManager).toBeDefined();
    expect(typeof cache.CacheManager).toBe('function');
    expect(cache.CacheManager.name).toBe('CacheManager');
  });

  it('should export getGlobalCache function', () => {
    expect(cache.getGlobalCache).toBeDefined();
    expect(typeof cache.getGlobalCache).toBe('function');
  });

  it('should export clearGlobalCache function', () => {
    expect(cache.clearGlobalCache).toBeDefined();
    expect(typeof cache.clearGlobalCache).toBe('function');
  });

  it('should export TypeScript types', () => {
    // TypeScript types are not available at runtime in the same way,
    // but we can verify that the exports object exists and has expected properties
    const exportNames = Object.keys(cache);
    expect(exportNames).toContain('CacheManager');
    expect(exportNames).toContain('getGlobalCache');
    expect(exportNames).toContain('clearGlobalCache');
  });

  it('should create CacheManager instance', () => {
    const instance = new cache.CacheManager();
    expect(instance).toBeInstanceOf(cache.CacheManager);
  });

  it('should have get and set methods on CacheManager instance', () => {
    const cacheManager = new cache.CacheManager();
    expect(typeof cacheManager.get).toBe('function');
    expect(typeof cacheManager.set).toBe('function');
    expect(typeof cacheManager.delete).toBe('function');
    expect(typeof cacheManager.clear).toBe('function');
    expect(typeof cacheManager.getStats).toBe('function');
  });
});
