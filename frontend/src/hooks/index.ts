/**
 * Custom Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, chartService, analysisService, transitService, type BirthData } from '../services';
import { useAuthStore, useChartsStore } from '../store';

// PWA Hooks
export { useServiceWorkerUpdate } from './useServiceWorkerUpdate';
export { usePushNotifications } from './usePushNotifications';

// AI Hooks
export { useAIInterpretation } from './useAIInterpretation';

/**
 * Use Auth Hook
 */
export function useAuth() {
  const { user, isAuthenticated, login, register, logout, updateProfile, updatePreferences, isLoading, error, clearError } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Use Charts Hook
 */
export function useCharts() {
  const { charts, currentChart, pagination, fetchCharts, fetchChart, createChart, updateChart, deleteChart, calculateChart, isLoading, error, clearError } = useChartsStore();

  return {
    charts,
    currentChart,
    pagination,
    fetchCharts,
    fetchChart,
    createChart,
    updateChart,
    deleteChart,
    calculateChart,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Use Chart Analysis Hook
 */
export function useChartAnalysis(chartId: string, enabled = true) {
  return useQuery({
    queryKey: ['analysis', chartId],
    queryFn: () => analysisService.getPersonalityAnalysis(chartId),
    enabled: enabled && !!chartId,
  });
}

/**
 * Use Aspects Analysis Hook
 */
export function useAspectsAnalysis(chartId: string, enabled = true) {
  return useQuery({
    queryKey: ['aspects', chartId],
    queryFn: () => analysisService.getAspectAnalysis(chartId),
    enabled: enabled && !!chartId,
  });
}

/**
 * Use Houses Analysis Hook
 */
export function useHousesAnalysis(chartId: string, enabled = true) {
  return useQuery({
    queryKey: ['houses', chartId],
    queryFn: () => analysisService.getHousesAnalysis(chartId),
    enabled: enabled && !!chartId,
  });
}

/**
 * Use Today's Transits Hook
 */
export function useTodayTransits(enabled = true) {
  return useQuery({
    queryKey: ['transits', 'today'],
    queryFn: () => transitService.getTodayTransits(),
    enabled,
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}

/**
 * Use Transit Calendar Hook
 */
export function useTransitCalendar(month: number, year: number, enabled = true) {
  return useQuery({
    queryKey: ['transits', 'calendar', month, year],
    queryFn: () => transitService.getTransitCalendar(month, year),
    enabled,
  });
}

/**
 * Use Transit Forecast Hook
 */
export function useTransitForecast(duration: 'week' | 'month' | 'quarter' | 'year' = 'month', enabled = true) {
  return useQuery({
    queryKey: ['transits', 'forecast', duration],
    queryFn: () => transitService.getTransitForecast(duration),
    enabled,
  });
}

/**
 * Use Create Chart Mutation Hook
 */
export function useCreateChart() {
  const queryClient = useQueryClient();
  const { createChart } = useCharts();

  return useMutation({
    mutationFn: (data: BirthData) => createChart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] });
    },
  });
}

/**
 * Use Calculate Chart Mutation Hook
 */
export function useCalculateChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chartId: string) => chartService.calculateChart(chartId),
    onSuccess: (_, chartId) => {
      queryClient.invalidateQueries({ queryKey: ['charts'] });
      queryClient.invalidateQueries({ queryKey: ['chart', chartId] });
      queryClient.invalidateQueries({ queryKey: ['analysis', chartId] });
    },
  });
}
