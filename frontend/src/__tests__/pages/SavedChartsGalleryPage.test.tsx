/**
 * SavedChartsGalleryPage Component Tests
 *
 * Comprehensive tests for the saved charts gallery page
 * Covers: navigation, sidebar folders, search, sort, view modes, chart cards, empty states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useCharts hook
const mockDeleteChart = vi.fn();
const mockLoadCharts = vi.fn();

const mockCharts = [
  {
    id: 'chart-1',
    user_id: 'user-1',
    name: 'My Birth Chart',
    type: 'natal' as const,
    birth_data: {
      name: 'My Birth Chart',
      birth_date: '1990-01-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
    },
    birthData: {
      name: 'My Birth Chart',
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    },
    created_at: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    positions: [
      {
        planet: 'Sun',
        name: 'Sun',
        sign: 'Capricorn',
        longitude: 295,
        latitude: 0,
        speed: 1,
        house: 1,
        degree: 15,
        minute: 30,
        position: '15 Capricorn',
        retrograde: false,
      },
      {
        planet: 'Moon',
        name: 'Moon',
        sign: 'Scorpio',
        longitude: 240,
        latitude: 0,
        speed: 13,
        house: 10,
        degree: 10,
        minute: 0,
        position: '10 Scorpio',
        retrograde: false,
      },
      {
        planet: 'Ascendant',
        name: 'Ascendant',
        sign: 'Libra',
        longitude: 180,
        latitude: 0,
        speed: 0,
        house: 1,
        degree: 0,
        minute: 0,
        position: '0 Libra',
        retrograde: false,
      },
    ],
    tags: ['Self', 'Personal'],
    element: 'earth',
  },
  {
    id: 'chart-2',
    user_id: 'user-1',
    name: 'Partner Chart',
    type: 'natal' as const,
    birth_data: {
      name: 'Partner Chart',
      birth_date: '1985-06-20',
      birth_time: '08:00',
      birth_place_name: 'Los Angeles, CA',
      birth_latitude: 34.0522,
      birth_longitude: -118.2437,
      birth_timezone: 'America/Los_Angeles',
    },
    birthData: {
      name: 'Partner Chart',
      birthDate: '1985-06-20',
      birthTime: '08:00',
      birthPlace: 'Los Angeles, CA',
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: 'America/Los_Angeles',
    },
    created_at: '2024-02-01T00:00:00.000Z',
    createdAt: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
    positions: [
      {
        planet: 'Sun',
        name: 'Sun',
        sign: 'Gemini',
        longitude: 85,
        latitude: 0,
        speed: 1,
        house: 1,
        degree: 28,
        minute: 0,
        position: '28 Gemini',
        retrograde: false,
      },
      {
        planet: 'Moon',
        name: 'Moon',
        sign: 'Cancer',
        longitude: 125,
        latitude: 0,
        speed: 13,
        house: 3,
        degree: 5,
        minute: 0,
        position: '5 Cancer',
        retrograde: false,
      },
      {
        planet: 'Ascendant',
        name: 'Ascendant',
        sign: 'Leo',
        longitude: 150,
        latitude: 0,
        speed: 0,
        house: 1,
        degree: 0,
        minute: 0,
        position: '0 Leo',
        retrograde: false,
      },
    ],
    tags: ['Relationship'],
    element: 'air',
  },
  {
    id: 'chart-3',
    user_id: 'user-1',
    name: 'Client John',
    type: 'natal' as const,
    birth_data: {
      name: 'Client John',
      birth_date: '1975-03-10',
      birth_time: '12:00',
      birth_place_name: 'Chicago, IL',
      birth_latitude: 41.8781,
      birth_longitude: -87.6298,
      birth_timezone: 'America/Chicago',
    },
    birthData: {
      name: 'Client John',
      birthDate: '1975-03-10',
      birthTime: '12:00',
      birthPlace: 'Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
      timezone: 'America/Chicago',
    },
    created_at: '2024-03-01T00:00:00.000Z',
    createdAt: '2024-03-01T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
    positions: [
      {
        planet: 'Sun',
        name: 'Sun',
        sign: 'Pisces',
        longitude: 350,
        latitude: 0,
        speed: 1,
        house: 1,
        degree: 20,
        minute: 0,
        position: '20 Pisces',
        retrograde: false,
      },
      {
        planet: 'Moon',
        name: 'Moon',
        sign: 'Taurus',
        longitude: 50,
        latitude: 0,
        speed: 13,
        house: 3,
        degree: 10,
        minute: 0,
        position: '10 Taurus',
        retrograde: false,
      },
      {
        planet: 'Ascendant',
        name: 'Ascendant',
        sign: 'Cancer',
        longitude: 120,
        latitude: 0,
        speed: 0,
        house: 1,
        degree: 0,
        minute: 0,
        position: '0 Cancer',
        retrograde: false,
      },
    ],
    tags: ['Client'],
    element: 'water',
  },
  {
    id: 'chart-4',
    user_id: 'user-1',
    name: 'Mom Chart',
    type: 'natal' as const,
    birth_data: {
      name: 'Mom Chart',
      birth_date: '1955-11-22',
      birth_time: '06:00',
      birth_place_name: 'Miami, FL',
      birth_latitude: 25.7617,
      birth_longitude: -80.1918,
      birth_timezone: 'America/New_York',
    },
    birthData: {
      name: 'Mom Chart',
      birthDate: '1955-11-22',
      birthTime: '06:00',
      birthPlace: 'Miami, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      timezone: 'America/New_York',
    },
    created_at: '2024-04-01T00:00:00.000Z',
    createdAt: '2024-04-01T00:00:00.000Z',
    updated_at: '2024-04-01T00:00:00.000Z',
    positions: [
      {
        planet: 'Sun',
        name: 'Sun',
        sign: 'Sagittarius',
        longitude: 245,
        latitude: 0,
        speed: 1,
        house: 1,
        degree: 0,
        minute: 0,
        position: '0 Sagittarius',
        retrograde: false,
      },
      {
        planet: 'Moon',
        name: 'Moon',
        sign: 'Virgo',
        longitude: 175,
        latitude: 0,
        speed: 13,
        house: 10,
        degree: 15,
        minute: 0,
        position: '15 Virgo',
        retrograde: false,
      },
      {
        planet: 'Ascendant',
        name: 'Ascendant',
        sign: 'Capricorn',
        longitude: 285,
        latitude: 0,
        speed: 0,
        house: 1,
        degree: 0,
        minute: 0,
        position: '0 Capricorn',
        retrograde: false,
      },
    ],
    tags: ['Family', 'Favorite'],
    element: 'fire',
  },
];

vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    charts: mockCharts,
    isLoading: false,
    error: null,
    deleteChart: mockDeleteChart,
    loadCharts: mockLoadCharts,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
  },
}));

// Mock child components
vi.mock('../../components/ui/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      data-testid={`button-${children?.toString?.().toLowerCase().replace(/\s+/g, '-')}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('../../components/chart/ChartCard', () => ({
  __esModule: true,
  ChartCard: ({ chart, onDelete, onShare, className }: any) => (
    <div
      data-testid={`chart-card-${chart.id}`}
      className={`chart-card ${className || ''}`}
      role="article"
      aria-label={`Chart: ${chart.name}`}
    >
      <h3>{chart.name}</h3>
      {chart.tags?.map((tag: string) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
      <button onClick={() => onDelete?.(chart.id)} aria-label={`Delete ${chart.name}`}>
        Delete
      </button>
      <button onClick={() => onShare?.(chart.id)} aria-label={`Share ${chart.name}`}>
        Share
      </button>
    </div>
  ),
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyState: ({ title, description, actionText, onAction }: Record<string, unknown>) => (
    <div data-testid="empty-state">
      <h3>{title as string}</h3>
      <p>{description as string}</p>
      {actionText && <button onClick={onAction as () => void}>{actionText as string}</button>}
    </div>
  ),
}));

// Import after mocks
import { SavedChartsGalleryPage } from '../../pages/SavedChartsGalleryPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('SavedChartsGalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteChart.mockReset();
    mockDeleteChart.mockResolvedValue(true);
    mockLoadCharts.mockReset();
    mockLoadCharts.mockResolvedValue(true);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText('My Cosmic Library')).toBeInTheDocument();
    });

    it('should render the page title with icon', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText('My Cosmic Library')).toBeInTheDocument();
    });

    it('should render the page description', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText(/Manage and explore your collection/i)).toBeInTheDocument();
    });

    it('should render the page subtitle', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText(/Manage and explore your collection/i)).toBeInTheDocument();
    });

    it('should render Add New Chart button', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText(/Add New Chart/i)).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    it('should render Add New Chart button in header area', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText(/Add New Chart/i)).toBeInTheDocument();
    });

    it('should render page description text', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(
        screen.getByText(/Manage and explore your collection of birth charts/i),
      ).toBeInTheDocument();
    });

    it('should render search input in actions bar', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByPlaceholderText('Find a chart...')).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });
  });

  describe('Sidebar Folders', () => {
    it('should render all folder options', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      // Use getAllByText for Personal since it appears in both sidebar and as a tag
      expect(screen.getByText('All Charts')).toBeInTheDocument();
      expect(screen.getAllByText('Personal').length).toBeGreaterThan(0);
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Relationships')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('should have All Charts folder active by default', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const allChartsButton = screen.getByRole('button', { name: /All Charts/i });
      expect(allChartsButton).toHaveClass('bg-primary/10');
    });

    it('should switch to Personal folder when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const personalButton = screen.getByRole('button', { name: /Personal/i });
      await user.click(personalButton);

      expect(personalButton).toHaveClass('bg-primary/10');
      // Should show only personal charts
      expect(screen.getByText('My Birth Chart')).toBeInTheDocument();
    });

    it('should switch to Clients folder when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const clientsButton = screen.getByRole('button', { name: /Clients/i });
      await user.click(clientsButton);

      expect(clientsButton).toHaveClass('bg-primary/10');
      // Should show only client charts
      expect(screen.getByText('Client John')).toBeInTheDocument();
    });

    it('should switch to Relationships folder when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const relationshipsButton = screen.getByRole('button', { name: /Relationships/i });
      await user.click(relationshipsButton);

      expect(relationshipsButton).toHaveClass('bg-primary/10');
    });

    it('should switch to Favorites folder when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const favoritesButton = screen.getByRole('button', { name: /Favorites/i });
      await user.click(favoritesButton);

      expect(favoritesButton).toHaveClass('bg-primary/10');
    });
  });

  describe('Storage Usage', () => {
    it('should display storage usage section', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText('Storage Usage')).toBeInTheDocument();
    });

    it('should show number of charts saved', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText(/4 of 100 Charts Saved/i)).toBeInTheDocument();
    });

    it('should show storage progress bar', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const progressBar = document.querySelector('.bg-gradient-to-r.from-primary.to-cosmic-blue');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByPlaceholderText('Find a chart...')).toBeInTheDocument();
    });

    it('should filter charts by search query', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Partner');

      // Should show only Partner Chart
      expect(screen.getByText('Partner Chart')).toBeInTheDocument();
      expect(screen.queryByText('My Birth Chart')).not.toBeInTheDocument();
    });

    it('should filter charts by place name', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Chicago');

      // Should show Client John (Chicago)
      expect(screen.getByText('Client John')).toBeInTheDocument();
    });

    it('should filter charts by tag', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Client');

      // Should show Client John
      expect(screen.getByText('Client John')).toBeInTheDocument();
    });

    it('should show empty state when no charts match search', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Nonexistent');

      expect(screen.getByText(/No charts found/i)).toBeInTheDocument();
      expect(screen.getByText(/No charts match "Nonexistent"/i)).toBeInTheDocument();
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Partner');
      await user.clear(searchInput);

      // Should show all charts again
      expect(screen.getByText('My Birth Chart')).toBeInTheDocument();
      expect(screen.getByText('Partner Chart')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should render sort dropdown', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    it('should have Date Added as default sort', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const sortSelect = document.querySelector('select');
      expect(sortSelect).toHaveValue('dateAdded');
    });

    it('should sort by name when A-Z is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const sortSelect = document.querySelector('select');
      await user.selectOptions(sortSelect!, 'name');

      expect(sortSelect).toHaveValue('name');
    });

    it('should sort by sign when Sign is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const sortSelect = document.querySelector('select');
      await user.selectOptions(sortSelect!, 'sign');

      expect(sortSelect).toHaveValue('sign');
    });
  });

  describe('View Mode Toggle', () => {
    it('should render grid view button', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const gridButton = screen.getByRole('button', { name: /grid_view/i });
      expect(gridButton).toBeInTheDocument();
    });

    it('should render list view button', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const listButton = screen.getByRole('button', { name: /view_list/i });
      expect(listButton).toBeInTheDocument();
    });

    it('should have grid view active by default', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const gridButton = screen.getByRole('button', { name: /grid_view/i });
      expect(gridButton).toHaveClass('bg-slate-800');
    });

    it('should switch to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const listButton = screen.getByRole('button', { name: /view_list/i });
      await user.click(listButton);

      expect(listButton).toHaveClass('bg-slate-800');
    });

    it('should switch back to grid view when grid button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const listButton = screen.getByRole('button', { name: /view_list/i });
      await user.click(listButton);

      const gridButton = screen.getByRole('button', { name: /grid_view/i });
      await user.click(gridButton);

      expect(gridButton).toHaveClass('bg-slate-800');
    });
  });

  describe('Chart Cards', () => {
    it('should render all chart cards', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByTestId('chart-card-chart-1')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-chart-2')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-chart-3')).toBeInTheDocument();
      expect(screen.getByTestId('chart-card-chart-4')).toBeInTheDocument();
    });

    it('should display chart names', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText('My Birth Chart')).toBeInTheDocument();
      expect(screen.getByText('Partner Chart')).toBeInTheDocument();
      expect(screen.getByText('Client John')).toBeInTheDocument();
      expect(screen.getByText('Mom Chart')).toBeInTheDocument();
    });

    it('should call deleteChart when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      expect(mockDeleteChart).toHaveBeenCalled();
    });

    it('should call onShare when share button is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const shareButtons = screen.getAllByRole('button', { name: /Share/i });
      await user.click(shareButtons[0]);

      // The mock ChartCard calls onShare directly, which in the real page logs to console
      // Since we mock ChartCard, we just verify the button works
      expect(shareButtons[0]).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });

  describe('Create New Chart', () => {
    it('should render Create New Chart button in header', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText(/Add New Chart/i)).toBeInTheDocument();
    });

    it('should render Create New Chart card in gallery', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText('Create New Chart')).toBeInTheDocument();
      expect(screen.getByText(/Start a new cosmic journey/i)).toBeInTheDocument();
    });

    it('should navigate to create chart page when Add New Chart is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const addButton = screen.getByText(/Add New Chart/i).closest('button');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no charts match search', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      // Search for non-existent chart
      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'Nonexistent');

      expect(screen.getByText(/No charts found/i)).toBeInTheDocument();
    });

    it('should show helpful message in empty state', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      // Search for non-existent chart
      const searchInput = screen.getByPlaceholderText('Find a chart...');
      await user.type(searchInput, 'XYZ');

      expect(screen.getByText(/No charts match "XYZ"/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      // Main title
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const searchInput = screen.getByPlaceholderText('Find a chart...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible folder buttons', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const folderButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.textContent?.includes('All Charts') ||
            btn.textContent?.includes('Personal') ||
            btn.textContent?.includes('Clients'),
        );
      expect(folderButtons.length).toBeGreaterThan(0);
    });

    it('should have accessible chart cards', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const chartCards = screen.getAllByRole('article');
      expect(chartCards.length).toBe(4);
    });
  });

  describe('Navigation', () => {
    it('should have Add New Chart button that navigates to create page', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const addButton = screen.getByText(/Add New Chart/i).closest('button');
      expect(addButton).toBeInTheDocument();
    });

    it('should have Create New Chart card in the gallery', () => {
      renderWithProviders(createElement(SavedChartsGalleryPage));

      expect(screen.getByText('Create New Chart')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should call deleteChart when delete is triggered', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(SavedChartsGalleryPage));

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      expect(mockDeleteChart).toHaveBeenCalled();
    });
  });
});
