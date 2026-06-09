/**
 * API Client Tests
 * Testing base API client configuration and interceptors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../../services/api';
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
    isAxiosError: vi.fn((error: any) => {
      return error && error.name === 'AxiosError';
    }),
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

  it('should export api instance', () => {
    expect(api).toBeDefined();
  });
});
