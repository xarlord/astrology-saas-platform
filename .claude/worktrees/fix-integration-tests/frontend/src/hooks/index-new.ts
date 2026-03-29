/**
 * Hooks Export
 *
 * Centralized exports for all custom hooks
 */

// Auth & User hooks
export { useAuth } from './useAuth';
export { useCharts } from './useCharts';
export { useCalendar } from './useCalendar';
export { useTransits } from './useTransits';
export { useSynastry } from './useSynastry';
export { useLearning } from './useLearning';
export { useReports } from './useReports';
export { useNotifications } from './useNotifications';

// Utility hooks
export { useLocalStorage, useLocalStorageObject, useLocalStorageArray } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useKeyboardShortcuts, useKeyboardShortcut, CommonShortcuts } from './useKeyboardShortcuts';
export { useErrorHandler, useLoadingAndError } from './useErrorHandler';

// Existing hooks
export { useServiceWorkerUpdate } from './useServiceWorkerUpdate';
export { usePushNotifications } from './usePushNotifications';
export { useCalendarEvents } from './useCalendarEvents';
export { useAIInterpretation } from './useAIInterpretation';
export { useFocusTrap } from './useFocusTrap';

// Re-export from old index for backward compatibility
export function useLegacyAuth() {
  // Implementation from old index if needed
  return {};
}

export function useLegacyCharts() {
  // Implementation from old index if needed
  return {};
}
