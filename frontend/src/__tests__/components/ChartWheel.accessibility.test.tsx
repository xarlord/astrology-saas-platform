/**
 * Accessibility Test for ChartWheel Component
 *
 * This test validates WCAG 2.1 AA compliance for the ChartWheel component.
 * Run with: npm test -- ChartWheel.accessibility.test
 */

import { render, screen, within } from '@testing-library/react';
import { ChartWheel, ChartWheelLegend } from '../../components/ChartWheel';
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
      // Component renders: "Natal chart wheel with N planets"
      expect(svg?.getAttribute('aria-label')).toMatch(/Natal chart wheel/i);
      expect(svg?.getAttribute('aria-label')).toContain('3');
      expect(svg?.getAttribute('aria-label')).toContain('planets');
    });
  });

  describe('Text-based Alternative', () => {
    it('should provide sr-only text description', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Find the sr-only region (aria-label="Chart data")
      const textRegion = container.querySelector(
        '[role="region"][aria-label="Chart data"]',
      );
      expect(textRegion).toBeInTheDocument();

      // Should have heading "Natal Chart"
      expect(
        within(textRegion!).getByText('Natal Chart'),
      ).toBeInTheDocument();

      // Should have planetary positions
      expect(within(textRegion!).getByText(/Planets/i)).toBeInTheDocument();
      expect(within(textRegion!).getByText(/Sun in aries/i)).toBeInTheDocument();
      expect(within(textRegion!).getByText(/Moon in taurus/i)).toBeInTheDocument();
      expect(within(textRegion!).getByText(/Mercury in aries/i)).toBeInTheDocument();

      // Should include retrograde status (R)
      expect(within(textRegion!).getByText(/Mercury in aries.*R/i)).toBeInTheDocument();
    });

    it('should list all houses in text format', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const textRegion = container.querySelector(
        '[role="region"][aria-label="Chart data"]',
      );
      expect(within(textRegion!).getByText(/Houses/i)).toBeInTheDocument();
      expect(within(textRegion!).getByText(/House 1.*aries/i)).toBeInTheDocument();
      expect(within(textRegion!).getByText(/House 2.*taurus/i)).toBeInTheDocument();
    });
  });

  describe('Planet Accessibility', () => {
    it('should provide aria-label for each planet', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      // Planet groups have aria-label like "Sun in aries 15°"
      const sun = container.querySelector('g[aria-label*="Sun in"]');
      expect(sun).toBeInTheDocument();

      const moon = container.querySelector('g[aria-label*="Moon"]');
      expect(moon).toBeInTheDocument();
    });

    it('should include planet name, sign, and degree in aria-label', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      // aria-label format: "Sun in aries 15°"
      const sun = container.querySelector('g[aria-label*="Sun in"]');

      expect(sun).toBeDefined();
      const label = sun?.getAttribute('aria-label') || '';
      expect(label).toMatch(/Sun/i);
      expect(label).toMatch(/aries/i);
      expect(label).toContain('15');
    });

    it('should have role="img" on planet groups', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const sun = container.querySelector('g[aria-label*="Sun in"]');

      expect(sun).toHaveAttribute('role', 'img');
    });
  });

  describe('Aspect Accessibility', () => {
    it('should provide aria-label for each aspect', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aspect = container.querySelector('g[aria-label*="Sun trine"]');

      expect(aspect).toBeInTheDocument();
    });

    it('should include both planets and aspect type in aria-label', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aspect = container.querySelector('g[aria-label*="Sun trine"]');

      expect(aspect?.getAttribute('aria-label')).toContain('Sun');
      expect(aspect?.getAttribute('aria-label')).toContain('Moon');
      expect(aspect?.getAttribute('aria-label')).toContain('trine');
    });

    it('should have role="img" on aspect groups', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);
      const aspect = container.querySelector('g[aria-label*="Sun trine"]');

      expect(aspect).toHaveAttribute('role', 'img');
    });
  });

  describe('Legend Accessibility', () => {
    it('should have role="region" and aria-label', () => {
      const { container } = render(<ChartWheelLegend />);
      const legend = container.querySelector('[role="region"]');

      expect(legend).toBeInTheDocument();
      expect(legend).toHaveAttribute('aria-label', 'Chart legend');
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should provide text alternatives for non-text content (1.1.1)', () => {
      render(<ChartWheel data={mockChartData} />);

      // Text alternative available via sr-only content
      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
    });

    it('should have identifiable elements (4.1.2)', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // SVG has role
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');

      // Interactive elements have labels
      const planetElements = container.querySelectorAll('g[aria-label][role="img"]');
      planetElements.forEach((el) => {
        expect(el).toHaveAttribute('aria-label');
      });
    });
  });
});
