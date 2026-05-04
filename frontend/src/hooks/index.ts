/**
 * Custom Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chartService, analysisService, transitService, type BirthData } from '../services';
import { useAuthStore, useChartStore } from '../stores';

// PWA Hooks
export { useServiceWorkerUpdate } from './useServiceWorkerUpdate';
export { usePushNotifications } from './usePushNotifications';

// AI Hooks
export { useAIInterpretation } from './useAIInterpretation';

// Keyboard Navigation Hooks (WCAG 2.1 AA)
export {
  useKeyboardNavigation,
  useTypeAhead,
  type UseKeyboardNavigationOptions,
  type UseKeyboardNavigationReturn,
  type NavigationDirection,
} from './useKeyboardNavigation';

export {
  useFocusTrap,
  useFocusRestoration,
  useAnnouncer,
  useRovingTabIndex,
  type UseFocusTrapOptions,
} from './useFocusTrap';

export {
  useKeyboardShortcuts,
  useKeyboardShortcut,
  CommonShortcuts,
  type KeyboardShortcut,
} from './useKeyboardShortcuts';

export {
  useShortcut,
  useScopedShortcuts,
  useShortcutsList,
  createShortcut,
  AppShortcuts,
  type ShortcutDefinition,
  type UseShortcutOptions,
} from './useShortcut';

// PDF Generation Hooks
export {
  usePDFGeneration,
  getReportTypeName,
  getExpectedPageCount,
  generateReportFilename,
} from './usePDFGeneration';
export type { PDFGenerationState, UsePDFGenerationReturn } from './usePDFGeneration';

// Form Validation Hooks
export {
  useFormValidation,
  useFieldValidation,
  type FieldConfig,
  type FormValidationConfig,
  type UseFormValidationReturn,
} from './useFormValidation';

// Video Player Hooks
export {
  useVideoPlayer,
  PLAYBACK_RATES,
  SEEK_JUMP_SECONDS,
  VOLUME_STEP,
  COMPLETION_THRESHOLD,
} from './useVideoPlayer';
export type {
  VideoPlayerState,
  VideoPlayerControls,
  VideoPlayerOptions,
  VideoProgress,
} from './useVideoPlayer';

// Real-Time Optimization Hooks
export {
  useRealTimeUpdates,
  type ConnectionStatus,
  type WebSocketMessage,
  type RealTimeUpdateOptions,
  type RealTimeUpdateState,
  type RealTimeUpdateActions,
} from './useRealTimeUpdates';

export {
  useDebouncedCallback,
  type DebouncedCallbackOptions,
  type DebouncedCallbackControl,
} from './useDebouncedCallback';

export {
  useThrottledValue,
  useThrottledValues,
  type ThrottledValueOptions,
} from './useThrottledValue';

export {
  useOptimisticUpdate,
  type OptimisticUpdateOptions,
  type OptimisticUpdateState,
  type OptimisticUpdateActions,
} from './useOptimisticUpdate';

export {
  usePolling,
  type PollingOptions,
  type PollingState,
  type PollingActions,
} from './usePolling';

/**
 * Use Auth Hook
 */
export function useAuth() {
  const {
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
  } = useAuthStore();

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
  const {
    charts,
    currentChart,
    pagination,
    loadCharts,
    loadChart,
    createChart,
    updateChart,
    deleteChart,
    calculateChart,
    isLoading,
    error,
    clearError,
  } = useChartStore();

  return {
    charts,
    currentChart,
    pagination,
    fetchCharts: loadCharts,
    fetchChart: loadChart,
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
export function useTransitForecast(
  duration: 'week' | 'month' | 'quarter' | 'year' = 'month',
  enabled = true,
) {
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
      void queryClient.invalidateQueries({ queryKey: ['charts'] });
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
      void queryClient.invalidateQueries({ queryKey: ['charts'] });
      void queryClient.invalidateQueries({ queryKey: ['chart', chartId] });
      void queryClient.invalidateQueries({ queryKey: ['analysis', chartId] });
    },
  });
}
