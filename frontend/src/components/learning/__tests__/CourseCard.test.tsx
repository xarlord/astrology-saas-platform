/**
 * CourseCard Component Tests
 *
 * Tests rendering, interactions, keyboard navigation, and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseCard from '../CourseCard';

const defaultProps = {
  id: 'course-1',
  title: 'Introduction to Astrology',
  description: 'Learn the basics of natal charts and planetary positions',
  totalLessons: 12,
  completedLessons: 5,
  duration: '2h 30m',
  status: 'in-progress' as const,
};

describe('CourseCard', () => {
  describe('Rendering', () => {
    it('renders with correct title and description', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('Introduction to Astrology')).toBeInTheDocument();
      expect(
        screen.getByText('Learn the basics of natal charts and planetary positions'),
      ).toBeInTheDocument();
    });

    it('renders lesson count', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('5/12 Lessons')).toBeInTheDocument();
    });

    it('renders duration', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('renders in-progress status badge', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders locked status badge', () => {
      render(<CourseCard {...defaultProps} status="locked" />);

      expect(screen.getByText('Locked')).toBeInTheDocument();
    });

    it('renders not-started status badge', () => {
      render(<CourseCard {...defaultProps} status="not-started" />);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders progress bar when in-progress with progress > 0', () => {
      const { container } = render(<CourseCard {...defaultProps} progress={50} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not render progress bar when not in-progress', () => {
      const { container } = render(
        <CourseCard {...defaultProps} status="not-started" progress={50} />,
      );

      expect(container.querySelector('[style*="width: 50%"]')).not.toBeInTheDocument();
    });

    it('does not render progress bar when progress is 0', () => {
      const { container } = render(<CourseCard {...defaultProps} progress={0} />);

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick with course id when clicked', () => {
      const handleClick = vi.fn();
      render(<CourseCard {...defaultProps} onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('course-1');
    });

    it('does not throw when onClick is not provided', () => {
      render(<CourseCard {...defaultProps} />);

      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });
  });

  describe('Keyboard Navigation', () => {
    it('triggers click on Enter key', () => {
      const handleClick = vi.fn();
      render(<CourseCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('course-1');
    });

    it('triggers click on Space key', () => {
      const handleClick = vi.fn();
      render(<CourseCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('course-1');
    });

    it('does not trigger click on other keys', () => {
      const handleClick = vi.fn();
      render(<CourseCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Tab' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="button"', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has tabIndex={0}', () => {
      render(<CourseCard {...defaultProps} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('has aria-label containing title and status for in-progress', () => {
      render(<CourseCard {...defaultProps} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute(
        'aria-label',
        'Introduction to Astrology course — in progress',
      );
    });

    it('has aria-label containing status for locked', () => {
      render(<CourseCard {...defaultProps} status="locked" />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Introduction to Astrology course — locked');
    });

    it('has aria-label containing status for not-started', () => {
      render(<CourseCard {...defaultProps} status="not-started" />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Introduction to Astrology course — not-started');
    });
  });
});
