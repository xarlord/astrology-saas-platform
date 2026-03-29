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
      expect(container.querySelector('.skeleton-card')).toBeInTheDocument();
    });

    it('renders list variant', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      expect(container.querySelector('.skeleton-list')).toBeInTheDocument();
    });

    it('renders text variant', () => {
      const { container } = render(<SkeletonLoader variant="text" />);
      expect(container.querySelector('.skeleton-text')).toBeInTheDocument();
    });

    it('renders calendar variant', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      expect(container.querySelector('.skeleton-calendar')).toBeInTheDocument();
    });

    it('renders chart variant', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      expect(container.querySelector('.skeleton-chart')).toBeInTheDocument();
    });

    it('renders multiple skeletons when count is specified', () => {
      const { container } = render(<SkeletonLoader count={3} />);
      expect(container.querySelectorAll('.skeleton-card')).toHaveLength(3);
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
      expect(container.querySelector('.skeleton-card-header')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-title')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-badge')).toBeInTheDocument();
    });

    it('renders card body with lines', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      expect(container.querySelector('.skeleton-card-body')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-line')).toBeInTheDocument();
    });

    it('renders card footer with symbols', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      expect(container.querySelector('.skeleton-card-footer')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-symbol')).toBeInTheDocument();
    });
  });

  describe('List Skeleton Structure', () => {
    it('renders list item with header', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      expect(container.querySelector('.skeleton-list-item')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-list-header')).toBeInTheDocument();
    });

    it('renders large symbols for list items', () => {
      const { container } = render(<SkeletonLoader variant="list" />);
      expect(container.querySelector('.skeleton-symbol-lg')).toBeInTheDocument();
    });
  });

  describe('Calendar Skeleton Structure', () => {
    it('renders calendar header with navigation', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      expect(container.querySelector('.skeleton-calendar-header')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-button')).toBeInTheDocument();
    });

    it('renders weekday headers', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      expect(container.querySelector('.skeleton-calendar-weekdays')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-weekday')).toHaveLength(7);
    });

    it('renders calendar grid with days', () => {
      const { container } = render(<SkeletonLoader variant="calendar" />);
      expect(container.querySelector('.skeleton-calendar-grid')).toBeInTheDocument();
      expect(container.querySelectorAll('.skeleton-day')).toHaveLength(35);
    });
  });

  describe('Chart Skeleton Structure', () => {
    it('renders chart wheel with circles', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      expect(container.querySelector('.skeleton-wheel')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-circle')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-circle-inner')).toBeInTheDocument();
    });

    it('renders planetary positions', () => {
      const { container } = render(<SkeletonLoader variant="chart" />);
      expect(container.querySelector('.skeleton-positions')).toBeInTheDocument();
      expect(container.querySelector('.skeleton-position')).toBeInTheDocument();
    });
  });
});

describe('SkeletonGrid', () => {
  it('renders grid container with responsive classes', () => {
    const { container } = render(<SkeletonGrid count={3} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('renders specified number of skeletons', () => {
    const { container } = render(<SkeletonGrid count={5} />);
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(5);
  });

  it('renders default 3 skeletons when count not specified', () => {
    const { container } = render(<SkeletonGrid />);
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(3);
  });
});
