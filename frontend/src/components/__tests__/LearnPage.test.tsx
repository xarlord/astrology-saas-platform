/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import LearnPage from '../../pages/LearnPage';

// Mock the store so AppLayout's useAuth doesn't crash
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
  useChartsStore: vi.fn(() => ({
    charts: [],
    currentChart: null,
    pagination: null,
    fetchCharts: vi.fn(),
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

describe('LearnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<LearnPage />);
      // Use getAllByText since sidebar may also contain "Learn Astrology"
      expect(screen.getAllByText('Learn Astrology').length).toBeGreaterThanOrEqual(1);
    });

    it('shows The Planets section', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('The Planets')).toBeInTheDocument();
      expect(screen.getByText('The celestial bodies that shape your chart')).toBeInTheDocument();
    });

    it('shows all planet cards', () => {
      renderWithProviders(<LearnPage />);
      // Use getAllByText since some planet names appear in multiple places (sidebar, etc.)
      expect(screen.getAllByText(/Sun/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Moon/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Mercury/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Venus/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Mars/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Jupiter/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Saturn/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Uranus/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Neptune/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Pluto/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows The Zodiac Signs section', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('The Zodiac Signs')).toBeInTheDocument();
      expect(screen.getByText('Twelve archetypes of expression')).toBeInTheDocument();
    });

    it('shows all zodiac sign cards', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getAllByText(/Aries/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Taurus/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Gemini/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Cancer/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Leo/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Virgo/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Libra/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Scorpio/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Sagittarius/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Capricorn/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Aquarius/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Pisces/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows The Houses section', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('The Houses')).toBeInTheDocument();
      expect(screen.getByText('Twelve domains of life experience')).toBeInTheDocument();
    });

    it('shows house cards', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getAllByText(/House 1 - Self/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/House 12 - Spirit/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows The Aspects section', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getByText('The Aspects')).toBeInTheDocument();
      expect(screen.getByText('Angular relationships between planets')).toBeInTheDocument();
    });

    it('shows all aspect cards', () => {
      renderWithProviders(<LearnPage />);
      expect(screen.getAllByText(/Conjunction/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Opposition/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Trine/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Square/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Sextile/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ExpandableCard interactions', () => {
    it('shows planet description when card is expanded', () => {
      renderWithProviders(<LearnPage />);
      const allSunElements = screen.getAllByText(/Sun/);
      const expandButton = allSunElements[0].closest('button');
      expect(expandButton).toBeInTheDocument();
      fireEvent.click(expandButton!);
      expect(screen.getByText(/Core identity, ego, vitality/)).toBeInTheDocument();
    });

    it('toggles aria-expanded when card is clicked', () => {
      renderWithProviders(<LearnPage />);
      const allMarsElements = screen.getAllByText(/Mars/);
      const expandButton = allMarsElements[0].closest('button');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(expandButton!);
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(expandButton!);
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows sign element badges when zodiac sign cards are expanded', () => {
      renderWithProviders(<LearnPage />);
      const allAriesElements = screen.getAllByText(/Aries/);
      const expandButton = allAriesElements[0].closest('button');
      fireEvent.click(expandButton!);
      expect(screen.getAllByText('Fire').length).toBeGreaterThanOrEqual(1);
    });

    it('shows aspect nature badges when aspect cards are expanded', () => {
      renderWithProviders(<LearnPage />);
      const allTrineElements = screen.getAllByText(/Trine/);
      const expandButton = allTrineElements[0].closest('button');
      fireEvent.click(expandButton!);
      expect(screen.getAllByText('Harmonious').length).toBeGreaterThanOrEqual(1);
    });

    it('shows house descriptions when house cards are expanded', () => {
      renderWithProviders(<LearnPage />);
      const allHouse1Elements = screen.getAllByText(/House 1 - Self/);
      const expandButton = allHouse1Elements[0].closest('button');
      fireEvent.click(expandButton!);
      expect(screen.getByText(/Your outward personality/)).toBeInTheDocument();
    });
  });
});
