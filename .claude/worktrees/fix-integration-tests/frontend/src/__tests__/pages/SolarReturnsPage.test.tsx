/**
 * SolarReturnsPage Component Tests
 *
 * Comprehensive tests for the solar returns page
 * Tests synchronous rendering - async data fetching tested via integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => createElement('div', props, children),
    header: ({ children, ...props }: Record<string, unknown>) => createElement('header', props, children),
    span: ({ children, ...props }: Record<string, unknown>) => createElement('span', props, children),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  Share2: () => <span data-testid="share-icon">Share</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">Back</span>,
}));

// Mock API - return never-resolving promise for loading state
vi.mock('../../services/api', () => ({
  default: {
    get: () => new Promise(() => {}),
    post: () => new Promise(() => {}),
  },
}));

// Mock child components
vi.mock('../../components/SolarReturnDashboard', () => ({
  SolarReturnDashboard: ({ onSelectYear, onSelectSolarReturn }: Record<string, unknown>) => (
    <div data-testid="solar-return-dashboard">
      <h2>Solar Return Dashboard</h2>
      <button onClick={() => onSelectYear(2024)} data-testid="select-year-btn">
        Select Year 2024
      </button>
      <button onClick={() => onSelectSolarReturn('sr-1')} data-testid="select-sr-btn">
        Select Solar Return
      </button>
    </div>
  ),
}));

vi.mock('../../components/SolarReturnChart', () => ({
  SolarReturnChart: ({ year, location }: Record<string, unknown>) => (
    <div data-testid="solar-return-chart">
      <h3>Solar Return Chart for {year}</h3>
      <p>Location: {location}</p>
    </div>
  ),
}));

vi.mock('../../components/SolarReturnInterpretation', () => ({
  SolarReturnInterpretation: ({ year, onDownload, onShare }: Record<string, unknown>) => (
    <div data-testid="solar-return-interpretation">
      <h3>Interpretation for {year}</h3>
      <button onClick={onDownload as () => void} data-testid="download-btn">Download</button>
      <button onClick={onShare as () => void} data-testid="share-btn">Share</button>
    </div>
  ),
}));

vi.mock('../../components/RelocationCalculator', () => ({
  RelocationCalculator: ({ year }: Record<string, unknown>) => (
    <div data-testid="relocation-calculator">
      <h3>Relocation Calculator for {year}</h3>
    </div>
  ),
}));

vi.mock('../../components/BirthdaySharing', () => ({
  BirthdaySharing: ({ onShare }: Record<string, unknown>) => (
    <div data-testid="birthday-sharing">
      <h3>Share Your Solar Return</h3>
      <button onClick={onShare as () => void} data-testid="birthday-share-btn">Share</button>
    </div>
  ),
}));

// Import after mocks
import { SolarReturnsPage } from '../../pages/SolarReturnsPage';

// Helper to create wrapper with providers and routes
const createWrapper = (initialRoute = '/solar-returns') => {
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
          createElement(Route, { path: '/solar-returns', element: children }),
          createElement(Route, { path: '/solar-returns/:year', element: children })
        )
      )
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/solar-returns') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('SolarReturnsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  describe('Page Rendering - Dashboard View', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByTestId('solar-returns-page')).toBeInTheDocument();
    });

    it('should render page header with correct title', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByText('Solar Returns')).toBeInTheDocument();
    });

    it('should render page subtitle', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByText('Your birthday year forecasts and themes')).toBeInTheDocument();
    });

    it('should render SolarReturnDashboard component', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByTestId('solar-return-dashboard')).toBeInTheDocument();
    });
  });

  describe('Dashboard Interactions', () => {
    it('should have select year button in dashboard', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnsPage));

      const selectYearBtn = screen.getByTestId('select-year-btn');
      expect(selectYearBtn).toBeInTheDocument();

      await user.click(selectYearBtn);
      // Component navigates internally
    });

    it('should have select solar return button in dashboard', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SolarReturnsPage));

      const selectSrBtn = screen.getByTestId('select-sr-btn');
      expect(selectSrBtn).toBeInTheDocument();

      await user.click(selectSrBtn);
      // Component fetches data internally
    });
  });

  describe('Dashboard Content', () => {
    it('should display dashboard title', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByText('Solar Return Dashboard')).toBeInTheDocument();
    });

    it('should have year selection button', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByText('Select Year 2024')).toBeInTheDocument();
    });

    it('should have solar return selection button', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      expect(screen.getByText('Select Solar Return')).toBeInTheDocument();
    });
  });

  describe('Year View', () => {
    it('should not show dashboard when year param is present', () => {
      renderWithProviders(createElement(SolarReturnsPage), '/solar-returns/2024');

      // Should NOT show dashboard when year is in URL
      expect(screen.queryByTestId('solar-return-dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Page Structure', () => {
    it('should have page header section', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      const pageHeader = document.querySelector('.page-header');
      expect(pageHeader).toBeInTheDocument();
    });

    it('should have main container', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      const mainContainer = screen.getByTestId('solar-returns-page');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Solar Returns');
    });

    it('should have descriptive subtitle', () => {
      renderWithProviders(createElement(SolarReturnsPage));
      const subtitle = screen.getByText('Your birthday year forecasts and themes');
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes without year parameter', () => {
      renderWithProviders(createElement(SolarReturnsPage), '/solar-returns');
      // Should show dashboard, not loading
      expect(screen.getByTestId('solar-return-dashboard')).toBeInTheDocument();
    });

    it('should handle various year patterns', () => {
      renderWithProviders(createElement(SolarReturnsPage), '/solar-returns/2025');
      // Should NOT show dashboard when year is in URL
      expect(screen.queryByTestId('solar-return-dashboard')).not.toBeInTheDocument();
    });
  });
});
