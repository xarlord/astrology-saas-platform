/**
 * TimeTravelSlider Component Tests
 *
 * Tests for the time-travel transit slider that scrubs through dates
 * showing planetary movements in real-time.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import TimeTravelSlider from '../TimeTravelSlider';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    input: ({ children, ...props }: any) => createElement('input', props, children),
  },
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
  }),
  useTransform: (_: any, __: any, fn: (v: number) => any) => fn(0),
  AnimatePresence: ({ children }: any) => children,
}));

const mockOnDateChange = vi.fn();
const mockChartId = 'test-chart-123';

const defaultProps = {
  chartId: mockChartId,
  onDateChange: mockOnDateChange,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

describe('TimeTravelSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the slider component', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByTestId('time-travel-slider')).toBeInTheDocument();
    });

    it('should render a date range input', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should display the currently selected date', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByTestId('selected-date')).toBeInTheDocument();
    });

    it('should show "Now" button to jump to today', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByText('Now')).toBeInTheDocument();
    });

    it('should display month markers on the timeline', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      // Should have month tick marks
      const ticks = document.querySelectorAll('[data-testid="time-travel-slider"] .absolute.top-1\\/2');
      expect(ticks.length).toBeGreaterThan(0);
    });
  });

  describe('Interaction', () => {
    it('should call onDateChange when slider value changes', async () => {
      render(createElement(TimeTravelSlider, defaultProps));
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });
      // Wait for debounce (150ms)
      await waitFor(() => {
        expect(mockOnDateChange).toHaveBeenCalled();
      }, { timeout: 300 });
    });

    it('should update selected date when slider moves', async () => {
      render(createElement(TimeTravelSlider, defaultProps));
      const slider = screen.getByRole('slider');
      // Move slider to roughly mid-year
      fireEvent.change(slider, { target: { value: '50' } });
      // The date should have changed from the default
      await waitFor(() => {
        expect(mockOnDateChange).toHaveBeenCalledTimes(1);
      }, { timeout: 300 });
    });

    it('should jump to today when "Now" button clicked', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      const nowButton = screen.getByText('Now');
      fireEvent.click(nowButton);
      const today = new Date().toISOString().split('T')[0];
      expect(mockOnDateChange).toHaveBeenCalledWith(today);
    });
  });

  describe('Date Calculations', () => {
    it('should calculate date range from props', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      const slider = screen.getByRole('slider') as HTMLInputElement;
      // Slider min/max should match date range in days
      expect(slider.min).toBe('0');
      const totalDays = Math.ceil(
        (new Date(defaultProps.endDate).getTime() - new Date(defaultProps.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      expect(slider.max).toBe(String(totalDays));
    });

    it('should default to today if within range', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      const slider = screen.getByRole('slider') as HTMLInputElement;
      // Default value should correspond to today's offset from startDate
      const today = new Date();
      const start = new Date(defaultProps.startDate);
      const expectedOffset = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(slider.value).toBe(String(Math.max(0, expectedOffset)));
    });
  });

  describe('Speed Control', () => {
    it('should have play/pause button for auto-scrubbing', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByTestId('play-pause-btn')).toBeInTheDocument();
    });

    it('should show speed selector', () => {
      render(createElement(TimeTravelSlider, defaultProps));
      expect(screen.getByTestId('speed-selector')).toBeInTheDocument();
    });
  });
});
