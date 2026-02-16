/**
 * Lazy Loading Utilities
 * Utilities for code splitting and lazy loading
 */

import { lazy, ComponentType } from 'react';
import { createElement } from 'react';

/**
 * Lazy load a component with error handling
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T {
  return lazy(() => importFn().catch((error) => {
    console.error('Failed to load component:', error);

    // Return a fallback component
    return {
      default: (() =>
        createElement(
          'div',
          { className: 'lazy-load-error' },
          createElement('p', null, 'Failed to load component. Please refresh the page.')
        )
      ) as unknown as T,
    };
  })) as unknown as T;
}

/**
 * Lazy load with retry logic
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries = 3
): T {
  let retries = 0;

  const loadWithRetry = (): Promise<{ default: T }> => {
    return importFn().catch((error) => {
      retries++;

      if (retries < maxRetries) {
        console.warn(`Retry ${retries}/${maxRetries} for component`);
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(loadWithRetry());
          }, 1000 * retries);
        });
      }

      throw error;
    });
  };

  return lazy(loadWithRetry) as unknown as T;
}
