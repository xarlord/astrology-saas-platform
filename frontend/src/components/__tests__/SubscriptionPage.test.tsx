/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import SubscriptionPage from '../../pages/SubscriptionPage';

// Mock the store so AppLayout's useAuth doesn't crash
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
  useChartsStore: vi.fn(),
}));

// Mock useCharts hook specifically
const mockFetchCharts = vi.fn();
vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    useCharts: vi.fn(),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useCharts } from '../../hooks';

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCharts as any).mockReturnValue({
      charts: [],
      fetchCharts: mockFetchCharts,
    });
    mockFetchCharts.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('Subscription')).toBeInTheDocument();
      expect(screen.getByText('Manage your plan and usage')).toBeInTheDocument();
    });

    it('calls fetchCharts on mount', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(mockFetchCharts).toHaveBeenCalledTimes(1);
    });

    it('shows Current Usage section', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('Current Usage')).toBeInTheDocument();
    });

    it('shows Choose Your Plan section with all three tiers', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      // Tier names appear in both pricing cards and feature table, use getAllByText
      expect(screen.getAllByText('Free').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Pro').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Premium').length).toBeGreaterThanOrEqual(1);
    });

    it('shows pricing for each tier', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$12')).toBeInTheDocument();
      expect(screen.getByText('$29')).toBeInTheDocument();
    });

    it('shows feature comparison table', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('Feature Comparison')).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
      expect(screen.getByText('Natal Charts')).toBeInTheDocument();
      expect(screen.getByText('Transit Tracking')).toBeInTheDocument();
      expect(screen.getByText('AI Interpretations')).toBeInTheDocument();
    });

    it('shows Most Popular badge on Pro tier', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    it('shows Current Plan badge on free tier', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getAllByText('Current Plan').length).toBeGreaterThanOrEqual(1);
    });

    it('shows tier features in pricing cards', () => {
      renderWithProviders(<SubscriptionPage />);

      // Free tier features
      expect(screen.getByText('Up to 3 natal charts')).toBeInTheDocument();
      expect(screen.getByText('Basic transit tracking')).toBeInTheDocument();
      // Pro tier features
      expect(screen.getByText('Up to 25 charts')).toBeInTheDocument();
      expect(screen.getByText('Synastry & compatibility')).toBeInTheDocument();
      // Premium tier features
      expect(screen.getByText('Up to 1,000 charts')).toBeInTheDocument();
      expect(screen.getByText('API access')).toBeInTheDocument();
    });

    it('shows period labels for each tier', () => {
      renderWithProviders(<SubscriptionPage />);

      expect(screen.getAllByText('forever').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('/month').length).toBeGreaterThanOrEqual(1);
    });

    it('navigates to settings on upgrade click', () => {
      renderWithProviders(<SubscriptionPage />);

      const upgradeButtons = screen.getAllByText('Upgrade');
      if (upgradeButtons.length > 0) {
        upgradeButtons[0].click();
        expect(mockNavigate).toHaveBeenCalledWith('/settings');
      }
    });

    it('shows chart count from fetched charts', () => {
      (useCharts as any).mockReturnValue({
        charts: [
          { id: 1, name: 'Chart 1' },
          { id: 2, name: 'Chart 2' },
        ],
        fetchCharts: mockFetchCharts,
      });

      renderWithProviders(<SubscriptionPage />);

      // UsageMeter shows "2 / 3 charts" for free tier with 2 charts
      expect(screen.getByText('2 / 3 charts')).toBeInTheDocument();
    });
  });
});
