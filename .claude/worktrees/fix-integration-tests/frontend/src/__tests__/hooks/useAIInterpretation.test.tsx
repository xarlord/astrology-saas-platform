/**
 * useAIInterpretation Hook Tests
 * TDD: Tests written before implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useAIInterpretation } from '../../hooks/useAIInterpretation';
import { createQueryClient } from '../test-utils';

// Mock API service
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../../services/api';
import { QueryClientProvider } from '@tanstack/react-query';

// Helper to create wrapper
function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAIInterpretation Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockClear();
    vi.mocked(api.post).mockClear();
    queryClient = createQueryClient();
  });

  it('should check AI availability on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          available: true,
          service: 'openai',
        },
      },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isAvailable).toBe(true);
    });
  });

  it('should handle AI unavailable status', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          available: false,
          service: null,
        },
      },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isAvailable).toBe(false);
    });
  });

  it('should generate AI natal interpretation successfully', async () => {
    const mockAIResponse = {
      data: {
        success: true,
        data: {
          interpretation: { planets: [] },
          enhanced: 'AI enhanced interpretation',
          ai: true,
          source: 'openai',
          generatedAt: new Date().toISOString(),
        },
      },
    };

    vi.mocked(api.post).mockResolvedValue(mockAIResponse);
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    const interpretation = await result.current.generateNatal({
      planets: [
        { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
      ],
    });

    await waitFor(() => {
      expect(interpretation).toHaveProperty('enhanced');
      expect(interpretation.ai).toBe(true);
      expect(interpretation.source).toBe('openai');
    });
  });

  it('should generate AI transit interpretation successfully', async () => {
    const mockAIResponse = {
      data: {
        success: true,
        data: {
          interpretation: { transits: [] },
          enhanced: 'AI transit forecast',
          ai: true,
          source: 'openai',
        },
      },
    };

    vi.mocked(api.post).mockResolvedValue(mockAIResponse);
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    const interpretation = await result.current.generateTransit({
      currentTransits: [],
    });

    await waitFor(() => {
      expect(interpretation.ai).toBe(true);
      expect(interpretation.enhanced).toBeDefined();
    });
  });

  it('should generate AI compatibility analysis successfully', async () => {
    const mockAIResponse = {
      data: {
        success: true,
        data: {
          interpretation: { compatibility: 85 },
          enhanced: 'AI compatibility analysis',
          ai: true,
          source: 'openai',
        },
      },
    };

    vi.mocked(api.post).mockResolvedValue(mockAIResponse);
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    const interpretation = await result.current.generateCompatibility({
      chartA: { planets: [] },
      chartB: { planets: [] },
    });

    await waitFor(() => {
      expect(interpretation.ai).toBe(true);
      expect(interpretation.interpretation).toHaveProperty('compatibility');
    });
  });

  it('should handle AI unavailable gracefully and fallback to rule-based', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          interpretation: { planets: [] },
          ai: false,
          source: 'rule-based',
        },
      },
    };

    vi.mocked(api.post).mockResolvedValue(mockResponse);
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    const interpretation = await result.current.generateNatal({ planets: [] });

    await waitFor(() => {
      expect(interpretation.ai).toBe(false);
      expect(interpretation.source).toBe('rule-based');
    });
  });

  it('should set error state on generation failure', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('API Error'));
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await result.current.generateNatal({ planets: [] });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('API Error');
    });
  });

  it('should set generating state during natal interpretation', async () => {
    let resolveGeneration: any;
    const pendingPromise = new Promise((resolve) => {
      resolveGeneration = resolve;
    });

    vi.mocked(api.post).mockReturnValue(pendingPromise);
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    // Start generation
    result.current.generateNatal({ planets: [] });

    // Check generating state
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true);
    });

    // Resolve the promise
    resolveGeneration({
      data: {
        success: true,
        data: { interpretation: {}, ai: true, source: 'openai' },
      },
    });

    // Check generating state is false
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network Error'));
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await result.current.generateNatal({ planets: [] });
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Network Error');
    });
  });

  it('should clear error on successful generation', async () => {
    // First call fails
    vi.mocked(api.post).mockRejectedValueOnce(new Error('First error'));
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, service: 'openai' } },
    });

    const { result } = renderHook(() => useAIInterpretation(), {
      wrapper: createWrapper(queryClient),
    });

    try {
      await result.current.generateNatal({ planets: [] });
    } catch (error) {
      // Expected
    }

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    // Second call succeeds
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: { interpretation: {}, ai: true, source: 'openai' },
      },
    });

    await result.current.generateNatal({ planets: [] });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });
});
