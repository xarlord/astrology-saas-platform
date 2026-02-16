/**
 * Calendar Types
 * TypeScript interfaces for calendar feature
 */

export type EventType =
  | 'retrograde'
  | 'eclipse'
  | 'moon-phase'
  | 'ingress'
  | 'transit'
  | 'lunar-return'
  | 'solar-return';

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

export type Planet =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export type MoonPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface MoonPhaseData {
  phase: MoonPhase;
  illumination: number;
  sign: string;
  degree: number;
}

export interface AstrologicalEvent {
  id: string;
  eventType: EventType;
  eventName: string;
  startDate: string;
  endDate?: string;
  intensity: number;
  affectedPlanets?: Planet[];
  aspectType?: AspectType;
  description?: string;
  advice?: string[];
  isGlobal: boolean;
  createdAt: string;
}

export interface TransitEvent extends AstrologicalEvent {
  natalPlanet: Planet;
  natalHouse: number;
  transitingPlanet: Planet;
  orb: number;
  applying: boolean;
}

export interface DailyWeather {
  date: string;
  summary: string;
  rating: number;
  color: string;
  moonPhase: MoonPhaseData;
  globalEvents: AstrologicalEvent[];
  personalTransits: TransitEvent[];
  luckyActivities: string[];
  challengingActivities: string[];
}

export interface CalendarMonth {
  month: number;
  year: number;
  events: AstrologicalEvent[];
  dailyWeather: Record<string, DailyWeather>;
}

export interface UserReminder {
  id: string;
  userId: string;
  eventType: EventType | 'all' | 'major-transits';
  reminderType: 'email' | 'push';
  reminderAdvanceHours: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFormData {
  eventType: string;
  reminderType: 'email' | 'push';
  reminderAdvanceHours: number[];
  isActive: boolean;
}

export interface CalendarExportParams {
  startDate: string;
  endDate: string;
  includePersonal?: boolean;
}
