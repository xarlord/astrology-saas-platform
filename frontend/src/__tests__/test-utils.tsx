/**
 * Frontend Test Utilities
 * Helper functions and renderers for React Testing Library
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react-refresh/only-export-components */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create wrappers for common providers
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  route?: string;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function AllTheProviders({ children, queryClient, route }: AllTheProvidersProps) {
  const qc = queryClient || createQueryClient();

  // Set router route if provided
  if (route) {
    window.history.pushState({}, 'Test page', route);
  }

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, route, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AllTheProviders queryClient={queryClient} route={route}>{children}</AllTheProviders>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from RTL
export * from '@testing-library/react';
export { renderWithProviders as render };

// Mock data generators
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  subscription_tier: 'free',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockChart = {
  id: 1,
  user_id: 1,
  name: 'Test Chart',
  birth_date: '1990-01-15',
  birth_time: '14:30',
  birth_place: 'New York, NY',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  house_system: 'placidus',
  zodiac_type: 'tropical',
  time_unknown: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

export const mockAnalysis = {
  overview: {
    sun: { sign: 'Capricorn', interpretation: 'Test sun interpretation' },
    moon: { sign: 'Scorpio', interpretation: 'Test moon interpretation' },
    ascendant: { sign: 'Libra', interpretation: 'Test ascendant interpretation' },
  },
  planets_in_signs: [],
  houses: [],
  aspects: { major: [], minor: [] },
  aspect_patterns: [],
};

// Mock handlers for MSW
export const mockHandlers = {
  // Authentication
  login: vi.fn(() => ({ user: mockUser, token: 'mock-token' })),
  register: vi.fn(() => ({ user: mockUser, token: 'mock-token' })),
  logout: vi.fn(() => ({ success: true })),
  getProfile: vi.fn(() => ({ user: mockUser })),

  // Charts
  getCharts: vi.fn(() => ({ charts: [mockChart] })),
  getChart: vi.fn(() => ({ chart: mockChart, calculated: { planets: [], houses: [], aspects: [] } })),
  createChart: vi.fn(() => ({ chart: mockChart, calculated: { planets: [], houses: [], aspects: [] } })),
  updateChart: vi.fn(() => ({ chart: mockChart })),
  deleteChart: vi.fn(() => ({ success: true })),

  // Analysis
  getPersonalityAnalysis: vi.fn(() => ({ analysis: mockAnalysis })),
  getAspectPatterns: vi.fn(() => ({ patterns: [] })),
  getTransits: vi.fn(() => ({ transits: [] })),
  getTransitsCalendar: vi.fn(() => ({ calendar: {} })),
};

// Helper to wait for async operations
export const waitFor = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to mock window.location
export const mockLocation = (pathname: string) => {
  delete (window as any).location;
  (window as any).location = { pathname };
};

// Helper to create mock FormData
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value as string);
  });
  return formData;
};
