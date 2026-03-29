/**
 * Lunar Return Type Definitions
 * Centralized types for lunar return features
 */

export interface NatalMoon {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface MoonPosition {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface LunarAspect {
  planets: [string, string];
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
}

export interface LunarReturnChart {
  returnDate: Date;
  moonPosition: MoonPosition;
  moonPhase: string;
  housePlacement: number;
  aspects: LunarAspect[];
  theme: string;
  intensity: number;
}

export interface KeyDate {
  date: Date;
  type: 'new-moon' | 'full-moon' | 'eclipse' | 'aspect-exact';
  description: string;
  significance: string;
}

export interface MonthlyPrediction {
  category: 'relationships' | 'career' | 'finances' | 'health' | 'creativity' | 'spirituality';
  prediction: string;
  likelihood: number;
  advice: string[];
}

export interface MonthlyRitual {
  phase: 'new-moon' | 'full-moon' | 'quarter-moon';
  title: string;
  description: string;
  materials?: string[];
  steps: string[];
}

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

export interface SavedLunarReturn {
  id: string;
  returnDate: Date;
  theme: string;
  intensity: number;
  emotionalTheme: string;
  actionAdvice: string[];
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
  createdAt: Date;
}
