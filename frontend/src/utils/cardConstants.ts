/**
 * Card Constants
 * Shared constants used across card components
 */

/** Zodiac unicode symbols keyed by lowercase sign name */
export const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

/** Get the zodiac symbol for a sign name */
export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign.toLowerCase()] ?? '?';
}

/** Planet display colors */
export const PLANET_COLORS: Record<string, string> = {
  sun: '#FFD700',
  moon: '#C0C0C0',
  venus: '#FF69B4',
  mars: '#EF4444',
  jupiter: '#FFA500',
  saturn: '#696969',
};

/** Element display colors */
export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#EF4444',
  earth: '#10B981',
  air: '#3B82F6',
  water: '#6366F1',
};

/** Get the element color for a zodiac sign */
export function getElementColor(sign: string): string {
  const fireSigns = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];

  const lower = sign.toLowerCase();
  if (fireSigns.includes(lower)) return ELEMENT_COLORS.fire;
  if (earthSigns.includes(lower)) return ELEMENT_COLORS.earth;
  if (airSigns.includes(lower)) return ELEMENT_COLORS.air;
  if (waterSigns.includes(lower)) return ELEMENT_COLORS.water;
  return '#ffffff';
}

/** Chart position data used by social card components */
export interface CardChartPosition {
  name: string;
  sign: string;
  degree: number;
  retrograde?: boolean;
}

/** Chart data shape expected by social card components */
export interface CardChartData {
  name: string;
  positions: CardChartPosition[];
  birthData?: {
    birthDate: string;
    birthPlace: string;
  };
  element?: string;
}
