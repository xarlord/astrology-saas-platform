/**
 * Zodiac Signs Constants
 */

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
  'pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

export const ZODIAC_SYMBOLS: Record<ZodiacSign, string> = {
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
  pisces: '♓'
};

export const ZODIAC_NAMES: Record<ZodiacSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces'
};

export const ELEMENTS = {
  fire: ['aries', 'leo', 'sagittarius'] as ZodiacSign[],
  earth: ['taurus', 'virgo', 'capricorn'] as ZodiacSign[],
  air: ['gemini', 'libra', 'aquarius'] as ZodiacSign[],
  water: ['cancer', 'scorpio', 'pisces'] as ZodiacSign[]
} as const;

export const MODALITIES = {
  cardinal: ['aries', 'cancer', 'libra', 'capricorn'] as ZodiacSign[],
  fixed: ['taurus', 'leo', 'scorpio', 'aquarius'] as ZodiacSign[],
  mutable: ['gemini', 'virgo', 'sagittarius', 'pisces'] as ZodiacSign[]
} as const;

export const ZODIAC_RULERS: Record<ZodiacSign, string> = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'pluto',
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'uranus',
  pisces: 'neptune'
};
