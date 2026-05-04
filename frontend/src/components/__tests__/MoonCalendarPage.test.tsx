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
import MoonCalendarPage from '../../pages/MoonCalendarPage';

// Mock AppLayout
vi.mock('../../components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock AstrologicalCalendar
vi.mock('../../components/AstrologicalCalendar', () => ({
  __esModule: true,
  default: () => <div data-testid="astrological-calendar">Calendar Component</div>,
}));

describe('MoonCalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<MoonCalendarPage />);
      expect(screen.getByText('Moon Calendar')).toBeInTheDocument();
    });

    it('renders the page description', () => {
      renderWithProviders(<MoonCalendarPage />);
      expect(screen.getByText('Track lunar phases, eclipses, and moon-related events')).toBeInTheDocument();
    });

    it('renders the AstrologicalCalendar component', () => {
      renderWithProviders(<MoonCalendarPage />);
      expect(screen.getByTestId('astrological-calendar')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('has the correct heading hierarchy', () => {
      renderWithProviders(<MoonCalendarPage />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Moon Calendar');
    });

    it('renders within AppLayout', () => {
      const { container } = renderWithProviders(<MoonCalendarPage />);
      // The AppLayout mock wraps children in a div
      expect(container.firstChild).toBeInTheDocument();
    });

    it('has a description paragraph below the heading', () => {
      renderWithProviders(<MoonCalendarPage />);
      const description = screen.getByText('Track lunar phases, eclipses, and moon-related events');
      expect(description.tagName).toBe('P');
    });
  });
});
