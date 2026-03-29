/**
 * API Client Configuration
 *
 * Features:
 * - Base URL configuration with environment variable support
 * - Request interceptor (add auth token)
 * - Response interceptor (handle errors, refresh token)
 * - Timeout configuration (30s default)
 * - Retry logic for failed requests
 * - Type-safe request methods
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TIMEOUTS, HTTP } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * Retry configuration for failed requests
 */
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: HTTP.DEFAULT_RETRIES,
  retryDelay: HTTP.DEFAULT_RETRY_DELAY_MS,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= HTTP.STATUS_INTERNAL_ERROR && error.response.status < 600);
  },
};

/**
 * Extend axios config to include metadata
 */
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
    };
  }
}

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: TIMEOUTS.API_DEFAULT_TIMEOUT_MS,
  headers: {
    [HTTP.HEADER_CONTENT_TYPE]: HTTP.CONTENT_TYPE_JSON,
  },
});

/**
 * Delay utility for retry logic
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enhanced request interceptor
 * - Adds auth token from localStorage
 * - Adds request timestamp for debugging
 * - Handles retry logic
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata
    config.metadata = {
      startTime: Date.now(),
      ...config.metadata,
    };

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Enhanced response interceptor
 * - Handles token refresh on 401
 * - Implements retry logic for failed requests
 * - Adds response timing information
 * - Handles common error scenarios
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const endTime = Date.now();
    const duration = endTime - (response.config.metadata?.startTime ?? endTime);

    // Log slow requests in development
    if (import.meta.env.DEV && duration > HTTP.SLOW_REQUEST_THRESHOLD_MS) {
      console.warn(`[API] Slow request detected: ${response.config.url} took ${duration}ms`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
      metadata?: { startTime: number };
    };

    // Handle 401 - Token refresh logic
    if (error.response?.status === HTTP.STATUS_UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use base axios instance to avoid infinite loop
        const response = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/api/v1/auth/refresh`,
          {},
          {
            headers: { [HTTP.HEADER_AUTHORIZATION]: `${HTTP.BEARER_PREFIX}${refreshToken}` },
          }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Update authorization header and retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${HTTP.BEARER_PREFIX}${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Only redirect if we're in the browser (not during SSR)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Retry logic for failed requests
    const retryConfig = DEFAULT_RETRY_CONFIG;
    const shouldRetry =
      originalRequest._retryCount === undefined &&
      retryConfig.retryCondition?.(error);

    if (shouldRetry) {
      originalRequest._retryCount = 0;
    }

    if (originalRequest._retryCount !== undefined &&
      originalRequest._retryCount < retryConfig.retries) {
      originalRequest._retryCount++;

      // Exponential backoff
      const delayTime = retryConfig.retryDelay * Math.pow(2, originalRequest._retryCount - 1);

      console.warn(
        `[API] Retrying request to ${originalRequest.url ?? 'unknown'} (attempt ${originalRequest._retryCount}/${retryConfig.retries})`
      );

      await delay(delayTime);

      // Reset _retry for the actual retry
      originalRequest._retry = false;
      return api(originalRequest);
    }

    // Enhance error with user-friendly message
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string } | undefined;

      // Server responded with error
      switch (status) {
        case HTTP.STATUS_BAD_REQUEST:
          error.message = data?.message ?? 'Invalid request. Please check your input.';
          break;
        case HTTP.STATUS_UNAUTHORIZED:
          error.message = 'Your session has expired. Please log in again.';
          break;
        case HTTP.STATUS_FORBIDDEN:
          error.message = 'You do not have permission to perform this action.';
          break;
        case HTTP.STATUS_NOT_FOUND:
          error.message = 'The requested resource was not found.';
          break;
        case HTTP.STATUS_TOO_MANY_REQUESTS:
          error.message = 'Too many requests. Please try again later.';
          break;
        case HTTP.STATUS_INTERNAL_ERROR:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = data?.message ?? `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Request made but no response received
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

/**
 * Type-safe request methods
 */
export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get<T>(url, config),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post<T>(url, data, config),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put<T>(url, data, config),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete<T>(url, config),
};

/**
 * Utility function to handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined;
    if (responseData?.message) {
      return responseData.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response && !!error.request;
};

/**
 * Check if error is an auth error
 */
export const isAuthError = (error: unknown): boolean => {
  return error instanceof AxiosError && (error.response?.status === HTTP.STATUS_UNAUTHORIZED || error.response?.status === HTTP.STATUS_FORBIDDEN);
};

export default api;
