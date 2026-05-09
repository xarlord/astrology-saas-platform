/**
 * Tests for ChartBirthAnimation component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartBirthAnimation } from '../ChartBirthAnimation';
import type { ChartData } from '../../astrology/ChartWheel';

const mockChartData: ChartData = {
  planets: [
    { name: 'Sun', symbol: '☉', degree: 49, minute: 12, sign: 'Taurus', house: 1, retrograde: false, element: 'earth' },
    { name: 'Moon', symbol: '☽', degree: 196, minute: 30, sign: 'Libra', house: 6, retrograde: false, element: 'air' },
    { name: 'Mercury', symbol: '☿', degree: 43, minute: 5, sign: 'Taurus', house: 1, retrograde: false, element: 'earth' },
  ],
  aspects: [
    { id: '1', planet1: 'Sun', planet2: 'Moon', type: 'trine' as const, degree: 147, orb: 2, applying: false },
  ],
  houses: [
    { number: 1, cuspDegree: 0, cuspMinute: 0, sign: 'Aries' },
    { number: 2, cuspDegree: 30, cuspMinute: 0, sign: 'Taurus' },
  ],
  angles: {
    ascendant: { degree: 0, sign: 'Aries' },
    midheaven: { degree: 90, sign: 'Cancer' },
    descendant: { degree: 180, sign: 'Libra' },
    ic: { degree: 270, sign: 'Capricorn' },
  },
};

describe('ChartBirthAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children content', () => {
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={false}>
        <div data-testid="child">Chart Content</div>
      </ChartBirthAnimation>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('starts in idle phase when trigger is false', () => {
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={false}>
        <div>Chart</div>
      </ChartBirthAnimation>,
    );
    const wrapper = screen.getByTestId('chart-birth-animation');
    expect(wrapper).toBeInTheDocument();
  });

  it('transitions through spiral → aspects → settle when triggered', () => {
    const onComplete = vi.fn();
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={true} onComplete={onComplete}>
        <div>Chart</div>
      </ChartBirthAnimation>,
    );

    // Should start animation (spiral phase)
    const container = screen.getByTestId('chart-birth-animation');
    expect(container).toBeInTheDocument();

    // Advance through spiral phase (1200ms)
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Advance through aspects phase (800ms)
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Advance through settle phase (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('shows planet count indicator during spiral phase', () => {
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={true}>
        <div>Chart</div>
      </ChartBirthAnimation>,
    );

    // Flush the initial state update (trigger → spiral)
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // During spiral phase, should show planet count with correct number
    const indicator = screen.getByText('3 planets');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-purple-400/70');
  });

  it('calls onComplete when animation finishes', () => {
    const onComplete = vi.fn();
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={true} onComplete={onComplete}>
        <div>Chart</div>
      </ChartBirthAnimation>,
    );

    // Advance through all phases
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('accepts custom duration', () => {
    const onComplete = vi.fn();
    render(
      <ChartBirthAnimation chartData={mockChartData} trigger={true} onComplete={onComplete} duration={500}>
        <div>Chart</div>
      </ChartBirthAnimation>,
    );

    // Custom spiral duration is 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be in aspects phase now (not complete yet)
    expect(onComplete).not.toHaveBeenCalled();

    // Advance through remaining phases
    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
