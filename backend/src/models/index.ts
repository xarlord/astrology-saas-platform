/**
 * Models Index
 * Central exports for all models
 * NOTE: Where multiple modules export the same type names, we use explicit
 * exports to avoid ambiguity (e.g., MoonPhase, Planet, PlanetPosition).
 */

// Charts
export { default as ChartModel } from '../modules/charts/models/chart.model';
export type { Chart, CreateChartData, UpdateChartData } from '../modules/charts/models/chart.model';

// Users
export { default as UserModel } from '../modules/users/models/user.model';
export type { User, CreateUserData, UpdateUserData } from '../modules/users/models/user.model';

// Auth
export * from '../modules/auth/models/refreshToken.model';

// Calendar model — authoritative source for MoonPhase, Planet
export * from '../modules/calendar/models/calendar.model';

// CalendarEvent — skip Planet, MoonPhase, PlanetPosition to avoid conflicts
export { type CalendarEvent } from '../modules/calendar/models/calendarEvent.model';

// Lunar model — skip NatalChart, ZodiacSign, MoonPhase to avoid conflicts
export {
  type LunarReturnChart,
  type LunarAspect,
  type LunarMonthForecast,
  type KeyDate,
  type MonthlyPrediction,
  type MonthlyRitual,
  type UserLunarReturn,
  type CurrentLunarReturn,
} from '../modules/lunar/models/lunarReturn.model';

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
