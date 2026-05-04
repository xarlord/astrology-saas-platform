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
import RetrogradePage from '../../pages/RetrogradePage';

// Mock the hooks module
vi.mock('../../hooks', () => ({
  useCharts: vi.fn(),
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

// Mock TransitCalendar
vi.mock('../../components/TransitCalendar', () => ({
  TransitCalendar: ({ transits, showRetrogrades }: any) => (
    <div data-testid="transit-calendar">
      <span>TransitCalendar rendered</span>
      <span data-testid="show-retrogrades">{showRetrogrades ? 'true' : 'false'}</span>
      {transits?.map((t: any, i: number) => (
        <div key={i}>
          {t.planet} {t.retrograde ? 'Rx' : 'Direct'} {t.date}
        </div>
      ))}
    </div>
  ),
}));

import { useCharts, useTransitCalendar } from '../../hooks';

const mockCalendarReadings = [
  {
    date: '2026-04-15T00:00:00Z',
    transits: [
      { transitPlanet: 'Mercury', natalPlanet: 'Sun', aspect: 'conjunction', orb: 1.5 },
      { transitPlanet: 'Saturn', natalPlanet: 'Moon', aspect: 'square', orb: 2.0 },
    ],
  },
  {
    date: '2026-04-20T00:00:00Z',
    transits: [
      { transitPlanet: 'Jupiter', natalPlanet: 'Mars', aspect: 'trine', orb: 3.0 },
    ],
  },
];

describe('RetrogradePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCharts as any).mockReturnValue({
      charts: [],
      fetchCharts: vi.fn().mockResolvedValue(undefined),
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
      renderWithProviders(<RetrogradePage />);
      expect(screen.getByText('Retrograde Tracker')).toBeInTheDocument();
    });

    it('renders the page description', () => {
      renderWithProviders(<RetrogradePage />);
      expect(screen.getByText('Monitor planetary retrogrades and their influence')).toBeInTheDocument();
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

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows skeleton loader when calendar data is loading and user has charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('does not show skeleton when user has no charts and charts are done loading', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state when calendar data fetch fails', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load retrograde data'),
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Unable to load retrograde data')).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderWithProviders(<RetrogradePage />);
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

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No retrograde data available')).toBeInTheDocument();
    });

    it('shows Create Chart button when user has no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByText('Create Chart')).toBeInTheDocument();
    });

    it('shows Go to Dashboard button when user has no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('shows description about natal chart requirement', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByText(/Retrograde tracking requires a natal chart/)).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('renders TransitCalendar when data is available', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('transit-calendar')).toBeInTheDocument();
    });

    it('passes showRetrogrades=true to TransitCalendar', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(screen.getByTestId('show-retrogrades')).toHaveTextContent('true');
    });

    it('displays retrograde planet data from readings', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTransitCalendar as any).mockReturnValue({
        data: mockCalendarReadings,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      // Mercury is a retrograde planet and should be marked Rx
      expect(screen.getByText(/Mercury.*Rx.*2026-04-15/)).toBeInTheDocument();
      // Jupiter is also a retrograde planet
      expect(screen.getByText(/Jupiter.*Rx.*2026-04-20/)).toBeInTheDocument();
    });

    it('calls fetchCharts on mount', () => {
      const mockFetchCharts = vi.fn().mockResolvedValue(undefined);
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: mockFetchCharts,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(mockFetchCharts).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hook Enablement', () => {
    it('enables useTransitCalendar when user has a calculated chart', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: { planets: [] } }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      // The hook is called with month, year, enabled=true
      expect(useTransitCalendar).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        true,
      );
    });

    it('disables useTransitCalendar when user has no calculated charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: null }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<RetrogradePage />);
      expect(useTransitCalendar).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        false,
      );
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

      renderWithProviders(<RetrogradePage />);
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

      renderWithProviders(<RetrogradePage />);
      const dashboardButton = screen.getByText('Go to Dashboard');
      expect(dashboardButton).toBeInTheDocument();
    });
  });
});
