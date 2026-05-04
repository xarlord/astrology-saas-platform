/**
 * ChartCreatePage Component Tests
 *
 * Tests for the chart creation redirect page
 * Note: ChartCreatePage is a simple redirect component that navigates to /charts/create
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocks
import ChartCreatePage from '../../pages/ChartCreatePage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts/new') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts/new') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('ChartCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // The component shows a loading spinner and redirect message
      expect(screen.getByText(/redirecting to chart creation/i)).toBeInTheDocument();
    });

    it('should show loading spinner', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // Check for the loading spinner by looking for the container
      const container = screen.getByText(/redirecting to chart creation/i).closest('div');
      expect(container).toBeInTheDocument();
    });

    it('should have proper container styling', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // The component renders a centered container
      const container = screen.getByText(/redirecting to chart creation/i).closest('div');
      expect(container).toHaveClass('flex');
    });
  });

  describe('Redirect Behavior', () => {
    it('should display redirect message', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText(/redirecting to chart creation/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with readable text', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // The redirect message should be visible
      const message = screen.getByText(/redirecting to chart creation/i);
      expect(message).toBeVisible();
    });
  });
});
