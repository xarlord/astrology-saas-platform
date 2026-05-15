/**
 * ChartCreatePage Component Tests
 *
 * Tests for the chart creation page with BirthDataForm
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the components barrel
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BirthDataForm: ({ onSuccess }: { onSuccess?: (chartId: string) => void }) => (
    <div data-testid="birth-data-form">
      <span>Chart Creation Form</span>
      <button onClick={() => onSuccess?.('chart-123')}>Submit</button>
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

    it('should render BirthDataForm', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByTestId('birth-data-form')).toBeInTheDocument();
    });

    it('should have proper heading', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Natal Chart');
    });
  });

  describe('Form Integration', () => {
    it('should display chart creation form text', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Chart Creation Form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with readable heading', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const heading = screen.getByText('Create Natal Chart');
      expect(heading).toBeVisible();
    });
  });
});
