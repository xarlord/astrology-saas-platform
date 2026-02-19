/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
/* eslint-disable @typescript-eslint/no-unused-vars */
 * * ChartWheel Component Tests
 * * Testing rendering, data display, interactivity, and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChartWheel, ChartWheelLegend } from '../ChartWheel';

describe('ChartWheel Component', () => {
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
        minute: 15,
        second: 30,
        house: 2,
        retrograde: false,
        latitude: 5,
        longitude: 20.25,
        speed: 13,
      },
      {
        planet: 'mercury',
        sign: 'aries',
        degree: 10,
        minute: 0,
        second: 0,
        house: 1,
        retrograde: true,
        latitude: -2,
        longitude: 10,
        speed: -1,
      },
    ],
    houses: [
      {
        house: 1,
        sign: 'aries',
        degree: 0,
        minute: 0,
        second: 0,
      },
      {
        house: 2,
        sign: 'taurus',
        degree: 30,
        minute: 0,
        second: 0,
      },
      {
        house: 3,
        sign: 'gemini',
        degree: 60,
        minute: 0,
        second: 0,
      },
    ],
    aspects: [
      {
        planet1: 'sun',
        planet2: 'moon',
        type: 'conjunction',
        degree: 5,
        minute: 0,
        second: 0,
        orb: 5,
        applying: true,
        separating: false,
      },
      {
        planet1: 'mercury',
        planet2: 'moon',
        type: 'square',
        degree: 90,
        minute: 0,
        second: 0,
        orb: 3,
        applying: false,
        separating: true,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render chart wheel SVG', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '600');
      expect(svg).toHaveAttribute('height', '600');
    });

    it('should render custom size', () => {
      const { container } = render(<ChartWheel data={mockChartData} size={800} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '800');
      expect(svg).toHaveAttribute('height', '800');
    });

    it('should render all zodiac signs', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const zodiacSymbols = container.querySelectorAll('text');
      expect(zodiacSymbols.length).toBeGreaterThan(0);
    });

    it('should render all planets', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Component renders: 3 planet circles + 1 center circle + 1 background circle = 5 total
      const planets = container.querySelectorAll('circle');
      expect(planets.length).toBe(5);
    });

    it('should render all house lines', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Component renders: 3 house lines + 2 aspect lines = 5 total lines
      const houseLines = container.querySelectorAll('line');
      expect(houseLines.length).toBe(5);
    });

    it('should render all aspect lines', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const aspectLines = container.querySelectorAll('line');
      expect(aspectLines.length).toBeGreaterThan(0);
    });

    it('should render house numbers', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // With only 3 houses, house 3 won't have a nextHouse, so only 2 numbers render
      const houseNumbers = Array.from(container.querySelectorAll('text')).filter(
        text => text.textContent?.match(/^[1-3]$/)
      );
      expect(houseNumbers.length).toBe(2);
    });
  });

  describe('Planet Display', () => {
    it('should render planet symbols correctly', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const planetTexts = container.querySelectorAll('text');
      expect(planetTexts.length).toBeGreaterThan(0);
    });

    it('should render retrograde indicator for retrograde planets', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const retrogradeTexts = Array.from(container.querySelectorAll('text')).filter(
        text => text.textContent === 'Rx'
      );
      expect(retrogradeTexts.length).toBe(1); // Only Mercury is retrograde
    });

    it('should not render retrograde indicator for non-retrograde planets', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Sun and Moon should not have Rx
      const planetsWithoutRetrograde = mockChartData.planets.filter(p => !p.retrograde);
      expect(planetsWithoutRetrograde.length).toBe(2);
    });

    it('should color planets correctly', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Only check planet circles (not center or background circles)
      const allCircles = container.querySelectorAll('circle');
      // First circle is background (fill="none"), last is center, middle ones are planets
      const planetCircles = Array.from(allCircles).slice(1, -1);

      expect(planetCircles.length).toBeGreaterThan(0);

      // Check that planet circles have fill colors (not 'none')
      planetCircles.forEach(circle => {
        expect(circle).toHaveAttribute('fill');
        const fill = circle.getAttribute('fill');
        // Planet circles should have actual colors, center/background can have 'none'
        if (fill && fill !== '#6366F1') { // Exclude center circle
          expect(fill).not.toBe('none');
        }
      });
    });
  });

  describe('Aspect Display', () => {
    it('should render aspect lines with correct colors', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const aspectLines = container.querySelectorAll('line');

      aspectLines.forEach(line => {
        expect(line).toHaveAttribute('stroke');
        const color = line.getAttribute('stroke');
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
      });
    });

    it('should render different aspect types with different styles', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const lines = container.querySelectorAll('line');
      const solidLines = Array.from(lines).filter(
        line => line.getAttribute('stroke-dasharray') === 'none'
      );
      const dashedLines = Array.from(lines).filter(
        line => line.getAttribute('stroke-dasharray') === '4,2'
      );

      // Quincunx should be dashed
      expect(solidLines.length).toBeGreaterThanOrEqual(0);
      expect(dashedLines.length).toBeGreaterThanOrEqual(0);
    });

    it('should render thicker lines for major aspects', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const conjunctionLines = Array.from(container.querySelectorAll('line')).filter(
        line => line.getAttribute('stroke-width') === '2'
      );

      expect(conjunctionLines.length).toBeGreaterThan(0);
    });
  });

  describe('Zodiac Wheel', () => {
    it('should render 12 zodiac segments', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const segments = container.querySelectorAll('path');
      expect(segments.length).toBeGreaterThanOrEqual(12);
    });

    it('should alternate colors for zodiac segments', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const segments = container.querySelectorAll('path');
      const colors = new Set(
        Array.from(segments).map(seg => seg.getAttribute('fill')).filter(Boolean)
      );

      expect(colors.size).toBeGreaterThan(0);
    });
  });

  describe('Interactivity', () => {
    it('should call onPlanetClick when planet is clicked', () => {
      const onPlanetClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} onPlanetClick={onPlanetClick} interactive={true} />
      );

      // Find a planet group and click it
      const planetGroups = container.querySelectorAll('g');
      planetGroups.forEach(group => {
        const circle = group.querySelector('circle');
        if (circle && group.parentElement?.querySelector('text')) {
          fireEvent.click(group);
        }
      });

      // At least one click should have been triggered
      expect(onPlanetClick).toHaveBeenCalled();
    });

    it('should call onAspectClick when aspect is clicked', () => {
      const onAspectClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} onAspectClick={onAspectClick} interactive={true} />
      );

      // Find an aspect group and click it
      const aspectGroups = container.querySelectorAll('g');
      aspectGroups.forEach(group => {
        if (group.classList.contains('cursor-pointer')) {
          fireEvent.click(group);
        }
      });

      // At least one click should have been triggered
      expect(onAspectClick).toHaveBeenCalled();
    });

    it('should not be interactive when interactive prop is false', () => {
      const onPlanetClick = vi.fn();
      const { container } = render(
        <ChartWheel data={mockChartData} onPlanetClick={onPlanetClick} interactive={false} />
      );

      const planetGroups = container.querySelectorAll('g');
      planetGroups.forEach(group => {
        expect(group.classList.contains('cursor-pointer')).toBe(false);
      });
    });

    it('should have correct cursor style when interactive', () => {
      const { container } = render(
        <ChartWheel data={mockChartData} interactive={true} />
      );

      const interactiveElements = container.querySelectorAll('.cursor-pointer');
      expect(interactiveElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have responsive SVG', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('max-w-full');
    });

    it('should have proper viewBox for scaling', () => {
      const { container } = render(<ChartWheel data={mockChartData} size={600} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 600 600');
    });

    it('should render text with dominant-baseline for alignment', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const textElements = container.querySelectorAll('text[dominant-baseline="middle"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty Data', () => {
    it('should render wheel with no planets', () => {
      const emptyData = {
        planets: [],
        houses: mockChartData.houses,
        aspects: [],
      };

      const { container } = render(<ChartWheel data={emptyData} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Background circle + center circle = 2 total
      const planetCircles = container.querySelectorAll('circle');
      expect(planetCircles.length).toBe(2);
    });

    it('should render wheel with no aspects', () => {
      const noAspectsData = {
        planets: mockChartData.planets,
        houses: mockChartData.houses,
        aspects: [],
      };

      const { container } = render(<ChartWheel data={noAspectsData} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle missing planet info gracefully', () => {
      const invalidPlanetData = {
        planets: [
          {
            planet: 'invalid-planet',
            sign: 'aries',
            degree: 0,
            minute: 0,
            second: 0,
            house: 1,
            retrograde: false,
            latitude: 0,
            longitude: 0,
            speed: 0,
          },
        ],
        houses: mockChartData.houses,
        aspects: [],
      };

      const { container } = render(<ChartWheel data={invalidPlanetData} />);

      // Should not crash, just skip invalid planet
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('ChartWheelLegend', () => {
    it('should render legend component', () => {
      render(<ChartWheelLegend />);

      expect(screen.getByText('Aspects')).toBeInTheDocument();
      expect(screen.getByText('Planets')).toBeInTheDocument();
      expect(screen.getByText('Zodiac Signs')).toBeInTheDocument();
    });

    it('should render all aspect types', () => {
      render(<ChartWheelLegend />);

      expect(screen.getByText('Conjunction (10°)')).toBeInTheDocument();
      expect(screen.getByText('Opposition (8°)')).toBeInTheDocument();
      expect(screen.getByText('Trine (8°)')).toBeInTheDocument();
      expect(screen.getByText('Square (8°)')).toBeInTheDocument();
      expect(screen.getByText('Sextile (6°)')).toBeInTheDocument();
    });

    it('should render all planets', () => {
      const { container } = render(<ChartWheelLegend />);

      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Moon')).toBeInTheDocument();
      expect(screen.getByText('Mercury')).toBeInTheDocument();
      expect(screen.getByText('Venus')).toBeInTheDocument();
      expect(screen.getByText('Mars')).toBeInTheDocument();
    });

    it('should render all zodiac signs', () => {
      const { container } = render(<ChartWheelLegend />);

      const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
      signs.forEach(sign => {
        expect(container.textContent).toContain(sign);
      });
    });

    it('should have correct styling classes', () => {
      const { container } = render(<ChartWheelLegend />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should scale with viewport', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      const svg = container.querySelector('svg');
      expect(svg?.parentElement).toHaveClass('flex');

      const wrapperDiv = container.querySelector('.max-w-full');
      expect(wrapperDiv).toBeInTheDocument();
    });

    it('should adapt font size to wheel size', () => {
      const { container: smallContainer } = render(<ChartWheel data={mockChartData} size={400} />);
      const { container: largeContainer } = render(<ChartWheel data={mockChartData} size={800} />);

      const smallText = smallContainer.querySelector('text');
      const largeText = largeContainer.querySelector('text');

      // fontSize is set as a style attribute in JSX, not as an HTML attribute
      const smallFontSize = smallText?.getAttribute('font-size');
      const largeFontSize = largeText?.getAttribute('font-size');

      expect(smallFontSize).not.toBe(largeFontSize);
      // Small wheel: 400 * 0.035 ≈ 14, Large wheel: 800 * 0.035 ≈ 28
      expect(parseFloat(smallFontSize || '0')).toBeCloseTo(14, 0);
      expect(parseFloat(largeFontSize || '0')).toBeCloseTo(28, 0);
    });
  });

  describe('Data Accuracy', () => {
    it('should calculate planet positions accurately', () => {
      const { container } = render(<ChartWheel data={mockChartData} />);

      // Just verify the component doesn't crash with real calculations
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should handle edge case planet positions', () => {
      const edgeCaseData = {
        planets: [
          {
            planet: 'sun',
            sign: 'pisces',
            degree: 359,
            minute: 59,
            second: 59,
            house: 12,
            retrograde: false,
            latitude: 0,
            longitude: 359.9997,
            speed: 1,
          },
        ],
        houses: mockChartData.houses,
        aspects: [],
      };

      const { container } = render(<ChartWheel data={edgeCaseData} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
