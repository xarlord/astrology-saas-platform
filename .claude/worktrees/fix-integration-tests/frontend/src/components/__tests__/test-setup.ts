/**
 * Test Setup Configuration
 * Global test utilities, mocks, and configuration for Vitest
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock window.URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Suppress console errors in tests unless debugging
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Test data factories
export const mockChartData = {
  planets: [
    {
      planet: 'sun',
      sign: 'aries',
      degree: 15,
      minute: 30,
      second: 0,
      house: 1,
      retrograde: false,
      latitude: 0,
      longitude: 15.5,
      speed: 1,
    },
    {
      planet: 'moon',
      sign: 'taurus',
      degree: 20,
      minute: 15,
      second: 30,
      house: 2,
      retrograde: false,
      latitude: 5,
      longitude: 20.25,
      speed: 13,
    },
  ],
  houses: [
    {
      house: 1,
      sign: 'aries',
      degree: 0,
      minute: 0,
      second: 0,
    },
  ],
  aspects: [],
};

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  timezone: 'UTC',
  plan: 'free',
  preferences: {
    theme: 'auto',
    defaultHouseSystem: 'placidus',
    defaultZodiac: 'tropical',
    aspectOrbs: {
      conjunction: 10,
      opposition: 10,
      trine: 8,
      square: 8,
      sextile: 6,
    },
  },
};

export const mockCharts = [
  {
    id: 'chart-1',
    name: 'Natal Chart',
    birth_date: '1990-01-15',
    birth_time: '10:30',
    birth_place_name: 'New York, NY',
    type: 'natal',
    calculated_data: mockChartData,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockCalendarEvents = [
  {
    id: '1',
    event_type: 'new_moon',
    event_date: '2026-01-10',
    interpretation: 'New Moon in Capricorn',
    event_data: {
      phase: 'new',
      sign: 'capricorn',
      degree: 20,
    },
    user_id: null,
  },
  {
    id: '2',
    event_type: 'full_moon',
    event_date: '2026-01-25',
    interpretation: 'Full Moon in Leo',
    event_data: {
      phase: 'full',
      sign: 'leo',
      degree: 5,
    },
    user_id: null,
  },
];

export const mockDailyWeather = {
  rating: 7,
  summary: 'A favorable day for communication and intellectual pursuits.',
  moonPhase: {
    phase: 'waxing-gibbous',
    sign: 'gemini',
    illumination: 78,
  },
  globalEvents: [
    {
      id: '1',
      eventType: 'moon-phase',
      eventName: 'Waxing Gibbous Moon',
      startDate: '2026-01-15',
      intensity: 5,
      isGlobal: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  personalTransits: [],
  luckyActivities: ['Creative work', 'Learning'],
  challengingActivities: [],
};

export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});

export const createMockChart = (overrides = {}) => ({
  ...mockCharts[0],
  ...overrides,
});

export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockEvent = (type: string, date: string) => ({
  id: Math.random().toString(36),
  event_type: type,
  event_date: date,
  interpretation: `Test ${type}`,
  event_data: {},
  user_id: null,
});

// Custom render helpers
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}

// Suppress act warnings in tests
const originalAct = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalAct.call(console, ...args);
  };
});
