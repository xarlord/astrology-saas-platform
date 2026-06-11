/**
 * Shared error handling utilities
 */

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
      } | string;
    };
  };
  message?: string;
}

/**
 * Extract a human-readable error message from an API error.
 * Handles both `{ error: { message } }` and `{ error: "string" }` response shapes.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const apiErr = err as ApiErrorResponse;
  const errorData = apiErr?.response?.data?.error;

  if (typeof errorData === 'string') {
    return errorData;
  }

  if (errorData && typeof errorData === 'object' && 'message' in errorData) {
    return errorData.message ?? fallback;
  }

  return fallback;
}
