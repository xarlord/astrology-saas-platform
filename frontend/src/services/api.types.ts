/**
 * Shared API Types
 *
 * Type definitions used across all API services
 */

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Error response
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * User types
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  plan: 'free' | 'basic' | 'premium';
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  // Optional fields used by components
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    transitAlerts: boolean;
    lunarPhases: boolean;
  };
  defaultHouseSystem: string;
  defaultZodiac: string;
  language: string;
}

/**
 * Chart types
 */
export interface BirthData {
  name: string;
  type?: ChartType;
  birth_date: string; // ISO 8601 date string
  birth_time: string; // HH:MM format
  birth_time_unknown?: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system?: HouseSystem;
  zodiac?: ZodiacSystem;
  sidereal_mode?: string;
  // CamelCase aliases for component compatibility
  birthDate?: string;
  birthTime?: string;
  unknownTime?: boolean;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export type ChartType =
  | 'natal'
  | 'synastry'
  | 'composite'
  | 'transit'
  | 'progressed'
  | 'solar-return';
export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
export type ZodiacSystem = 'tropical' | 'sidereal';

export interface Chart {
  id: string;
  user_id: string;
  name: string;
  type: ChartType;
  birth_data: BirthData;
  calculated_data?: CalculatedChartData;
  created_at: string;
  updated_at: string;
  // Optional camelCase aliases for component compatibility
  birthData?: BirthData;
  createdAt?: string;
  updatedAt?: string;
  // Optional extended fields used by components
  positions?: PlanetPosition[];
  tags?: string[];
  element?: string;
}

export interface CalculatedChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  points: ChartPoint[];
}

export interface PlanetPosition {
  planet: string;
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  house: number;
  sign: string;
  degree: number;
  minute: number;
  position: string; // e.g., "15°30' Aries"
  retrograde: boolean;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  position: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  degree: number;
  orb: number;
  applying: boolean;
  major: boolean;
}

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'sesquisquare'
  | 'semisextile'
  | 'semisquare'
  | 'quintile'
  | 'biquintile';

export interface ChartPoint {
  name: string;
  longitude: number;
  latitude: number;
  house: number;
  sign: string;
  position: string;
}

/**
 * Calendar types
 */
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: CalendarEventType;
  type?: CalendarEventType; // Alias for component compatibility
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
  created_at: string;
  // Optional fields for event data from different endpoints
  event_date?: string;
  event_data?: Record<string, unknown>;
  event_name?: string;
  intensity?: number;
  is_global?: boolean;
  interpretation?: string;
  // Additional aliases for component compatibility
  startDate?: string;
  endDate?: string;
}

export type CalendarEventType =
  | 'transit'
  | 'lunar-phase'
  | 'planetary-aspect'
  | 'retrograde'
  | 'eclipse'
  | 'custom'
  | 'moon_phase'
  | 'planetary_motion'
  | 'aspect'
  | 'ingress'
  | 'new_moon'
  | 'full_moon'
  | 'solar_eclipse'
  | 'lunar_eclipse';

export interface LunarPhase {
  date: string;
  phase: string;
  illumination: number;
  sign: string;
  degree: number;
  influence: string;
}

export type LunarPhaseType =
  | 'new-moon'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full-moon'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

/**
 * Transit types
 */
export interface Transit {
  id: string;
  planet: string;
  type: TransitType;
  start_date: string;
  end_date: string;
  peak_date: string;
  aspect?: string;
  influence: {
    overall: string;
    career?: string;
    relationships?: string;
    personal_growth?: string;
  };
  intensity: number; // 1-10
  // Optional fields used by dashboard components
  title?: string;
  description?: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

export type TransitType = 'major' | 'minor' | 'planetary-hour';

export interface TransitChart {
  chart_id: string;
  date: string;
  transits: Transit[];
  energy_level: number;
  dominant_themes: string[];
}

/**
 * Synastry types
 */
export interface SynastryComparison {
  chart1_id: string;
  chart2_id: string;
  overall_compatibility: number; // 0-100
  breakdown: SynastryBreakdown;
  aspects: SynastryAspect[];
  theme_analysis: {
    romantic?: string;
    communication?: string;
    values?: string;
    emotional?: string;
    intellectual?: string;
  };
}

export interface SynastryBreakdown {
  romance: number;
  communication: number;
  values: number;
  emotional: number;
  intellectual: number;
  overall: number;
}

export interface SynastryAspect {
  planet1: { planet: string; chart: 'chart1' | 'chart2' };
  planet2: { planet: string; chart: 'chart1' | 'chart2' };
  type: AspectType;
  degree: number;
  orb: number;
  influence: string;
  harmonic: boolean;
}

/**
 * Report types
 */
export interface ReportRequest {
  chart_id: string;
  type: ReportType;
  options?: ReportOptions;
}

export type ReportType = 'natal' | 'solar-return' | 'synastry' | 'transit' | 'composite';

export interface ReportOptions {
  includeAspects?: boolean;
  includeHouses?: boolean;
  includeTransits?: boolean;
  includeSynastryChartId?: string;
  language?: string;
  length?: 'brief' | 'standard' | 'comprehensive';
}

export interface Report {
  id: string;
  user_id: string;
  chart_id: string;
  type: ReportType;
  title: string;
  content: string;
  generated_at: string;
  pdf_url?: string;
  options: ReportOptions;
}

/**
 * Learning types
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessons: Lesson[];
  thumbnail_url?: string;
  category: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  order: number;
  duration: number;
  completed: boolean;
}

export interface UserProgress {
  user_id: string;
  course_id: string;
  completed_lessons: string[];
  current_lesson: string;
  progress_percentage: number;
  last_accessed: string;
  completed_at?: string;
}

/**
 * Location types
 */
export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeocodingResult {
  locations: Location[];
  query: string;
}

/**
 * Notification types
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export type NotificationType =
  | 'transit'
  | 'lunar-phase'
  | 'course-update'
  | 'report-ready'
  | 'system'
  | 'reminder';

/**
 * Auth types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Utility types
 */
export interface DateRange {
  start: string;
  end: string;
}

export type Timezone = string;

export interface Coordinate {
  latitude: number;
  longitude: number;
}
