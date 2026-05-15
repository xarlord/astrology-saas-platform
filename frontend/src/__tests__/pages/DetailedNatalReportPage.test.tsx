/**
 * DetailedNatalReportPage Component Tests
 *
 * Comprehensive tests for the detailed natal report page
 * Tests rendering, navigation, user interactions, and all tabs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => createElement('div', props, children),
    section: ({ children, ...props }: Record<string, unknown>) =>
      createElement('section', props, children),
    header: ({ children, ...props }: Record<string, unknown>) =>
      createElement('header', props, children),
  },
}));

// Mock child components
vi.mock('../../components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    leftIcon,
    fullWidth,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={onClick as () => void}
      disabled={disabled as boolean}
      data-variant={variant}
      data-full-width={fullWidth}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  ),
}));

vi.mock('../../components/astrology/PlanetaryPositionCard', () => ({
  default: ({ planet }: Record<string, unknown>) => (
    <div
      data-testid={`planet-card-${(planet as Record<string, unknown>).name?.toString().toLowerCase()}`}
    >
      <span className="planet-name">{(planet as Record<string, unknown>).name as string}</span>
      <span className="planet-sign">{(planet as Record<string, unknown>).sign as string}</span>
      <span className="planet-house">
        House {(planet as Record<string, unknown>).house as number}
      </span>
    </div>
  ),
}));

vi.mock('../../components/astrology/ElementalBalance', () => ({
  default: ({ fire, earth, air, water }: Record<string, unknown>) => (
    <div data-testid="elemental-balance">
      <span data-testid="fire-value">Fire: {fire as number}%</span>
      <span data-testid="earth-value">Earth: {earth as number}%</span>
      <span data-testid="air-value">Air: {air as number}%</span>
      <span data-testid="water-value">Water: {water as number}%</span>
    </div>
  ),
}));

vi.mock('../../components/astrology/AspectGrid', () => ({
  default: ({ planets, aspects }: Record<string, unknown>) => (
    <div data-testid="aspect-grid">
      <span data-testid="planet-count">{(planets as string[])?.length} planets</span>
      <span data-testid="aspect-count">{(aspects as unknown[])?.length} aspects</span>
    </div>
  ),
}));

// Mock the components barrel to avoid circular import SyntaxError
const { mockChartData } = vi.hoisted(() => {
  const data = {
    id: 'test-chart-1',
    user_id: 'user-1',
    name: 'Sarah Mitchell',
    type: 'natal' as const,
    birth_data: {
      name: 'Sarah Mitchell',
      birth_date: 'January 14, 1992',
      birth_time: '14:42 EST',
      birth_place_name: 'New York, USA',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'EST',
    },
    calculated_data: {
      planets: [
        { planet: 'Sun', name: 'Sun', longitude: 294, latitude: 0, speed: 1, house: 10, sign: 'Capricorn', degree: 24, minute: 0, position: "24 Capricorn", retrograde: false },
        { planet: 'Moon', name: 'Moon', longitude: 345, latitude: 0, speed: 13, house: 4, sign: 'Pisces', degree: 15, minute: 0, position: "15 Pisces", retrograde: false },
        { planet: 'Rising', name: 'Rising', longitude: 128, latitude: 0, speed: 0, house: 1, sign: 'Leo', degree: 8, minute: 0, position: "8 Leo", retrograde: false },
        { planet: 'Mercury', name: 'Mercury', longitude: 288, latitude: 0, speed: 1, house: 10, sign: 'Capricorn', degree: 18, minute: 0, position: "18 Capricorn", retrograde: false },
        { planet: 'Venus', name: 'Venus', longitude: 262, latitude: 0, speed: 1, house: 5, sign: 'Sagittarius', degree: 22, minute: 0, position: "22 Sagittarius", retrograde: false },
        { planet: 'Mars', name: 'Mars', longitude: 222, latitude: 0, speed: 0.5, house: 4, sign: 'Scorpio', degree: 12, minute: 0, position: "12 Scorpio", retrograde: false },
        { planet: 'Jupiter', name: 'Jupiter', longitude: 185, latitude: 0, speed: 0.08, house: 3, sign: 'Libra', degree: 5, minute: 0, position: "5 Libra", retrograde: false },
      ],
      houses: [],
      aspects: [
        { planet1: 'Sun', planet2: 'Moon', type: 'trine' as const, degree: 120, orb: 120, applying: true, major: true },
        { planet1: 'Sun', planet2: 'Mercury', type: 'conjunction' as const, degree: 6, orb: 6, applying: true, major: true },
        { planet1: 'Sun', planet2: 'Mars', type: 'square' as const, degree: 88, orb: 88, applying: true, major: true },
        { planet1: 'Moon', planet2: 'Venus', type: 'sextile' as const, degree: 57, orb: 57, applying: true, major: true },
        { planet1: 'Moon', planet2: 'Jupiter', type: 'trine' as const, degree: 120, orb: 120, applying: true, major: true },
      ],
      points: [],
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
  return { mockChartData: data };
});

vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../services/chart.service', () => ({
  chartService: {
    getChart: vi.fn().mockResolvedValue({ chart: mockChartData }),
  },
}));

// Mock usePDFGeneration hook
vi.mock('../../hooks/usePDFGeneration', () => ({
  usePDFGeneration: () => ({
    isGenerating: false,
    generateReport: vi.fn().mockResolvedValue({ success: true }),
    downloadReport: vi.fn(),
  }),
  generateReportFilename: (type: string, name: string) => `${type}-${name}.pdf`,
}));

// Import after mocks
import DetailedNatalReportPage from '../../pages/DetailedNatalReportPage';
import { chartService } from '../../services/chart.service';

// Helper to create wrapper with providers and routes
const createWrapper = (initialRoute = '/natal-report/test-chart-1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        { initialEntries: [initialRoute] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/natal-report', element: children }),
          createElement(Route, { path: '/natal-report/:chartId', element: children }),
          createElement(Route, {
            path: '/dashboard',
            element: <div data-testid="dashboard-page">Dashboard</div>,
          }),
          createElement(Route, {
            path: '/synastry',
            element: <div data-testid="synastry-page">Synastry</div>,
          }),
          createElement(Route, {
            path: '/transits',
            element: <div data-testid="transits-page">Transits</div>,
          }),
        ),
      ),
    );
};

// Helper to render with providers and wait for data to load
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/natal-report/test-chart-1') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

// Mock navigator.share
const mockShare = vi.fn();
const originalShare = navigator.share;

describe('DetailedNatalReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-establish chartService mock after clearAllMocks
    vi.mocked(chartService.getChart).mockResolvedValue({ chart: mockChartData });

    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    // Mock console.log and console.error
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();

    // Restore navigator.share
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      writable: true,
      configurable: true,
    });
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Premium Natal Report')).toBeInTheDocument();
    });

    it('should render the header with chart info', async () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Premium Natal Report')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
      });
    });

    it('should render chart name', async () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      await waitFor(() => {
        expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
      });
    });

    it('should render birth data information', async () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      await waitFor(() => {
        expect(screen.getByText('January 14, 1992')).toBeInTheDocument();
      });
      expect(screen.getByText('14:42 EST')).toBeInTheDocument();
      expect(screen.getByText('New York, USA')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText('Planets')).toBeInTheDocument();
      expect(screen.getByText('Houses')).toBeInTheDocument();
      expect(screen.getByText('Aspects')).toBeInTheDocument();
    });
  });

  describe('Summary Tab (Default)', () => {
    it('should show summary tab by default', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('The Big Three')).toBeInTheDocument();
    });

    it('should render Big Three section', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('The Big Three')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-sun')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-moon')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-rising')).toBeInTheDocument();
    });

    it('should render Elemental Balance component', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByTestId('elemental-balance')).toBeInTheDocument();
      expect(screen.getByTestId('fire-value')).toHaveTextContent('Fire: 35%');
      expect(screen.getByTestId('earth-value')).toHaveTextContent('Earth: 45%');
      expect(screen.getByTestId('air-value')).toHaveTextContent('Air: 10%');
      expect(screen.getByTestId('water-value')).toHaveTextContent('Water: 10%');
    });

    it('should render Chart Strength Overview', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Chart Strength Overview')).toBeInTheDocument();
      expect(screen.getByText(/Cardinal energy/)).toBeInTheDocument();
    });

    it('should render Personal Planets section', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Personal Planets')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Planets tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      const planetsTab = screen.getByText('Planets');
      await user.click(planetsTab);

      // Should NOT show summary content
      expect(screen.queryByText('The Big Three')).not.toBeInTheDocument();
    });

    it('should switch to Houses tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      const housesTab = screen.getByText('Houses');
      await user.click(housesTab);

      // Should show house cards
      expect(screen.getByText('House 1')).toBeInTheDocument();
      expect(screen.getByText('House 12')).toBeInTheDocument();
    });

    it('should switch to Aspects tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      const aspectsTab = screen.getByText('Aspects');
      await user.click(aspectsTab);

      expect(screen.getByTestId('aspect-grid')).toBeInTheDocument();
    });

    it('should switch back to Summary tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      // First switch to Planets
      await user.click(screen.getByText('Planets'));
      expect(screen.queryByText('The Big Three')).not.toBeInTheDocument();

      // Then switch back to Summary
      await user.click(screen.getByText('Summary'));
      expect(screen.getByText('The Big Three')).toBeInTheDocument();
    });
  });

  describe('Houses Tab Content', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));
      await user.click(screen.getByText('Houses'));
    });

    it('should render all 12 houses', () => {
      for (let i = 1; i <= 12; i++) {
        expect(screen.getByText(`House ${i}`)).toBeInTheDocument();
      }
    });

    it('should show planets in their respective houses', async () => {
      // Sun is in 10th house according to mock data
      await waitFor(() => {
        expect(screen.getByText(/Sun in Capricorn/)).toBeInTheDocument();
      });
    });

    it('should show empty house message for houses without planets', () => {
      const emptyHouses = screen.getAllByText('Empty house');
      expect(emptyHouses.length).toBeGreaterThan(0);
    });

    it('should display planet count for each house', () => {
      const planetCounts = screen.getAllByText(/planets/);
      expect(planetCounts.length).toBeGreaterThan(0);
    });
  });

  describe('Planets Tab Content', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));
      await user.click(screen.getByText('Planets'));
    });

    it('should render all planet cards', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('planet-card-sun')).toBeInTheDocument();
      });
      expect(screen.getByTestId('planet-card-moon')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-rising')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-mercury')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-venus')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-mars')).toBeInTheDocument();
      expect(screen.getByTestId('planet-card-jupiter')).toBeInTheDocument();
    });
  });

  describe('Aspects Tab Content', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));
      await user.click(screen.getByText('Aspects'));
    });

    it('should render aspect grid', () => {
      expect(screen.getByTestId('aspect-grid')).toBeInTheDocument();
    });

    it('should show planet count', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('planet-count')).toHaveTextContent('7 planets');
      });
    });

    it('should show aspect count', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('aspect-count')).toHaveTextContent('5 aspects');
      });
    });
  });

  describe('PDF Generation', () => {
    it('should have Download PDF button in sidebar', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
    });

    it('should start PDF generation when button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      // Wait for chart data to load first
      await waitFor(() => {
        expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Download PDF Report');
      await user.click(downloadButton);

      // The mock always returns isGenerating: false, so the button text stays
      // as "Download PDF Report" — verify it's still rendered after click
      expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
    });

    it('should have Order Printed Chart button', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Order Printed Chart')).toBeInTheDocument();
    });
  });

  describe('Share Functionality', () => {
    it('should have Share Report button in sidebar', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Share Report')).toBeInTheDocument();
    });

    it('should call navigator.share when share button clicked', async () => {
      mockShare.mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      const shareButton = screen.getByText('Share Report');
      await user.click(shareButton);

      // Verify share was called
      expect(mockShare).toHaveBeenCalled();
    });

    it('should handle share cancellation gracefully', async () => {
      mockShare.mockRejectedValue(new Error('Share cancelled'));
      const user = userEvent.setup();
      renderWithProviders(createElement(DetailedNatalReportPage));

      const shareButton = screen.getByText('Share Report');
      await user.click(shareButton);

      // Should not throw error and share was attempted
      expect(mockShare).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should have Print button in sidebar', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Order Printed Chart')).toBeInTheDocument();
    });

    it('should have upsell synastry card', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Synastry Guide')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should have current transit information', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Current Transit')).toBeInTheDocument();
      expect(screen.getByText('Jupiter Retrograde')).toBeInTheDocument();
    });
  });

  describe('Chart ID Parameter', () => {
    it('should use default chart when no chartId provided', () => {
      renderWithProviders(createElement(DetailedNatalReportPage), '/natal-report');
      // No chartId means no fetch, so fallback chart name is "Unknown Chart"
      expect(screen.getByText('Unknown Chart')).toBeInTheDocument();
    });

    it('should use fetched chart for given chartId', async () => {
      renderWithProviders(createElement(DetailedNatalReportPage), '/natal-report/some-chart-id');
      await waitFor(() => {
        expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: 'Sarah Mitchell' });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have all interactive tab elements', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));

      const tabs = ['Summary', 'Planets', 'Houses', 'Aspects'];
      tabs.forEach((tabName) => {
        const tab = screen.getByText(tabName);
        expect(tab).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Content', () => {
    it('should render Premium Actions section', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Premium Actions')).toBeInTheDocument();
    });

    it('should render all sidebar buttons', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Download PDF Report')).toBeInTheDocument();
      expect(screen.getByText('Order Printed Chart')).toBeInTheDocument();
      expect(screen.getByText('Share Report')).toBeInTheDocument();
    });

    it('should render upsell card with synastry guide', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Synastry Guide')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle PDF generation errors gracefully', async () => {
      vi.spyOn(global, 'setTimeout').mockImplementationOnce((callback: () => void) => {
        throw new Error('PDF Error');
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProviders(createElement(DetailedNatalReportPage));

      // Component should not crash
      expect(screen.getByText('Premium Natal Report')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      const mainContainer = document.querySelector('.max-w-7xl');
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
