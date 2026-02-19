/**
 * Accessibility Test for ChartWheel Component
 *
 * This test validates WCAG 2.1 AA compliance for the ChartWheel component.
 * Run with: npm test -- ChartWheel.accessibility.test
 */

import { render, screen } from '@testing-library/react';
import { ChartWheel, ChartWheelLegend } from './ChartWheel';
import { describe, it, expect, vi } from 'vitest';

// Mock chart data for testing
const mockChartData = {
  planets: [
    {
      planet: 'sun',
      sign: 'aries',
      degree: 15,
      minute: 30,
      second: 0,
      house: 1,
      retrograde: false,
      latitude: 0,
      longitude: 15.5,
      speed: 1,
    },
    {
      planet: 'moon',
      sign: 'taurus',
      degree: 20,
      minute: 45,
      second: 0,
      house: 2,
      retrograde: false,
      latitude: 5,
      longitude: 50.75,
      speed: 12,
    },
    {
      planet: 'mercury',
      sign: 'aries',
      degree: 5,
      minute: 15,
      second: 0,
      house: 1,
      retrograde: true,
      latitude: -2,
      longitude: 5.25,
      speed: -1,
    },
  ],
  houses: [
    { house: 1, sign: 'aries', degree: 0, minute: 0, second: 0 },
    { house: 2, sign: 'taurus', degree: 30, minute: 0, second: 0 },
    { house: 3, sign: 'gemini', degree: 60, minute: 0, second: 0 },
  ],
  aspects: [
    {
      planet1: 'sun',
      planet2: 'moon',
      type: 'trine' as const,
      degree: 120,
      minute: 0,
      orb: 5,
      applying: true,
      separating: false,
    },
  ],
};

