/**
 * Configuration Constants
 */

export const ZODIAC_TYPES = ['tropical', 'sidereal'] as const;
export type ZodiacType = typeof ZODIAC_TYPES[number];

export const SIDEREAL_MODES = ['fagan-bradley', 'lahiri', 'raman', 'sassanian'] as const;
export type SiderealMode = typeof SIDEREAL_MODES[number];

export const DEFAULT_ZODIAC_TYPE: ZodiacType = 'tropical';

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
] as const;

export const DEFAULT_TIMEZONE = 'UTC';

export const CHART_TYPES = ['natal', 'synastry', 'composite', 'transit', 'solar-return', 'lunar-return'] as const;
export type ChartType = typeof CHART_TYPES[number];

export const USER_ROLES = ['user', 'admin', 'premium', 'pro'] as const;
export type UserRole = typeof USER_ROLES[number];

export const SUBSCRIPTION_TIERS = ['free', 'premium', 'pro'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

export const API_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = typeof API_VERSIONS[number];

export const DEFAULT_API_VERSION: ApiVersion = 'v1';
