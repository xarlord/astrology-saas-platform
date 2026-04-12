/**
 * Stores Export
 *
 * Centralized exports for all Zustand stores
 */

// Auth store
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from './authStore';

// Chart store
export {
  useChartStore,
  useCharts,
  useCurrentChart,
  useChartLoading,
  useChartError,
} from './chartStore';

// Calendar store
export {
  useCalendarStore,
  useCalendarViewMode,
  useCalendarSelectedDate,
  useCalendarEvents,
  useLunarPhases,
  useCalendarLoading,
} from './calendarStore';

// Transit store
export {
  useTransitStore,
  useTransits,
  useTransitChart,
  useEnergyLevel,
  useTransitLoading,
} from './transitStore';

// Synastry store
export {
  useSynastryStore,
  useSynastryPersons,
  useSynastryScore,
  useSynastryBreakdown,
  useSynastryComparison,
  useSynastryLoading,
} from './synastryStore';

// Learning store
export {
  useLearningStore,
  useCourses,
  useCurrentCourse,
  useCurrentLesson,
  useProgress,
  useLearningLoading,
} from './learningStore';

// UI store
export {
  useUIStore,
  useTheme,
  useSidebarOpen,
  useViewMode,
  useDensity,
  useChartDisplayOptions,
} from './uiStore';

// Notification store
export {
  useNotificationStore,
  useNotifications,
  useAddNotification,
  useRemoveNotification,
} from './notificationStore';

// Report store
export { useReportStore, useReports, useActiveReport, useIsGeneratingReport } from './reportStore';

// Location store
export {
  useLocationStore,
  useSearchResults,
  useIsSearchingLocations,
  useSelectedLocation,
  useSearchLocations,
  useSelectLocation,
} from './locationStore';
