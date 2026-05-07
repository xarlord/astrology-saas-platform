/**
 * LunarReturnsPage Component Tests
 *
 * Tests for the lunar returns page shell and view routing
 * Covers: page rendering, navigation between views, dashboard integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => createElement('div', props, children),
    header: ({ children, ...props }: Record<string, unknown>) =>
      createElement('header', props, children),
    span: ({ children, ...props }: Record<string, unknown>) =>
      createElement('span', props, children),
    circle: ({ children, ...props }: Record<string, unknown>) =>
      createElement('circle', props, children),
  },
}));

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
    section: ({ children, ...props }: any) => createElement('section', props, children),
    circle: ({ children, ...props }: any) => createElement('circle', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock clsx
vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Mock hooks
vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    charts: [
      {
        id: 'chart-1',
        name: 'My Birth Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1990-01-15',
          birth_time: '14:30',
          birth_place_name: 'New York, NY',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Leo' },
            { name: 'Moon', sign: 'Taurus' },
          ],
        },
      },
    ],
    isLoading: false,
    error: null,
    loadCharts: vi.fn(),
  }),
}));

// Mock lunar return API service
vi.mock('../../services/lunarReturn.api', () => ({
  getNextLunarReturn: vi.fn().mockResolvedValue({
    nextReturn: new Date(),
    natalMoon: {
      sign: 'Pisces',
      degree: 15,
      minute: 32,
      second: 0,
    },
  }),
  getCurrentLunarReturn: vi.fn().mockResolvedValue({
    returnDate: new Date('2026-06-01'),
    daysUntil: 27,
  }),
  calculateLunarReturnChart: vi.fn().mockResolvedValue({
    returnDate: new Date('2026-06-01'),
    moonPosition: {
      sign: 'pisces',
      degree: 15,
      minute: 32,
      second: 0,
    },
    moonPhase: 'full',
    housePlacement: 4,
    aspects: [],
    theme: 'Emotional Renewal',
    intensity: 72,
  }),
  getLunarReturnHistory: vi.fn().mockResolvedValue({
    returns: [
      {
        id: 'lr-1',
        returnDate: new Date('2026-01-15'),
        theme: 'Emotional Renewal',
        intensity: 72,
        emotionalTheme: 'Intuitive Growth',
        actionAdvice: ['Meditate daily', 'Journal your dreams'],
        keyDates: [],
        predictions: [],
        rituals: [],
        journalPrompts: [],
        createdAt: new Date('2026-01-01'),
      },
      {
        id: 'lr-2',
        returnDate: new Date('2025-12-15'),
        theme: 'Creative Surge',
        intensity: 65,
        emotionalTheme: 'Artistic Inspiration',
        actionAdvice: ['Start a creative project'],
        keyDates: [],
        predictions: [],
        rituals: [],
        journalPrompts: [],
        createdAt: new Date('2025-12-01'),
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  }),
  getLunarMonthForecast: vi.fn().mockResolvedValue({
    userId: 'user-1',
    returnDate: new Date(),
    theme: 'Emotional Renewal & Intuition',
    intensity: 72,
    emotionalTheme: 'Emotional Renewal',
    actionAdvice: ['Focus on self-care', 'Practice meditation'],
    keyDates: [],
    predictions: [
      {
        category: 'relationships',
        prediction: 'Good time for connections',
        likelihood: 80,
        advice: [],
      },
      {
        category: 'career',
        prediction: 'Creative opportunities arise',
        likelihood: 60,
        advice: [],
      },
    ],
    rituals: [],
    journalPrompts: [],
  }),
}));

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, variant, onClick, className, ...props }: Record<string, unknown>) => (
    <button
      onClick={onClick as React.MouseEventHandler}
      className={`btn btn-${variant} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div {...props}>{children}</div>
  ),
  LunarReturnDashboard: ({ onChartClick, onForecastClick, onHistoryClick }: any) => (
    <div data-testid="lunar-return-dashboard">
      <span>Lunar Return Dashboard</span>
      <button data-testid="mock-forecast-btn" onClick={onForecastClick}>
        View Monthly Forecast
      </button>
      <button data-testid="mock-chart-btn" onClick={() => onChartClick?.({ aspects: [] })}>
        View Return Chart
      </button>
      <button data-testid="mock-history-btn" onClick={onHistoryClick}>
        View History
      </button>
    </div>
  ),
  LunarChartView: ({ chart, onBack }: any) => (
    <div data-testid="lunar-chart-view">
      <span>Lunar Chart View</span>
      <button data-testid="mock-back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  ),
  LunarForecastView: ({ returnDate, onBack }: any) => (
    <div data-testid="lunar-forecast-view">
      <span>Lunar Forecast View</span>
      <button data-testid="mock-back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  ),
  LunarHistoryView: ({ onSelect, onBack }: any) => (
    <div data-testid="lunar-history-view">
      <span>Lunar History View</span>
      <button data-testid="mock-back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  ),
  SkeletonLoader: ({ variant }: any) => <div data-testid="skeleton-loader">Loading {variant}...</div>,
  SkeletonGrid: ({ children }: any) => <div>{children}</div>,
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
  EmptyStates: ({ children }: any) => <div>{children}</div>,
}));

// Import after mocks
import LunarReturnsPage from '../../pages/LunarReturnsPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/lunar-returns') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/lunar-returns') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('LunarReturnsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Lunar Returns')).toBeInTheDocument();
    });

    it('should render the page header with correct title', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByRole('heading', { name: /Lunar Returns/i })).toBeInTheDocument();
    });

    it('should render page content inside AppLayout', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      // The page wraps content in AppLayout which is mocked as a simple div
      expect(screen.getByText('Lunar Returns')).toBeInTheDocument();
    });

    it('should render the page subtitle', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Your monthly emotional cycles and forecasts/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard View', () => {
    it('should render LunarReturnDashboard by default', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('lunar-return-dashboard')).toBeInTheDocument();
    });

    it('should not render tabs in dashboard mode', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      // Tabs are hidden in dashboard view mode
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('should not render Back to Dashboard button in dashboard mode', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.queryByText(/Back to Dashboard/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation Between Views', () => {
    it('should switch to forecast view when forecast is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Click the forecast button from the dashboard mock
      await user.click(screen.getByTestId('mock-forecast-btn'));

      // Should now show forecast view and tabs
      expect(screen.getByTestId('lunar-forecast-view')).toBeInTheDocument();
      expect(screen.queryByTestId('lunar-return-dashboard')).not.toBeInTheDocument();
    });

    it('should switch to chart view when chart is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Click the chart button from the dashboard mock
      await user.click(screen.getByTestId('mock-chart-btn'));

      // Should now show chart view
      expect(screen.getByTestId('lunar-chart-view')).toBeInTheDocument();
      expect(screen.queryByTestId('lunar-return-dashboard')).not.toBeInTheDocument();
    });

    it('should switch to history view when history is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Click the history button from the dashboard mock
      await user.click(screen.getByTestId('mock-history-btn'));

      // Should now show history view
      expect(screen.getByTestId('lunar-history-view')).toBeInTheDocument();
      expect(screen.queryByTestId('lunar-return-dashboard')).not.toBeInTheDocument();
    });

    it('should show tabs when not in dashboard mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view
      await user.click(screen.getByTestId('mock-forecast-btn'));

      // Tabs should now be visible
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should show Back to Dashboard button when not in dashboard mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view
      await user.click(screen.getByTestId('mock-forecast-btn'));

      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });

    it('should return to dashboard when Back to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view
      await user.click(screen.getByTestId('mock-forecast-btn'));
      expect(screen.getByTestId('lunar-forecast-view')).toBeInTheDocument();

      // Click Back to Dashboard from the mock sub-component
      await user.click(screen.getByTestId('mock-back-btn'));

      // Should be back in dashboard
      expect(screen.getByTestId('lunar-return-dashboard')).toBeInTheDocument();
      expect(screen.queryByText(/Back to Dashboard/i)).not.toBeInTheDocument();
    });

    it('should navigate between tabs', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view first to show tabs
      await user.click(screen.getByTestId('mock-forecast-btn'));
      expect(screen.getByTestId('lunar-forecast-view')).toBeInTheDocument();

      // Click Dashboard tab
      const dashboardTab = screen.getByRole('tab', { name: 'Dashboard' });
      await user.click(dashboardTab);
      expect(screen.getByTestId('lunar-return-dashboard')).toBeInTheDocument();
    });
  });

  describe('View Mode Tabs', () => {
    it('should render Dashboard, Forecast, and History tabs', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate away from dashboard to show tabs
      await user.click(screen.getByTestId('mock-forecast-btn'));

      expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Forecast' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument();
    });

    it('should highlight the active tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view
      await user.click(screen.getByTestId('mock-forecast-btn'));

      const forecastTab = screen.getByRole('tab', { name: 'Forecast' });
      expect(forecastTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to history view via tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate to forecast view first
      await user.click(screen.getByTestId('mock-forecast-btn'));

      // Click History tab
      const historyTab = screen.getByRole('tab', { name: 'History' });
      await user.click(historyTab);

      expect(screen.getByTestId('lunar-history-view')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByRole('heading', { name: /Lunar Returns/i })).toBeInTheDocument();
    });

    it('should have tablist with correct aria-label', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate away from dashboard to show tabs
      await user.click(screen.getByTestId('mock-forecast-btn'));

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Lunar return view mode');
    });

    it('should have proper tab panel with aria attributes', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate away from dashboard to show tabpanel
      await user.click(screen.getByTestId('mock-forecast-btn'));

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('id', 'lunar-tabpanel');
    });

    it('should have correct tab IDs', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Navigate away from dashboard to show tabs
      await user.click(screen.getByTestId('mock-forecast-btn'));

      const dashboardTab = screen.getByRole('tab', { name: 'Dashboard' });
      expect(dashboardTab).toHaveAttribute('id', 'lunar-tab-dashboard');

      const forecastTab = screen.getByRole('tab', { name: 'Forecast' });
      expect(forecastTab).toHaveAttribute('id', 'lunar-tab-forecast');

      const historyTab = screen.getByRole('tab', { name: 'History' });
      expect(historyTab).toHaveAttribute('id', 'lunar-tab-history');
    });
  });
});
