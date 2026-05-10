/**
 * TransitOverlay Component Tests
 *
 * Tests for the real-time transit overlay that shows current planet positions
 * on an outer ring with conjunction flash animations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import TransitOverlay from '../TransitOverlay';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    circle: ({ children, ...props }: any) => createElement('circle', props, children),
    g: ({ children, ...props }: any) => createElement('g', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockNatalPlanets = [
  { name: 'Sun', longitude: 84.5 },
  { name: 'Moon', longitude: 210.3 },
  { name: 'Venus', longitude: 55.2 },
];

const mockTransitPlanets = [
  { name: 'Mercury', longitude: 83.8, sign: 'Gemini', degree: 23, retrograde: false },
  { name: 'Mars', longitude: 120.5, sign: 'Leo', degree: 0, retrograde: false },
  { name: 'Saturn', longitude: 350.0, sign: 'Pisces', degree: 20, retrograde: true },
];

const defaultProps = {
  size: 400,
  transitPlanets: mockTransitPlanets,
  natalPlanets: mockNatalPlanets,
  conjunctionOrb: 2,
};

describe('TransitOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the overlay SVG group', () => {
      render(createElement(TransitOverlay, defaultProps));
      expect(screen.getByTestId('transit-overlay')).toBeInTheDocument();
    });

    it('should render outer ring circle', () => {
      render(createElement(TransitOverlay, defaultProps));
      expect(screen.getByTestId('transit-outer-ring')).toBeInTheDocument();
    });

    it('should render a transit dot for each transit planet', () => {
      render(createElement(TransitOverlay, defaultProps));
      const dots = screen.getAllByTestId(/^transit-dot-/);
      expect(dots).toHaveLength(mockTransitPlanets.length);
    });

    it('should render transit dots with planet names as aria-labels', () => {
      render(createElement(TransitOverlay, defaultProps));
      expect(screen.getByLabelText('Transit Mercury')).toBeInTheDocument();
      expect(screen.getByLabelText('Transit Mars')).toBeInTheDocument();
    });
  });

  describe('Conjunction Detection', () => {
    it('should detect conjunction when transit is within orb of natal planet', () => {
      // Mercury at 83.8° is within 2° orb of Sun at 84.5°
      render(createElement(TransitOverlay, defaultProps));
      const flashes = screen.getAllByTestId(/^conjunction-flash-/);
      expect(flashes.length).toBeGreaterThanOrEqual(1);
    });

    it('should not flash when no planets within orb', () => {
      const wideOrbPlanets = [
        { name: 'Pluto', longitude: 280.0, sign: 'Capricorn', degree: 10, retrograde: false },
      ];
      render(createElement(TransitOverlay, { ...defaultProps, transitPlanets: wideOrbPlanets }));
      expect(screen.queryByTestId(/^conjunction-flash-/)).not.toBeInTheDocument();
    });

    it('should show retrograde indicator for retrograde transit planets', () => {
      render(createElement(TransitOverlay, defaultProps));
      expect(screen.getByText('℞')).toBeInTheDocument();
    });
  });

  describe('Visual Properties', () => {
    it('should render outer ring as dashed circle', () => {
      render(createElement(TransitOverlay, defaultProps));
      const ring = screen.getByTestId('transit-outer-ring');
      expect(ring.getAttribute('stroke-dasharray')).toBeTruthy();
    });

    it('should render transit dots as semi-transparent', () => {
      render(createElement(TransitOverlay, defaultProps));
      const dot = screen.getByTestId('transit-dot-Mercury');
      const opacity = dot.getAttribute('opacity');
      expect(parseFloat(opacity ?? '1')).toBeLessThan(1);
    });

    it('should apply tooltip title to transit dots', () => {
      render(createElement(TransitOverlay, defaultProps));
      const dot = screen.getByTestId('transit-dot-Mercury');
      const title = dot.querySelector('title');
      expect(title?.textContent).toContain('Mercury');
      expect(title?.textContent).toContain('Gemini');
    });
  });
});
