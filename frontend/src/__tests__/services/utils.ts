/**
 * Service Test Utilities
 * Shared mocks and helpers for service tests
 */

import { vi } from 'vitest';

// Create a mock API object that can be reused across tests
export const createMockApi = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
});

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  timezone: 'America/New_York',
  plan: 'free' as const,
  preferences: {
    theme: 'dark' as const,
    notifications: {
      email: true,
      push: false,
      transitAlerts: true,
      lunarPhases: true,
    },
    defaultHouseSystem: 'placidus',
    defaultZodiac: 'tropical',
    language: 'en',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

// Mock chart data
export const mockChart = {
  id: 'chart-123',
  user_id: 'user-123',
  name: 'Test Natal Chart',
  type: 'natal' as const,
  birth_data: {
    name: 'John Doe',
    birth_date: '1990-01-15',
    birth_time: '14:30',
    birth_time_unknown: false,
    birth_place_name: 'New York, NY',
    birth_latitude: 40.7128,
    birth_longitude: -74.006,
    birth_timezone: 'America/New_York',
    house_system: 'placidus' as const,
    zodiac: 'tropical' as const,
  },
  calculated_data: {
    planets: [
      {
        planet: 'Sun',
        name: 'Sun',
        longitude: 295.5,
        latitude: 0,
        speed: 1.0,
        house: 4,
        sign: 'Capricorn',
        degree: 25,
        minute: 30,
        position: "25deg30' Capricorn",
        retrograde: false,
      },
    ],
    houses: [],
    aspects: [],
    points: [],
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

// Mock location data
export const mockLocation = {
  name: 'New York, United States',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
};

// Mock calendar event
export const mockCalendarEvent = {
  id: 'event-123',
  user_id: 'user-123',
  title: 'Full Moon in Cancer',
  description: 'Emotional intensity peaks',
  start_date: '2024-01-25T12:00:00Z',
  event_type: 'full_moon' as const,
  priority: 'high' as const,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock transit data
export const mockTransit = {
  id: 'transit-123',
  planet: 'Saturn',
  type: 'major' as const,
  start_date: '2024-01-01',
  end_date: '2024-03-01',
  peak_date: '2024-02-01',
  aspect: 'conjunction',
  influence: {
    overall: 'A time of restructuring',
    career: 'Focus on long-term goals',
    relationships: 'Commitments tested',
  },
  intensity: 8,
};

// Mock synastry data
export const mockSynastryChart = {
  id: 'synastry-123',
  chart1Id: 'chart-1',
  chart2Id: 'chart-2',
  synastryAspects: [
    {
      planet1: 'Sun',
      planet2: 'Moon',
      aspect: 'conjunction' as const,
      orb: 2.5,
      applying: true,
      interpretation: 'Strong emotional connection',
      weight: 0.9,
      soulmateIndicator: true,
    },
  ],
  overallCompatibility: 85,
  relationshipTheme: 'Karmic Connection',
  strengths: ['Deep emotional bond', 'Shared values'],
  challenges: ['Need for independence'],
  advice: 'Communicate openly',
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get store() {
      return store;
    },
  };
};

// Setup global localStorage mock
export const setupLocalStorageMock = () => {
  const localStorageMock = mockLocalStorage();
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
  return localStorageMock;
};

// Helper to create mock responses
export const createMockResponse = <T>(data: T) => ({
  data: { data },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Helper to create mock error
export const createMockError = (message: string, status = 500) => {
  const error = new Error(message);
  (error as any).response = {
    status,
    data: { message },
  };
  return error;
};

// Mock fetch for location service tests
export const mockFetch = (data: unknown, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};
