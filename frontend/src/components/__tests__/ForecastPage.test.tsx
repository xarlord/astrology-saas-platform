/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import ForecastPage from '../../pages/ForecastPage';

// Mock the hooks module
vi.mock('../../hooks', () => ({
  useCharts: vi.fn(),
  useTodayTransits: vi.fn(),
  useTransitForecast: vi.fn(),
  useTransitCalendar: vi.fn(),
}));

// Mock AppLayout
vi.mock('../../components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock SkeletonLoader
vi.mock('../../components/SkeletonLoader', () => ({
  SkeletonLoader: ({ count }: { count: number }) => (
    <div data-testid="skeleton-loader">Loading {count} items...</div>
  ),
}));

// Mock EmptyState
vi.mock('../../components/EmptyState', () => ({
  EmptyState: ({ title, description, actionText, onAction, secondaryActionText, onSecondaryAction }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      {description && <p>{description}</p>}
      {actionText && <button onClick={onAction}>{actionText}</button>}
      {secondaryActionText && <button onClick={onSecondaryAction}>{secondaryActionText}</button>}
    </div>
  ),
}));

// Mock TransitDashboard
vi.mock('../../components/TransitDashboard', () => ({
  TransitDashboard: ({ data }: any) => (
    <div data-testid="transit-dashboard">
      <span>TransitDashboard rendered</span>
      {data?.today?.map((t: any, i: number) => (
        <div key={`today-${i}`}>Today: {t.transitingPlanet} {t.type} {t.natalPlanet}</div>
      ))}
      {data?.week?.map((t: any, i: number) => (
        <div key={`week-${i}`}>Week: {t.transitingPlanet} {t.type} {t.natalPlanet}</div>
      ))}
    </div>
  ),
  TransitDetailModal: ({ transit, onClose }: any) => (
    <div data-testid="transit-detail-modal">
      <span>Detail: {transit?.transitingPlanet}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

import { useCharts, useTodayTransits, useTransitForecast, useTransitCalendar } from '../../hooks';

const mockTodayReading = {
  date: '2026-04-29T00:00:00Z',
  transits: [
    { transitPlanet: 'Saturn', natalPlanet: 'Moon', aspect: 'square', orb: 1.2 },
  ],
};

const mockMonthReadings = [
  {
    date: '2026-04-29T00:00:00Z',
    transits: [
      { transitPlanet: 'Jupiter', natalPlanet: 'Sun', aspect: 'trine', orb: 2.0 },
    ],
  },
  {
    date: '2026-05-05T00:00:00Z',
    transits: [
      { transitPlanet: 'Mars', natalPlanet: 'Venus', aspect: 'conjunction', orb: 0.5 },
    ],
  },
];

const mockCalendarReadings = [
  {
    date: '2026-04-29T00:00:00Z',
    transits: [
      { transitPlanet: 'Saturn', natalPlanet: 'Moon', aspect: 'square', orb: 1.2 },
    ],
  },
];

describe('ForecastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCharts as any).mockReturnValue({
      charts: [],
      fetchCharts: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
      error: null,
    });
    (useTodayTransits as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    (useTransitForecast as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    (useTransitCalendar as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Transit Forecast')).toBeInTheDocument();
    });

    it('renders the page description', () => {
      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Planetary influences affecting your chart in the coming weeks')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton loader when charts are loading', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows skeleton loader when today transits are loading', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows skeleton loader when forecast data is loading', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTodayReading,
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows skeleton loader when calendar data is loading', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTodayReading,
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: mockMonthReadings,
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state when today transits fetch fails', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Today transits network error'),
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Unable to load forecast')).toBeInTheDocument();
    });

    it('shows error state when forecast fetch fails', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Forecast network error'),
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Unable to load forecast')).toBeInTheDocument();
    });

    it('shows error state when calendar fetch fails', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Calendar network error'),
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Unable to load forecast')).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('No Charts State', () => {
    it('shows empty state when user has no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No transit data available')).toBeInTheDocument();
    });

    it('shows Create Chart and Go to Dashboard buttons when no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Create Chart')).toBeInTheDocument();
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('shows no-charts empty state with description about forecasts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByText(/Transit forecasts require a natal chart/)).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('renders TransitDashboard when all data is available', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTodayReading,
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: mockMonthReadings,
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByTestId('transit-dashboard')).toBeInTheDocument();
    });

    it('displays today transit data in the dashboard', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTodayReading,
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: mockMonthReadings,
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Today: Saturn square Moon')).toBeInTheDocument();
    });

    it('displays forecast transit data in the dashboard', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTodayReading,
        isLoading: false,
        error: null,
      });
      (useTransitForecast as any).mockReturnValue({
        data: mockMonthReadings,
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(screen.getByText('Week: Jupiter trine Sun')).toBeInTheDocument();
      expect(screen.getByText('Week: Mars conjunction Venus')).toBeInTheDocument();
    });

    it('calls fetchCharts on mount', () => {
      const mockFetchCharts = vi.fn().mockResolvedValue(undefined);
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: mockFetchCharts,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(mockFetchCharts).toHaveBeenCalledTimes(1);
    });

    it('passes correct duration to useTransitForecast', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(useTransitForecast).toHaveBeenCalledWith('month', true);
    });
  });

  describe('Hook Enablement', () => {
    it('enables hooks only when user has a calculated chart', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: { planets: [] } }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(useTodayTransits).toHaveBeenCalledWith(true);
      expect(useTransitForecast).toHaveBeenCalledWith('month', true);
    });

    it('disables hooks when user has no calculated charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: null }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      expect(useTodayTransits).toHaveBeenCalledWith(false);
      expect(useTransitForecast).toHaveBeenCalledWith('month', false);
    });
  });

  describe('Navigation', () => {
    it('shows Create Chart button for navigation when no charts exist', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      const createChartButton = screen.getByText('Create Chart');
      expect(createChartButton).toBeInTheDocument();
    });

    it('shows Go to Dashboard button for navigation when no charts exist', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ForecastPage />);
      const dashboardButton = screen.getByText('Go to Dashboard');
      expect(dashboardButton).toBeInTheDocument();
    });
  });
});
