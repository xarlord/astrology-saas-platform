/**
 * Tests for CosmicWeatherWidget component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CosmicWeatherWidget } from '../CosmicWeatherWidget';
import type { TransitInfo } from '../CosmicWeatherWidget';

const mockTransits: TransitInfo[] = [
  { planet1: 'Venus', planet2: 'Jupiter', type: 'trine', harmonious: true, intensity: 8, description: 'Favorable' },
  { planet1: 'Mars', planet2: 'Saturn', type: 'square', harmonious: false, intensity: 6, description: 'Challenging' },
];

describe('CosmicWeatherWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with energy score', () => {
    render(<CosmicWeatherWidget energyScore={85} transits={mockTransits} />);

    const widget = screen.getByTestId('cosmic-weather-widget');
    expect(widget).toBeInTheDocument();

    // Energy score should animate from 0
    const scoreEl = screen.getByTestId('energy-score');
    expect(scoreEl).toBeInTheDocument();
  });

  it('animates energy score counter', () => {
    render(<CosmicWeatherWidget energyScore={75} transits={[]} />);

    // Initially should show 0 or low number
    const scoreEl = screen.getByTestId('energy-score');

    // Advance timers to complete animation
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(scoreEl.textContent).toBe('75');
  });

  it('shows correct energy label for high score', () => {
    render(<CosmicWeatherWidget energyScore={90} transits={[]} />);
    const label = screen.getByTestId('energy-label');
    expect(label).toHaveTextContent('High Vitality');
  });

  it('shows correct energy label for low score', () => {
    render(<CosmicWeatherWidget energyScore={30} transits={[]} />);
    const label = screen.getByTestId('energy-label');
    expect(label).toHaveTextContent('Low Energy');
  });

  it('shows correct energy label for critical score', () => {
    render(<CosmicWeatherWidget energyScore={15} transits={[]} />);
    const label = screen.getByTestId('energy-label');
    expect(label).toHaveTextContent('Critical Period');
  });

  it('displays weather icon based on transit nature', () => {
    const harmoniousTransits: TransitInfo[] = [
      { planet1: 'Venus', planet2: 'Jupiter', type: 'trine', harmonious: true, intensity: 9, description: 'Great' },
      { planet1: 'Sun', planet2: 'Moon', type: 'sextile', harmonious: true, intensity: 7, description: 'Nice' },
    ];
    render(<CosmicWeatherWidget energyScore={80} transits={harmoniousTransits} />);
    const icon = screen.getByTestId('weather-icon');
    expect(icon.textContent).toBe('☀️');
  });

  it('shows stormy icon for challenging transits', () => {
    const challengingTransits: TransitInfo[] = [
      { planet1: 'Mars', planet2: 'Saturn', type: 'square', harmonious: false, intensity: 8, description: 'Hard' },
      { planet1: 'Pluto', planet2: 'Sun', type: 'opposition', harmonious: false, intensity: 9, description: 'Tough' },
    ];
    render(<CosmicWeatherWidget energyScore={30} transits={challengingTransits} />);
    const icon = screen.getByTestId('weather-icon');
    expect(icon.textContent).toBe('⛈️');
  });

  it('shows starry icon when no transits', () => {
    render(<CosmicWeatherWidget energyScore={50} transits={[]} />);
    const icon = screen.getByTestId('weather-icon');
    expect(icon.textContent).toBe('✨');
  });

  it('displays moon phase when provided', () => {
    render(
      <CosmicWeatherWidget
        energyScore={75}
        transits={[]}
        moonPhase="Full Moon"
        moonSign="Scorpio"
      />,
    );
    expect(screen.getByText(/Full Moon in Scorpio/)).toBeInTheDocument();
  });

  it('renders active transits list', () => {
    render(<CosmicWeatherWidget energyScore={75} transits={mockTransits} />);
    expect(screen.getByText(/Venus trine Jupiter/)).toBeInTheDocument();
    expect(screen.getByText(/Mars square Saturn/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CosmicWeatherWidget energyScore={75} transits={[]} className="custom-class" />,
    );
    const widget = container.querySelector('.custom-class');
    expect(widget).toBeInTheDocument();
  });
});
