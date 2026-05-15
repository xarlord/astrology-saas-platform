/**
 * CalendarPage Component Tests
 *
 * Comprehensive tests for the astrological calendar page
 * Covers: page shell, calendar grid, navigation, event display, loading/error states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock motion/react (used by PageTransition and effects)
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
    section: ({ children, ...props }: any) => createElement('section', props, children),
    circle: ({ children, ...props }: any) => createElement('circle', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mutable mock state for useCalendarEvents
let mockCalendarEventsState: {
  data: any[] | null;
  isLoading: boolean;
  error: any;
  refetch: ReturnType<typeof vi.fn>;
} = {
  data: [
    {
      id: 'event-1',
      title: 'Venus enters Pisces',
      description: 'A time for romance and creativity',
      event_type: 'new_moon',
      event_date: '2026-05-10T00:00:00.000Z',
      event_data: { sign: 'pisces' },
      interpretation: 'Venus enters Pisces interpretation',
    },
    {
      id: 'event-2',
      title: 'Mercury Retrograde',
      description: 'Communication challenges',
      event_type: 'mercury_retrograde',
      event_date: '2026-05-20T00:00:00.000Z',
      event_data: {},
      interpretation: 'Mercury retrograde interpretation',
    },
    {
      id: 'event-3',
      title: 'Solar Eclipse',
      description: 'Major transformation energy',
      event_type: 'solar_eclipse',
      event_date: '2026-05-25T00:00:00.000Z',
      event_data: {},
      interpretation: 'Solar eclipse interpretation',
    },
  ],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

// Mock the useCalendarEvents hook to return event data as an array
// (AstrologicalCalendar expects events to be an array)
vi.mock('../../hooks/useCalendarEvents', () => ({
  useCalendarEvents: () => mockCalendarEventsState,
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SkeletonLoader: ({ variant }: any) => <div data-testid="skeleton-loader">Loading {variant}...</div>,
  SkeletonGrid: ({ children }: any) => <div>{children}</div>,
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
  EmptyStates: ({ children }: any) => <div>{children}</div>,
}));

// Import after mocks
import CalendarPage from '../../pages/CalendarPage';

// Helper to create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: ['/calendar'] }, children),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: createWrapper() });
};

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByText('Astrological Calendar')).toBeInTheDocument();
    });

    it('should render the page title', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByRole('heading', { name: /Astrological Calendar/i })).toBeInTheDocument();
    });

    it('should render page subtitle', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByText(/Track moon phases, retrogrades/i)).toBeInTheDocument();
    });

    it('should render the calendar component inside AppLayout', () => {
      renderWithProviders(createElement(CalendarPage));
      // AstrologicalCalendar renders navigation buttons when events are present
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Calendar Navigation', () => {
    it('should render Today button', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should render previous month button', () => {
      renderWithProviders(createElement(CalendarPage));
      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton).toBeInTheDocument();
    });

    it('should render next month button', () => {
      renderWithProviders(createElement(CalendarPage));
      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton).toBeInTheDocument();
    });

    it('should display current month and year', () => {
      renderWithProviders(createElement(CalendarPage));
      // Current month is May 2026 (from new Date() in AstrologicalCalendar default)
      const monthYear = screen.getByRole('heading', { level: 2 });
      expect(monthYear).toHaveTextContent('May 2026');
    });

    it('should navigate to previous month when Previous clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(CalendarPage));

      const prevButton = screen.getByLabelText('Previous month');
      await user.click(prevButton);

      // After clicking previous, the month should change
      const monthYear = screen.getByRole('heading', { level: 2 });
      expect(monthYear).toHaveTextContent('April 2026');
    });

    it('should navigate to next month when Next clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(CalendarPage));

      const nextButton = screen.getByLabelText('Next month');
      await user.click(nextButton);

      // After clicking next, the month should change
      const monthYear = screen.getByRole('heading', { level: 2 });
      expect(monthYear).toHaveTextContent('June 2026');
    });

    it('should navigate to today when Today clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(CalendarPage));

      // Navigate away first
      const nextButton = screen.getByLabelText('Next month');
      await user.click(nextButton);

      // Click Today to go back
      const todayButton = screen.getByText('Today');
      await user.click(todayButton);

      const monthYear = screen.getByRole('heading', { level: 2 });
      expect(monthYear).toHaveTextContent('May 2026');
    });
  });

  describe('Calendar Grid', () => {
    it('should render weekday headers', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('should render calendar cells for each day of the month', () => {
      renderWithProviders(createElement(CalendarPage));
      // May 2026 has 31 days
      const dayCells = screen.getAllByText(/^[0-9]+$/).filter(
        (el) => parseInt(el.textContent || '0') >= 1 && parseInt(el.textContent || '0') <= 31
      );
      expect(dayCells.length).toBe(31);
    });

    it('should display event badges on calendar days', () => {
      renderWithProviders(createElement(CalendarPage));
      // Event on May 10 with sign = 'pisces' renders as 'Pisces' (capitalize)
      expect(screen.getByText('Pisces')).toBeInTheDocument();
    });
  });

  describe('Event Legend', () => {
    it('should render legend section with event types', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByText('New Moon')).toBeInTheDocument();
      expect(screen.getByText('Full Moon')).toBeInTheDocument();
      expect(screen.getByText('Retrograde')).toBeInTheDocument();
      expect(screen.getByText('Eclipse')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton when events are loading', () => {
      mockCalendarEventsState = {
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(createElement(CalendarPage));
      // When loading, SkeletonLoader is rendered with variant="calendar"
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();

      // Restore default mock state
      mockCalendarEventsState = {
        data: [
          {
            id: 'event-1',
            title: 'Venus enters Pisces',
            description: 'A time for romance and creativity',
            event_type: 'new_moon',
            event_date: '2026-05-10T00:00:00.000Z',
            event_data: { sign: 'pisces' },
            interpretation: 'Venus enters Pisces interpretation',
          },
          {
            id: 'event-2',
            title: 'Mercury Retrograde',
            description: 'Communication challenges',
            event_type: 'mercury_retrograde',
            event_date: '2026-05-20T00:00:00.000Z',
            event_data: {},
            interpretation: 'Mercury retrograde interpretation',
          },
          {
            id: 'event-3',
            title: 'Solar Eclipse',
            description: 'Major transformation energy',
            event_type: 'solar_eclipse',
            event_date: '2026-05-25T00:00:00.000Z',
            event_data: {},
            interpretation: 'Solar eclipse interpretation',
          },
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    });
  });

  describe('Error State', () => {
    it('should render error state when events fail to load', () => {
      mockCalendarEventsState = {
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
      };

      renderWithProviders(createElement(CalendarPage));
      // Error state renders EmptyState with "Unable to load calendar" title
      expect(screen.getByTestId('empty-state')).toHaveTextContent('Unable to load calendar');

      // Restore default mock state
      mockCalendarEventsState = {
        data: [
          {
            id: 'event-1',
            title: 'Venus enters Pisces',
            description: 'A time for romance and creativity',
            event_type: 'new_moon',
            event_date: '2026-05-10T00:00:00.000Z',
            event_data: { sign: 'pisces' },
            interpretation: 'Venus enters Pisces interpretation',
          },
          {
            id: 'event-2',
            title: 'Mercury Retrograde',
            description: 'Communication challenges',
            event_type: 'mercury_retrograde',
            event_date: '2026-05-20T00:00:00.000Z',
            event_data: {},
            interpretation: 'Mercury retrograde interpretation',
          },
          {
            id: 'event-3',
            title: 'Solar Eclipse',
            description: 'Major transformation energy',
            event_type: 'solar_eclipse',
            event_date: '2026-05-25T00:00:00.000Z',
            event_data: {},
            interpretation: 'Solar eclipse interpretation',
          },
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no events are found', () => {
      mockCalendarEventsState = {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };

      renderWithProviders(createElement(CalendarPage));
      // Empty state renders EmptyState with "No events this month"
      expect(screen.getByTestId('empty-state')).toHaveTextContent('No events this month');

      // Restore default mock state
      mockCalendarEventsState = {
        data: [
          {
            id: 'event-1',
            title: 'Venus enters Pisces',
            description: 'A time for romance and creativity',
            event_type: 'new_moon',
            event_date: '2026-05-10T00:00:00.000Z',
            event_data: { sign: 'pisces' },
            interpretation: 'Venus enters Pisces interpretation',
          },
          {
            id: 'event-2',
            title: 'Mercury Retrograde',
            description: 'Communication challenges',
            event_type: 'mercury_retrograde',
            event_date: '2026-05-20T00:00:00.000Z',
            event_data: {},
            interpretation: 'Mercury retrograde interpretation',
          },
          {
            id: 'event-3',
            title: 'Solar Eclipse',
            description: 'Major transformation energy',
            event_type: 'solar_eclipse',
            event_date: '2026-05-25T00:00:00.000Z',
            event_data: {},
            interpretation: 'Solar eclipse interpretation',
          },
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(createElement(CalendarPage));
      expect(screen.getByRole('heading', { name: /Astrological Calendar/i })).toBeInTheDocument();
    });

    it('should have aria-labels on navigation buttons', () => {
      renderWithProviders(createElement(CalendarPage));
      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton).toHaveAttribute('aria-label', 'Previous month');

      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton).toHaveAttribute('aria-label', 'Next month');
    });
  });

  describe('User Profile', () => {
    it('should render page content inside AppLayout', () => {
      renderWithProviders(createElement(CalendarPage));
      // AppLayout is mocked as a simple div; verify calendar page content renders
      expect(screen.getByText('Astrological Calendar')).toBeInTheDocument();
      expect(screen.getByText(/Track moon phases, retrogrades/i)).toBeInTheDocument();
    });
  });
});
