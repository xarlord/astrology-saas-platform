/**
 * LunarReturnsPage Component Tests
 *
 * Comprehensive tests for the lunar returns page
 * Covers: navigation, lunar return display, themes, life areas, rituals, journaling
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

// Mock lunar return API service
vi.mock('../../services/lunarReturn.api', () => ({
  getNextLunarReturn: vi.fn().mockResolvedValue({
    nextReturn: new Date(),
    natalMoon: {
      sign: 'Pisces',
      degree: 15,
      minute: 32,
      second: 0,
    },
  }),
  getLunarReturnHistory: vi.fn().mockResolvedValue({
    returns: [
      {
        id: 'lr-1',
        returnDate: new Date('2026-01-15'),
        theme: 'Emotional Renewal',
        intensity: 72,
        emotionalTheme: 'Intuitive Growth',
        actionAdvice: ['Meditate daily', 'Journal your dreams'],
        keyDates: [],
        predictions: [],
        rituals: [],
        journalPrompts: [],
        createdAt: new Date('2026-01-01'),
      },
      {
        id: 'lr-2',
        returnDate: new Date('2025-12-15'),
        theme: 'Creative Surge',
        intensity: 65,
        emotionalTheme: 'Artistic Inspiration',
        actionAdvice: ['Start a creative project'],
        keyDates: [],
        predictions: [],
        rituals: [],
        journalPrompts: [],
        createdAt: new Date('2025-12-01'),
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  }),
  getLunarMonthForecast: vi.fn().mockResolvedValue({
    userId: 'user-1',
    returnDate: new Date(),
    theme: 'Emotional Renewal & Intuition',
    intensity: 72,
    emotionalTheme: 'Emotional Renewal',
    actionAdvice: ['Focus on self-care', 'Practice meditation'],
    keyDates: [],
    predictions: [
      { category: 'relationships', prediction: 'Good time for connections', likelihood: 80, advice: [] },
      { category: 'career', prediction: 'Creative opportunities arise', likelihood: 60, advice: [] },
    ],
    rituals: [],
    journalPrompts: [],
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

// Helper to render with providers and wait for loading to complete
const renderWithProviders = async (ui: React.ReactElement, initialRoute = '/lunar-returns') => {
  const result = render(ui, { wrapper: createWrapper(initialRoute) });
  // Wait for loading to complete to avoid act warnings
  await waitFor(() => {
    expect(screen.queryByText('Loading lunar return data...')).not.toBeInTheDocument();
  }, { timeout: 5000 });
  return result;
};

describe('LunarReturnsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('lunar-returns-page')).toBeInTheDocument();
    });

    it('should render the page header with correct title', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Lunar Return in Pisces')).toBeInTheDocument();
      });
    });

    it('should render navigation bar', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render nav links', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-lunar-returns')).toBeInTheDocument();
    });
  });

  describe('Navigation Section', () => {
    it('should have dashboard link', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      const dashboardLink = screen.getByTestId('nav-dashboard');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should highlight Lunar Returns nav item', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      const lunarReturnsLink = screen.getByTestId('nav-lunar-returns');
      expect(lunarReturnsLink).toHaveClass('text-white');
    });
  });

  describe('Header Section', () => {
    it('should display current cycle label', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Current Cycle')).toBeInTheDocument();
      });
    });

    it('should display lunar return sign', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/Lunar Return in Pisces/i)).toBeInTheDocument();
      });
    });

    it('should display cycle subtitle', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        // Use getAllByText since the text appears multiple times
        const elements = screen.getAllByText(/Emotional Renewal & Intuition/i);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should render Past Cycles button', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Past Cycles')).toBeInTheDocument();
      });
    });

    it('should render Share Chart button', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Share Chart')).toBeInTheDocument();
      });
    });
  });

  describe('Lunar Return Hero Card', () => {
    it('should display time remaining label', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Time Remaining in Phase')).toBeInTheDocument();
      });
    });

    it('should display cycle progress label', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Cycle Progress')).toBeInTheDocument();
      });
    });

    it('should display moon sign badge', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/Moon in Pisces/i)).toBeInTheDocument();
      });
    });

    it('should display moon phase', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Waxing')).toBeInTheDocument();
      });
    });

    it('should display illumination percentage', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/50% Illumination/i)).toBeInTheDocument();
      });
    });
  });

  describe('Chart Analysis Section', () => {
    it('should render chart analysis title', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Chart Analysis')).toBeInTheDocument();
      });
    });

    it('should display intensity score label', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Intensity Score')).toBeInTheDocument();
      });
    });

    it('should display intensity value', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        // The intensity score 70 appears in multiple places, so we use getAllByText
        const intensityElements = screen.getAllByText(/70/);
        expect(intensityElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/\/100/)).toBeInTheDocument();
      });
    });

    it('should display key placement label', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Key Placement')).toBeInTheDocument();
      });
    });

    it('should display moon degree and minute', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/Pisces 15/)).toBeInTheDocument();
      });
    });

    it('should display house information', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/4th House of Home/i)).toBeInTheDocument();
      });
    });

    it('should display Key Aspects section', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Key Aspects')).toBeInTheDocument();
      });
    });

    it('should display aspect details', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Moon Trine Venus')).toBeInTheDocument();
        expect(screen.getByText('Moon Square Mars')).toBeInTheDocument();
        expect(screen.getByText('Moon Sextile Jupiter')).toBeInTheDocument();
      });
    });

    it('should display aspect types', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Harmony')).toBeInTheDocument();
        expect(screen.getByText('Tension')).toBeInTheDocument();
        expect(screen.getByText('Support')).toBeInTheDocument();
      });
    });
  });

  describe('Forecast Themes Section', () => {
    it('should render forecast themes header', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Forecast Themes')).toBeInTheDocument();
      });
    });

    it('should display theme cards', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        // Check for the emotional theme from the mock API - appears multiple times so use getAllByText
        const elements = screen.getAllByText('Emotional Renewal');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display theme descriptions', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        // Check for theme description - the mock returns 'Emotional Renewal & Intuition' as the theme
        const elements = screen.getAllByText(/Emotional Renewal & Intuition/i);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display Dominant badge on dominant theme', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Dominant')).toBeInTheDocument();
      });
    });
  });

  describe('Life Areas Impact Section', () => {
    it('should render Life Areas Impact header', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Life Areas Impact')).toBeInTheDocument();
      });
    });

    it('should display life area cards', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        // The component uses forecast.predictions when available (only relationships and career in mock)
        // or falls back to default areas. Check for what's actually rendered based on mock data.
        expect(screen.getByText('Relationships')).toBeInTheDocument();
        expect(screen.getByText('Career')).toBeInTheDocument();
      });
    });
  });

  describe('Past Returns Timeline', () => {
    it('should render Past Returns header', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Past Returns')).toBeInTheDocument();
      });
    });

    it('should render View All History link', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('View All History')).toBeInTheDocument();
      });
    });
  });

  describe('Recommended Rituals Section', () => {
    it('should render Recommended Rituals header', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Recommended Rituals')).toBeInTheDocument();
      });
    });

    it('should display ritual items', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Salt Bath Cleansing')).toBeInTheDocument();
        expect(screen.getByText('Dream Journaling')).toBeInTheDocument();
      });
    });

    it('should display ritual descriptions', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText(/Epsom salts and lavender to purify/i)).toBeInTheDocument();
        expect(screen.getByText(/Keep a notebook by your bed/i)).toBeInTheDocument();
      });
    });

    it('should render View Ritual Guide button', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('View Ritual Guide')).toBeInTheDocument();
      });
    });
  });

  describe('Journal Prompts Section', () => {
    it('should render Reflections header', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('Reflections')).toBeInTheDocument();
      });
    });

    it('should display journal prompts', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      await waitFor(() => {
        expect(screen.getByText('What emotions have surfaced recently?')).toBeInTheDocument();
        expect(screen.getByText('Where do you feel most at home?')).toBeInTheDocument();
        expect(screen.getByText('One intention for this cycle:')).toBeInTheDocument();
      });
    });

    it('should have input fields for journal entries', async () => {
      const user = userEvent.setup();
      await renderWithProviders(createElement(LunarReturnsPage));

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('Type your thoughts...');
        expect(inputs.length).toBe(3);
      });

      const inputs = screen.getAllByPlaceholderText('Type your thoughts...');
      // Type in first input
      await user.type(inputs[0], 'Feeling peaceful');
      expect(inputs[0]).toHaveValue('Feeling peaceful');
    });
  });

  describe('Accessibility', () => {
    it('should have proper document structure', async () => {
      await renderWithProviders(createElement(LunarReturnsPage));
      // Check for semantic elements
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
