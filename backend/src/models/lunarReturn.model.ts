/**
 * Lunar Return Model Interfaces
 * TypeScript interfaces for lunar return feature
 */

export interface NatalChart {
  id: string;
  userId: string;
  moon: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  // Add other planets as needed
}

export interface LunarReturnChart {
  returnDate: Date;
  moonPosition: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  moonPhase: MoonPhase;
  housePlacement: number;
  aspects: LunarAspect[];
  theme: string;
  intensity: number;
}

export interface LunarAspect {
  planets: [string, string];
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
}

export type MoonPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface LunarMonthForecast {
  userId: string;
  returnDate: Date;
  theme: string;
  intensity: number;
  emotionalTheme: string;
  actionAdvice: string[];
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
}

export interface KeyDate {
  date: Date;
  type: 'new-moon' | 'full-moon' | 'eclipse' | 'aspect-exact';
  description: string;
  significance: string;
}

export interface MonthlyPrediction {
  category:
    | 'relationships'
    | 'career'
    | 'finances'
    | 'health'
    | 'creativity'
    | 'spirituality';
  prediction: string;
  likelihood: number; // 1-10
  advice: string[];
}

export interface MonthlyRitual {
  phase: 'new-moon' | 'full-moon' | 'quarter-moon';
  title: string;
  description: string;
  materials?: string[];
  steps: string[];
}

export interface UserLunarReturn {
  id: string;
  userId: string;
  returnDate: Date;
  chartData: LunarReturnChart;
  themeSummary: string;
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
  createdAt: Date;
}

export interface CurrentLunarReturn {
  returnDate: Date;
  daysUntil: number;
  intensity: number;
  theme: string;
}

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';
