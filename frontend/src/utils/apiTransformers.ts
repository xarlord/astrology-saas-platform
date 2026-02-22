/**
 * API Transformers
 *
 * Transforms backend API responses (snake_case) to frontend domain models (camelCase).
 * This isolates the contract mismatch and provides type-safe transformations.
 */

// ============================================================================
// BACKEND API TYPES (snake_case) - What the backend actually sends
// ============================================================================

/**
 * Raw Chart data from backend API
 */
export interface APIChart {
  id: string;
  user_id: string;
  name: string;
  type: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: string; // ISO date string from backend
  birth_time: string; // HH:MM format
  birth_time_unknown: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac: 'tropical' | 'sidereal';
  sidereal_mode?: string;
  calculated_data?: unknown;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Raw BirthData from backend API
 */
export interface APIBirthData {
  birth_date?: string;
  birth_time?: string;
  birth_time_unknown?: boolean;
  birth_place_name?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  birth_timezone?: string;
}

/**
 * Raw PlanetPosition from backend API
 */
export interface APIPlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  house?: number;
  retrograde?: boolean;
}

/**
 * Raw User data from backend API
 */
export interface APIUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'pro' | 'lifetime';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
  settings?: APIUserSettings;
  preferences?: Record<string, unknown>;
}

/**
 * Raw UserSettings from backend API
 */
export interface APIUserSettings {
  timezone: string;
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
  notifications?: APINotificationSettings;
}

/**
 * Raw NotificationSettings from backend API
 */
export interface APINotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  lunar_returns: boolean;
  solar_returns: boolean;
  daily_forecast: boolean;
}

// ============================================================================
// FRONTEND DOMAIN TYPES (camelCase) - What the frontend expects
// ============================================================================

/**
 * Frontend BirthData interface
 */
export interface BirthData {
  name?: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  unknownTime?: boolean;
}

/**
 * Frontend Chart interface
 */
export interface Chart {
  id: string;
  userId: string;
  name: string;
  type: 'natal' | 'draconic' | 'harmonic' | 'composite' | 'synastry';
  birthData: BirthData;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  notes?: string;
}

/**
 * Frontend PlanetPosition interface
 */
export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  minute: number;
  house?: number;
  retrograde?: boolean;
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform API BirthData to frontend BirthData
 */
export function transformBirthData(apiData: APIBirthData): BirthData {
  return {
    birthDate: apiData.birth_date ?? '',
    birthTime: apiData.birth_time ?? '',
    birthPlace: apiData.birth_place_name ?? '',
    latitude: apiData.birth_latitude ?? 0,
    longitude: apiData.birth_longitude ?? 0,
    timezone: apiData.birth_timezone ?? 'UTC',
    unknownTime: apiData.birth_time_unknown ?? false,
  };
}

/**
 * Transform frontend BirthData to API BirthData
 */
export function birthDataToAPI(data: BirthData): APIBirthData {
  return {
    birth_date: data.birthDate,
    birth_time: data.birthTime,
    birth_place_name: data.birthPlace,
    birth_latitude: data.latitude,
    birth_longitude: data.longitude,
    birth_timezone: data.timezone,
    birth_time_unknown: data.unknownTime,
  };
}

/**
 * Transform API Chart to frontend Chart
 */
export function transformChart(apiChart: APIChart): Chart {
  return {
    id: apiChart.id,
    userId: apiChart.user_id,
    name: apiChart.name,
    type: apiChart.type as Chart['type'], // Type casting needed for different enum values
    birthData: {
      name: apiChart.name,
      birthDate: apiChart.birth_date,
      birthTime: apiChart.birth_time,
      birthPlace: apiChart.birth_place_name,
      latitude: apiChart.birth_latitude,
      longitude: apiChart.birth_longitude,
      timezone: apiChart.birth_timezone,
      unknownTime: apiChart.birth_time_unknown,
    },
    createdAt: apiChart.created_at,
    updatedAt: apiChart.updated_at,
    isDefault: true, // Backend doesn't have this field, default to true
    notes: undefined,
  };
}

