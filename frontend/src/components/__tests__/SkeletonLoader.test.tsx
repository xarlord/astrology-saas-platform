/**
 * SkeletonLoader Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonLoader, SkeletonGrid } from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  describe('Rendering', () => {
    it('renders with default card variant', () => {
      const { container } = render(<SkeletonLoader />);
      // Card variant renders a container with rounded-lg and p-6
      expect(container.querySelector('.rounded-lg.p-6')).toBeInTheDocument();
    });

    it('renders list variant', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      // List variant renders rounded-full elements (planet symbols)
      expect(container.querySelector('.rounded-full.w-10.h-10')).toBeInTheDocument();
    });

    it('renders text variant', () => {
      const { container } = render(<SkeletonLoader variant="text" />);
      // Text variant renders animated pulse bars
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders calendar variant', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      // Calendar has a 7-column grid
      expect(container.querySelector('.grid.grid-cols-7')).toBeInTheDocument();
    });

    it('renders chart variant', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      // Chart variant renders two-column grid
      expect(container.querySelector('.grid.lg\\:grid-cols-2')).toBeInTheDocument();
    });

    it('renders multiple skeletons when count is specified', () => {
      const { container } = render(<SkeletonLoader count={3} />);
      // Each card has rounded-lg and p-6
      expect(container.querySelectorAll('.rounded-lg.p-6')).toHaveLength(3);
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonLoader className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="status" attribute', () => {
      const { container } = render(<SkeletonLoader />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('has aria-live="polite" for screen readers', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing loading state', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('contains screen reader only text', () => {
      render(<SkeletonLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Card Skeleton Structure', () => {
    it('renders card header with title and badge', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      // Card header has flex justify-between with two animated bars
      const header = container.querySelector('.flex.justify-between');
      expect(header).toBeInTheDocument();
      // Title bar (w-3/5) and badge bar (w-12)
      expect(header?.querySelector('.w-3\\/5')).toBeInTheDocument();
      expect(header?.querySelector('.w-12')).toBeInTheDocument();
    });

    it('renders card body with lines', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      // Card body has full-width animated lines
      const bodyLines = container.querySelectorAll('.animate-pulse.rounded.w-full.h-4');
      expect(bodyLines.length).toBeGreaterThan(0);
    });

    it('renders card footer with symbols', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      // Card footer has border-t separator and rounded-full symbols
      const footer = container.querySelector('.border-t');
      expect(footer).toBeInTheDocument();
      expect(footer?.querySelectorAll('.rounded-full').length).toBeGreaterThan(0);
    });
  });

  describe('List Skeleton Structure', () => {
    it('renders list item with header', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      // List has rounded-full icons and text bars
      expect(container.querySelector('.animate-pulse.rounded.w-full.h-4')).toBeInTheDocument();
    });

    it('renders large symbols for list items', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      // List variant has multiple rounded-full w-10 h-10 icons
      expect(container.querySelectorAll('.rounded-full.w-10.h-10').length).toBeGreaterThan(0);
    });
  });

  describe('Calendar Skeleton Structure', () => {
    it('renders calendar header with navigation', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      // Calendar has two buttons (prev/next) and a title bar
      const header = container.querySelector('.flex.justify-between');
      expect(header).toBeInTheDocument();
      // Navigation buttons (rounded-md w-24)
      expect(container.querySelectorAll('.rounded-md.w-24').length).toBeGreaterThanOrEqual(2);
    });

    it('renders weekday headers', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      // 7 weekday headers (Sun, Mon, etc.)
      const weekdays = container.querySelectorAll('.grid-cols-7 .text-center');
      expect(weekdays.length).toBe(7);
    });

    it('renders calendar grid with days', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      // 35 day cells in the grid
      const grids = container.querySelectorAll('.grid.grid-cols-7');
      // Second grid is the days grid (first is weekdays)
      expect(grids.length).toBeGreaterThanOrEqual(2);
      // Last grid should have 35 children
      const dayGrid = grids[grids.length - 1];
      expect(dayGrid.children.length).toBe(35);
    });
  });

  describe('Chart Skeleton Structure', () => {
    it('renders chart wheel with circles', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      // Chart has aspect-square container with two nested circles
      expect(container.querySelector('.aspect-square')).toBeInTheDocument();
      // Two concentric circles (w-4/5 and w-3/5)
      expect(container.querySelector('.w-4\\/5')).toBeInTheDocument();
      expect(container.querySelector('.w-3\\/5')).toBeInTheDocument();
    });

    it('renders planetary positions', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      // 5 position rows with border-b
      const positions = container.querySelectorAll('.border-b');
      expect(positions.length).toBeGreaterThan(0);
    });
  });
});

describe('SkeletonGrid', () => {
  it('renders grid container with responsive classes', () => {
    const { container } = render(<SkeletonGrid count={3} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('renders specified number of skeletons', () => {
    const { container } = render(<SkeletonGrid count={5} />);
    expect(container.querySelectorAll('.rounded-lg.p-6')).toHaveLength(5);
  });

  it('renders default 3 skeletons when count not specified', () => {
    const { container } = render(<SkeletonGrid />);
    expect(container.querySelectorAll('.rounded-lg.p-6')).toHaveLength(3);
  });
});
