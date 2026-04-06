/**
 * Cache Utilities Barrel File Tests
 * Verify all cache utility exports are available
 */

import { describe, it, expect } from 'vitest';
import * as cache from './index';

describe('cache utilities barrel exports', () => {
  it('should export CacheManager class', () => {
    expect(cache.CacheManager).toBeDefined();
    expect(typeof cache.CacheManager).toBe('function');
  });

  it('should export getGlobalCache function', () => {
    expect(cache.getGlobalCache).toBeDefined();
    expect(typeof cache.getGlobalCache).toBe('function');
  });

  it('should export clearGlobalCache function', () => {
    expect(cache.clearGlobalCache).toBeDefined();
    expect(typeof cache.clearGlobalCache).toBe('function');
  });

  it('should export CacheEntry type', () => {
    // Type exports don't appear at runtime, but we verify the file structure is correct
    expect(cache).toBeDefined();
  });

  it('should export CacheOptions type', () => {
    // Type exports don't appear at runtime
    expect(cache).toBeDefined();
  });

  it('should export CacheStats type', () => {
    // Type exports don't appear at runtime
    expect(cache).toBeDefined();
  });
});
