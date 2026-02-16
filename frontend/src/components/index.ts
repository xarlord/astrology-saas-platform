/**
 * UI Components Export
 */

// Auth & Protection
export { ProtectedRoute } from './ProtectedRoute';
export { LoginForm, RegisterForm } from './AuthenticationForms';

// Basic Symbols & Badges
export { PlanetSymbol } from './PlanetSymbol';
export { AspectSymbol } from './AspectSymbol';
export { ZodiacBadge } from './ZodiacBadge';

// Chart & Analysis
export { ChartWheel, ChartWheelLegend } from './ChartWheel';
export type { ChartData, PlanetPosition, HouseCusp, Aspect } from './ChartWheel';
export { PersonalityAnalysis } from './PersonalityAnalysis';
export type {
  PersonalityAnalysisData,
  PlanetSignInterpretation,
  HouseInterpretation,
  AspectInterpretation,
} from './PersonalityAnalysis';

// Forms
export { BirthDataForm } from './BirthDataForm';
export type { BirthData } from './BirthDataForm';

// Transit
export {
  TransitDashboard,
  TransitDetailModal,
} from './TransitDashboard';
export type {
  Transit,
  TransitHighlight,
  TransitCalendarDay,
  TransitDashboardData,
} from './TransitDashboard';

// User Profile
export { UserProfile } from './UserProfile';
export type { UserProfile as UserProfileType, Chart, HouseSystem } from './UserProfile';

// Layout
export { AppLayout } from './AppLayout';

// Calendar
export {
  CalendarView,
  DailyWeatherModal,
  ReminderSettings,
  CalendarExport,
} from './calendar.index';

