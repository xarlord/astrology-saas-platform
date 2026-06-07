/**
 * LessonCard Component Tests
 *
 * Tests rendering, interactions, keyboard navigation, and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LessonCard from '../LessonCard';

const defaultProps = {
  id: 'lesson-1',
  title: 'Understanding Moon Phases',
  thumbnail: '/images/moon-phases.jpg',
  duration: '15 min',
  category: 'Lunar',
  type: 'video' as const,
};

describe('LessonCard', () => {
  describe('Rendering', () => {
    it('renders with correct title', () => {
      render(<LessonCard {...defaultProps} />);

      expect(screen.getByText('Understanding Moon Phases')).toBeInTheDocument();
    });

    it('renders duration and category info', () => {
      render(<LessonCard {...defaultProps} />);

      expect(screen.getByText(/Video/)).toBeInTheDocument();
      expect(screen.getByText(/15 min/)).toBeInTheDocument();
      expect(screen.getByText('Lunar')).toBeInTheDocument();
    });

    it('renders thumbnail image', () => {
      render(<LessonCard {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/images/moon-phases.jpg');
      expect(img).toHaveAttribute('alt', 'Understanding Moon Phases');
    });

    it('renders video type indicator', () => {
      render(<LessonCard {...defaultProps} type="video" />);

      expect(screen.getByText(/Video/)).toBeInTheDocument();
    });

    it('renders article type indicator', () => {
      render(<LessonCard {...defaultProps} type="article" />);

      expect(screen.getByText(/Article/)).toBeInTheDocument();
    });

    it('renders completed checkmark when completed', () => {
      render(<LessonCard {...defaultProps} completed={true} />);

      expect(screen.getByText('check')).toBeInTheDocument();
    });

    it('does not render completed checkmark when not completed', () => {
      render(<LessonCard {...defaultProps} completed={false} />);

      expect(screen.queryByText('check')).not.toBeInTheDocument();
    });

    it('renders bookmark button', () => {
      render(<LessonCard {...defaultProps} />);

      expect(screen.getByLabelText('Bookmark lesson')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick with lesson id when clicked', () => {
      const handleClick = vi.fn();
      render(<LessonCard {...defaultProps} onClick={handleClick} />);

      // The outer div has role="button"
      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('lesson-1');
    });

    it('does not throw when onClick is not provided', () => {
      render(<LessonCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      expect(() => fireEvent.click(card)).not.toThrow();
    });

    it('calls onBookmark with lesson id when bookmark is clicked', () => {
      const handleBookmark = vi.fn();
      render(<LessonCard {...defaultProps} onBookmark={handleBookmark} />);

      fireEvent.click(screen.getByLabelText('Bookmark lesson'));
      expect(handleBookmark).toHaveBeenCalledTimes(1);
      expect(handleBookmark).toHaveBeenCalledWith('lesson-1');
    });

    it('does not propagate bookmark click to parent onClick', () => {
      const handleClick = vi.fn();
      const handleBookmark = vi.fn();
      render(
        <LessonCard {...defaultProps} onClick={handleClick} onBookmark={handleBookmark} />,
      );

      fireEvent.click(screen.getByLabelText('Bookmark lesson'));
      expect(handleBookmark).toHaveBeenCalledTimes(1);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('triggers click on Enter key', () => {
      const handleClick = vi.fn();
      render(<LessonCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('lesson-1');
    });

    it('triggers click on Space key', () => {
      const handleClick = vi.fn();
      render(<LessonCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      fireEvent.keyDown(card, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith('lesson-1');
    });

    it('does not trigger click on other keys', () => {
      const handleClick = vi.fn();
      render(<LessonCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      fireEvent.keyDown(card, { key: 'Tab' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="button"', () => {
      render(<LessonCard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Understanding Moon Phases/ }),
      ).toBeInTheDocument();
    });

    it('has tabIndex={0}', () => {
      render(<LessonCard {...defaultProps} />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('has aria-label containing title and video type', () => {
      render(<LessonCard {...defaultProps} type="video" />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      expect(card).toHaveAttribute(
        'aria-label',
        'Understanding Moon Phases — video lesson',
      );
    });

    it('has aria-label containing title and article type', () => {
      render(<LessonCard {...defaultProps} type="article" />);

      const card = screen.getByRole('button', { name: /Understanding Moon Phases/ });
      expect(card).toHaveAttribute(
        'aria-label',
        'Understanding Moon Phases — article lesson',
      );
    });

    it('has bookmark button with accessible label', () => {
      render(<LessonCard {...defaultProps} />);

      expect(screen.getByLabelText('Bookmark lesson')).toBeInTheDocument();
    });
  });
});
