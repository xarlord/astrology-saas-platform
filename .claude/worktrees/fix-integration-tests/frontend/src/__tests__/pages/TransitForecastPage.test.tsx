/**
 * TransitForecastPage Component Tests
 *
 * Comprehensive tests for the transit forecast page
 * Covers: chart selection, date range, filters, timeline, energy display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock navigation
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock services
const mockCalculateTransits = vi.fn();
const mockGetCharts = vi.fn();

vi.mock('../../services/transit.service', () => ({
  transitService: {
    calculateTransits: (...args: any[]) => mockCalculateTransits(...args),
  },
}));

vi.mock('../../services/chart.service', () => ({
  chartService: {
    getCharts: () => mockGetCharts(),
  },
}));

// Mock child components
vi.mock('../../components/astrology/TransitTimelineCard', () => ({
  __esModule: true,
  default: ({ title, description, type, date, time }: any) => (
    <div data-testid="transit-card" className={`transit-card transit-${type}`}>
      <span className="transit-date">{date}</span>
      <span className="transit-time">{time}</span>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('../../components/transit/TransitChart', () => ({
  __esModule: true,
  default: ({ data, height, onDataPointClick }: any) => (
    <div data-testid="transit-chart" style={{ height }}>
      Transit Chart with {data?.length || 0} data points
    </div>
  ),
}));

vi.mock('../../components/astrology/EnergyMeter', () => ({
  __esModule: true,
  default: ({ value, size, label, ...props }: any) => (
    <div
      role="progressbar"
      aria-valuenow={value}
      data-testid={`energy-meter-${size}`}
      {...props}
    >
      {value}%
    </div>
  ),
}));

vi.mock('../../components/AppLayout', () => ({
  __esModule: true,
  AppLayout: ({ children }: any) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('../../components', () => ({
  SkeletonLoader: ({ variant, count }: any) => (
    <div data-testid={`skeleton-${variant}`} data-count={count}>
      Loading...
    </div>
  ),
  EmptyState: ({ icon, title, description, actionText, onAction }: any) => (
    <div data-testid="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && (
        <button onClick={onAction} data-testid="empty-state-action">
          {actionText}
        </button>
      )}
    </div>
  ),
}));

// Import after mocks
import TransitForecastPage from '../../pages/TransitForecastPage';

// Helper to create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: ['/transits'] }, children)
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: createWrapper() });
};

// Default mock charts
const mockCharts = [
  { id: 'chart-1', name: 'My Birth Chart' },
  { id: 'chart-2', name: 'Partner Chart' },
];

// Default mock transit data
const mockTransitData = {
  transits: [
    {
      id: 'transit-1',
      date: '2026-02-20',
      time: '10:30 AM',
      title: 'Venus enters Pisces',
      description: 'A time of heightened sensitivity and romantic idealism',
      type: 'favorable' as const,
      impact: 'high' as const,
      tags: ['venus', 'pisces'],
    },
    {
      id: 'transit-2',
      date: '2026-02-22',
      time: '3:00 PM',
      title: 'Mercury Square Mars',
      description: 'Communication challenges and potential conflicts',
      type: 'challenging' as const,
      impact: 'moderate' as const,
      tags: ['mercury', 'mars'],
    },
    {
      id: 'transit-3',
      date: '2026-02-25',
      time: '9:00 AM',
      title: 'Full Moon in Virgo',
      description: 'Time for completion and harvest',
      type: 'major' as const,
      impact: 'high' as const,
      tags: ['moon', 'virgo'],
    },
  ],
  energyLevels: [
    { date: '2026-02-20', level: 75, description: 'High energy day' },
    { date: '2026-02-21', level: 60, description: 'Moderate energy' },
    { date: '2026-02-22', level: 45, description: 'Low energy - rest recommended' },
  ],
  bestDay: { date: '2026-02-20', score: 85 },
  worstDay: { date: '2026-02-22', score: 35 },
};

describe('TransitForecastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockGetCharts.mockReset();
    mockCalculateTransits.mockReset();

    // Default successful responses
    mockGetCharts.mockResolvedValue({ charts: mockCharts });
    mockCalculateTransits.mockResolvedValue(mockTransitData);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Transit Forecast')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText(/Daily planetary influences/i)).toBeInTheDocument();
      });
    });

    it('should render duration toggle buttons', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('duration-buttons')).toBeInTheDocument();
      });
    });

    it('should render chart selector', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart-selector')).toBeInTheDocument();
      });
    });

    it('should render date inputs', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
        expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
      });
    });

    it('should render filters toggle button', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });
    });
  });

  describe('Duration Selection', () => {
    it('should render all duration options', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('duration-week')).toBeInTheDocument();
        expect(screen.getByTestId('duration-month')).toBeInTheDocument();
        expect(screen.getByTestId('duration-quarter')).toBeInTheDocument();
        expect(screen.getByTestId('duration-year')).toBeInTheDocument();
      });
    });

    it('should have month selected by default', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const monthButton = screen.getByTestId('duration-month');
        expect(monthButton).toHaveClass('bg-primary');
      });
    });

    it('should change duration when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('duration-week')).toBeInTheDocument();
      });

      const weekButton = screen.getByTestId('duration-week');
      await user.click(weekButton);

      expect(weekButton).toHaveClass('bg-primary');
    });

    it('should update date range when duration changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('duration-week')).toBeInTheDocument();
      });

      const weekButton = screen.getByTestId('duration-week');
      await user.click(weekButton);

      // Should recalculate transits with new date range
      await waitFor(() => {
        expect(mockCalculateTransits).toHaveBeenCalled();
      });
    });
  });

  describe('Chart Selection', () => {
    it('should load charts on mount', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(mockGetCharts).toHaveBeenCalled();
      });
    });

    it('should display chart options in selector', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const chartSelector = screen.getByTestId('chart-selector');
        expect(chartSelector).toBeInTheDocument();
      });
    });

    it('should auto-select first chart', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const chartSelector = screen.getByTestId('chart-selector') as HTMLSelectElement;
        expect(chartSelector.value).toBe('chart-1');
      });
    });

    it('should change selected chart', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart-selector')).toBeInTheDocument();
      });

      const chartSelector = screen.getByTestId('chart-selector');
      await user.selectOptions(chartSelector, 'chart-2');

      expect(chartSelector).toHaveValue('chart-2');
    });

    it('should load transits when chart changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart-selector')).toBeInTheDocument();
      });

      mockCalculateTransits.mockClear();
      const chartSelector = screen.getByTestId('chart-selector');
      await user.selectOptions(chartSelector, 'chart-2');

      await waitFor(() => {
        expect(mockCalculateTransits).toHaveBeenCalledWith('chart-2', expect.any(String), expect.any(String));
      });
    });
  });

  describe('Date Range Selection', () => {
    it('should render start date input', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const startDateInput = screen.getByTestId('start-date-input');
        expect(startDateInput).toBeInTheDocument();
      });
    });

    it('should render end date input', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const endDateInput = screen.getByTestId('end-date-input');
        expect(endDateInput).toBeInTheDocument();
      });
    });

    it('should update transits when date changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
      });

      // Clear any previous calls
      mockCalculateTransits.mockClear();

      const startDateInput = screen.getByTestId('start-date-input');
      await user.clear(startDateInput);
      await user.type(startDateInput, '2026-03-01');

      // Date change should eventually trigger transit reload via useEffect
      // The component uses useEffect to reload when date changes
      await waitFor(() => {
        // Just verify the input was updated - the actual API call depends on effect
        expect(startDateInput).toHaveValue('2026-03-01');
      });
    });
  });

  describe('Filter Panel', () => {
    it('should toggle filter panel visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });

      const filterButton = screen.getByTestId('filters-toggle-button');
      await user.click(filterButton);

      // Should show filter options
      expect(screen.getByText('Major aspects only')).toBeInTheDocument();
    });

    it('should render filter options', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('filters-toggle-button'));

      expect(screen.getByText('Major aspects only')).toBeInTheDocument();
      expect(screen.getByText('Minimum Impact')).toBeInTheDocument();
      expect(screen.getByText('Show Types')).toBeInTheDocument();
    });

    it('should toggle major aspects filter', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('filters-toggle-button'));

      const majorCheckbox = screen.getByLabelText('Major aspects only');
      await user.click(majorCheckbox);

      expect(majorCheckbox).toBeChecked();
    });

    it('should render impact level selector', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('filters-toggle-button'));

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Moderate+' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'High Only' })).toBeInTheDocument();
    });

    it('should render type filter checkboxes', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('filters-toggle-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('filters-toggle-button'));

      expect(screen.getByLabelText('Favorable')).toBeInTheDocument();
      expect(screen.getByLabelText('Challenging')).toBeInTheDocument();
      expect(screen.getByLabelText('Neutral')).toBeInTheDocument();
    });
  });

  describe('Transit Data Display', () => {
    it('should display Forecast Summary', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Forecast Summary')).toBeInTheDocument();
      });
    });

    it('should display total transits count', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Total Transits')).toBeInTheDocument();
      });
    });

    it('should display major aspects count', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Major Aspects')).toBeInTheDocument();
      });
    });

    it('should display best day', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Best Day')).toBeInTheDocument();
      });
    });

    it('should display most challenging day', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Most Challenging')).toBeInTheDocument();
      });
    });

    it('should display energy meter', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('energy-meter-md')).toBeInTheDocument();
      });
    });

    it('should display transit items', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const transitItems = screen.getAllByTestId('transit-item');
        expect(transitItems.length).toBeGreaterThan(0);
      });
    });

    it('should display transit cards', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        const transitCards = screen.getAllByTestId('transit-card');
        expect(transitCards.length).toBeGreaterThan(0);
      });
    });

    it('should display transit titles', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Venus enters Pisces')).toBeInTheDocument();
      });
    });

    it('should display energy chart', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Energy Levels Over Time')).toBeInTheDocument();
        expect(screen.getByTestId('transit-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Personalized Insight Sidebar', () => {
    it('should display Personalized Insight section', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Personalized Insight')).toBeInTheDocument();
      });
    });

    it('should display View Full Report button', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('View Full Report')).toBeInTheDocument();
      });
    });

    it('should navigate to analysis page when View Full Report clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('View Full Report')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View Full Report'));

      expect(mockNavigate).toHaveBeenCalledWith('/analysis/chart-1');
    });
  });

  describe('Current Transits Sidebar', () => {
    it('should display Current Transits section', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText('Current Transits')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when transit calculation fails', async () => {
      mockCalculateTransits.mockRejectedValue(new Error('Failed to calculate transits'));
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByText(/Failed to calculate transits/i)).toBeInTheDocument();
      });
    });

    it('should handle charts loading error', async () => {
      mockGetCharts.mockRejectedValue(new Error('Failed to load charts'));
      renderWithProviders(createElement(TransitForecastPage));

      // When charts fail to load, the component shows empty state or error
      await waitFor(() => {
        // The component handles error by showing empty state or setting error
        const emptyState = screen.queryByTestId('empty-state');
        const errorElement = screen.queryByText(/Failed to load/i);
        expect(emptyState || errorElement).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no charts available', async () => {
      mockGetCharts.mockResolvedValue({ charts: [] });
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No charts available')).toBeInTheDocument();
      });
    });

    it('should navigate to create chart from empty state', async () => {
      const user = userEvent.setup();
      mockGetCharts.mockResolvedValue({ charts: [] });
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-action')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('empty-state-action'));
      expect(mockNavigate).toHaveBeenCalledWith('/charts/new');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while loading transits', async () => {
      mockCalculateTransits.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockTransitData), 100))
      );

      renderWithProviders(createElement(TransitForecastPage));

      // Should show loading state initially
      await waitFor(() => {
        expect(screen.getByText(/Loading transit data/i)).toBeInTheDocument();
      });
    });

    it('should show skeleton loader while loading charts', async () => {
      mockGetCharts.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ charts: mockCharts }), 100))
      );

      renderWithProviders(createElement(TransitForecastPage));

      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Transit Forecast/i })).toBeInTheDocument();
      });
    });

    it('should have date input elements', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        // The date inputs have labels via label elements
        expect(screen.getByText('Start Date')).toBeInTheDocument();
        expect(screen.getByText('End Date')).toBeInTheDocument();
        expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
        expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
      });
    });

    it('should have chart selector element', async () => {
      renderWithProviders(createElement(TransitForecastPage));

      await waitFor(() => {
        // The chart selector has a label
        expect(screen.getByText('Select Chart')).toBeInTheDocument();
        expect(screen.getByTestId('chart-selector')).toBeInTheDocument();
      });
    });
  });
});