/**
 * Transform API Chart array to frontend Chart array
 */
export function transformCharts(apiCharts: APIChart[]): Chart[] {
  return apiCharts.map(transformChart);
}

/**
 * Transform API PlanetPosition to frontend PlanetPosition
 */
export function transformPlanetPosition(apiPos: APIPlanetPosition): PlanetPosition {
  return {
    name: apiPos.planet,
    sign: apiPos.sign,
    degree: apiPos.degree,
    minute: apiPos.minute,
    house: apiPos.house,
    retrograde: apiPos.retrograde,
  };
}

/**
 * Transform API PlanetPosition array to frontend PlanetPosition array
 */
export function transformPlanetPositions(apiPositions: APIPlanetPosition[]): PlanetPosition[] {
  return apiPositions.map(transformPlanetPosition);
}

/**
 * Transform API User to frontend User
 */
export function transformUser(apiUser: APIUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    fullName: apiUser.full_name,
    avatar: apiUser.avatar_url,
    role: apiUser.role,
    subscriptionTier: apiUser.subscription_tier,
    subscriptionExpiresAt: apiUser.subscription_expires_at,
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
    settings: apiUser.settings ? transformUserSettings(apiUser.settings) : undefined,
    preferences: apiUser.preferences as User['preferences'],
  };
}

/**
 * Transform API UserSettings to frontend UserSettings
 */
export function transformUserSettings(apiSettings: APIUserSettings): UserSettings {
  return {
    timezone: apiSettings.timezone,
    language: apiSettings.language,
    dateFormat: apiSettings.date_format,
    timeFormat: apiSettings.time_format,
    notifications: apiSettings.notifications ? transformNotificationSettings(apiSettings.notifications) : {
      email: false,
      push: false,
      dailyDigest: false,
      transitAlerts: false,
      lunarReturns: false,
      solarReturns: false,
    },
  };
}

/**
 * Transform APINotificationSettings to frontend NotificationSettings
 */
export function transformNotificationSettings(apiSettings: APINotificationSettings): NotificationSettings {
  return {
    email: apiSettings.email_enabled,
    push: apiSettings.push_enabled,
    dailyDigest: apiSettings.daily_forecast,
    transitAlerts: false,
    lunarReturns: apiSettings.lunar_returns,
    solarReturns: apiSettings.solar_returns,
  };
}

/**
 * Transform frontend User to API format (for updates)
 */
export function userToAPI(user: Partial<User>): Partial<APIUser> {
  const apiUser: Partial<APIUser> = {};

  if (user.firstName) apiUser.first_name = user.firstName;
  if (user.lastName) apiUser.last_name = user.lastName;
  if (user.fullName) apiUser.full_name = user.fullName;
  if (user.avatar !== undefined) apiUser.avatar_url = user.avatar;
  if (user.subscriptionTier) apiUser.subscription_tier = user.subscriptionTier;
  if (user.subscriptionExpiresAt) apiUser.subscription_expires_at = user.subscriptionExpiresAt;

  return apiUser;
}

// ============================================================================
// FRONTEND TYPES IMPORT (from api.types.ts)
// ============================================================================

// Import User-related types from types/api.types.ts (frontend domain types)
type User = import('../types/api.types').User;
type UserSettings = import('../types/api.types').UserSettings;
type NotificationSettings = import('../types/api.types').NotificationSettings;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safe transform with null checking
 */
export function safeTransform<T, R>(
  data: T | null | undefined,
  transformer: (data: T) => R,
  defaultValue: R
): R {
  if (data === null || data === undefined) {
    return defaultValue;
  }
  try {
    return transformer(data);
  } catch (error) {
    console.error('Transform error:', error);
    return defaultValue;
  }
}

/**
 * Check if data is from API (has snake_case properties)
 */
export function isAPIData(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return 'birth_date' in obj || 'birth_time' in obj || 'created_at' in obj;
}

/**
 * Smart transform that detects input format
 */
export function smartTransformChart(data: APIChart | Chart): Chart {
  if (isAPIData(data)) {
    return transformChart(data as APIChart);
  }
  return data as Chart;
}
