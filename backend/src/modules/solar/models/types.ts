/**
 * Solar Return Types
 * TypeScript interfaces for solar return feature
 */

export interface SolarReturnLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  region?: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

export interface SolarReturnChartData {
  planets: PlanetaryPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  mc: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  moonPhase: {
    phase: string;
    illumination: number;
  };
}

export interface SolarReturnInterpretation {
  themes: string[];
  sunHouse: {
    house: number;
    interpretation: string;
    focus: string[];
  };
  moonPhase: {
    phase: string;
    interpretation: string;
  };
  luckyDays: Array<{
    date: string;
    reason: string;
    intensity: number;
  }>;
  challenges: Array<{
    area: string;
    description: string;
    advice: string;
  }>;
  opportunities: Array<{
    area: string;
    description: string;
    timing: string;
  }>;
  advice: string[];
  keywords: string[];
}

export interface SolarReturnInput {
  userId: string;
  chartId: string;
  year: number;
  returnDate: Date;
  returnLocation: SolarReturnLocation;
  calculatedData: SolarReturnChartData;
  interpretation?: SolarReturnInterpretation;
  isRelocated?: boolean;
  notes?: string;
}

export interface SolarReturn {
  id: string;
  userId: string;
  chartId: string;
  year: number;
  returnDate: Date;
  returnLocation: SolarReturnLocation;
  calculatedData: SolarReturnChartData;
  interpretation?: SolarReturnInterpretation;
  isRelocated: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SolarReturnCalculationParams {
  natalChartId: string;
  year: number;
  location?: SolarReturnLocation;
  houseSystem?: string;
  zodiacType?: string;
}

export interface SolarReturnRecalculationParams {
  id: string;
  newLocation: SolarReturnLocation;
}
