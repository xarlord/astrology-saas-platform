/**
 * LunarReturnsPage Component Tests
 *
 * Comprehensive tests for the lunar returns page
 * Covers: navigation, lunar return display, themes, life areas, rituals, journaling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => createElement('div', props, children),
    header: ({ children, ...props }: Record<string, unknown>) => createElement('header', props, children),
    span: ({ children, ...props }: Record<string, unknown>) => createElement('span', props, children),
    circle: ({ children, ...props }: Record<string, unknown>) => createElement('circle', props, children),
  },
}));

// Mock clsx
vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Mock hooks
vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    charts: [
      {
        id: 'chart-1',
        name: 'My Birth Chart',
        type: 'Birth Chart',
        birth_data: {
          birth_date: '1990-01-15',
          birth_time: '14:30',
          birth_place_name: 'New York, NY',
        },
        calculated_data: {
          planets: [
            { name: 'Sun', sign: 'Leo' },
            { name: 'Moon', sign: 'Taurus' },
          ],
        },
      },
    ],
    isLoading: false,
    error: null,
    loadCharts: vi.fn(),
  }),
}));

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  Button: ({ children, variant, onClick, className, ...props }: Record<string, unknown>) => (
    <button
      onClick={onClick as React.MouseEventHandler}
      className={`btn btn-${variant} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  Share2: () => <span data-testid="share-icon">Share</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">Back</span>,
}));

// Import after mocks
import { LunarReturnsPage } from '../../pages/LunarReturnsPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/lunar-returns') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/lunar-returns') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('LunarReturnsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('lunar-returns-page')).toBeInTheDocument();
    });

    it('should render the page header with correct title', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Lunar Return in Pisces')).toBeInTheDocument();
    });

    it('should render navigation bar', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render nav links', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-lunar-returns')).toBeInTheDocument();
    });
  });

  describe('Navigation Section', () => {
    it('should have dashboard link', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      const dashboardLink = screen.getByTestId('nav-dashboard');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should highlight Lunar Returns nav item', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      const lunarReturnsLink = screen.getByTestId('nav-lunar-returns');
      expect(lunarReturnsLink).toHaveClass('text-white');
    });
  });

  describe('Header Section', () => {
    it('should display current cycle label', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Current Cycle')).toBeInTheDocument();
    });

    it('should display lunar return sign', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Lunar Return in Pisces/i)).toBeInTheDocument();
    });

    it('should display cycle subtitle', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Emotional Renewal & Intuition/i)).toBeInTheDocument();
    });

    it('should render Past Cycles button', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Past Cycles')).toBeInTheDocument();
    });

    it('should render Share Chart button', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Share Chart')).toBeInTheDocument();
    });
  });

  describe('Lunar Return Hero Card', () => {
    it('should display time remaining label', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Time Remaining in Phase')).toBeInTheDocument();
    });

    it('should display cycle progress label', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Cycle Progress')).toBeInTheDocument();
    });

    it('should display moon sign badge', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Moon in Pisces/i)).toBeInTheDocument();
    });

    it('should display moon phase', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Waxing Gibbous')).toBeInTheDocument();
    });

    it('should display illumination percentage', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/72% Illumination/i)).toBeInTheDocument();
    });
  });

  describe('Chart Analysis Section', () => {
    it('should render chart analysis title', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Chart Analysis')).toBeInTheDocument();
    });

    it('should display intensity score label', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Intensity Score')).toBeInTheDocument();
    });

    it('should display intensity value', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      // The intensity score 72 appears in multiple places, so we use getAllByText
      const intensityElements = screen.getAllByText(/72/);
      expect(intensityElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/\/100/)).toBeInTheDocument();
    });

    it('should display key placement label', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Key Placement')).toBeInTheDocument();
    });

    it('should display moon degree and minute', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Pisces 15/)).toBeInTheDocument();
    });

    it('should display house information', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/4th House of Home/i)).toBeInTheDocument();
    });

    it('should display Key Aspects section', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Key Aspects')).toBeInTheDocument();
    });

    it('should display aspect details', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Moon Trine Venus')).toBeInTheDocument();
      expect(screen.getByText('Moon Square Mars')).toBeInTheDocument();
      expect(screen.getByText('Moon Sextile Jupiter')).toBeInTheDocument();
    });

    it('should display aspect types', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Harmony')).toBeInTheDocument();
      expect(screen.getByText('Tension')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });
  });

  describe('Forecast Themes Section', () => {
    it('should render forecast themes header', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Forecast Themes')).toBeInTheDocument();
    });

    it('should display all theme cards', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Emotional Renewal')).toBeInTheDocument();
      expect(screen.getByText('Creative Surge')).toBeInTheDocument();
      expect(screen.getByText('Family Focus')).toBeInTheDocument();
    });

    it('should display theme descriptions', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Moon in your 4th house signals a time to retreat/i)).toBeInTheDocument();
      expect(screen.getByText(/Venus aspecting your Moon, artistic endeavors are favored/i)).toBeInTheDocument();
      expect(screen.getByText(/Domestic matters take center stage/i)).toBeInTheDocument();
    });

    it('should display Dominant badge on dominant theme', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Dominant')).toBeInTheDocument();
    });
  });

  describe('Life Areas Impact Section', () => {
    it('should render Life Areas Impact header', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Life Areas Impact')).toBeInTheDocument();
    });

    it('should display all life area cards', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Relationships')).toBeInTheDocument();
      expect(screen.getByText('Career')).toBeInTheDocument();
      expect(screen.getByText('Finances')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Spirituality')).toBeInTheDocument();
      expect(screen.getByText('Creativity')).toBeInTheDocument();
    });
  });

  describe('Past Returns Timeline', () => {
    it('should render Past Returns header', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Past Returns')).toBeInTheDocument();
    });

    it('should render View All History link', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('View All History')).toBeInTheDocument();
    });
  });

  describe('Recommended Rituals Section', () => {
    it('should render Recommended Rituals header', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Recommended Rituals')).toBeInTheDocument();
    });

    it('should display ritual items', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Salt Bath Cleansing')).toBeInTheDocument();
      expect(screen.getByText('Dream Journaling')).toBeInTheDocument();
    });

    it('should display ritual descriptions', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText(/Epsom salts and lavender to purify/i)).toBeInTheDocument();
      expect(screen.getByText(/Keep a notebook by your bed/i)).toBeInTheDocument();
    });

    it('should render View Ritual Guide button', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('View Ritual Guide')).toBeInTheDocument();
    });
  });

  describe('Journal Prompts Section', () => {
    it('should render Reflections header', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('Reflections')).toBeInTheDocument();
    });

    it('should display journal prompts', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('What emotions have surfaced recently?')).toBeInTheDocument();
      expect(screen.getByText('Where do you feel most at home?')).toBeInTheDocument();
      expect(screen.getByText('One intention for this cycle:')).toBeInTheDocument();
    });

    it('should have input fields for journal entries', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LunarReturnsPage));

      const inputs = screen.getAllByPlaceholderText('Type your thoughts...');
      expect(inputs.length).toBe(3);

      // Type in first input
      await user.type(inputs[0], 'Feeling peaceful');
      expect(inputs[0]).toHaveValue('Feeling peaceful');
    });
  });

  describe('Accessibility', () => {
    it('should have proper document structure', () => {
      renderWithProviders(createElement(LunarReturnsPage));
      // Check for semantic elements
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
