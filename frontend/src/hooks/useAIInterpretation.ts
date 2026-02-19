/**
 * AI Interpretation Hook
 * Manages AI-powered interpretation generation
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import aiService from '../services/ai.service';

interface UseAIInterpretationResult {
  generateNatal: (chartData: any) => Promise<any>;
  generateTransit: (transitData: any) => Promise<any>;
  generateCompatibility: (synastryData: any) => Promise<any>;
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
    mutationFn: (chartData: any) => aiService.generateNatal(chartData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err) => setError(err),
  });

  const transitMutation = useMutation({
    mutationFn: (transitData: any) => aiService.generateTransit(transitData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err) => setError(err),
  });

  const compatibilityMutation = useMutation({
    mutationFn: (synastryData: any) => aiService.generateCompatibility(synastryData),
    onSuccess: () => {
      setError(null);
    },
    onError: (err) => setError(err),
  });

  return {
    generateNatal: natalMutation.mutateAsync,
    generateTransit: transitMutation.mutateAsync,
    generateCompatibility: compatibilityMutation.mutateAsync,
    isGenerating: natalMutation.isPending,
    error,
    isAvailable: status?.available || false,
  };
}
