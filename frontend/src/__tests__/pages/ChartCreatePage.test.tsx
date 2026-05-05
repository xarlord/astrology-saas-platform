/**
 * ChartCreatePage Component Tests
 *
 * Tests for the chart creation page
 * Renders BirthDataForm inside AppLayout with a header
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BirthDataForm: ({ onSuccess }: { onSuccess: (chartId: string) => void }) => (
    <div data-testid="birth-data-form">
      <p>Birth Data Form</p>
      <button type="button" onClick={() => onSuccess('new-chart-1')}>Submit</button>
    </div>
  ),
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
      expect(screen.getByText('Create Natal Chart')).toBeInTheDocument();
    });

    it('should render the page title', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Create Natal Chart')).toBeInTheDocument();
    });

    it('should render the page description', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText(/Enter your birth information to generate a detailed natal chart/i)).toBeInTheDocument();
    });

    it('should render the BirthDataForm', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByTestId('birth-data-form')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render content inside a glass-panel container', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const form = screen.getByTestId('birth-data-form');
      const panel = form.closest('.glass-panel');
      expect(panel).toBeInTheDocument();
    });

    it('should render inside AppLayout', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // AppLayout is mocked as a div wrapping children
      expect(screen.getByText('Create Natal Chart')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have a heading for the page title', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const heading = screen.getByRole('heading', { name: /Create Natal Chart/i });
      expect(heading).toBeInTheDocument();
    });

    it('should be accessible with readable text', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Create Natal Chart')).toBeVisible();
    });
  });
});
