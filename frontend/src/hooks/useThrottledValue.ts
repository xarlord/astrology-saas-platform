/**
 * useThrottledValue Hook
 *
 * Throttles value updates to prevent excessive re-renders
 * and API calls. Useful for real-time data that updates frequently.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface ThrottledValueOptions {
  /** Throttle interval in milliseconds (default: 100) */
  interval?: number;
  /** Skip the initial throttle (immediate first update) (default: true) */
  skipInitialThrottle?: boolean;
  /** Callback when value is throttled */
  onThrottled?: (value: unknown) => void;
}

/**
 * Custom hook for throttling value updates
 */
export function useThrottledValue<T>(
  value: T,
  options: ThrottledValueOptions = {},
): [T, () => void, () => void] {
  const { interval = 100, skipInitialThrottle: _skipInitialThrottle = true, onThrottled } = options;

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecutedRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T>(value);
  const isFirstRenderRef = useRef(true);

  // Flush immediately (execute pending update)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setThrottledValue(pendingValueRef.current);
    lastExecutedRef.current = Date.now();
  }, []);

  // Cancel pending update
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Skip first render effect (value is already in state)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    pendingValueRef.current = value;

    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    // If enough time has passed, update immediately
    if (timeSinceLastExecution >= interval) {
      setThrottledValue(value);
      lastExecutedRef.current = now;
    } else {
      // Otherwise, schedule update for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const remainingTime = interval - timeSinceLastExecution;

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(pendingValueRef.current);
        lastExecutedRef.current = Date.now();
        timeoutRef.current = null;
      }, remainingTime);

      onThrottled?.(value);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, interval, onThrottled]);

  return [throttledValue, flush, cancel];
}

/**
 * Hook for throttling multiple values together
 */
export function useThrottledValues<T extends Record<string, unknown>>(
  values: T,
  options: ThrottledValueOptions = {},
): [T, () => void, () => void] {
  const { interval = 100, skipInitialThrottle: _skipInitialThrottle = true, onThrottled } = options;

  const [throttledValues, setThrottledValues] = useState<T>(values);
  const lastExecutedRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValuesRef = useRef<T>(values);
  const isFirstRenderRef = useRef(true);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setThrottledValues(pendingValuesRef.current);
    lastExecutedRef.current = Date.now();
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Skip first render effect (values are already in state)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    pendingValuesRef.current = values;

    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    if (timeSinceLastExecution >= interval) {
      setThrottledValues(values);
      lastExecutedRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const remainingTime = interval - timeSinceLastExecution;

      timeoutRef.current = setTimeout(() => {
        setThrottledValues(pendingValuesRef.current);
        lastExecutedRef.current = Date.now();
        timeoutRef.current = null;
      }, remainingTime);

      onThrottled?.(values);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [values, interval, onThrottled]);

  return [throttledValues, flush, cancel];
}

export default useThrottledValue;
