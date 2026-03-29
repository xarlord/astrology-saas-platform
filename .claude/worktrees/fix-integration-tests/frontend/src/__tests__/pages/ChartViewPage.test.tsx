/**
 * ChartViewPage Component Tests
 *
 * Comprehensive tests for the chart view page
 * Tests synchronous rendering - async data fetching tested via integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock child components synchronously
vi.mock('../../components/SkeletonLoader', () => ({
  SkeletonLoader: ({ variant }: Record<string, unknown>) => (
    <div data-testid="skeleton-loader" data-variant={variant}>
      Loading...
    </div>
  ),
}));

vi.mock('../../components/EmptyState', () => ({
  EmptyState: ({ title, description, actionText, onAction, secondaryActionText, onSecondaryAction }: Record<string, unknown>) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && (
        <button onClick={onAction as () => void} data-testid="empty-state-action">
          {actionText}
        </button>
      )}
      {secondaryActionText && (
        <button onClick={onSecondaryAction as () => void} data-testid="empty-state-secondary-action">
          {secondaryActionText}
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../components/ChartWheel', () => ({
  ChartWheel: ({ data }: Record<string, unknown>) => (
    <div data-testid="chart-wheel">
      <span>Chart Wheel</span>
      <span data-testid="planets-count">{(data as { planets: unknown[] })?.planets?.length || 0} planets</span>
    </div>
  ),
}));

// Mock chartService - return never-resolving promise for loading state tests
vi.mock('../../services', () => ({
  chartService: {
    getChart: () => new Promise(() => {}), // Never resolves - keeps loading state
    calculateChart: () => Promise.resolve({}),
  },
}));

// Import after mocks
import ChartViewPage from '../../pages/ChartViewPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts/chart-1') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts/chart-1') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('ChartViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(ChartViewPage));
      // Check for main container
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should render page header', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });

    it('should render back to dashboard link', () => {
      renderWithProviders(createElement(ChartViewPage));
      const backLink = screen.getByText(/Back to Dashboard/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton while fetching chart', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have correct variant for chart skeleton', () => {
      renderWithProviders(createElement(ChartViewPage));
      const skeleton = screen.getByTestId('skeleton-loader');
      expect(skeleton).toHaveAttribute('data-variant', 'chart');
    });
  });

  describe('Header Structure', () => {
    it('should have header element', () => {
      renderWithProviders(createElement(ChartViewPage));
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should have main content area', () => {
      renderWithProviders(createElement(ChartViewPage));
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should display Natal Chart title', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('should have dark mode classes', () => {
      renderWithProviders(createElement(ChartViewPage));
      const container = document.querySelector('.bg-gray-50');
      expect(container).toBeInTheDocument();
    });

    it('should have responsive container', () => {
      renderWithProviders(createElement(ChartViewPage));
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have link to dashboard', () => {
      renderWithProviders(createElement(ChartViewPage));
      const dashboardLink = screen.getByRole('link', { name: /back to dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Accessibility', () => {
    it('should have proper document structure with header and main', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('should have h1 heading', () => {
      renderWithProviders(createElement(ChartViewPage));
      const h1 = document.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toBe('Natal Chart');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing chartId in URL params', () => {
      // Render with route that has no chartId
      renderWithProviders(createElement(ChartViewPage), '/charts');

      // Should still render but show loading state
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('should handle routes with different chartId patterns', () => {
      renderWithProviders(createElement(ChartViewPage), '/charts/abc123');

      // Should render loading state
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });
  });
});
