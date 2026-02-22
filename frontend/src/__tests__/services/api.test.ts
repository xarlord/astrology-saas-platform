/**
 * API Client Tests
 * Testing base API client configuration and interceptors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api, {
  apiRequest,
  handleApiError,
  isNetworkError,
  isAuthError,
} from '../../services/api';
import { AxiosError } from 'axios';
import { setupLocalStorageMock } from './utils';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: mockAxios,
    AxiosError: class AxiosError extends Error {
      response?: any;
      request?: any;
      constructor(message: string) {
        super(message);
        this.name = 'AxiosError';
      }
    },
  };
});

describe('api', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = setupLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiRequest', () => {
    it('should expose GET method', () => {
      expect(apiRequest.get).toBeDefined();
      expect(typeof apiRequest.get).toBe('function');
    });

    it('should expose POST method', () => {
      expect(apiRequest.post).toBeDefined();
      expect(typeof apiRequest.post).toBe('function');
    });

    it('should expose PUT method', () => {
      expect(apiRequest.put).toBeDefined();
      expect(typeof apiRequest.put).toBe('function');
    });

    it('should expose PATCH method', () => {
      expect(apiRequest.patch).toBeDefined();
      expect(typeof apiRequest.patch).toBe('function');
    });

    it('should expose DELETE method', () => {
      expect(apiRequest.delete).toBeDefined();
      expect(typeof apiRequest.delete).toBe('function');
    });
  });

  describe('handleApiError', () => {
    it('should extract message from AxiosError response', () => {
      const error = new AxiosError('Request failed');
      error.response = {
        data: { message: 'Custom error message' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {},
      };

      const result = handleApiError(error);

      expect(result).toBe('Custom error message');
    });

    it('should return error message when no response data', () => {
      const error = new AxiosError('Network error');
      error.response = undefined;

      const result = handleApiError(error);

      expect(result).toBe('Network error');
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');

      const result = handleApiError(error);

      expect(result).toBe('Generic error');
    });

    it('should return default message for unknown errors', () => {
      const result = handleApiError('unknown');

      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle null/undefined errors', () => {
      expect(handleApiError(null)).toBe('An unexpected error occurred. Please try again.');
      expect(handleApiError(undefined)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors (no response)', () => {
      const error = new AxiosError('Network Error');
      error.request = {};
      error.response = undefined;

      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false when there is a response', () => {
      const error = new AxiosError('Server Error');
      error.response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      };
      error.request = {};

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Network Error');

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false when no request', () => {
      const error = new AxiosError('Error');
      error.request = undefined;

      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should return true for 401 errors', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {},
      };

      expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 403 errors', () => {
      const error = new AxiosError('Forbidden');
      error.response = {
        data: {},
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: {},
      };

      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for other status codes', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        data: {},
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {},
      };

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Unauthorized');

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false when no response', () => {
      const error = new AxiosError('Error');
      error.response = undefined;

      expect(isAuthError(error)).toBe(false);
    });
  });
});
