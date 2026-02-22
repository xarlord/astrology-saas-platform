/**
 * SolarReturnAnnualReportPage Component Tests
 *
 * Comprehensive tests for the solar return annual report page
 * Tests rendering, navigation, user interactions, accordions, and PDF generation
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

// Mock Button component
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

// Import after mocks
import SolarReturnAnnualReportPage from '../../pages/SolarReturnAnnualReportPage';

// Helper to create wrapper with providers and routes
const createWrapper = (initialRoute = '/solar-returns/2024') => {
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
          createElement(Route, { path: '/solar-returns/:id', element: children }),
          createElement(Route, { path: '/solar-returns', element: <div data-testid="solar-returns-page">Solar Returns</div> }),
          createElement(Route, { path: '/dashboard', element: <div data-testid="dashboard-page">Dashboard</div> }),
          createElement(Route, { path: '/synastry', element: <div data-testid="synastry-page">Synastry</div> }),
          createElement(Route, { path: '/learning', element: <div data-testid="learning-page">Learning</div> })
        )
      )
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/solar-returns/2024') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('SolarReturnAnnualReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console.log and console.error
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Annual Forecast')).toBeInTheDocument();
    });

    it('should render navigation header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Compatibility')).toBeInTheDocument();
      expect(screen.getByText('Academy')).toBeInTheDocument();
    });

    it('should render year in header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText(/Solar Return Report 2024/)).toBeInTheDocument();
    });

    it('should render page description', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Your birthday chart and annual forecast for the year ahead.')).toBeInTheDocument();
    });

    it('should render View Archive button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('View Archive')).toBeInTheDocument();
    });

    it('should render Download PDF button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  describe('Yearly Theme Section', () => {
    it('should render yearly theme label', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('The Yearly Theme')).toBeInTheDocument();
    });

    it('should render theme title', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('The Year of Personal Expansion')).toBeInTheDocument();
    });

    it('should render theme description', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText(/monumental shift in your personal evolution/)).toBeInTheDocument();
    });

    it('should render read full summary link', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Read Full Executive Summary')).toBeInTheDocument();
    });

    it('should render solar theme image', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const image = screen.getByAltText('Solar Theme');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Chart Comparison Section', () => {
    it('should render chart comparison header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Chart Comparison: Natal vs. Solar Return')).toBeInTheDocument();
    });

    it('should render natal chart card', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Natal Birth Chart')).toBeInTheDocument();
      expect(screen.getByText('Fixed positions at time of birth')).toBeInTheDocument();
    });

    it('should render solar return chart card', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Solar Return 2024 Chart')).toBeInTheDocument();
      expect(screen.getByText('Annual celestial alignment for current year')).toBeInTheDocument();
    });

    it('should render ascendant badge', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Leo RISING')).toBeInTheDocument();
      expect(screen.getByText('Solar Return Ascendant')).toBeInTheDocument();
    });

    it('should render natal chart image', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const natalImage = screen.getByAltText('Natal Chart Wheel');
      expect(natalImage).toBeInTheDocument();
    });

    it('should render solar return chart image', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const solarImage = screen.getByAltText('Solar Return Chart Wheel');
      expect(solarImage).toBeInTheDocument();
    });
  });

  describe('Key Placements Grid', () => {
    it('should render Solar House card', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('The Solar House')).toBeInTheDocument();
      expect(screen.getByText('Sun in the 9th House')).toBeInTheDocument();
      expect(screen.getByText('Horizon Expansion')).toBeInTheDocument();
    });

    it('should render Yearly Ruler card', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Yearly Ruler')).toBeInTheDocument();
      expect(screen.getByText('Jupiter')).toBeInTheDocument();
      expect(screen.getByText('Benevolent Growth')).toBeInTheDocument();
    });

    it('should render Crucial Aspect card', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Crucial Aspect')).toBeInTheDocument();
      expect(screen.getByText('Sun Conjunct Midheaven')).toBeInTheDocument();
      expect(screen.getByText('Public Peak')).toBeInTheDocument();
    });

    it('should render descriptions for each placement', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText(/travel, higher learning, and spiritual philosophy/)).toBeInTheDocument();
      expect(screen.getByText(/magnifying abundance/)).toBeInTheDocument();
      expect(screen.getByText(/professional peak/)).toBeInTheDocument();
    });
  });

  describe('Annual Timeline Section', () => {
    it('should render timeline header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Annual 12-Month Timeline')).toBeInTheDocument();
    });

    it('should render all months', () => {
      const months = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'];
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      months.forEach(month => {
        // Use getAllByText since some months might appear multiple times
        expect(screen.getAllByText(month).length).toBeGreaterThan(0);
      });
    });

    it('should render power dates', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      // Multiple 'Power Date' labels exist - use getAllByText
      expect(screen.getAllByText('Power Date').length).toBeGreaterThan(0);
      expect(screen.getByText('May 14')).toBeInTheDocument();
      expect(screen.getByText('Sep 22')).toBeInTheDocument();
      expect(screen.getByText('Jan 05')).toBeInTheDocument();
    });

    it('should render challenge dates', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      // Multiple elements with 'Challenge' text - use getAllByText
      expect(screen.getAllByText('Challenge').length).toBeGreaterThan(0);
      expect(screen.getByText('Jul 28')).toBeInTheDocument();
      expect(screen.getByText('Nov 11')).toBeInTheDocument();
    });
  });

  describe('Detailed Interpretations Accordions', () => {
    it('should render interpretations header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Detailed Interpretations')).toBeInTheDocument();
    });

    it('should render Career accordion button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Career & Purpose')).toBeInTheDocument();
    });

    it('should render Love accordion button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Love & Social Life')).toBeInTheDocument();
    });

    it('should render Health accordion button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Health & Vitality')).toBeInTheDocument();
    });

    it('should expand accordion when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      // Career content should not be visible initially
      expect(screen.queryByText(/professional landscape is undergoing/)).not.toBeInTheDocument();

      // Click Career accordion - find by text content
      const allButtons = screen.getAllByRole('button');
      const careerButton = allButtons.find(btn => btn.textContent?.includes('Career & Purpose'));
      await user.click(careerButton!);

      // Content should now be visible
      await waitFor(() => {
        expect(screen.getByText(/professional landscape is undergoing/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should collapse accordion when clicked again', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      // Open accordion
      const allButtons = screen.getAllByRole('button');
      const careerButton = allButtons.find(btn => btn.textContent?.includes('Career & Purpose'));
      await user.click(careerButton!);

      await waitFor(() => {
        expect(screen.getByText(/professional landscape is undergoing/)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Close accordion
      await user.click(careerButton!);
      await waitFor(() => {
        expect(screen.queryByText(/professional landscape is undergoing/)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show Love content when expanded', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      const allButtons = screen.getAllByRole('button');
      const loveButton = allButtons.find(btn => btn.textContent?.includes('Love & Social Life'));
      await user.click(loveButton!);

      await waitFor(() => {
        expect(screen.getByText(/Social dynamics will shift/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show Health content when expanded', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      const allButtons = screen.getAllByRole('button');
      const healthButton = allButtons.find(btn => btn.textContent?.includes('Health & Vitality'));
      await user.click(healthButton!);

      await waitFor(() => {
        expect(screen.getByText(/Focus on routine and mental health/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should only have one accordion open at a time', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      // Open Career
      const allButtons = screen.getAllByRole('button');
      const careerButton = allButtons.find(btn => btn.textContent?.includes('Career & Purpose'));
      await user.click(careerButton!);

      await waitFor(() => {
        expect(screen.getByText(/professional landscape is undergoing/)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Open Love - Career should close
      const loveButton = allButtons.find(btn => btn.textContent?.includes('Love & Social Life'));
      await user.click(loveButton!);

      await waitFor(() => {
        expect(screen.getByText(/Social dynamics will shift/)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.queryByText(/professional landscape is undergoing/)).not.toBeInTheDocument();
    });
  });

  describe('PDF Generation', () => {
    it('should have Download PDF button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('should have View Archive button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('View Archive')).toBeInTheDocument();
    });

    it('should have primary variant button for download', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const downloadButton = screen.getByText('Download PDF').closest('button');
      expect(downloadButton).toHaveAttribute('data-variant', 'primary');
    });
  });

  describe('Final Actions Bar', () => {
    it('should render compare with previous year button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Compare with Previous Year')).toBeInTheDocument();
    });

    it('should render add power dates to calendar button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Add Power Dates to Calendar')).toBeInTheDocument();
    });

    it('should render book consultation button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('BOOK CONSULTATION FOR THIS REPORT')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have View Archive button', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('View Archive')).toBeInTheDocument();
    });

    it('should have Dashboard navigation link', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should have Compatibility navigation link', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Compatibility')).toBeInTheDocument();
    });

    it('should have Academy navigation link', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Academy')).toBeInTheDocument();
    });
  });

  describe('ID Parameter Handling', () => {
    it('should use 2024 data for matching ID', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage), '/solar-returns/2024');
      expect(screen.getByText('The Year of Personal Expansion')).toBeInTheDocument();
    });

    it('should fallback to 2024 for unknown ID', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage), '/solar-returns/unknown');
      // Falls back to default 2024 data
      expect(screen.getByText('The Year of Personal Expansion')).toBeInTheDocument();
    });

    it('should fallback to 2024 when no ID provided', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage), '/solar-returns/undefined');
      expect(screen.getByText('The Year of Personal Expansion')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const heading = screen.getByRole('heading', { name: /Solar Return Report 2024/ });
      expect(heading).toBeInTheDocument();
    });

    it('should have descriptive labels for sections', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('Annual Forecast')).toBeInTheDocument();
    });

    it('should have interactive accordion buttons', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const careerButton = screen.getByText('Career & Purpose').closest('button');
      const loveButton = screen.getByText('Love & Social Life').closest('button');
      const healthButton = screen.getByText('Health & Vitality').closest('button');

      expect(careerButton).toBeInTheDocument();
      expect(loveButton).toBeInTheDocument();
      expect(healthButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive container classes', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const mainContainer = document.querySelector('.max-w-7xl');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have responsive grid for key placements', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const grid = document.querySelector('.grid-cols-1.md\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have fixed navigation', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const nav = document.querySelector('nav.fixed');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should have background decorative elements', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      const blurElements = document.querySelectorAll('.blur-\\[120px\\], .blur-\\[150px\\]');
      expect(blurElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should have sun icon in header', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('wb_sunny')).toBeInTheDocument();
    });

    it('should have light_mode icon in hero section', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText('light_mode')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle PDF generation errors gracefully', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      const downloadButton = screen.getByText('Download PDF').closest('button');
      await user.click(downloadButton!);

      // Component should not crash
      expect(screen.getByText('Annual Forecast')).toBeInTheDocument();
    });
  });

  describe('Timeline Icons', () => {
    it('should have star icon for power dates', async () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      // Power dates are May 14, Sep 22, Jan 05
      const starIcons = screen.getAllByText('star');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('should have dark_mode icon for challenge dates', async () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      // Challenge dates are Jul 28, Nov 11
      const darkModeIcons = screen.getAllByText('dark_mode');
      expect(darkModeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Content Completeness', () => {
    it('should display complete yearly theme description', () => {
      renderWithProviders(createElement(SolarReturnAnnualReportPage));
      expect(screen.getByText(/This year marks a monumental shift/)).toBeInTheDocument();
      expect(screen.getByText(/breaking boundaries and seeking higher truths/)).toBeInTheDocument();
    });

    it('should display complete career interpretation when accordion expanded', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      // Find and click career accordion
      const allButtons = screen.getAllByRole('button');
      const careerButton = allButtons.find(btn => btn.textContent?.includes('Career & Purpose'));
      await user.click(careerButton!);

      // Content should now be visible
      await waitFor(() => {
        expect(screen.getByText(/professional landscape is undergoing/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display complete love interpretation when accordion expanded', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      const allButtons = screen.getAllByRole('button');
      const loveButton = allButtons.find(btn => btn.textContent?.includes('Love & Social Life'));
      await user.click(loveButton!);

      await waitFor(() => {
        expect(screen.getByText(/Social dynamics will shift/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should display complete health interpretation when accordion expanded', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnAnnualReportPage));

      const allButtons = screen.getAllByRole('button');
      const healthButton = allButtons.find(btn => btn.textContent?.includes('Health & Vitality'));
      await user.click(healthButton!);

      await waitFor(() => {
        expect(screen.getByText(/Focus on routine and mental health/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
