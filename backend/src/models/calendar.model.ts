/**
 * Calendar Model Interfaces
 * TypeScript interfaces for calendar-related database tables
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

export type RetrogradePeriod = {
  planet: Planet;
  startDate: Date;
  endDate: Date;
  shadowStartDate?: Date;
  shadowEndDate?: Date;
};

export type Eclipse = {
  id: string;
  eclipseType: 'solar' | 'lunar';
  startDate: Date;
  endDate: Date;
  magnitude: number;
  visibility: string[];
  zodiacSign: string;
  degree: number;
};

export type MoonPhaseEvent = {
  date: Date;
  phase: MoonPhase;
  sign: string;
  degree: number;
  illumination: number;
};

export interface AstrologicalEvent {
  id: string;
  eventType: EventType;
  eventName: string;
  startDate: Date;
  endDate?: Date;
  intensity: number; // 1-10
  affectedPlanets?: Planet[];
  aspectType?: AspectType;
  description?: string;
  advice?: string[];
  isGlobal: boolean;
  createdAt: Date;
}

export interface TransitEvent extends AstrologicalEvent {
  natalPlanet: Planet;
  natalHouse: number;
  transitingPlanet: Planet;
  aspectType: AspectType;
  orb: number;
  applying: boolean;
}

export interface DailyWeather {
  date: string;
  summary: string;
  rating: number; // 1-10
  color: string; // hex color based on rating
  moonPhase: {
    phase: MoonPhase;
    illumination: number;
    sign: string;
    degree: number;
  };
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarView {
  id: string;
  userId: string;
  viewDate: Date;
  viewedEvents: string[];
  createdAt: Date;
}

export interface NotificationPayload {
  to: string; // user email or push token
  subject?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  eventId?: string;
  eventType?: string;
}
