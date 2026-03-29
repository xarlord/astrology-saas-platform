/**
 * AI Interpretation Hook
 * Manages AI-powered interpretation generation
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import aiService from '../services/ai.service';
import type { AIInterpretationResponse } from '../services/ai.service';

type ChartData = Record<string, unknown>;

interface UseAIInterpretationResult {
  generateNatal: (chartData: Record<string, unknown>) => Promise<AIInterpretationResponse>;
  generateTransit: (transitData: Record<string, unknown>) => Promise<AIInterpretationResponse>;
  generateCompatibility: (synastryData: { chartA: ChartData; chartB: ChartData }) => Promise<AIInterpretationResponse>;
  isGenerating: boolean;
  error: Error | null;
  isAvailable: boolean;
}

export function useAIInterpretation(): UseAIInterpretationResult {
  const [error, setError] = useState<Error | null>(null);

  // Check AI availability
  const { data: status } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => aiService.checkStatus(),
    retry: false,
  });

  const natalMutation = useMutation({
    mutationFn: (chartData: Record<string, unknown>) => aiService.generateNatal(chartData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  const transitMutation = useMutation({
    mutationFn: (transitData: Record<string, unknown>) => aiService.generateTransit(transitData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  const compatibilityMutation = useMutation({
    mutationFn: (synastryData: { chartA: ChartData; chartB: ChartData }) => aiService.generateCompatibility(synastryData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  return {
    generateNatal: natalMutation.mutateAsync,
    generateTransit: transitMutation.mutateAsync,
    generateCompatibility: compatibilityMutation.mutateAsync,
    isGenerating: natalMutation.isPending || transitMutation.isPending || compatibilityMutation.isPending,
    error,
    isAvailable: status?.available ?? false,
  };
}
