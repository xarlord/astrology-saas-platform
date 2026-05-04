/**
 * useErrorHandler Hook
 *
 * Custom hook for handling errors in React components.
 */

import { useState, useCallback } from 'react';
import { AppError, parseAPIError, getUserFriendlyError, logError } from '@/utils/errorHandler';

interface UseErrorHandlerResult {
  error: AppError | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  errorMessage: string;
  handleAsync: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Hook for managing error state in components
 */
export function useErrorHandler(context?: string): UseErrorHandlerResult {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback(
    (err: unknown) => {
      const appError = parseAPIError(err);
      logError(appError, context);
      setErrorState(appError);
    },
    [context],
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (err) {
        setError(err);
        return null;
      }
    },
    [clearError, setError],
  );

  const errorMessage = error ? getUserFriendlyError(error) : '';

  return {
    error,
    setError,
    clearError,
    errorMessage,
    handleAsync,
  };
}

/**
 * Hook for managing loading and error states together
 */
interface UseLoadingAndErrorResult<T> extends UseErrorHandlerResult {
  data: T | null;
  loading: boolean;
  execute: (fn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export function useLoadingAndError<T>(context?: string): UseLoadingAndErrorResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const errorHandler = useErrorHandler(context);

  const execute = useCallback(
    async (fn: () => Promise<T>) => {
      setLoading(true);
      try {
        const result = await fn();
        setData(result);
        errorHandler.clearError();
      } catch (err) {
        errorHandler.setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [errorHandler],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    errorHandler.clearError();
  }, [errorHandler]);

  return {
    ...errorHandler,
    data,
    loading,
    execute,
    reset,
  };
}
