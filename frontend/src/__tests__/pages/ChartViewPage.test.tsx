/**
 * ChartViewPage Component Tests
 *
 * Comprehensive tests for the chart view page
 * Tests synchronous rendering - async data fetching tested via integration tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the charts store
vi.mock('../../store/chartsStore', () => ({
  useChartsStore: () => ({
    currentChart: null,
    isLoading: true,
    error: null,
    fetchChart: vi.fn(),
  }),
}));

// Mock child components synchronously
vi.mock('../../components/SkeletonLoader', () => ({
  SkeletonLoader: ({ variant }: Record<string, unknown>) => (
    <div data-testid="skeleton-loader" data-variant={variant}>
      Loading...
    </div>
  ),
}));

vi.mock('../../components/EmptyState', () => ({
  EmptyState: ({
    title,
    description,
    actionText,
    onAction,
    secondaryActionText,
    onSecondaryAction,
  }: Record<string, unknown>) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && (
        <button onClick={onAction as () => void} data-testid="empty-state-action">
          {actionText}
        </button>
      )}
      {secondaryActionText && (
        <button
          onClick={onSecondaryAction as () => void}
          data-testid="empty-state-secondary-action"
        >
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
      <span data-testid="planets-count">
        {(data as { planets: unknown[] })?.planets?.length || 0} planets
      </span>
    </div>
  ),
  ChartWheelLegend: () => (
    <div data-testid="chart-wheel-legend">
      <span>Legend</span>
    </div>
  ),
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SkeletonLoader: ({ variant }: Record<string, unknown>) => (
    <div data-testid="skeleton-loader" data-variant={variant}>
      Loading...
    </div>
  ),
  EmptyState: ({
    title,
    description,
    actionText,
    onAction,
    secondaryActionText,
    onSecondaryAction,
  }: Record<string, unknown>) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionText && (
        <button onClick={onAction as () => void} data-testid="empty-state-action">
          {actionText}
        </button>
      )}
      {secondaryActionText && (
        <button
          onClick={onSecondaryAction as () => void}
          data-testid="empty-state-secondary-action"
        >
          {secondaryActionText}
        </button>
      )}
    </div>
  ),
  ChartWheel: ({ data }: Record<string, unknown>) => (
    <div data-testid="chart-wheel">
      <span>Chart Wheel</span>
      <span data-testid="planets-count">
        {(data as { planets: unknown[] })?.planets?.length || 0} planets
      </span>
    </div>
  ),
  ChartWheelLegend: () => (
    <div data-testid="chart-wheel-legend">
      <span>Legend</span>
    </div>
  ),
}));

// Import after mocks
import ChartViewPage from '../../pages/ChartViewPage';

// Helper to create wrapper with providers and routes
const createWrapper = (initialRoute = '/charts/chart-1') => {
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
          createElement(Route, { path: '/charts/:id', element: children }),
          createElement(Route, { path: '/charts', element: children }),
        ),
      ),
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
      // Page renders inside AppLayout (mocked as div) with loading skeleton
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('should render page header', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });

    it('should render loading skeleton while fetching chart data', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
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
    it('should display Natal Chart title', () => {
      renderWithProviders(createElement(ChartViewPage));
      const heading = screen.getByText('Natal Chart');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('should have heading in mb-8 container', () => {
      renderWithProviders(createElement(ChartViewPage));
      const heading = screen.getByText('Natal Chart');
      const container = heading.closest('.mb-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('should have mb-8 spacing on header container', () => {
      renderWithProviders(createElement(ChartViewPage));
      const heading = screen.getByText('Natal Chart');
      const container = heading.parentElement;
      expect(container?.className).toContain('mb-8');
    });

    it('should wrap content in AppLayout', () => {
      renderWithProviders(createElement(ChartViewPage));
      // AppLayout is mocked as a div, content is rendered inside it
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should not have a back to dashboard link during loading', () => {
      renderWithProviders(createElement(ChartViewPage));
      // During loading state, there are no navigation links
      expect(screen.queryByRole('link', { name: /back to dashboard/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have Natal Chart heading', () => {
      renderWithProviders(createElement(ChartViewPage));
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });

    it('should have heading visible during loading state', () => {
      renderWithProviders(createElement(ChartViewPage));
      const heading = screen.getByText('Natal Chart');
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing chartId in URL params', () => {
      // Render with route that has no chartId - shows empty state
      renderWithProviders(createElement(ChartViewPage), '/charts');

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should handle routes with different chartId patterns', () => {
      renderWithProviders(createElement(ChartViewPage), '/charts/abc123');

      // Should render loading state
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });
  });
});
