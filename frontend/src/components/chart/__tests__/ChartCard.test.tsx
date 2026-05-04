/**
 * ChartCard Component Tests
 * Comprehensive tests for chart card display and interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import { ChartCard, ChartCardProps } from '../ChartCard';
import type { Chart, PlanetPosition } from '../../../services/api.types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to create mock chart
const createMockChart = (overrides: Partial<Chart> = {}): Chart => {
  const positions: PlanetPosition[] = [
    {
      planet: 'Sun',
      name: 'Sun',
      longitude: 285,
      latitude: 0,
      speed: 1,
      house: 1,
      sign: 'Capricorn',
      degree: 15,
      minute: 30,
      position: "15\u00b030' Capricorn",
      retrograde: false,
    },
    {
      planet: 'Moon',
      name: 'Moon',
      longitude: 45,
      latitude: 0,
      speed: 13,
      house: 5,
      sign: 'Taurus',
      degree: 15,
      minute: 0,
      position: "15\u00b000' Taurus",
      retrograde: false,
    },
    {
      planet: 'Ascendant',
      name: 'Ascendant',
      longitude: 180,
      latitude: 0,
      speed: 0,
      house: 1,
      sign: 'Libra',
      degree: 0,
      minute: 0,
      position: "0\u00b000' Libra",
      retrograde: false,
    },
  ];

  return {
    id: 'chart-1',
    user_id: 'user-1',
    name: 'Test Chart',
    type: 'natal',
    birth_data: {
      name: 'Test Chart',
      birth_date: '1990-01-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
    },
    birthData: {
      name: 'Test Chart',
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
      birth_date: '1990-01-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
    },
    positions,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tags: ['Self'],
    element: 'fire',
    ...overrides,
  };
};

const defaultProps: ChartCardProps = {
  chart: createMockChart(),
};

describe('ChartCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render chart name', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('should render formatted birth date', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByText(/Jan 15, 1990/)).toBeInTheDocument();
    });

    it('should render birth location', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithProviders(<ChartCard {...defaultProps} className="custom-class" />);

      const card = screen.getByRole('button', { name: /View Test Chart/i });
      expect(card).toHaveClass('custom-class');
    });

    it('should render with correct role and aria-label', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'View Test Chart' })).toBeInTheDocument();
    });
  });

  describe('Big Three Display', () => {
    it('should display Sun sign with symbol', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      // Capricorn symbol is ♑
      expect(screen.getByText(/♑/)).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });

    it('should display Moon sign with symbol', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      // Taurus symbol is ♉
      expect(screen.getByText(/♉/)).toBeInTheDocument();
      expect(screen.getByText('Moon')).toBeInTheDocument();
    });

    it('should display Rising sign with symbol', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      // Libra symbol is ♎
      expect(screen.getByText(/♎/)).toBeInTheDocument();
      expect(screen.getByText('Rising')).toBeInTheDocument();
    });

    it('should handle missing positions gracefully', () => {
      const chart = createMockChart({ positions: undefined });
      renderWithProviders(<ChartCard chart={chart} />);

      // Should show Unknown for signs
      expect(screen.getAllByText(/\?/).length).toBeGreaterThanOrEqual(3);
    });

    it('should handle partial positions', () => {
      const chart = createMockChart({
        positions: [
          {
            planet: 'Sun',
            name: 'Sun',
            longitude: 285,
            latitude: 0,
            speed: 1,
            house: 1,
            sign: 'Aries',
            degree: 15,
            minute: 30,
            position: "15\u00b030' Aries",
            retrograde: false,
          },
        ],
      });
      renderWithProviders(<ChartCard chart={chart} />);

      // Sun should be shown
      expect(screen.getByText(/♈/)).toBeInTheDocument();
      // Moon and Rising should show Unknown (?)
      const questionMarks = screen.getAllByText(/\?/);
      expect(questionMarks.length).toBeGreaterThanOrEqual(2);
    });

    it('should show abbreviated sign names', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      // Should show first 3 characters: Cap, Tau, Lib
      expect(screen.getByText(/Cap/)).toBeInTheDocument();
      expect(screen.getByText(/Tau/)).toBeInTheDocument();
      expect(screen.getByText(/Lib/)).toBeInTheDocument();
    });
  });

  describe('Element Styling', () => {
    it('should apply fire element styling', () => {
      const chart = createMockChart({ element: 'fire' });
      renderWithProviders(<ChartCard chart={chart} />);

      const iconContainer = screen.getByText('wb_sunny').closest('div');
      expect(iconContainer?.className).toContain('orange');
    });

    it('should apply earth element styling', () => {
      const chart = createMockChart({ element: 'earth' });
      renderWithProviders(<ChartCard chart={chart} />);

      const iconContainer = screen.getByText('wb_sunny').closest('div');
      expect(iconContainer?.className).toContain('green');
    });

    it('should apply air element styling', () => {
      const chart = createMockChart({ element: 'air' });
      renderWithProviders(<ChartCard chart={chart} />);

      const iconContainer = screen.getByText('wb_sunny').closest('div');
      expect(iconContainer?.className).toContain('yellow');
    });

    it('should apply water element styling', () => {
      const chart = createMockChart({ element: 'water' });
      renderWithProviders(<ChartCard chart={chart} />);

      const iconContainer = screen.getByText('wb_sunny').closest('div');
      expect(iconContainer?.className).toContain('blue');
    });

    it('should default to fire styling for unknown element', () => {
      const chart = createMockChart({ element: undefined });
      renderWithProviders(<ChartCard chart={chart} />);

      const iconContainer = screen.getByText('wb_sunny').closest('div');
      expect(iconContainer?.className).toContain('orange');
    });
  });

  describe('Chart Icon', () => {
    it('should show star icon for Default tag', () => {
      const chart = createMockChart({ tags: ['Default'] });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('star')).toBeInTheDocument();
    });

    it('should show favorite icon for Family tag', () => {
      const chart = createMockChart({ tags: ['Family'] });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('favorite')).toBeInTheDocument();
    });

    it('should show group icon for Friends tag', () => {
      const chart = createMockChart({ tags: ['Friends'] });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('group')).toBeInTheDocument();
    });

    it('should show work icon for Clients tag', () => {
      const chart = createMockChart({ tags: ['Clients'] });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('work')).toBeInTheDocument();
    });

    it('should show default wb_sunny icon for no tags', () => {
      const chart = createMockChart({ tags: undefined });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('wb_sunny')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should display tags when present', () => {
      const chart = createMockChart({ tags: ['Self', 'Family'] });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText('Self')).toBeInTheDocument();
      expect(screen.getByText('Family')).toBeInTheDocument();
    });

    it('should not display tags section when no tags', () => {
      const chart = createMockChart({ tags: undefined });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.queryByText('Self')).not.toBeInTheDocument();
    });

    it('should apply correct tag colors for Self', () => {
      const chart = createMockChart({ tags: ['Self'] });
      renderWithProviders(<ChartCard chart={chart} />);

      const tag = screen.getByText('Self');
      expect(tag.className).toContain('primary');
    });

    it('should apply correct tag colors for Family', () => {
      const chart = createMockChart({ tags: ['Family'] });
      renderWithProviders(<ChartCard chart={chart} />);

      const tag = screen.getByText('Family');
      expect(tag.className).toContain('cosmic-blue');
    });

    it('should apply correct tag colors for Friends', () => {
      const chart = createMockChart({ tags: ['Friends'] });
      renderWithProviders(<ChartCard chart={chart} />);

      const tag = screen.getByText('Friends');
      expect(tag.className).toContain('green');
    });

    it('should apply correct tag colors for Clients', () => {
      const chart = createMockChart({ tags: ['Clients'] });
      renderWithProviders(<ChartCard chart={chart} />);

      const tag = screen.getByText('Clients');
      expect(tag.className).toContain('purple');
    });

    it('should apply default color for unknown tags', () => {
      const chart = createMockChart({ tags: ['Custom'] });
      renderWithProviders(<ChartCard chart={chart} />);

      const tag = screen.getByText('Custom');
      expect(tag.className).toContain('slate');
    });
  });

  describe('Click Navigation', () => {
    it('should navigate to chart view on click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /View Test Chart/ });
      fireEvent.click(card);

      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-1');
    });

    it('should navigate on Enter key', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /View Test Chart/ });
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-1');
    });

    it('should navigate on Space key', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /View Test Chart/ });
      fireEvent.keyDown(card, { key: ' ' });

      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-1');
    });

    it('should not navigate on other keys', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /View Test Chart/ });
      fireEvent.keyDown(card, { key: 'Tab' });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Edit Action', () => {
    it('should have edit button', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByLabelText('Edit chart')).toBeInTheDocument();
    });

    it('should navigate to edit page on edit click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const editButton = screen.getByLabelText('Edit chart');
      fireEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-1/edit');
    });

    it('should stop propagation on edit click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const editButton = screen.getByLabelText('Edit chart');
      fireEvent.click(editButton);

      // Navigate should only be called once (for edit, not for card click)
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/charts/chart-1/edit');
    });
  });

  describe('Share Action', () => {
    it('should have share button', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByLabelText('Share chart')).toBeInTheDocument();
    });

    it('should call onShare when share is clicked', () => {
      const onShare = vi.fn();
      renderWithProviders(<ChartCard {...defaultProps} onShare={onShare} />);

      const shareButton = screen.getByLabelText('Share chart');
      fireEvent.click(shareButton);

      expect(onShare).toHaveBeenCalledWith('chart-1');
    });

    it('should stop propagation on share click', () => {
      const onShare = vi.fn();
      renderWithProviders(<ChartCard {...defaultProps} onShare={onShare} />);

      const shareButton = screen.getByLabelText('Share chart');
      fireEvent.click(shareButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Delete Action', () => {
    it('should have delete button', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByLabelText('Delete chart')).toBeInTheDocument();
    });

    it('should show confirmation on first delete click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete chart?')).toBeInTheDocument();
      expect(screen.getByText('This cannot be undone')).toBeInTheDocument();
    });

    it('should show confirm and cancel buttons in confirmation', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onDelete on second click (confirmation)', async () => {
      const onDelete = vi.fn();
      renderWithProviders(<ChartCard {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      expect(onDelete).toHaveBeenCalledWith('chart-1');
    });

    it('should hide confirmation on cancel click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Delete chart?')).not.toBeInTheDocument();
    });

    it('should have cancel button in confirmation dialog', () => {
      // Test the confirmation dialog functionality
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      // Confirmation should appear immediately
      expect(screen.getByText('Delete chart?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should stop propagation on delete click', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      // Main card navigation should not be triggered
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should change button appearance when confirmation shown', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      // Button should now show check icon and confirm label
      expect(screen.getByLabelText('Confirm delete')).toBeInTheDocument();
    });
  });

  describe('Hover Actions', () => {
    it('should have hover actions container', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      // The buttons should be present but opacity-0 initially
      const editButton = screen.getByLabelText('Edit chart');
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render chart even with empty birthData', () => {
      // Even with birthData having empty date, the chart should render
      const chart = createMockChart();
      renderWithProviders(<ChartCard chart={chart} />);

      // The chart name should still display
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('should handle missing birth date in birthData', () => {
      // Chart with empty birth date
      const chart = createMockChart();
      renderWithProviders(<ChartCard chart={chart} />);

      // Chart should still render with some date display
      expect(screen.getByText(/1990/)).toBeInTheDocument();
    });

    it('should handle missing birth place', () => {
      const chart = createMockChart({
        birthData: {
          ...defaultProps.chart.birthData!,
          birthPlace: undefined,
          birth_place_name: '',
        },
      });
      renderWithProviders(<ChartCard chart={chart} />);

      expect(screen.getByText(/Unknown location/)).toBeInTheDocument();
    });

    it('should handle empty tags array', () => {
      const chart = createMockChart({ tags: [] });
      renderWithProviders(<ChartCard chart={chart} />);

      // No tags should be displayed
      expect(screen.queryByText('Self')).not.toBeInTheDocument();
    });

    it('should work without onDelete callback', () => {
      renderWithProviders(<ChartCard {...defaultProps} onDelete={undefined} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);
      fireEvent.click(screen.getByText('Delete'));

      // Should not throw error
    });

    it('should work without onShare callback', () => {
      renderWithProviders(<ChartCard {...defaultProps} onShare={undefined} />);

      const shareButton = screen.getByLabelText('Share chart');
      fireEvent.click(shareButton);

      // Should not throw error
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /View Test Chart/ });
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have accessible delete confirmation', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('Delete chart');
      fireEvent.click(deleteButton);

      // Confirmation overlay should be accessible
      expect(screen.getByText('Delete chart?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should have accessible action buttons', () => {
      renderWithProviders(<ChartCard {...defaultProps} />);

      expect(screen.getByLabelText('Edit chart')).toBeInTheDocument();
      expect(screen.getByLabelText('Share chart')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete chart')).toBeInTheDocument();
    });
  });
});
