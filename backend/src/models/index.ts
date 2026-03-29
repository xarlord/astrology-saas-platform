/**
 * Models Index
 * Central exports for all models - explicit named exports to avoid conflicts
 */

// Charts
export { default as ChartModel } from '../modules/charts/models/chart.model';
export type { Chart, CreateChartData, UpdateChartData } from '../modules/charts/models/chart.model';

// Users
export { default as UserModel } from '../modules/users/models/user.model';
export type { User, CreateUserData, UpdateUserData } from '../modules/users/models/user.model';

// Auth
export * from '../modules/auth/models/refreshToken.model';

// Calendar
export type {
  EventType,
  AspectType,
  Planet,
  MoonPhase,
  RetrogradePeriod,
  Eclipse,
  MoonPhaseEvent,
  AstrologicalEvent,
  TransitEvent,
  DailyWeather,
  CalendarMonth,
  UserReminder,
  CalendarView,
  NotificationPayload,
} from '../modules/calendar/models/calendar.model';

// Calendar Events - only unique exports
export type {
  CalendarEvent,
  MoonPhaseDetails,
} from '../modules/calendar/models/calendarEvent.model';

// Lunar - only unique exports
export type {
  LunarReturnChart,
  LunarAspect,
  LunarMonthForecast,
  KeyDate,
  MonthlyPrediction,
  MonthlyRitual,
  UserLunarReturn,
  CurrentLunarReturn,
} from '../modules/lunar/models/lunarReturn.model';

// Notifications
export * from '../modules/notifications/models/pushSubscription.model';

// Solar
export * from '../modules/solar/models/solarReturn.model';

// Synastry - only unique exports
export type {
  SynastryChart,
  SynastryAspect,
  CompositePlanet,
  CompositeChart,
  CompatibilityScores,
  ElementalBalance,
  CompatibilityReport,
  SynastryComparisonRequest,
  SynastryComparisonResponse,
  SynastryRequest,
} from '../modules/synastry/models/synastry.model';

// AI
export * from '../modules/ai/models/aiCache.model';
export * from '../modules/ai/models/aiUsage.model';
