/**
 * usePolling Hook
 *
 * Provides polling functionality with configurable interval,
 * automatic pause when tab is hidden, and error handling with retry.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PollingOptions<T> {
  /** Polling interval in milliseconds (default: 5000) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Pause polling when tab is not visible (default: true) */
  pauseWhenHidden?: boolean;
  /** Maximum number of consecutive errors before stopping (default: 5) */
  maxErrors?: number;
  /** Delay before retrying after an error (default: interval * 2) */
  errorRetryDelay?: number;
  /** Callback when polling succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when polling fails */
  onError?: (error: Error) => void;
  /** Whether to run immediately on mount (default: false) */
  immediate?: boolean;
  /** Dependencies array to reset polling when changed */
  deps?: unknown[];
}

export interface PollingState<T> {
  /** Latest polled data */
  data: T | null;
  /** Whether polling is in progress */
  isPolling: boolean;
  /** Whether polling is paused */
  isPaused: boolean;
  /** Number of successful polls */
  pollCount: number;
  /** Number of consecutive errors */
  errorCount: number;
  /** Last error that occurred */
  error: Error | null;
  /** Last successful poll timestamp */
  lastPollTime: number | null;
  /** Next poll timestamp */
  nextPollTime: number | null;
}

export interface PollingActions {
  /** Start polling */
  start: () => void;
  /** Stop polling */
  stop: () => void;
  /** Pause polling */
  pause: () => void;
  /** Resume polling */
  resume: () => void;
  /** Force an immediate poll */
  poll: () => Promise<void>;
  /** Reset error count and resume */
  reset: () => void;
}

const DEFAULT_INTERVAL = 5000;
const DEFAULT_MAX_ERRORS = 5;

/**
 * Custom hook for polling data at regular intervals
 *
 * @example
 * ```tsx
 * const [state, actions] = usePolling(
 *   async () => fetchTransits(),
 *   {
 *     interval: 10000,
 *     pauseWhenHidden: true,
 *     onSuccess: (data) => setTransits(data),
 *   }
 * );
 * ```
 */
export function usePolling<T>(
  pollFn: () => Promise<T>,
  options: PollingOptions<T> = {},
): [PollingState<T>, PollingActions] {
  const {
    interval = DEFAULT_INTERVAL,
    enabled = true,
    pauseWhenHidden = true,
    maxErrors = DEFAULT_MAX_ERRORS,
    errorRetryDelay = interval * 2,
    onSuccess,
    onError,
    immediate = false,
    deps = [],
  } = options;

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isPolling: false,
    isPaused: false,
    pollCount: 0,
    errorCount: 0,
    error: null,
    lastPollTime: null,
    nextPollTime: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);
  const isPausedRef = useRef(false);
  const enabledRef = useRef(enabled);
  const pollFnRef = useRef(pollFn);

  // Keep refs updated
  pollFnRef.current = pollFn;
  enabledRef.current = enabled;

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Perform a single poll
   */
  const poll = useCallback(async () => {
    // Prevent concurrent polls
    if (isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    setState((prev) => ({ ...prev, isPolling: true }));

    try {
      const data = await pollFnRef.current();

      setState((prev) => ({
        ...prev,
        data,
        isPolling: false,
        pollCount: prev.pollCount + 1,
        errorCount: 0,
        error: null,
        lastPollTime: Date.now(),
        nextPollTime: Date.now() + interval,
      }));

      onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      setState((prev) => ({
        ...prev,
        isPolling: false,
        errorCount: prev.errorCount + 1,
        error,
      }));

      onError?.(error);

      // Check if we should stop due to too many errors
      if (state.errorCount + 1 >= maxErrors) {
        clearTimers();
        return;
      }

      // Schedule retry with delay
      timeoutRef.current = setTimeout(() => {
        if (!isPausedRef.current && enabledRef.current) {
          void poll();
        }
      }, errorRetryDelay);
    } finally {
      isPollingRef.current = false;
    }
  }, [interval, maxErrors, errorRetryDelay, onSuccess, onError, clearTimers, state.errorCount]);

  /**
   * Start polling
   */
  const start = useCallback(() => {
    if (intervalRef.current) return; // Already running

    isPausedRef.current = false;
    setState((prev) => ({ ...prev, isPaused: false }));

    // Set next poll time
    setState((prev) => ({
      ...prev,
      nextPollTime: Date.now() + interval,
    }));

    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current && enabledRef.current) {
        void poll();
      }
    }, interval);
  }, [interval, poll]);

  /**
   * Stop polling
   */
  const stop = useCallback(() => {
    clearTimers();
    isPausedRef.current = false;
    setState((prev) => ({
      ...prev,
      isPaused: false,
      nextPollTime: null,
    }));
  }, [clearTimers]);

  /**
   * Pause polling
   */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  /**
   * Resume polling
   */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setState((prev) => ({
      ...prev,
      isPaused: false,
      nextPollTime: Date.now() + interval,
    }));
  }, [interval]);

  /**
   * Reset error count and resume
   */
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errorCount: 0,
      error: null,
    }));
    if (!intervalRef.current && enabledRef.current) {
      start();
    }
    // Note: 'enabled' is tracked via ref, dependency is not needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // Handle visibility change
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        resume();
        // Poll immediately when becoming visible
        void poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden, pause, resume, poll]);

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !isPausedRef.current) {
      if (immediate) {
        void poll();
      }
      start();
    } else {
      stop();
    }

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return [
    state,
    {
      start,
      stop,
      pause,
      resume,
      poll,
      reset,
    },
  ];
}

export default usePolling;
