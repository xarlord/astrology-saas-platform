/**
 * Shared error handling utilities
 */

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const apiErr = err as ApiErrorResponse;
  return apiErr?.response?.data?.error?.message ?? fallback;
}
