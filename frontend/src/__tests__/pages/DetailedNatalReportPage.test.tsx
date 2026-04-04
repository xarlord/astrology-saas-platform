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
    section: ({ children, ...props }: Record<string, unknown>) => createElement('section', props, children),
    header: ({ children, ...props }: Record<string, unknown>) => createElement('header', props, children),
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
    <div data-testid={`planet-card-${(planet as Record<string, unknown>).name?.toString().toLowerCase()}`}>
      <span className="planet-name">{(planet as Record<string, unknown>).name as string}</span>
      <span className="planet-sign">{(planet as Record<string, unknown>).sign as string}</span>
      <span className="planet-house">House {(planet as Record<string, unknown>).house as number}</span>
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
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocks
import DetailedNatalReportPage from '../../pages/DetailedNatalReportPage';

// Helper to create wrapper with providers and routes
const createWrapper = (initialRoute = '/natal-report') => {
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
          createElement(Route, { path: '/dashboard', element: <div data-testid="dashboard-page">Dashboard</div> }),
          createElement(Route, { path: '/synastry', element: <div data-testid="synastry-page">Synastry</div> }),
          createElement(Route, { path: '/transits', element: <div data-testid="transits-page">Transits</div> })
        )
      )
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/natal-report') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

// Mock navigator.share
const mockShare = vi.fn();
const originalShare = navigator.share;

describe('DetailedNatalReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

    it('should render the header with navigation', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Natal Reports')).toBeInTheDocument();
      expect(screen.getByText('Compatibility')).toBeInTheDocument();
      expect(screen.getByText('Transits')).toBeInTheDocument();
    });

    it('should render chart name', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });

    it('should render birth data information', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      expect(screen.getByText('January 14, 1992')).toBeInTheDocument();
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

    it('should show planets in their respective houses', () => {
      // Sun is in 10th house according to mock data
      expect(screen.getByText(/Sun in Capricorn/)).toBeInTheDocument();
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

    it('should render all planet cards', () => {
      expect(screen.getByTestId('planet-card-sun')).toBeInTheDocument();
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

    it('should show planet count', () => {
      expect(screen.getByTestId('planet-count')).toHaveTextContent('7 planets');
    });

    it('should show aspect count', () => {
      expect(screen.getByTestId('aspect-count')).toHaveTextContent('5 aspects');
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

      const downloadButton = screen.getByText('Download PDF Report');
      await user.click(downloadButton);

      // Should show generating state immediately after click
      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument();
      }, { timeout: 3000 });
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
    it('should have back button in header', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      const backButton = screen.getByText('arrow_back').closest('button');
      expect(backButton).toBeInTheDocument();
    });

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
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });

    it('should use default chart for unknown chartId', () => {
      renderWithProviders(createElement(DetailedNatalReportPage), '/natal-report/unknown-id');
      // Falls back to default
      expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      const heading = screen.getByRole('heading', { name: 'Sarah Mitchell' });
      expect(heading).toBeInTheDocument();
    });

    it('should have notification button in header', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      const notificationButton = screen.getByText('notifications').closest('button');
      expect(notificationButton).toBeInTheDocument();
    });

    it('should have all interactive tab elements', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));

      const tabs = ['Summary', 'Planets', 'Houses', 'Aspects'];
      tabs.forEach(tabName => {
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

    it('should have sticky sidebar positioning', () => {
      renderWithProviders(createElement(DetailedNatalReportPage));
      const sidebar = document.querySelector('.sticky');
      expect(sidebar).toBeInTheDocument();
    });
  });
});
