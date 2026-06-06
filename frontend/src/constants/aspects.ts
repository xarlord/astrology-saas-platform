/**
 * Centralized aspect definitions — single source of truth for symbols, colors, and labels.
 * Use this everywhere instead of inline Records.
 */

export type AspectKey =
  | 'conjunction'
  | 'opposition'
  | 'square'
  | 'trine'
  | 'sextile'
  | 'quincunx'
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'
  | 'quintile'
  | 'biquintile'
  | 'septile'
  | 'novile';

export interface AspectInfo {
  /** Readable Unicode symbol (always renders correctly) */
  symbol: string;
  /** Full human-readable label */
  label: string;
  /** Degree angle as string */
  angle: string;
  /** Numeric degree value */
  degrees: number;
  /** Tailwind text color class */
  colorClass: string;
  /** CSS hex color for inline styles */
  colorHex: string;
  /** Harmonious | Challenging | Neutral */
  nature: 'Harmonious' | 'Challenging' | 'Neutral';
}

/**
 * Complete aspect reference table.
 * Symbols chosen for maximum cross-platform renderability.
 */
export const ASPECTS: Record<AspectKey, AspectInfo> = {
  conjunction: {
    symbol: '☌',
    label: 'Conjunction',
    angle: '0°',
    degrees: 0,
    colorClass: 'text-amber-400',
    colorHex: '#fbbf24',
    nature: 'Neutral',
  },
  opposition: {
    symbol: '☍',
    label: 'Opposition',
    angle: '180°',
    degrees: 180,
    colorClass: 'text-red-500',
    colorHex: '#ef4444',
    nature: 'Challenging',
  },
  square: {
    symbol: '□',
    label: 'Square',
    angle: '90°',
    degrees: 90,
    colorClass: 'text-orange-500',
    colorHex: '#f97316',
    nature: 'Challenging',
  },
  trine: {
    symbol: '△',
    label: 'Trine',
    angle: '120°',
    degrees: 120,
    colorClass: 'text-green-500',
    colorHex: '#22c55e',
    nature: 'Harmonious',
  },
  sextile: {
    symbol: '✶',
    label: 'Sextile',
    angle: '60°',
    degrees: 60,
    colorClass: 'text-blue-400',
    colorHex: '#60a5fa',
    nature: 'Harmonious',
  },
  quincunx: {
    symbol: '⚻',
    label: 'Quincunx',
    angle: '150°',
    degrees: 150,
    colorClass: 'text-purple-500',
    colorHex: '#a855f7',
    nature: 'Neutral',
  },
  semisextile: {
    symbol: '⚺',
    label: 'Semisextile',
    angle: '30°',
    degrees: 30,
    colorClass: 'text-blue-300',
    colorHex: '#93c5fd',
    nature: 'Harmonious',
  },
  semisquare: {
    symbol: '∠',
    label: 'Semisquare',
    angle: '45°',
    degrees: 45,
    colorClass: 'text-orange-400',
    colorHex: '#fb923c',
    nature: 'Challenging',
  },
  sesquisquare: {
    symbol: '⊾',
    label: 'Sesquisquare',
    angle: '135°',
    degrees: 135,
    colorClass: 'text-orange-400',
    colorHex: '#fb923c',
    nature: 'Challenging',
  },
  quintile: {
    symbol: 'Q',
    label: 'Quintile',
    angle: '72°',
    degrees: 72,
    colorClass: 'text-cyan-400',
    colorHex: '#22d3ee',
    nature: 'Harmonious',
  },
  biquintile: {
    symbol: 'bQ',
    label: 'Biquintile',
    angle: '144°',
    degrees: 144,
    colorClass: 'text-cyan-400',
    colorHex: '#22d3ee',
    nature: 'Harmonious',
  },
  septile: {
    symbol: '7',
    label: 'Septile',
    angle: '51.43°',
    degrees: 51.43,
    colorClass: 'text-indigo-400',
    colorHex: '#818cf8',
    nature: 'Neutral',
  },
  novile: {
    symbol: '9',
    label: 'Novile',
    angle: '40°',
    degrees: 40,
    colorClass: 'text-teal-400',
    colorHex: '#2dd4bf',
    nature: 'Harmonious',
  },
};

/** Lookup helper — returns symbol string for any aspect key, with fallback to capitalized key */
export function getAspectSymbol(key: string): string {
  return (ASPECTS as Record<string, AspectInfo>)[key]?.symbol ?? key;
}

/** Lookup helper — returns full label for any aspect key */
export function getAspectLabel(key: string): string {
  return (ASPECTS as Record<string, AspectInfo>)[key]?.label ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** Lookup helper — returns hex color for any aspect key */
export function getAspectColorHex(key: string): string {
  return (ASPECTS as Record<string, AspectInfo>)[key]?.colorHex ?? '#94a3b8';
}

/** Lookup helper — returns Tailwind color class for any aspect key */
export function getAspectColorClass(key: string): string {
  return (ASPECTS as Record<string, AspectInfo>)[key]?.colorClass ?? 'text-slate-400';
}

/** Lookup helper — returns nature for any aspect key */
export function getAspectNature(key: string): 'Harmonious' | 'Challenging' | 'Neutral' {
  return (ASPECTS as Record<string, AspectInfo>)[key]?.nature ?? 'Neutral';
}

/** All aspect keys in order */
export const ASPECT_KEYS: AspectKey[] = [
  'conjunction', 'opposition', 'square', 'trine', 'sextile',
  'quincunx', 'semisextile', 'semisquare', 'sesquisquare',
  'quintile', 'biquintile', 'septile', 'novile',
];
