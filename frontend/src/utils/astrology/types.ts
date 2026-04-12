/**
 * Astrology Calculation Types
 * Type definitions for chart calculation utilities
 */

// ===========================================
// ZODIAC TYPES
// ===========================================

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_ELEMENTS = {
  fire: ['Aries', 'Leo', 'Sagittarius'],
  earth: ['Taurus', 'Virgo', 'Capricorn'],
  air: ['Gemini', 'Libra', 'Aquarius'],
  water: ['Cancer', 'Scorpio', 'Pisces'],
} as const;

export type Element = keyof typeof ZODIAC_ELEMENTS;

export const ZODIAC_QUALITIES = {
  cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
} as const;

export type Quality = keyof typeof ZODIAC_QUALITIES;

// ===========================================
// PLANET TYPES
// ===========================================

export const CELESTIAL_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'NorthNode',
  'SouthNode',
  'Chiron',
  'Lilith',
] as const;

export type CelestialBody = (typeof CELESTIAL_BODIES)[number];

export const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'] as const;
export const SOCIAL_PLANETS = ['Jupiter', 'Saturn'] as const;
export const OUTER_PLANETS = ['Uranus', 'Neptune', 'Pluto'] as const;

export interface PlanetData {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: ZodiacSign;
  degree: number;
  house?: number;
}

// ===========================================
// ASPECT TYPES
// ===========================================

export const MAJOR_ASPECTS = ['conjunction', 'opposition', 'trine', 'square', 'sextile'] as const;

export const MINOR_ASPECTS = [
  'quincunx',
  'semisextile',
  'semisquare',
  'sesquisquare',
  'quintile',
  'biquintile',
] as const;

export type AspectType = (typeof MAJOR_ASPECTS)[number] | (typeof MINOR_ASPECTS)[number];

export interface AspectDefinition {
  name: string;
  angle: number;
  orb: number;
  symbol: string;
  harmonious: boolean;
  major: boolean;
}

export const ASPECT_DEFINITIONS: Record<AspectType, AspectDefinition> = {
  conjunction: {
    name: 'Conjunction',
    angle: 0,
    orb: 10,
    symbol: '\u260c',
    harmonious: false,
    major: true,
  },
  opposition: {
    name: 'Opposition',
    angle: 180,
    orb: 8,
    symbol: '\u260d',
    harmonious: false,
    major: true,
  },
  trine: { name: 'Trine', angle: 120, orb: 8, symbol: '\u25b3', harmonious: true, major: true },
  square: { name: 'Square', angle: 90, orb: 8, symbol: '\u25a1', harmonious: false, major: true },
  sextile: { name: 'Sextile', angle: 60, orb: 6, symbol: '\u2606', harmonious: true, major: true },
  quincunx: {
    name: 'Quincunx',
    angle: 150,
    orb: 3,
    symbol: '\u26b9',
    harmonious: false,
    major: false,
  },
  semisextile: {
    name: 'Semi-sextile',
    angle: 30,
    orb: 2,
    symbol: '\u26b9',
    harmonious: true,
    major: false,
  },
  semisquare: {
    name: 'Semi-square',
    angle: 45,
    orb: 2,
    symbol: '\u2220',
    harmonious: false,
    major: false,
  },
  sesquisquare: {
    name: 'Sesqui-square',
    angle: 135,
    orb: 2,
    symbol: '\u22c0',
    harmonious: false,
    major: false,
  },
  quintile: { name: 'Quintile', angle: 72, orb: 1, symbol: 'Q', harmonious: true, major: false },
  biquintile: {
    name: 'Bi-quintile',
    angle: 144,
    orb: 1,
    symbol: 'bQ',
    harmonious: true,
    major: false,
  },
};

export interface AspectData {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;
  orb: number;
  applying: boolean;
  exact: boolean;
}

// ===========================================
// HOUSE TYPES
// ===========================================

export type HouseSystem = 'placidus' | 'koch' | 'whole' | 'equal' | 'porphyry';

export interface HouseData {
  number: number;
  cusp: number;
  sign: ZodiacSign;
  degree: number;
  size?: number;
}

export interface HouseCuspData {
  house: number;
  longitude: number;
  sign: ZodiacSign;
  position: string;
}

// ===========================================
// ANGLE TYPES
// ===========================================

export interface AngleData {
  name: string;
  longitude: number;
  latitude: number;
  sign: ZodiacSign;
  degree: number;
  house?: number;
}

export type ChartAngle = 'Ascendant' | 'Descendant' | 'MC' | 'IC' | 'Vertex' | 'AntiVertex';

// ===========================================
// CHART TYPES
// ===========================================

export type ChartType =
  | 'natal'
  | 'transit'
  | 'synastry'
  | 'solar-return'
  | 'lunar-return'
  | 'progressed'
  | 'composite';

export interface BirthDataInput {
  date: Date;
  time: string;
  latitude: number;
  longitude: number;
  timezone: string;
  houseSystem?: HouseSystem;
}

export interface CalculatedChart {
  planets: PlanetData[];
  houses: HouseData[];
  aspects: AspectData[];
  angles: AngleData[];
  elements: Record<Element, number>;
  qualities: Record<Quality, number>;
  ascendant: number;
  midheaven: number;
}

export interface TransitData {
  transitDate: Date;
  natalPlanets: PlanetData[];
  transitPlanets: PlanetData[];
  aspects: AspectData[];
}

export interface SynastryData {
  chart1: CalculatedChart;
  chart2: CalculatedChart;
  aspects: AspectData[];
  compatibility: CompatibilityScore;
}

export interface CompatibilityScore {
  overall: number;
  romantic: number;
  communication: number;
  emotional: number;
  intellectual: number;
  values: number;
}

export interface SolarReturnData {
  year: number;
  returnDate: Date;
  chart: CalculatedChart;
  themes: string[];
}

export interface LunarReturnData {
  returnDate: Date;
  chart: CalculatedChart;
  theme: string;
  keyAreas: string[];
}

// ===========================================
// ASPECT PATTERN TYPES
// ===========================================

export type AspectPatternType =
  | 'grand-trine'
  | 'grand-cross'
  | 't-square'
  | 'yod'
  | 'kite'
  | 'mystic-rectangle'
  | 'stellium';

export interface AspectPattern {
  type: AspectPatternType;
  planets: string[];
  aspects: AspectData[];
  description: string;
}

// ===========================================
// ORB CONFIGURATION
// ===========================================

export interface OrbConfig {
  conjunction: number;
  opposition: number;
  trine: number;
  square: number;
  sextile: number;
  quincunx: number;
  semisextile: number;
  semisquare: number;
  sesquisquare: number;
  quintile: number;
  biquintile: number;
}

export const DEFAULT_ORBS: OrbConfig = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6,
  quincunx: 3,
  semisextile: 2,
  semisquare: 2,
  sesquisquare: 2,
  quintile: 1,
  biquintile: 1,
};
