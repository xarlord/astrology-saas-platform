/**
 * NatalChartDetailPage Component Tests
 *
 * Comprehensive tests for the natal chart detail page
 * Tests: component rendering, user interactions, navigation, loading states, data display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock navigate function
const mockNavigate = vi.fn();

// Create mutable mock state for useCharts
let mockCurrentChart: any = null;
let mockIsLoading = true;
let mockLoadChart = vi.fn();

vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    currentChart: mockCurrentChart,
    loadChart: mockLoadChart,
    isLoading: mockIsLoading,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'chart-123' }),
  };
});

// Mock the Button component
vi.mock('../../components/ui/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Import after mocks
import { NatalChartDetailPage } from '../../pages/NatalChartDetailPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts/chart-123') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children)
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts/chart-123') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

// Mock chart data for testing
const mockChartData = {
  id: 'chart-123',
  name: 'Test Birth Chart',
  birthData: {
    birthDate: '1990-01-15',
    birthTime: '14:30',
    birthPlace: 'New York, NY',
  },
  calculated_data: {
    planets: [],
    houses: [],
    aspects: [],
  },
};

describe('NatalChartDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockLoadChart.mockReset();
    mockLoadChart.mockResolvedValue(undefined);
    mockCurrentChart = null;
    mockIsLoading = true;
  });

  afterEach(() => {
    mockCurrentChart = null;
    mockIsLoading = true;
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockCurrentChart = null;
      mockIsLoading = true;
    });

    it('should display loading spinner when chart is loading', () => {
      mockIsLoading = true;
      mockCurrentChart = null;

      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });

    it('should display loading state when currentChart is null', () => {
      mockIsLoading = false;
      mockCurrentChart = null;

      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });

    it('should have loading spinner animation', () => {
      mockIsLoading = true;
      mockCurrentChart = null;

      renderWithProviders(createElement(NatalChartDetailPage));

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should have proper loading state structure', () => {
      mockIsLoading = true;
      mockCurrentChart = null;

      renderWithProviders(createElement(NatalChartDetailPage));

      const loadingContainer = document.querySelector('.min-h-screen.bg-deep-navy');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Chart Data Loading', () => {
    beforeEach(() => {
      mockCurrentChart = null;
      mockIsLoading = true;
    });

    it('should call loadChart with chart id from params', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(mockLoadChart).toHaveBeenCalledWith('chart-123');
    });
  });

  describe('Page Rendering with Chart Data', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render page structure when chart is loaded', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for main structure
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should render chart name in the header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Chart name appears in multiple places - check for h1 specifically
      const h1 = document.querySelector('h1');
      expect(h1?.textContent).toBe('Test Birth Chart');
    });

    it('should render birth date information', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Birth date formatted
      expect(screen.getByText(/January 15, 1990/)).toBeInTheDocument();
    });

    it('should render birth time information', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('should render birth location information', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render header with brand name', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render Dashboard navigation links', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Multiple Dashboard links exist (header nav and breadcrumbs)
      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks.length).toBeGreaterThan(0);
      expect(dashboardLinks[0]).toHaveAttribute('href', '/dashboard');
    });

    it('should render Transits navigation link', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const transitsLink = screen.getByRole('link', { name: /transits/i });
      expect(transitsLink).toHaveAttribute('href', '/transits');
    });

    it('should render profile button in header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Use more specific selector - the profile button has bg-primary/20 class
      const profileButton = document.querySelector('button.bg-primary\\/20');
      expect(profileButton).not.toBeNull();
    });

    it('should navigate to profile when profile button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      // Click the header profile button (the one with the circular styling)
      const profileButton = document.querySelector('button.bg-primary\\/20') as HTMLElement;
      if (profileButton) {
        await user.click(profileButton);
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
      }
    });

    it('should render search input', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const searchInput = screen.getByPlaceholderText('Search charts...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Chart Display', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render chart wheel container', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(document.querySelector('.aspect-square')).toBeInTheDocument();
    });

    it('should render SVG for zodiac ring', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render inner hub with chart name', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const hub = document.querySelector('.w-24.h-24');
      expect(hub).toBeInTheDocument();
    });
  });

  describe('Planetary Positions Sidebar', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render planetary positions header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Planetary Positions')).toBeInTheDocument();
    });

    it('should render planet table', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should render table headers', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Planet')).toBeInTheDocument();
      expect(screen.getByText('Pos')).toBeInTheDocument();
      expect(screen.getByText('House')).toBeInTheDocument();
    });

    it('should render all planets', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

      planets.forEach(planet => {
        expect(screen.getByText(planet)).toBeInTheDocument();
      });
    });

    it('should render planet sign abbreviations', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for zodiac sign abbreviations - use getAllByText since they appear multiple times
      const capElements = screen.getAllByText(/Cap/);
      expect(capElements.length).toBeGreaterThan(0);

      const pisElements = screen.getAllByText(/Pis/);
      expect(pisElements.length).toBeGreaterThan(0);
    });

    it('should render retrograde indicator for retrograde planets', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const retroBadge = screen.getByText('Retro');
      expect(retroBadge).toBeInTheDocument();
    });

    it('should render house numbers', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for house numbers in the table
      const houseCells = document.querySelectorAll('td.text-right');
      expect(houseCells.length).toBeGreaterThan(0);
    });
  });

  describe('Analysis Overview Sidebar', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render analysis overview header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Analysis Overview')).toBeInTheDocument();
    });

    it('should render Big Three section', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('The Big Three')).toBeInTheDocument();
    });

    it('should render Sun sign card', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Sun sign appears multiple times (chart wheel tooltip + sidebar)
      expect(screen.getAllByText(/Sun in/).length).toBeGreaterThan(0);
    });

    it('should render Moon sign card', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getAllByText(/Moon in/).length).toBeGreaterThan(0);
    });

    it('should render Rising sign card', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getAllByText(/Rising in/).length).toBeGreaterThan(0);
    });

    it('should render sign descriptions', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Ambitious, disciplined, and practical')).toBeInTheDocument();
      expect(screen.getByText('Highly intuitive and empathetic')).toBeInTheDocument();
      expect(screen.getByText('Charismatic and bold')).toBeInTheDocument();
    });

    it('should render sign type labels (Identity, Emotions, Persona)', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('Emotions')).toBeInTheDocument();
      expect(screen.getByText('Persona')).toBeInTheDocument();
    });
  });

  describe('Major Aspects Section', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render Major Aspects header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Major Aspects')).toBeInTheDocument();
    });

    it('should render View All button', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('View All')).toBeInTheDocument();
    });

    it('should render aspect entries', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Sun Trine Mars aspect
      expect(screen.getByText(/Sun.*Trine.*Mars/)).toBeInTheDocument();
    });

    it('should render aspect orb information', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for orb text format
      const orbTexts = screen.getAllByText(/Orb:/i);
      expect(orbTexts.length).toBeGreaterThan(0);
    });

    it('should render different aspect types', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for various aspect type labels
      expect(screen.getByText(/Trine/)).toBeInTheDocument();
      expect(screen.getByText(/Square/)).toBeInTheDocument();
      expect(screen.getByText(/Sextile/)).toBeInTheDocument();
      expect(screen.getByText(/Opposition/)).toBeInTheDocument();
    });
  });

  describe('Elemental Balance Section', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render Elemental Balance header', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Elemental Balance')).toBeInTheDocument();
    });

    it('should render all four elements', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('fire')).toBeInTheDocument();
      expect(screen.getByText('earth')).toBeInTheDocument();
      expect(screen.getByText('air')).toBeInTheDocument();
      expect(screen.getByText('water')).toBeInTheDocument();
    });

    it('should render element percentages', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Percentages may appear in progress bars
      const twentyFive = screen.getAllByText('25%');
      const thirtyFive = screen.getAllByText('35%');
      const twenty = screen.getAllByText('20%');

      expect(twentyFive.length).toBeGreaterThan(0);
      expect(thirtyFive.length).toBeGreaterThan(0);
      expect(twenty.length).toBeGreaterThan(0);
    });

    it('should render progress bars for elements', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const progressBars = document.querySelectorAll('.h-2.w-full');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render edit button', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const editButton = screen.getByRole('button', { name: /^edit$/i });
      expect(editButton).toBeInTheDocument();
    });

    it('should render download button', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const downloadButton = screen.getByRole('button', { name: /^download$/i });
      expect(downloadButton).toBeInTheDocument();
    });

    it('should render share button', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const shareButton = screen.getByRole('button', { name: /^share$/i });
      expect(shareButton).toBeInTheDocument();
    });

    it('should render View Transits button', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('View Transits')).toBeInTheDocument();
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const editButton = screen.getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-123/edit');
    });

    it('should navigate to transits page with chart parameter', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const transitsButton = screen.getByRole('button', { name: /view transits/i });
      await user.click(transitsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/transits?chart=chart-123');
    });

    it('should call handleDownload when download button is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const downloadButton = screen.getByRole('button', { name: /^download$/i });
      await user.click(downloadButton);

      expect(consoleSpy).toHaveBeenCalledWith('Download chart:', 'chart-123');
      consoleSpy.mockRestore();
    });

    it('should call handleShare when share button is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const shareButton = screen.getByRole('button', { name: /^share$/i });
      await user.click(shareButton);

      expect(consoleSpy).toHaveBeenCalledWith('Share chart:', 'chart-123');
      consoleSpy.mockRestore();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render Personality Analysis tab', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Personality Analysis')).toBeInTheDocument();
    });

    it('should render House Interpretations tab', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('House Interpretations')).toBeInTheDocument();
    });

    it('should render Aspects Detail tab', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Aspects Detail')).toBeInTheDocument();
    });

    it('should render Download Report tab', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('Download Report')).toBeInTheDocument();
    });

    it('should have Personality tab active by default', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const personalityTab = screen.getByRole('button', { name: /personality analysis/i });
      expect(personalityTab).toHaveClass('border-primary');
    });

    it('should switch active tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const housesTab = screen.getByRole('button', { name: /house interpretations/i });
      await user.click(housesTab);

      expect(housesTab).toHaveClass('border-primary');
    });

    it('should update active tab styling correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      // Click on Aspects tab
      const aspectsTab = screen.getByRole('button', { name: /aspects detail/i });
      await user.click(aspectsTab);

      // Check that the aspects tab now has the active class
      expect(aspectsTab).toHaveClass('border-primary');

      // Check that the personality tab no longer has the active class
      const personalityTab = screen.getByRole('button', { name: /personality analysis/i });
      expect(personalityTab).not.toHaveClass('border-primary');
    });

    it('should have correct tab icons', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for tab icons
      expect(screen.getByText('psychology')).toBeInTheDocument();
      expect(screen.getByText('home')).toBeInTheDocument();
      expect(screen.getByText('hub')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs Navigation', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render breadcrumb navigation', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for Dashboard and Charts in breadcrumbs (multiple occurrences)
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      // Charts text also appears multiple times
      expect(screen.getAllByText('Charts').length).toBeGreaterThan(0);
    });

    it('should render breadcrumb separators', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const separators = screen.getAllByText('chevron_right');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should have link to dashboard in breadcrumbs', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks[0]).toHaveAttribute('href', '/dashboard');
    });

    it('should have link to charts list in breadcrumbs', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const chartsLink = screen.getByRole('link', { name: /^charts$/i });
      expect(chartsLink).toHaveAttribute('href', '/charts');
    });
  });

  describe('Chart Header Information', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render chart title as h1', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const h1 = document.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('should render birth date icon', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('calendar_today')).toBeInTheDocument();
    });

    it('should render schedule icon', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('schedule')).toBeInTheDocument();
    });

    it('should render location icon', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(screen.getByText('location_on')).toBeInTheDocument();
    });
  });

  describe('Chart Wheel Interactions', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should have hoverable planet markers', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for cursor-pointer on planet markers
      const planetMarkers = document.querySelectorAll('.cursor-pointer');
      expect(planetMarkers.length).toBeGreaterThan(0);
    });

    it('should have tooltip on Sun planet hover', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // The tooltip should exist (even if hidden) - appears multiple times
      expect(screen.getAllByText('Sun in Capricorn').length).toBeGreaterThan(0);
    });

    it('should have transition transform on planet hover', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const planetWithTransition = document.querySelector('.hover\\:scale-125');
      expect(planetWithTransition).toBeInTheDocument();
    });
  });

  describe('Background Elements', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render background gradient elements', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const gradients = document.querySelectorAll('.blur-\\[100px\\]');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should have pointer-events-none on background', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const backgroundContainer = document.querySelector('.pointer-events-none');
      expect(backgroundContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should have proper document structure with header and main', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('should have h1 heading', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const h1 = document.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('should have h2 for brand name', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const h2 = document.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2?.textContent).toBe('AstroVerse');
    });

    it('should have h3 for section headers', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const h3s = document.querySelectorAll('h3');
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should have accessible button elements', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible links', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should have responsive container classes', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const responsiveElements = document.querySelectorAll('.md\\:flex, .lg\\:flex, .xl\\:w-96');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('should hide sidebars on smaller screens', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Left sidebar is hidden on screens smaller than lg
      const leftSidebar = document.querySelector('.hidden.lg\\:flex');
      expect(leftSidebar).toBeInTheDocument();

      // Right sidebar is hidden on screens smaller than md
      const rightSidebar = document.querySelector('.hidden.md\\:flex');
      expect(rightSidebar).toBeInTheDocument();
    });

    it('should have responsive text sizes', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const responsiveText = document.querySelector('.md\\:text-4xl');
      expect(responsiveText).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Missing Data', () => {
    it('should handle missing birth date gracefully', () => {
      mockCurrentChart = {
        id: 'chart-123',
        name: 'Test Chart',
        birthData: {
          birthDate: null,
          birthTime: '14:30',
          birthPlace: 'New York, NY',
        },
      };
      mockIsLoading = false;

      renderWithProviders(createElement(NatalChartDetailPage));

      // Should still render the page
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle missing birth time gracefully', () => {
      mockCurrentChart = {
        id: 'chart-123',
        name: 'Test Chart',
        birthData: {
          birthDate: '1990-01-15',
          birthTime: null,
          birthPlace: 'New York, NY',
        },
      };
      mockIsLoading = false;

      renderWithProviders(createElement(NatalChartDetailPage));

      // Should still render the page without birth time display
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle missing birth place gracefully', () => {
      mockCurrentChart = {
        id: 'chart-123',
        name: 'Test Chart',
        birthData: {
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: null,
        },
      };
      mockIsLoading = false;

      renderWithProviders(createElement(NatalChartDetailPage));

      // Should still render the page
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should use default name when chart has no name', () => {
      mockCurrentChart = {
        id: 'chart-123',
        name: '',
        birthData: {
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'New York, NY',
        },
      };
      mockIsLoading = false;

      renderWithProviders(createElement(NatalChartDetailPage));

      // Should use default name - appears multiple times
      expect(screen.getAllByText('Birth Chart').length).toBeGreaterThan(0);
    });

    it('should handle very long chart names', () => {
      const longName = 'A'.repeat(100);
      mockCurrentChart = {
        id: 'chart-123',
        name: longName,
        birthData: {
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'New York, NY',
        },
      };
      mockIsLoading = false;

      renderWithProviders(createElement(NatalChartDetailPage));

      // Should render the long name (appears in multiple places)
      expect(screen.getAllByText(longName).length).toBeGreaterThan(0);
    });
  });

  describe('Zodiac Colors', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should apply correct zodiac colors in the chart', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for SVG circles with stroke colors (zodiac ring)
      const svgCircles = document.querySelectorAll('svg circle[stroke]');
      expect(svgCircles.length).toBeGreaterThan(0);
    });
  });

  describe('Aspect Configuration', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should render different aspect type icons', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for aspect-related icons (may appear multiple times)
      expect(screen.getAllByText('check_circle').length).toBeGreaterThan(0); // Trine
      expect(screen.getAllByText('error').length).toBeGreaterThan(0); // Square
      expect(screen.getAllByText('stars').length).toBeGreaterThan(0); // Other aspects
    });

    it('should apply correct aspect colors', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for aspect color classes
      const aspectColors = document.querySelectorAll('.text-blue-400, .text-red-400, .text-green-400, .text-slate-400');
      expect(aspectColors.length).toBeGreaterThan(0);
    });
  });

  describe('Planet Styling', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should apply correct planet color classes', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for planet-specific color classes
      expect(document.querySelector('.bg-orange-500\\/10')).toBeInTheDocument(); // Sun
      expect(document.querySelector('.bg-blue-500\\/10')).toBeInTheDocument(); // Moon
      expect(document.querySelector('.bg-pink-500\\/10')).toBeInTheDocument(); // Venus
      expect(document.querySelector('.bg-red-600\\/10')).toBeInTheDocument(); // Mars
    });

    it('should render planet symbols', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      // Check for material symbols used as planet icons
      expect(screen.getAllByText('sunny').length).toBeGreaterThan(0); // Sun
      expect(screen.getAllByText('dark_mode').length).toBeGreaterThan(0); // Moon
      expect(screen.getAllByText('favorite').length).toBeGreaterThan(0); // Venus
      expect(screen.getAllByText('local_fire_department').length).toBeGreaterThan(0); // Mars
    });
  });

  describe('Custom Scrollbar', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should have custom scrollbar class on scrollable areas', () => {
      renderWithProviders(createElement(NatalChartDetailPage));

      const scrollableAreas = document.querySelectorAll('.custom-scrollbar');
      expect(scrollableAreas.length).toBeGreaterThan(0);
    });
  });

  describe('All Tabs Navigation', () => {
    beforeEach(() => {
      mockCurrentChart = mockChartData;
      mockIsLoading = false;
    });

    it('should switch to House Interpretations tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const housesTab = screen.getByRole('button', { name: /house interpretations/i });
      await user.click(housesTab);

      expect(housesTab).toHaveClass('border-primary');
      expect(housesTab).toHaveClass('text-white');
    });

    it('should switch to Aspects Detail tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const aspectsTab = screen.getByRole('button', { name: /aspects detail/i });
      await user.click(aspectsTab);

      expect(aspectsTab).toHaveClass('border-primary');
    });

    it('should switch to Download Report tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      const reportTab = screen.getByRole('button', { name: /download report/i });
      await user.click(reportTab);

      expect(reportTab).toHaveClass('border-primary');
    });

    it('should only have one active tab at a time', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NatalChartDetailPage));

      // Get all tabs
      const personalityTab = screen.getByRole('button', { name: /personality analysis/i });
      const housesTab = screen.getByRole('button', { name: /house interpretations/i });
      const aspectsTab = screen.getByRole('button', { name: /aspects detail/i });
      const reportTab = screen.getByRole('button', { name: /download report/i });

      // Click houses tab
      await user.click(housesTab);

      // Check that only houses tab is active
      expect(personalityTab).not.toHaveClass('border-primary');
      expect(housesTab).toHaveClass('border-primary');
      expect(aspectsTab).not.toHaveClass('border-primary');
      expect(reportTab).not.toHaveClass('border-primary');
    });
  });
});
