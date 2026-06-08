/**
 * Shared Astrology Utilities
 * Centralized zodiac sign lookup used across multiple modules.
 */

// Zodiac signs in order
export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

/**
 * Get zodiac sign from ecliptic longitude (in degrees).
 * Handles negative and out-of-range values via modular normalization.
 */
export function getZodiacSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}
