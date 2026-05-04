/**
 * Error Handling Utilities
 *
 * Provides centralized error handling utilities for the application.
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Custom error class for application errors
 */
export class ApplicationError extends Error implements AppError {
  code?: string;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, code?: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Network error class for API failures
 */
export class NetworkError extends ApplicationError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

/**
 * Validation error class for form validation failures
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error class for auth failures
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Parse API error response
 */
export function parseAPIError(error: unknown): AppError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string; message?: string } } })
      .response;
    if (response?.data?.error) {
      return {
        message: response.data.error,
        details: error,
      };
    }
    if (response?.data?.message) {
      return {
        message: response.data.message,
        details: error,
      };
    }
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: AppError): string {
  // Special handling for common error codes
  if (error.code === 'NETWORK_ERROR') {
    if (error.statusCode === 401) {
      return 'Please log in to continue';
    }
    if (error.statusCode === 403) {
      return "You don't have permission to access this resource";
    }
    if (error.statusCode === 404) {
      return 'The requested resource was not found';
    }
    if (error.statusCode === 500) {
      return 'Server error. Please try again later';
    }
  }

  if (error.code === 'VALIDATION_ERROR') {
    return error.message;
  }

  if (error.code === 'AUTH_ERROR') {
    return error.message;
  }

  // Default message
  return error.message || 'Something went wrong. Please try again.';
}

/**
 * Log error to console (and eventually to error tracking service)
 */
export function logError(error: AppError, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : '';

  console.error(`${contextPrefix}Error:`, error.message);

  if (error.code) {
    console.error(`${contextPrefix}Error Code:`, error.code);
  }

  if (error.statusCode) {
    console.error(`${contextPrefix}Status Code:`, error.statusCode);
  }

  if (error.details && import.meta.env.DEV) {
    console.error(`${contextPrefix}Details:`, error.details);
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // Example with Sentry:
  // Sentry.captureException(error, {
  //   tags: { context },
  //   extra: { details: error.details }
  // });
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  onError?: (error: AppError) => void,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = parseAPIError(error);
    logError(appError);

    if (onError) {
      onError(appError);
    }

    return null;
  }
}

/**
 * Create error handler for React components
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    const appError = parseAPIError(error);
    logError(appError, context);

    // TODO: Show error notification to user
    // Example with toast notification:
    // toast.error(getUserFriendlyError(appError));
  };

  return { handleError };
}
