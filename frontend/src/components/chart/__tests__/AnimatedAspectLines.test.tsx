/**
 * Tests for AnimatedAspectLines component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedAspectLines } from '../AnimatedAspectLines';
import type { AspectLineData, PlanetPositionData } from '../AnimatedAspectLines';

const mockPlanetPositions: PlanetPositionData[] = [
  { name: 'Sun', x: 250, y: 100 },
  { name: 'Moon', x: 100, y: 300 },
  { name: 'Mars', x: 400, y: 200 },
];

const mockAspects: AspectLineData[] = [
  { id: '1', planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120, orb: 2, applying: false },
  { id: '2', planet1: 'Sun', planet2: 'Mars', type: 'square', degree: 90, orb: 0.5, applying: true },
  { id: '3', planet1: 'Moon', planet2: 'Mars', type: 'sextile', degree: 60, orb: 4, applying: false },
];

describe('AnimatedAspectLines', () => {
  it('renders SVG group with aspect lines', () => {
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={mockAspects}
          planetPositions={mockPlanetPositions}
          size={500}
        />
      </svg>,
    );
    const group = container.querySelector('[data-testid="animated-aspect-lines"]');
    expect(group).toBeInTheDocument();
  });

  it('renders a line for each valid aspect', () => {
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={mockAspects}
          planetPositions={mockPlanetPositions}
          size={500}
        />
      </svg>,
    );
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(3);
  });

  it('skips aspects where planet positions are not found', () => {
    const aspectsWithMissing: AspectLineData[] = [
      { id: '1', planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120, orb: 2, applying: false },
      { id: '2', planet1: 'Sun', planet2: 'Jupiter', type: 'conjunction', degree: 0, orb: 1, applying: true },
    ];
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={aspectsWithMissing}
          planetPositions={mockPlanetPositions}
          size={500}
        />
      </svg>,
    );
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(1);
  });

  it('applies SVG glow filters', () => {
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={mockAspects}
          planetPositions={mockPlanetPositions}
          size={500}
        />
      </svg>,
    );
    const filters = container.querySelectorAll('filter');
    expect(filters.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without animation when animated=false', () => {
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={mockAspects}
          planetPositions={mockPlanetPositions}
          size={500}
          animated={false}
        />
      </svg>,
    );
    const group = container.querySelector('[data-testid="animated-aspect-lines"]');
    expect(group).toBeInTheDocument();
  });

  it('renders empty group for empty aspects', () => {
    const { container } = render(
      <svg>
        <AnimatedAspectLines
          aspects={[]}
          planetPositions={mockPlanetPositions}
          size={500}
        />
      </svg>,
    );
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(0);
  });
});
