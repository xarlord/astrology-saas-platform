/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import EphemerisPage from '../../pages/EphemerisPage';

// Mock the store so AppLayout's useAuth doesn't crash
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
  useChartsStore: vi.fn(() => ({
    charts: [],
    currentChart: null,
    pagination: null,
    fetchCharts: vi.fn(),
    fetchChart: vi.fn(),
    createChart: vi.fn(),
    updateChart: vi.fn(),
    deleteChart: vi.fn(),
    calculateChart: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

// Mock useTodayTransits hook specifically
const mockRefetch = vi.fn();
vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    useTodayTransits: vi.fn(),
  };
});

import { useTodayTransits } from '../../hooks';

describe('EphemerisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTodayTransits as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<EphemerisPage />);

      // "Ephemeris" appears in both sidebar nav and page heading
      const ephemerisElements = screen.getAllByText('Ephemeris');
      expect(ephemerisElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Current planetary positions and active transits')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      // Page heading still visible during loading
      expect(screen.getByRole('heading', { name: 'Ephemeris', level: 1 })).toBeInTheDocument();
    });

    it('shows error state when data fetch fails', () => {
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText('Unable to load transit data')).toBeInTheDocument();
      // getErrorMessage returns the fallback when error lacks response.data.error.message
      expect(screen.getByText("Failed to fetch today's transits")).toBeInTheDocument();
    });

    it('shows empty state when no data is available', () => {
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText('No transit data available')).toBeInTheDocument();
      expect(screen.getByText('Create a natal chart first to see how current planetary positions affect your birth chart.')).toBeInTheDocument();
    });

    it('shows no-transits empty state when data has empty transits array', () => {
      (useTodayTransits as any).mockReturnValue({
        data: { date: '2026-04-29', transits: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText('No major transits today')).toBeInTheDocument();
    });

    it('shows transit data grouped by planet', () => {
      (useTodayTransits as any).mockReturnValue({
        data: {
          date: '2026-04-29',
          transits: [
            { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'square', orb: 1.5 },
            { transitPlanet: 'Jupiter', natalPlanet: 'Moon', aspect: 'trine', orb: 0.8 },
            { transitPlanet: 'Saturn', natalPlanet: 'Venus', aspect: 'conjunction', orb: 2.1 },
          ],
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      // Saturn group header
      expect(screen.getByText('Saturn')).toBeInTheDocument();
      // Jupiter group header
      expect(screen.getByText('Jupiter')).toBeInTheDocument();
      // Saturn has 2 transits
      expect(screen.getByText('2 active transits')).toBeInTheDocument();
      // Jupiter has 1 transit
      expect(screen.getByText('1 active transit')).toBeInTheDocument();
    });

    it('shows planet symbols and aspect labels', () => {
      (useTodayTransits as any).mockReturnValue({
        data: {
          date: '2026-04-29',
          transits: [
            { transitPlanet: 'Mars', natalPlanet: 'Mercury', aspect: 'opposition', orb: 3.2 },
          ],
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText('Opposition')).toBeInTheDocument();
      expect(screen.getByText(/Mercury/)).toBeInTheDocument();
      expect(screen.getByText(/Orb: 3.2/)).toBeInTheDocument();
    });

    it('shows last updated timestamp when data has a date', () => {
      (useTodayTransits as any).mockReturnValue({
        data: { date: '2026-04-29T12:00:00Z', transits: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('shows refresh button when data is available', () => {
      (useTodayTransits as any).mockReturnValue({
        data: { date: '2026-04-29', transits: [] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByLabelText('Refresh transit data')).toBeInTheDocument();
    });

    it('does not show refresh button when no data', () => {
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.queryByLabelText('Refresh transit data')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('shows retry button in error state', () => {
      (useTodayTransits as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Server error'),
        refetch: mockRefetch,
      });

      renderWithProviders(<EphemerisPage />);

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});
