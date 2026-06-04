/**
 * useOptimisticUpdate Hook
 *
 * Provides optimistic UI updates with automatic rollback on failure
 * and configurable retry logic.
 */

import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdateOptions<T> {
  /** Current actual value */
  currentValue: T;
  /** Function to perform the actual update */
  updateFn: (newValue: T) => Promise<T | void>;
  /** Number of retry attempts on failure (default: 3) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Callback on successful update */
  onSuccess?: (value: T) => void;
  /** Callback on failed update after all retries */
  onError?: (error: Error, value: T) => void;
  /** Callback when rolling back to previous value */
  onRollback?: (value: T) => void;
  /** Custom function to compare values for equality */
  isEqual?: (a: T, b: T) => boolean;
}

export interface OptimisticUpdateState<T> {
  /** The current displayed value (may be optimistic) */
  value: T;
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Whether the current value is optimistic (not confirmed by server) */
  isOptimistic: boolean;
  /** Number of pending updates */
  pendingCount: number;
  /** Error from last failed update */
  error: Error | null;
  /** Number of retry attempts remaining */
  retriesRemaining: number;
}

export interface OptimisticUpdateActions<T> {
  /** Perform an optimistic update */
  update: (newValue: T) => Promise<boolean>;
  /** Force rollback to the last confirmed value */
  rollback: () => void;
  /** Clear any errors */
  clearError: () => void;
  /** Reset to current actual value */
  reset: () => void;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Custom hook for optimistic UI updates
 *
 * @example
 * ```tsx
 * const [state, actions] = useOptimisticUpdate({
 *   currentValue: chartName,
 *   updateFn: (newName) => updateChartAPI({ name: newName }),
 *   onSuccess: (name) => toast.success(`Chart renamed to ${name}`),
 *   onError: (err) => toast.error(`Failed to rename: ${err.message}`)
 * });
 *
 * // Use state.value for display (optimistic)
 * // Call actions.update(newValue) to update
 * ```
 */
export function useOptimisticUpdate<T>(
  options: OptimisticUpdateOptions<T>,
): [OptimisticUpdateState<T>, OptimisticUpdateActions<T>] {
  const {
    currentValue,
    updateFn,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    onSuccess,
    onError,
    onRollback,
    isEqual = (a, b) => a === b,
  } = options;

  const [state, setState] = useState<OptimisticUpdateState<T>>({
    value: currentValue,
    isUpdating: false,
    isOptimistic: false,
    pendingCount: 0,
    error: null,
    retriesRemaining: maxRetries,
  });

  // Track confirmed value for rollback
  const confirmedValueRef = useRef<T>(currentValue);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<{ value: T; retries: number } | null>(null);

  /**
   * Perform an optimistic update
   */
  const update = useCallback(
    async (newValue: T): Promise<boolean> => {
      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Store the pending update
      pendingUpdateRef.current = { value: newValue, retries: maxRetries };

      // Optimistically update the displayed value
      setState((prev) => ({
        ...prev,
        value: newValue,
        isUpdating: true,
        isOptimistic: true,
        pendingCount: prev.pendingCount + 1,
        error: null,
        retriesRemaining: maxRetries,
      }));

      try {
        // Perform the actual update
        const result = await updateFn(newValue);
        const confirmedValue = result ?? newValue;

        // Update confirmed value
        confirmedValueRef.current = confirmedValue;
        pendingUpdateRef.current = null;

        // Update state to reflect confirmed value
        setState((prev) => {
          const newPendingCount = Math.max(0, prev.pendingCount - 1);
          return {
            ...prev,
            value: confirmedValue,
            isUpdating: newPendingCount > 0,
            isOptimistic: false,
            pendingCount: newPendingCount,
            error: null,
            retriesRemaining: maxRetries,
          };
        });

        onSuccess?.(confirmedValue);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        setState((prev) => ({
          ...prev,
          error,
          retriesRemaining: prev.retriesRemaining - 1,
        }));

        // Check if we should retry
        if (pendingUpdateRef.current && pendingUpdateRef.current.retries > 1) {
          pendingUpdateRef.current.retries--;

          retryTimeoutRef.current = setTimeout(() => {
            if (pendingUpdateRef.current) {
              void update(pendingUpdateRef.current.value);
            }
          }, retryDelay);

          return false;
        }

        // No more retries - rollback
        rollback();
        onError?.(error, newValue);
        return false;
      }
    },
    // Note: 'rollback' is intentionally excluded as it would cause circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateFn, maxRetries, retryDelay, onSuccess, onError],
  );

  /**
   * Rollback to the last confirmed value
   */
  const rollback = useCallback(() => {
    // Clear pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    pendingUpdateRef.current = null;

    const rollbackValue = confirmedValueRef.current;

    setState((prev) => {
      // Only rollback if values are different
      if (isEqual(prev.value, rollbackValue)) {
        return prev;
      }

      onRollback?.(rollbackValue);

      return {
        ...prev,
        value: rollbackValue,
        isUpdating: false,
        isOptimistic: false,
        pendingCount: 0,
        retriesRemaining: maxRetries,
      };
    });
  }, [isEqual, maxRetries, onRollback]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Reset to current actual value
   */
  const reset = useCallback(() => {
    // Clear pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    pendingUpdateRef.current = null;

    confirmedValueRef.current = currentValue;

    setState({
      value: currentValue,
      isUpdating: false,
      isOptimistic: false,
      pendingCount: 0,
      error: null,
      retriesRemaining: maxRetries,
    });
  }, [currentValue, maxRetries]);

  // Update confirmed value when currentValue prop changes
  if (!isEqual(confirmedValueRef.current, currentValue) && !state.isOptimistic) {
    confirmedValueRef.current = currentValue;
  }

  return [
    state,
    {
      update,
      rollback,
      clearError,
      reset,
    },
  ];
}

export default useOptimisticUpdate;
