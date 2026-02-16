/**
 * Aspects Constants
 */

export const ASPECT_TYPES = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
  'semi-sextile'
] as const;

export type AspectType = typeof ASPECT_TYPES[number];

export const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '∘',
  'semi-sextile': '⚺'
};

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
  'semi-sextile': 30
};

export const DEFAULT_ORBS: Record<AspectType, number> = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6,
  quincunx: 3,
  'semi-sextile': 3
};

export const MAJOR_ASPECTS: AspectType[] = ['conjunction', 'opposition', 'trine', 'square'];
export const MINOR_ASPECTS: AspectType[] = ['sextile', 'quincunx', 'semi-sextile'];

export const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#FF0000',  // Red
  opposition: '#FF0000',   // Red
  trine: '#00FF00',        // Green
  square: '#FF6600',       // Orange
  sextile: '#00BFFF',      // DeepSkyBlue
  quincunx: '#9932CC',     // DarkOrchid
  'semi-sextile': '#9370DB' // MediumPurple
};

export const ASPECT_QUALITIES: Record<AspectType, 'harmonious' | 'challenging' | 'neutral'> = {
  conjunction: 'neutral',
  opposition: 'challenging',
  trine: 'harmonious',
  square: 'challenging',
  sextile: 'harmonious',
  quincunx: 'challenging',
  'semi-sextile': 'neutral'
};
