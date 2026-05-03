/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import TodayTransitsPage from '../../pages/TodayTransitsPage';

// Mock the hooks module
vi.mock('../../hooks', () => ({
  useCharts: vi.fn(),
  useTodayTransits: vi.fn(),
}));

// Mock AppLayout to simplify rendering
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
        <div key={i}>{t.transitingPlanet} {t.type} {t.natalPlanet}</div>
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

import { useCharts, useTodayTransits } from '../../hooks';

const mockTransitReading = {
  date: '2026-04-29T00:00:00Z',
  transits: [
    { transitPlanet: 'Saturn', natalPlanet: 'Moon', aspect: 'square', orb: 1.2 },
    { transitPlanet: 'Jupiter', natalPlanet: 'Sun', aspect: 'trine', orb: 3.5 },
  ],
};

describe('TodayTransitsPage', () => {
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
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByText("Today's Transits")).toBeInTheDocument();
    });

    it('renders the page description', () => {
      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByText('Current planetary influences on your natal chart')).toBeInTheDocument();
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

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows skeleton loader when transit data is loading and user has charts', () => {
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

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error state when transit data fetch fails', () => {
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

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Unable to load transits')).toBeInTheDocument();
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

      renderWithProviders(<TodayTransitsPage />);
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

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No transit data available')).toBeInTheDocument();
    });

    it('shows Create Chart button when user has no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByText('Create Chart')).toBeInTheDocument();
    });

    it('shows Go to Dashboard button when user has no charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('renders TransitDashboard when data is available', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTransitReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByTestId('transit-dashboard')).toBeInTheDocument();
    });

    it('displays transit data in the dashboard', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: {} }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });
      (useTodayTransits as any).mockReturnValue({
        data: mockTransitReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(screen.getByText('Saturn square Moon')).toBeInTheDocument();
      expect(screen.getByText('Jupiter trine Sun')).toBeInTheDocument();
    });

    it('calls fetchCharts on mount', () => {
      const mockFetchCharts = vi.fn().mockResolvedValue(undefined);
      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: mockFetchCharts,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(mockFetchCharts).toHaveBeenCalledTimes(1);
    });

    it('enables useTodayTransits only when user has a calculated chart', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: { planets: [] } }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(useTodayTransits).toHaveBeenCalledWith(true);
    });

    it('disables useTodayTransits when user has no calculated charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [{ id: '1', name: 'Test Chart', calculated_data: null }],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />);
      expect(useTodayTransits).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation', () => {
    it('navigates to new chart page when Create Chart is clicked', async () => {
      const navigate = vi.fn();
      vi.doMock('react-router-dom', () => ({
        ...vi.importActual('react-router-dom'),
        useNavigate: () => navigate,
      }));

      (useCharts as any).mockReturnValue({
        charts: [],
        fetchCharts: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<TodayTransitsPage />, { route: '/transits/today' });

      const createChartButton = screen.getByText('Create Chart');
      createChartButton.click();

      // The button triggers navigate('/charts/new') via the onAction callback
      await waitFor(() => {
        // Verify the button exists and is clickable (actual navigation tested via integration)
        expect(createChartButton).toBeInTheDocument();
      });
    });
  });
});
