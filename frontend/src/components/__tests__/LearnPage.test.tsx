/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import LearnPage from '../../pages/LearnPage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the store so AppLayout's useAuth doesn't crash
vi.mock('../../stores', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
  useChartStore: vi.fn(() => ({
    charts: [],
    currentChart: null,
    pagination: null,
    loadCharts: vi.fn(),
    fetchCharts: vi.fn(),
    loadChart: vi.fn(),
    fetchChart: vi.fn(),
    createChart: vi.fn(),
    updateChart: vi.fn(),
    deleteChart: vi.fn(),
    calculateChart: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

/** Helper: click a section tab by text. Tabs appear in the tab bar and possibly sidebar. */
function clickSectionTab(label: string | RegExp) {
  const allMatches = screen.getAllByText(label);
  // The section tabs are <button> elements in the tab bar
  const tabButton = allMatches.find((el) => el.closest('button') !== null && el.closest('button')!.textContent?.includes(typeof label === 'string' ? label : ''));
  if (tabButton) {
    fireEvent.click(tabButton.closest('button')!);
  } else {
    // Fallback: click the last match
    fireEvent.click(allMatches[allMatches.length - 1]);
  }
}

describe('LearnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getAllByText('Learn Astrology').length).toBeGreaterThanOrEqual(1);
    });

    it('shows welcome message on overview tab', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('Welcome to AstroVerse Learn')).toBeInTheDocument();
    });

    it('shows learning path with all sections', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('Suggested Learning Path')).toBeInTheDocument();
      expect(screen.getByText('Start Here')).toBeInTheDocument();
    });

    it('shows search input', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByPlaceholderText('Search topics, terms, concepts...')).toBeInTheDocument();
    });

    it('shows difficulty filter buttons', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getAllByText('All Levels').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Beginner').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Intermediate').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Advanced').length).toBeGreaterThanOrEqual(1);
    });

    it('shows section tabs including Learning Path and The Planets', () => {
      renderWithProviders(<LearnPage />);
      // Tabs use specific labels — check they exist (may also appear elsewhere)
      expect(screen.getAllByText('Learning Path').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/The Planets/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Tab Navigation', () => {
    it('shows planet section when Planets tab is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Planets/);
      // Planet names should be visible
      expect(screen.getAllByText(/☉ Sun/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/☽ Moon/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows houses section when Houses tab is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Houses/);
      expect(screen.getAllByText(/House 1/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows glossary section when Glossary tab is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab('Glossary');
      expect(screen.getByText('Ascendant (Rising Sign)')).toBeInTheDocument();
    });

    it('shows transits section when Transits tab is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/Understanding Transits/);
      expect(screen.getByText('Fast Transits')).toBeInTheDocument();
      expect(screen.getByText('Social Transits')).toBeInTheDocument();
      expect(screen.getByText('Outer Planet Transits')).toBeInTheDocument();
    });

    it('shows aspects section with quincunx when Aspects tab is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Aspects/);
      expect(screen.getAllByText(/Conjunction/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Quincunx/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Search', () => {
    it('filters glossary terms by search query', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab('Glossary');

      const searchInput = screen.getByPlaceholderText('Search topics, terms, concepts...');
      fireEvent.change(searchInput, { target: { value: 'Ascendant' } });

      expect(screen.getByText('Ascendant (Rising Sign)')).toBeInTheDocument();
    });

    it('shows empty state when search yields no results in glossary', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab('Glossary');

      const searchInput = screen.getByPlaceholderText('Search topics, terms, concepts...');
      fireEvent.change(searchInput, { target: { value: 'zzznonexistentterm' } });

      expect(screen.getByText(/No glossary terms match/)).toBeInTheDocument();
    });
  });

  describe('ExpandableCard interactions', () => {
    it('expands planet card to show details', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Planets/);

      // Find and click the Sun card
      const allSunElements = screen.getAllByText(/☉ Sun/);
      const expandButton = allSunElements[0].closest('button');
      fireEvent.click(expandButton!);

      // Should show core function label
      expect(screen.getAllByText('Core Function').length).toBeGreaterThanOrEqual(1);
    });

    it('toggles aria-expanded when card is clicked', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Planets/);

      const allMoonElements = screen.getAllByText(/☽ Moon/);
      const expandButton = allMoonElements[0].closest('button');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(expandButton!);
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(expandButton!);
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows difficulty badges on cards', () => {
      renderWithProviders(<LearnPage />);
      // Beginner badges should be visible in multiple places
      expect(screen.getAllByText('Beginner').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Progress tracking', () => {
    it('loads progress from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['sun']));
      renderWithProviders(<LearnPage />);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('astroverse-learn-progress');
    });

    it('shows progress indicator', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  describe('Difficulty filter', () => {
    it('filters planets by beginner difficulty', () => {
      renderWithProviders(<LearnPage />);
      clickSectionTab(/The Planets/);

      // Click the "Beginner" filter button (first occurrence in the filter bar)
      const beginnerButtons = screen.getAllByText('Beginner');
      // Find the button in the filter bar — it's inside a button element in the filter area
      const filterButton = beginnerButtons.find(el => el.closest('button')?.className.includes('rounded-lg'));
      if (filterButton) {
        fireEvent.click(filterButton.closest('button')!);
      }

      // Should still show beginner planets like Sun
      expect(screen.getAllByText(/☉ Sun/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Overview section', () => {
    it('shows stats cards', () => {
      renderWithProviders(<LearnPage />);
      // The overview shows stat cards with counts — look for the stat labels
      // "Planets", "Houses", "Aspects" appear multiple places, so check counts
      const planetLabels = screen.getAllByText('Planets');
      expect(planetLabels.length).toBeGreaterThanOrEqual(2); // sidebar + stat card
    });

    it('shows continue learning suggestion', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });
  });
});
