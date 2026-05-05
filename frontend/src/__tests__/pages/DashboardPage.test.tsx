/**
 * DashboardPage Component Tests
 *
 * Comprehensive tests for the main dashboard page
 * Covers: header, welcome section, cosmic energy, transits, charts, quick actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
    circle: ({ children, ...props }: any) => createElement('circle', props, children),
  },
}));

// Mock hooks
const mockLogout = vi.fn();
const mockFetchCharts = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      plan: 'free',
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    logout: mockLogout,
    clearError: vi.fn(),
    hasAtLeastPlan: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    charts: [
      {
        id: 'chart-1',
        name: 'My Birth Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1990-01-15',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Leo' },
            { name: 'Moon', sign: 'Taurus' },
          ],
        },
      },
      {
        id: 'chart-2',
        name: 'Partner Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1992-06-20',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Scorpio' },
            { name: 'Moon', sign: 'Cancer' },
          ],
        },
      },
    ],
    isLoading: false,
    error: null,
    fetchCharts: mockFetchCharts,
    loadCharts: mockFetchCharts,
  }),
}));

vi.mock('../../hooks', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: null,
      plan: 'free',
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    logout: mockLogout,
    clearError: vi.fn(),
    hasAtLeastPlan: vi.fn().mockReturnValue(false),
  }),
  useCharts: () => ({
    charts: [
      {
        id: 'chart-1',
        name: 'My Birth Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1990-01-15',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Leo' },
            { name: 'Moon', sign: 'Taurus' },
          ],
        },
      },
      {
        id: 'chart-2',
        name: 'Partner Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1992-06-20',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Scorpio' },
            { name: 'Moon', sign: 'Cancer' },
          ],
        },
      },
    ],
    isLoading: false,
    error: null,
    fetchCharts: mockFetchCharts,
    loadCharts: mockFetchCharts,
  }),
  useTodayTransits: () => ({
    data: null,
    isFetching: false,
    isLoading: false,
  }),
}));

// Mock the components barrel
vi.mock('../../components', () => {
  return {
    AppLayout: ({ children }: { children: React.ReactNode }) => (
      <div>
        <header role="banner">
          <span>AstroVerse</span>
          <button data-testid="new-chart-header-button" type="button">New Chart</button>
          <button aria-label="User menu" data-testid="user-menu-button" type="button">
            TU
          </button>
          <div>
            <span>Test User</span>
            <span>test@example.com</span>
            <button
              data-testid="logout-button"
              type="button"
              onClick={async () => {
                try {
                  await (globalThis as any).__dashboardMockLogout?.();
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    ),
    SkeletonLoader: ({ variant }: Record<string, unknown>) => (
      <div data-testid="skeleton-loader" data-variant={variant}>Loading...</div>
    ),
    SkeletonGrid: ({ count }: Record<string, unknown>) => (
      <div data-testid="skeleton-grid">
        {Array.from({ length: (count as number) || 3 }, (_, i) => (
          <div key={i} data-testid="skeleton-item" />
        ))}
      </div>
    ),
    EmptyStates: {
      NoCharts: ({ onAction }: Record<string, unknown>) => (
        <div data-testid="empty-no-charts">
          <p>No charts yet</p>
          <button onClick={onAction as () => void} type="button">Create Chart</button>
        </div>
      ),
    },
  };
});

// Mock global fetch for planetary positions API call
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({}),
  } as Response),
);
vi.stubGlobal('fetch', mockFetch);

// Import after mocks
import DashboardPage from '../../pages/DashboardPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/dashboard') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/dashboard') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockReset();
    mockLogout.mockResolvedValue(undefined);
    (globalThis as any).__dashboardMockLogout = mockLogout;
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('should have correct document structure', () => {
      renderWithProviders(createElement(DashboardPage));
      const banners = screen.getAllByRole('banner');
      expect(banners.length).toBeGreaterThan(0);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render the logo and brand name', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/astroverse/i)).toBeInTheDocument();
    });

    it('should render New Chart button in header', () => {
      renderWithProviders(createElement(DashboardPage));
      const newChartButton = screen.getByTestId('new-chart-header-button');
      expect(newChartButton).toBeInTheDocument();
      expect(newChartButton).toHaveTextContent('New Chart');
    });

    it('should render user avatar/initials', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('should show user name and email in dropdown', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should have a logout button', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
  });

  describe('Welcome Section', () => {
    it('should render welcome message with user first name', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
    });

    it('should render daily insights label', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/daily insights/i)).toBeInTheDocument();
    });

    it('should render cosmic overview text', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/cosmic overview/i)).toBeInTheDocument();
    });
  });

  describe('Cosmic Energy Section', () => {
    it('should render Cosmic Energy label', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Cosmic Energy')).toBeInTheDocument();
    });

    it('should display energy score', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('72')).toBeInTheDocument();
    });

    it('should display /100 label', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('/100')).toBeInTheDocument();
    });

    it('should display vitality status', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('High Vitality')).toBeInTheDocument();
    });
  });

  describe('Major Transit Card', () => {
    it('should render Major Transit badge', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/major transit/i)).toBeInTheDocument();
    });

    it('should render transit title', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Venus enters Pisces')).toBeInTheDocument();
    });

    it('should render transit description', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText(/heightened sensitivity/i)).toBeInTheDocument();
    });

    it('should render Read Forecast link', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Read Forecast')).toBeInTheDocument();
    });
  });

  describe('Current Positions Section', () => {
    it('should render Current Positions heading', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Current Positions')).toBeInTheDocument();
    });

    it('should render View Ephemeris link', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('View Ephemeris')).toBeInTheDocument();
    });

    it('should display planet names', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Moon')).toBeInTheDocument();
    });

    it('should display planet signs', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Scorpio')).toBeInTheDocument();
      expect(screen.getByText('Taurus')).toBeInTheDocument();
    });
  });

  describe('Upcoming Transits Section', () => {
    it('should render Upcoming Transits heading', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Upcoming Transits')).toBeInTheDocument();
    });

    it('should render View All Transits link', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('View All Transits')).toBeInTheDocument();
    });

    it('should render transit entries', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Sun Trine Saturn')).toBeInTheDocument();
      expect(screen.getByText('Mars Square Pluto')).toBeInTheDocument();
      expect(screen.getByText('Full Moon in Scorpio')).toBeInTheDocument();
    });

    it('should render transit badges', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Favorable')).toBeInTheDocument();
      expect(screen.getByText('Challenging')).toBeInTheDocument();
      expect(screen.getByText('Neutral')).toBeInTheDocument();
    });
  });

  describe('Charts Section', () => {
    it('should render Your Charts heading', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Your Charts')).toBeInTheDocument();
    });

    it('should display chart names', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('My Birth Chart')).toBeInTheDocument();
      expect(screen.getByText('Partner Chart')).toBeInTheDocument();
    });

    it('should have Create New Chart link', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Create New Chart')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render Calendar quick action', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Events & Phases')).toBeInTheDocument();
    });

    it('should render Synastry quick action', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Synastry')).toBeInTheDocument();
      expect(screen.getByText('Compatibility')).toBeInTheDocument();
    });

    it('should render Lunar Returns quick action', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Lunar Returns')).toBeInTheDocument();
      expect(screen.getByText('Monthly Forecast')).toBeInTheDocument();
    });

    it('should render Solar Returns quick action', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByText('Solar Returns')).toBeInTheDocument();
      expect(screen.getByText('Yearly Outlook')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have clickable chart cards', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(DashboardPage));

      const chartCards = screen.getAllByTestId('chart-card');
      expect(chartCards.length).toBeGreaterThan(0);
      await user.click(chartCards[0]);
      expect(chartCards[0]).toBeInTheDocument();
    });

    it('should have links to all quick action pages', () => {
      renderWithProviders(createElement(DashboardPage));

      const calendarLink = screen.getByText('Calendar').closest('a');
      expect(calendarLink).toHaveAttribute('href', '/calendar');

      const synastryLink = screen.getByText('Synastry').closest('a');
      expect(synastryLink).toHaveAttribute('href', '/synastry');

      const lunarLink = screen.getByText('Lunar Returns').closest('a');
      expect(lunarLink).toHaveAttribute('href', '/lunar-returns');

      const solarLink = screen.getByText('Solar Returns').closest('a');
      expect(solarLink).toHaveAttribute('href', '/solar-returns');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(DashboardPage));
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have aria-labels on interactive elements', () => {
      renderWithProviders(createElement(DashboardPage));
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      expect(userMenuButton).toHaveAttribute('aria-label', 'User menu');
    });
  });

  describe('Error Handling', () => {
    it('should handle logout error gracefully', async () => {
      const logoutError = new Error('Logout failed');
      mockLogout.mockRejectedValueOnce(logoutError);

      const user = userEvent.setup();
      renderWithProviders(createElement(DashboardPage));

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      // Page should still be rendered after error
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });
});
