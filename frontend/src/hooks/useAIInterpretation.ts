/**
 * AI Interpretation Hook
 * Manages AI-powered interpretation generation
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import aiService from '../services/ai.service';

import type { Chart } from '../services/api.types';

interface NatalChartData {
  chartId: string;
  birthData: unknown;
}

interface TransitForecastData {
  chartId: string;
  startDate: string;
  endDate: string;
}

interface SynastryChartData {
  chartA: Chart;
  chartB: Chart;
}

interface AIInterpretationResult {
  interpretation: string;
  enhanced?: string;
  ai: boolean;
  source: string;
  generatedAt?: string;
}

interface UseAIInterpretationResult {
  generateNatal: (chartData: NatalChartData) => Promise<AIInterpretationResult>;
  generateTransit: (transitData: TransitForecastData) => Promise<AIInterpretationResult>;
  generateCompatibility: (synastryData: SynastryChartData) => Promise<AIInterpretationResult>;
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
    mutationFn: (chartData: NatalChartData) => aiService.generateNatal(chartData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  const transitMutation = useMutation({
    mutationFn: (transitData: TransitForecastData) => aiService.generateTransit(transitData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  const compatibilityMutation = useMutation({
    mutationFn: (synastryData: SynastryChartData) => aiService.generateCompatibility(synastryData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => setError(err),
  });

  return {
    generateNatal: natalMutation.mutateAsync,
    generateTransit: transitMutation.mutateAsync,
    generateCompatibility: compatibilityMutation.mutateAsync,
    isGenerating:
      natalMutation.isPending || transitMutation.isPending || compatibilityMutation.isPending,
    error,
    isAvailable: status?.available ?? false,
  };
}
