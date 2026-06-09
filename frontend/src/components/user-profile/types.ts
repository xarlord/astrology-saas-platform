// Types based on findings.md
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  createdAt: Date;
  subscription: {
    plan: 'free' | 'premium' | 'professional';
    status: 'active' | 'canceled' | 'expired';
    renewalDate?: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    defaultHouseSystem: HouseSystem;
    defaultZodiac: 'tropical' | 'sidereal';
    aspectOrbs: {
      conjunction: number;
      opposition: number;
      trine: number;
      square: number;
      sextile: number;
    };
  };
}

export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';

export interface Chart {
  id: string;
  userId: string;
  name: string;
  type: 'natal' | 'synastry' | 'composite' | 'transit';
  birthData: {
    date: Date;
    time: string;
    place: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    timeUnknown: boolean;
  };
  settings: {
    houseSystem: HouseSystem;
    zodiac: 'tropical' | 'sidereal';
    sideralMode?: string;
  };
  calculatedData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileProps {
  onEditChart?: (chartId: string) => void;
  onViewChart?: (chartId: string) => void;
  onDeleteChart?: (chartId: string) => void;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  avatar?: string;
  createdAt?: Date;
  timezone?: string;
  plan?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    defaultHouseSystem?: HouseSystem;
    defaultZodiac?: 'tropical' | 'sidereal';
    aspectOrbs?: {
      conjunction: number;
      opposition: number;
      trine: number;
      square: number;
      sextile: number;
    };
  };
}
