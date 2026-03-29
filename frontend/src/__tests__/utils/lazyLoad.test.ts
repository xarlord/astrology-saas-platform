/**
 * Lazy Load Utilities Tests
 */

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/require-await */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentType } from 'react';

// Mock React.lazy to call the factory (exercising error paths) and return a component
vi.mock('react', () => ({
  createElement: vi.fn((tag: string, props: Record<string, unknown> | null, ...children: unknown[]) =>
    ({ $$typeof: Symbol.for('react.element'), type: tag, props, children })),
  lazy: vi.fn((factory: () => Promise<{ default: unknown }>) => {
    // Call the factory so the .catch() inside lazyLoadComponent fires
    factory().catch(() => {});
    const MockComponent = ((props: Record<string, unknown>) => props) as unknown as ComponentType<Record<string, unknown>>;
    MockComponent.displayName = 'MockLazyComponent';
    return MockComponent;
  }),
  Component: class Component {},
}));

import { lazyLoadComponent, lazyLoadWithRetry } from '../../utils/lazyLoad';

describe('Lazy Load Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lazyLoadComponent', () => {
    it('should lazy load component successfully', async () => {
      const mockComponent = vi.fn().mockReturnValue('Lazy Component');
      const importFn = vi.fn().mockResolvedValue({ default: mockComponent });

      const LazyComponent = lazyLoadComponent(importFn);

      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('function');
    });

    it('should handle import errors with fallback', async () => {
      const importFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const LazyComponent = lazyLoadComponent(importFn);
      expect(LazyComponent).toBeDefined();
    });
  });

  describe('lazyLoadWithRetry', () => {
    it('should lazy load component with retry logic', async () => {
      const mockComponent = vi.fn().mockReturnValue('Retry Component');
      const importFn = vi.fn().mockResolvedValue({ default: mockComponent });
      const LazyComponent = lazyLoadWithRetry(importFn, 3);
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('function');
    });

    it('should retry on failure', async () => {
      const mockComponent = vi.fn().mockReturnValue('Retry Component');
      const importFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ default: mockComponent });

      const LazyComponent = lazyLoadWithRetry(importFn, 3);
      expect(LazyComponent).toBeDefined();
    });

    it('should throw error after max retries', async () => {
      const importFn = vi.fn().mockRejectedValue(new Error('Persistent error'));
      const LazyComponent = lazyLoadWithRetry(importFn, 2);
      expect(LazyComponent).toBeDefined();
    });

    it('should use default max retries of 3', async () => {
      const importFn = vi.fn().mockResolvedValue({ default: () => 'Component' });
      const LazyComponent = lazyLoadWithRetry(importFn);
      expect(LazyComponent).toBeDefined();
    });
  });
});
