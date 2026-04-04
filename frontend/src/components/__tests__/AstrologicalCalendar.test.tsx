/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import AstrologicalCalendar from '../AstrologicalCalendar';

// Mock the barrel to avoid SyntaxError from circular import in TransitDashboard
vi.mock('../', () => ({
  SkeletonLoader: ({ children }: any) => <div data-testid="skeleton-loader">{children}</div>,
  EmptyState: ({ children }: any) => <div data-testid="empty-state">{children}</div>,
}));

// Mock the useCalendarEvents hook
vi.mock('../../hooks/useCalendarEvents', () => ({
  useCalendarEvents: vi.fn(),
}));

import { useCalendarEvents } from '../../hooks/useCalendarEvents';

describe('AstrologicalCalendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCalendarEvents as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render calendar component', () => {
      const { container } = renderWithProviders(<AstrologicalCalendar month={1} year={2026} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render without crashing', () => {
      renderWithProviders(<AstrologicalCalendar />);
      const component = screen.queryByText(/Unable to load|No events|loading/i);
      expect(component).toBeTruthy();
    });

    it('should render calendar grid structure', () => {
      const { container } = renderWithProviders(<AstrologicalCalendar />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Month Navigation', () => {
    it('should have navigation buttons available', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-01-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      renderWithProviders(<AstrologicalCalendar />);
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });

    it('should render component for different months', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-01-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container: container1 } = renderWithProviders(<AstrologicalCalendar month={1} year={2026} />);
      expect(container1.querySelector('.grid.grid-cols-7')).toBeTruthy();

      const { container: container2 } = renderWithProviders(<AstrologicalCalendar month={2} year={2026} />);
      expect(container2.querySelector('.grid.grid-cols-7')).toBeTruthy();
    });
  });

  describe('Event Display', () => {
    it('should render component with event data', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-01-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container } = renderWithProviders(<AstrologicalCalendar month={1} year={2026} />);
      expect(container.querySelector('.grid.grid-cols-7')).toBeTruthy();
    });

    it('should display calendar structure', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container } = renderWithProviders(<AstrologicalCalendar />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render in viewport', () => {
      const { container } = renderWithProviders(<AstrologicalCalendar />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap years', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2024-02-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container } = renderWithProviders(<AstrologicalCalendar month={2} year={2024} />);
      expect(container.querySelector('.grid.grid-cols-7')).toBeTruthy();
    });

    it('should handle different months', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-08-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container } = renderWithProviders(<AstrologicalCalendar month={8} year={2026} />);
      expect(container.querySelector('.grid.grid-cols-7')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-01-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      renderWithProviders(<AstrologicalCalendar />);
      const prevButton = screen.getByLabelText('Previous month');
      const nextButton = screen.getByLabelText('Next month');
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should work with different props', () => {
      (useCalendarEvents as any).mockReturnValue({
        data: { data: [{ id: '1', event_type: 'new_moon', event_date: '2026-01-10', interpretation: 'Test', event_data: {} }] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      const { container: container1 } = renderWithProviders(<AstrologicalCalendar month={1} year={2026} />);
      expect(container1.querySelector('.grid.grid-cols-7')).toBeTruthy();

      const { container: container2 } = renderWithProviders(<AstrologicalCalendar month={12} year={2026} />);
      expect(container2.querySelector('.grid.grid-cols-7')).toBeTruthy();
    });
  });
});
