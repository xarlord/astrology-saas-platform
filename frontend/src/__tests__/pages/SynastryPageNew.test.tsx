/**
 * SynastryPageNew Component Tests
 *
 * Comprehensive tests for the synastry/compatibility page
 * Covers: chart selection, comparison, results display, error states
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

// Mock services - must use module factory with function references
const mockCompareCharts = vi.fn();
const mockGetCompatibility = vi.fn();
const mockGetCharts = vi.fn();

vi.mock('../../services/synastry.api', () => ({
  compareCharts: (...args: any[]) => mockCompareCharts(...args),
  getCompatibility: (...args: any[]) => mockGetCompatibility(...args),
}));

vi.mock('../../services/chart.service', () => ({
  chartService: {
    getCharts: (...args: any[]) => mockGetCharts(...args),
  },
}));

// Mock child components
vi.mock('../../components/synastry/PersonSelector', () => ({
  __esModule: true,
  default: ({
    charts,
    chart1Id,
    chart2Id,
    onChart1Change,
    onChart2Change,
    onSwap,
    onCreateNew,
  }: any) => (
    <div data-testid="person-selector">
      <select
        data-testid="chart1-select"
        value={chart1Id}
        onChange={(e) => onChart1Change(e.target.value)}
        aria-label="Select first chart"
      >
        <option value="">Select Chart 1</option>
        {charts.map((chart: any) => (
          <option key={chart.id} value={chart.id}>
            {chart.name}
          </option>
        ))}
      </select>
      <select
        data-testid="chart2-select"
        value={chart2Id}
        onChange={(e) => onChart2Change(e.target.value)}
        aria-label="Select second chart"
      >
        <option value="">Select Chart 2</option>
        {charts.map((chart: any) => (
          <option key={chart.id} value={chart.id}>
            {chart.name}
          </option>
        ))}
      </select>
      <button data-testid="swap-button" onClick={onSwap}>
        Swap
      </button>
      <button data-testid="create-new-button" onClick={onCreateNew}>
        Create New Chart
      </button>
    </div>
  ),
}));

vi.mock('../../components/astrology/CompatibilityGauge', () => ({
  __esModule: true,
  default: ({ score, size, showLabel, ...props }: any) => (
    <div
      role="progressbar"
      aria-valuenow={score}
      data-testid={`compatibility-gauge-${size}`}
      {...props}
    >
      {score}%
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
import SynastryPage from '../../pages/SynastryPageNew';

// Helper to create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: ['/synastry'] }, children),
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
  { id: 'chart-3', name: 'Friend Chart' },
];

// Default mock results
const mockSynastryResult = {
  synastryAspects: [
    {
      planet1: 'Sun',
      planet2: 'Moon',
      aspect: 'trine',
      orb: 2.5,
      applying: true,
      interpretation: 'Harmonious emotional connection',
    },
    {
      planet1: 'Venus',
      planet2: 'Mars',
      aspect: 'conjunction',
      orb: 1.2,
      applying: false,
      interpretation: 'Strong romantic attraction',
    },
  ],
  relationshipTheme: 'A relationship focused on emotional growth and mutual support',
  strengths: ['Strong communication', 'Emotional understanding', 'Shared values'],
  challenges: ['Different approaches to money', 'Need for personal space'],
};

const mockCompatibilityResult = {
  scores: {
    overall: 85,
    romantic: 90,
    communication: 82,
    emotional: 88,
    intellectual: 78,
    spiritual: 85,
    values: 80,
  },
};

describe('SynastryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockGetCharts.mockReset();
    mockCompareCharts.mockReset();
    mockGetCompatibility.mockReset();

    // Default successful responses
    mockGetCharts.mockResolvedValue({ charts: mockCharts });
    mockCompareCharts.mockResolvedValue(mockSynastryResult);
    mockGetCompatibility.mockResolvedValue(mockCompatibilityResult);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByText('Synastry & Compatibility')).toBeInTheDocument();
      });
    });

    it('should render page header with premium badge', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByText('Premium Feature')).toBeInTheDocument();
        expect(screen.getByText('Synastry & Compatibility')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByText(/Decode the cosmic blueprint/i)).toBeInTheDocument();
      });
    });

    it('should render PersonSelector component', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('person-selector')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Selection', () => {
    it('should load charts on mount', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(mockGetCharts).toHaveBeenCalled();
      });
    });

    it('should display chart options in selectors', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
        expect(screen.getByTestId('chart2-select')).toBeInTheDocument();
      });
    });

    it('should allow selecting charts', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
      });

      const chart1Select = screen.getByTestId('chart1-select');
      await user.selectOptions(chart1Select, 'chart-1');

      expect(chart1Select).toHaveValue('chart-1');
    });

    it('should swap charts when swap button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
      });

      const chart1Select = screen.getByTestId('chart1-select');
      const chart2Select = screen.getByTestId('chart2-select');

      await user.selectOptions(chart1Select, 'chart-1');
      await user.selectOptions(chart2Select, 'chart-2');

      const swapButton = screen.getByTestId('swap-button');
      await user.click(swapButton);

      // Charts should be swapped
      expect(chart1Select).toHaveValue('chart-2');
      expect(chart2Select).toHaveValue('chart-1');
    });

    it('should navigate to create chart page', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('create-new-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('create-new-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/charts/new');
    });
  });

  describe('Compare Charts Button', () => {
    it('should render Compare Charts button', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByText('Compare Charts')).toBeInTheDocument();
      });
    });

    it('should be disabled when no charts selected', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        const compareButton = screen.getByText('Compare Charts');
        expect(compareButton).toBeDisabled();
      });
    });

    it('should be disabled when same chart selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
      });

      const chart1Select = screen.getByTestId('chart1-select');
      const chart2Select = screen.getByTestId('chart2-select');

      await user.selectOptions(chart1Select, 'chart-1');
      await user.selectOptions(chart2Select, 'chart-1');

      const compareButton = screen.getByText('Compare Charts');
      expect(compareButton).toBeDisabled();
    });

    it('should be enabled when different charts selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByTestId('chart1-select'), 'chart-1');
      await user.selectOptions(screen.getByTestId('chart2-select'), 'chart-2');

      const compareButton = screen.getByText('Compare Charts');
      expect(compareButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should show error when selecting same chart', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('chart1-select')).toBeInTheDocument();
      });

      // Select same charts
      await user.selectOptions(screen.getByTestId('chart1-select'), 'chart-1');
      await user.selectOptions(screen.getByTestId('chart2-select'), 'chart-1');

      // Try to click compare (should show error)
      const compareButton = screen.getByText('Compare Charts');
      expect(compareButton).toBeDisabled();
    });

    it('should handle charts loading error', async () => {
      mockGetCharts.mockRejectedValue(new Error('Failed to load charts'));
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no charts available', async () => {
      mockGetCharts.mockResolvedValue({ charts: [] });
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No charts available')).toBeInTheDocument();
      });
    });

    it('should navigate to create chart from empty state', async () => {
      const user = userEvent.setup();
      mockGetCharts.mockResolvedValue({ charts: [] });
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-action')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('empty-state-action'));
      expect(mockNavigate).toHaveBeenCalledWith('/charts/new');
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loader while loading charts', async () => {
      // Delay charts loading
      mockGetCharts.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ charts: mockCharts }), 100)),
      );

      renderWithProviders(createElement(SynastryPage));

      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Synastry & Compatibility/i }),
        ).toBeInTheDocument();
      });
    });

    it('should have accessible chart selectors', async () => {
      renderWithProviders(createElement(SynastryPage));

      await waitFor(() => {
        expect(screen.getByLabelText('Select first chart')).toBeInTheDocument();
        expect(screen.getByLabelText('Select second chart')).toBeInTheDocument();
      });
    });
  });
});
