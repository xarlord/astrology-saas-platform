/**
 * useDebouncedCallback Hook
 *
 * Advanced debouncing hook with leading/trailing edge options,
 * cancelable debouncing, and max wait time support.
 */

import { useCallback, useRef, useMemo } from 'react';

export interface DebouncedCallbackOptions {
  /** Delay in milliseconds (default: 300) */
  delay?: number;
  /** Invoke on the leading edge of the timeout (default: false) */
  leading?: boolean;
  /** Invoke on the trailing edge of the timeout (default: true) */
  trailing?: boolean;
  /** Maximum time the debounced function is allowed to be delayed (default: infinity) */
  maxWait?: number;
}

export interface DebouncedCallbackControl {
  /** Cancel pending execution */
  cancel: () => void;
  /** Immediately invoke if pending */
  flush: () => void;
  /** Check if there's a pending execution */
  pending: () => boolean;
}

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Custom hook for advanced debounced callbacks
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => searchAPI(query),
 *   {
 *     delay: 300,
 *     leading: false,
 *     trailing: true,
 *     maxWait: 2000
 *   }
 * );
 *
 * // Later, you can control it:
 * debouncedSearch.cancel();
 * debouncedSearch.flush();
 * ```
 */
export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  options: DebouncedCallbackOptions = {}
): T & DebouncedCallbackControl {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T> | null>(null);
  const leadingCalledRef = useRef(false);

  // Keep callback ref updated
  callbackRef.current = callback;

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  // Cancel pending execution
  const cancel = useCallback(() => {
    clearAllTimeouts();
    argsRef.current = null;
    leadingCalledRef.current = false;
  }, [clearAllTimeouts]);

  // Immediately invoke if pending
  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearAllTimeouts();
      callbackRef.current(...argsRef.current);
      argsRef.current = null;
      leadingCalledRef.current = false;
    }
  }, [clearAllTimeouts]);

  // Check if there's a pending execution
  const pending = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  // The debounced function
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;

      // Handle leading edge
      if (leading && !leadingCalledRef.current) {
        leadingCalledRef.current = true;
        callbackRef.current(...args);
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set max wait timeout if specified
      if (maxWait !== undefined && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          if (argsRef.current) {
            clearAllTimeouts();
            callbackRef.current(...argsRef.current);
            argsRef.current = null;
            leadingCalledRef.current = false;
          }
        }, maxWait);
      }

      // Set the main debounce timeout
      timeoutRef.current = setTimeout(() => {
        if (trailing && argsRef.current) {
          callbackRef.current(...argsRef.current);
        }
        clearAllTimeouts();
        argsRef.current = null;
        leadingCalledRef.current = false;
      }, delay);
    },
    [delay, leading, trailing, maxWait, clearAllTimeouts]
  );

  // Cleanup on unmount
  useMemo(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Return function with control methods
  const result = useCallback(
    (...args: Parameters<T>) => {
      return debouncedFn(...args);
    },
    [debouncedFn]
  ) as T & DebouncedCallbackControl;

  result.cancel = cancel;
  result.flush = flush;
  result.pending = pending;

  return result;
}

export default useDebouncedCallback;