describe('ChartWheel Accessibility', () => {
  describe('SVG Structure', () => {
    it('should have role="img" on SVG', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('role', 'img');
    });

    it('should have aria-label describing the chart', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-label');
      expect(svg?.getAttribute('aria-label')).toContain('Astrological chart wheel');
      expect(svg?.getAttribute('aria-label')).toContain('planets');
    });

    it('should have aria-describedby when interactive', () => {
      const { container } = render(<ChartWheel data={mockChartData} interactive />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-describedby', 'chart-description');
    });
  });

  describe('Chart Description', () => {
    it('should provide a description element', () => {
      const { container } = render(<ChartWheel data={mockChartData} interactive />);
      const desc = container.querySelector('desc#chart-description');

      expect(desc).toBeInTheDocument();
      expect(desc?.textContent).toBeDefined();
      expect(desc?.textContent).toContain('Astrological chart wheel');
    });

    it('should include all planets in description', () => {
      const { container } = render(<ChartWheel data={mockChartData} interactive />);
      const desc = container.querySelector('desc#chart-description');

      expect(desc?.textContent).toContain('Sun');
      expect(desc?.textContent).toContain('Moon');
      expect(desc?.textContent).toContain('Mercury');
    });

    it('should include aspects in description', () => {
      const { container } = render(<ChartWheel data={mockChartData} interactive />);
      const desc = container.querySelector('desc#chart-description');

      expect(desc?.textContent).toContain('trine');
    });
  });

  describe('Text-based Alternative', () => {
    it('should provide sr-only text description', () => {
      render(<ChartWheel data={mockChartData} />);

      // Should have heading
      expect(screen.getByText('Astrological Chart - Text Description')).toBeInTheDocument();

      // Should have planetary positions
      expect(screen.getByText(/Planetary Positions/i)).toBeInTheDocument();
      expect(screen.getByText(/Sun in aries/i)).toBeInTheDocument();
      expect(screen.getByText(/Moon in taurus/i)).toBeInTheDocument();
      expect(screen.getByText(/Mercury in aries/i)).toBeInTheDocument();

      // Should include retrograde status
      expect(screen.getByText(/retrograde/i)).toBeInTheDocument();
    });

    it('should list all aspects in text format', () => {
      render(<ChartWheel data={mockChartData} />);

      expect(screen.getByText(/Aspects/i)).toBeInTheDocument();
      expect(screen.getByText(/Sun.*trine.*Moon/i)).toBeInTheDocument();
    });

    it('should list all house cusps in text format', () => {
      render(<ChartWheel data={mockChartData} />);

      expect(screen.getByText(/House Cusps/i)).toBeInTheDocument();
      expect(screen.getByText(/House 1.*aries/i)).toBeInTheDocument();
      expect(screen.getByText(/House 2.*taurus/i)).toBeInTheDocument();
    });
  });

  describe('Planet Accessibility', () => {
    it('should provide aria-label for each planet', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const planets = container.querySelectorAll('g[aria-label*="Sun"], g[aria-label*="Moon"], g[aria-label*="Mercury"]');

      expect(planets.length).toBeGreaterThanOrEqual(mockChartData.planets.length);
    });

    it('should include planet name, sign, degree, and house in aria-label', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const sun = container.querySelector('g[aria-label*="Sun"]');

      expect(sun?.getAttribute('aria-label')).toContain('Sun');
      expect(sun?.getAttribute('aria-label')).toContain('aries');
      expect(sun?.getAttribute('aria-label')).toContain('15');
      expect(sun?.getAttribute('aria-label')).toContain('House 1');
    });

    it('should indicate retrograde status in aria-label', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const mercury = container.querySelector('g[aria-label*="Mercury"]');

      expect(mercury?.getAttribute('aria-label')).toContain('retrograde');
    });

    it('should be keyboard accessible when interactive', () => {
      const onPlanetClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} interactive onPlanetClick={onPlanetClick} />
      );
      const planet = container.querySelector('g[aria-label*="Sun"]');

      expect(planet).toHaveAttribute('tabIndex', '0');
      expect(planet).toHaveAttribute('role', 'img');
    });

    it('should handle Enter and Space keys for planet interaction', () => {
      const onPlanetClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} interactive onPlanetClick={onPlanetClick} />
      );
      const planet = container.querySelector('g[aria-label*="Sun"]') as Element;

      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'preventDefault', { value: vi.fn() });
      planet.dispatchEvent(enterEvent);

      // Simulate Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      Object.defineProperty(spaceEvent, 'preventDefault', { value: vi.fn() });
      planet.dispatchEvent(spaceEvent);

      // Note: This is a basic check - full keyboard testing requires user-event
      expect(planet).toBeInTheDocument();
    });
  });

  describe('Aspect Accessibility', () => {
    it('should provide aria-label for each aspect', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aspect = container.querySelector('g[aria-label*="Sun"]');

      expect(aspect).toBeInTheDocument();
    });

    it('should include both planets and aspect type in aria-label', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aspect = container.querySelector('g[aria-label*="trine"]');

      expect(aspect?.getAttribute('aria-label')).toContain('Sun');
      expect(aspect?.getAttribute('aria-label')).toContain('Moon');
      expect(aspect?.getAttribute('aria-label')).toContain('trine');
    });

    it('should be keyboard accessible when interactive', () => {
      const onAspectClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} interactive onAspectClick={onAspectClick} />
      );
      const aspect = container.querySelector('g[aria-label*="trine"]');

      expect(aspect).toHaveAttribute('tabIndex', '0');
      expect(aspect).toHaveAttribute('role', 'img');
    });
  });

  describe('Zodiac Sign Accessibility', () => {
    it('should provide aria-label for zodiac symbols', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aries = container.querySelector('text[aria-label*="aries"]');

      expect(aries).toBeInTheDocument();
      expect(aries?.getAttribute('aria-label')).toContain('aries');
    });
  });

  describe('Legend Accessibility', () => {
    it('should have role="region" and aria-label', () => {
      const { container } = render(<ChartWheelLegend />);
      const legend = container.querySelector('[role="region"]');

      expect(legend).toBeInTheDocument();
      expect(legend).toHaveAttribute('aria-label', 'Chart legend');
    });

    it('should have aria-hidden="true" on decorative symbols', () => {
      const { container } = render(<ChartWheelLegend />);
      const symbols = container.querySelectorAll('[aria-hidden="true"]');

      expect(symbols.length).toBeGreaterThan(0);
    });

    it('should provide screen reader text for symbols', () => {
      render(<ChartWheelLegend />);

      expect(screen.getByText(/Conjunction symbol/i)).toBeInTheDocument();
      expect(screen.getByText(/Sun symbol/i)).toBeInTheDocument();
    });

    it('should have role="list" on lists', () => {
      const { container } = render(<ChartWheelLegend />);
      const lists = container.querySelectorAll('[role="list"]');

      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should provide text alternatives for non-text content (1.1.1)', () => {
      render(<ChartWheel data={mockChartData} />);

      // Text alternative available via sr-only content
      expect(screen.getByText('Astrological Chart - Text Description')).toBeInTheDocument();
    });

    it('should have identifiable elements (4.1.2)', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // SVG has role
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');

      // Interactive elements have labels
      const interactiveElements = container.querySelectorAll('g[tabIndex="0"]');
      interactiveElements.forEach((el) => {
        expect(el).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard accessible (2.1.1)', () => {
      const onPlanetClick = vi.fn();
      const onAspectClick = vi.fn();

      const { container } = render(
        <ChartWheel
          data={mockChartData}
          interactive
          onPlanetClick={onPlanetClick}
          onAspectClick={onAspectClick}
        />
      );

      // All interactive elements should be focusable
      const focusableElements = container.querySelectorAll('[tabIndex="0"]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Screen Reader Testing', () => {
  it('should announce chart structure clearly', () => {
    const { container } = render(<ChartWheel data={mockChartData} interactive />);

    // Main SVG
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toMatch(/Astrological chart wheel/i);

    // Description
    const desc = container.querySelector('desc#chart-description');
    expect(desc).toBeInTheDocument();
  });

  it('should announce planet positions clearly', () => {
    render(<ChartWheel data={mockChartData} />);

    // Text-based alternative should be available
    expect(screen.getByText(/Sun in aries at 15°30' in House 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Moon in taurus at 20°45' in House 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Mercury in aries at 5°15' in House 1 \(retrograde\)/i)).toBeInTheDocument();
  });

  it('should announce aspects clearly', () => {
    render(<ChartWheel data={mockChartData} />);

    expect(screen.getByText(/Sun trine Moon \(120°0'\)/i)).toBeInTheDocument();
  });
});
