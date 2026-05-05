/**
 * LunarReturnsPage Component Tests
 *
 * Comprehensive tests for the lunar returns page
 * Covers: page rendering, navigation between views, view mode tabs
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

// Mock clsx
vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div>{children}</div>
  ),
  LunarReturnDashboard: ({ onChartClick, onForecastClick, onHistoryClick }: Record<string, unknown>) => (
    <div data-testid="lunar-return-dashboard">
      <h2>Lunar Return Dashboard</h2>
      <button type="button" onClick={onChartClick as () => void}>View Chart</button>
      <button type="button" onClick={onForecastClick as () => void}>View Forecast</button>
      <button type="button" onClick={onHistoryClick as () => void}>View History</button>
    </div>
  ),
  LunarChartView: ({ onBack }: Record<string, unknown>) => (
    <div data-testid="lunar-chart-view">
      <h2>Lunar Chart View</h2>
      <button type="button" onClick={onBack as () => void}>Back</button>
    </div>
  ),
  LunarForecastView: ({ onBack }: Record<string, unknown>) => (
    <div data-testid="lunar-forecast-view">
      <h2>Lunar Forecast View</h2>
      <button type="button" onClick={onBack as () => void}>Back</button>
    </div>
  ),
  LunarHistoryView: ({ onSelect, onBack }: Record<string, unknown>) => (
    <div data-testid="lunar-history-view">
      <h2>Lunar History View</h2>
      <button type="button" onClick={onBack as () => void}>Back</button>
      <button type="button" onClick={onSelect as () => void}>Select Return</button>
    </div>
  ),
}));

// Mock hooks
vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    charts: [],
    isLoading: false,
    error: null,
    loadCharts: vi.fn(),
  }),
}));

// Mock lunar return API service
vi.mock('../../services/lunarReturn.api', () => ({
  getNextLunarReturn: vi.fn().mockResolvedValue({}),
  getLunarReturnHistory: vi.fn().mockResolvedValue({ returns: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
  getLunarMonthForecast: vi.fn().mockResolvedValue({}),
}));

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, variant, onClick, className, ...props }: Record<string, unknown>) => (
    <button
      type="button"
      onClick={onClick as React.MouseEventHandler}
      className={`btn btn-${variant} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  ),
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
    it('should render without crashing', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Lunar Returns')).toBeInTheDocument();
    });

    it('should render the page header with correct title', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Lunar Returns')).toBeInTheDocument();
    });

    it('should render the page subtitle', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Your monthly emotional cycles and forecasts')).toBeInTheDocument();
    });

    it('should render LunarReturnDashboard by default', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('lunar-return-dashboard')).toBeInTheDocument();
    });

    it('should not show Back to Dashboard button in dashboard view', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.queryByText('Back to Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Section', () => {
    it('should render View Chart button in dashboard', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('View Chart')).toBeInTheDocument();
    });

    it('should render View Forecast button in dashboard', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('View Forecast')).toBeInTheDocument();
    });

    it('should render View History button in dashboard', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('View History')).toBeInTheDocument();
    });
  });

  describe('View Mode Navigation', () => {
    it('should switch to chart view when View Chart is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Chart'));

      await waitFor(() => {
        expect(screen.getByTestId('lunar-chart-view')).toBeInTheDocument();
      });
    });

    it('should switch to forecast view when View Forecast is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Forecast'));

      await waitFor(() => {
        expect(screen.getByTestId('lunar-forecast-view')).toBeInTheDocument();
      });
    });

    it('should switch to history view when View History is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View History'));

      await waitFor(() => {
        expect(screen.getByTestId('lunar-history-view')).toBeInTheDocument();
      });
    });

    it('should show Back to Dashboard button when not in dashboard view', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Chart'));

      await waitFor(() => {
        expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument();
      });
    });

    it('should show view mode tabs when not in dashboard', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Forecast'));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Forecast' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument();
      });
    });

    it('should return to dashboard when Back to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Chart'));
      await waitFor(() => {
        expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Back to Dashboard/));

      await waitFor(() => {
        expect(screen.getByTestId('lunar-return-dashboard')).toBeInTheDocument();
        expect(screen.queryByText(/Back to Dashboard/)).not.toBeInTheDocument();
      });
    });

    it('should switch views using tab buttons', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      // Go to forecast view first
      await user.click(screen.getByText('View Forecast'));
      await waitFor(() => {
        expect(screen.getByTestId('lunar-forecast-view')).toBeInTheDocument();
      });

      // Switch to history tab
      await user.click(screen.getByRole('tab', { name: 'History' }));
      await waitFor(() => {
        expect(screen.getByTestId('lunar-history-view')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Lunar Returns');
    });

    it('should have tablist with proper aria when in non-dashboard view', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      await user.click(screen.getByText('View Forecast'));

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByRole('tab', { name: 'Forecast' })).toHaveAttribute('aria-selected', 'true');
      });
    });
  });
});
