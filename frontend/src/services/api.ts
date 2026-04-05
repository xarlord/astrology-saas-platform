/**
 * API Client Configuration
 */

import axios from 'axios';
import { getAccessToken, getRefreshToken } from '../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (CSRF cookie)
});

// CSRF token management
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const { data } = await axios.get<{ data: { token: string } }>(`${API_URL}/api/v1/csrf-token`, {
    withCredentials: true,
  });
  const token: string = data.data.token;
  csrfToken = token;
  return token;
}

// Request interceptor - Add auth token + CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for mutating requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh + CSRF retry
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // CSRF token invalid — refresh and retry once
    if (
      error.response?.status === 403 &&
      originalRequest &&
      !(originalRequest as unknown as Record<string, unknown>)._csrfRetry
    ) {
      const errorCode = (error.response?.data as { code?: string } | undefined)?.code;
      if (errorCode === 'CSRF_TOKEN_INVALID' || errorCode === 'CSRF_VALIDATION_ERROR') {
        (originalRequest as unknown as Record<string, unknown>)._csrfRetry = true;
        try {
          const newToken = await fetchCsrfToken();
          originalRequest.headers['x-csrf-token'] = newToken;
          return api(originalRequest);
        } catch {
          return Promise.reject(error);
        }
      }
    }

    // If 401 and not already retrying
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as unknown as Record<string, unknown>)._retry
    ) {
      (originalRequest as unknown as Record<string, unknown>)._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = data.data;

        // Update token in Zustand store via a custom event
        // The authStore listens for this to update its state
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { accessToken } }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - trigger logout
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
