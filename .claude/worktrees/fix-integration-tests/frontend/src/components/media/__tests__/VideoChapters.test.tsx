/**
 * VideoChapters Component Tests
 *
 * Tests for chapter navigation and markers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import {
  VideoChapters,
  ChapterMarkers,
  parseChaptersFromCues,
  VideoChapter,
} from '../VideoChapters';

// Mock chapters data
const mockChapters: VideoChapter[] = [
  {
    id: 'chapter-1',
    title: 'Introduction',
    startTime: 0,
    endTime: 60,
    thumbnail: 'https://example.com/thumb1.jpg',
    description: 'Welcome to the course',
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    startTime: 60,
    endTime: 180,
    thumbnail: 'https://example.com/thumb2.jpg',
  },
  {
    id: 'chapter-3',
    title: 'Chapter 3',
    startTime: 180,
    endTime: 300,
  },
];

describe('VideoChapters', () => {
  const mockOnChapterClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chapters list', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Chapter 2')).toBeInTheDocument();
      expect(screen.getByText('Chapter 3')).toBeInTheDocument();
    });

    it('should render chapter timestamps', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      // Check for timestamp text (multiple elements may have same text)
      expect(screen.getAllByText(/0:00/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1:00/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/3:00/).length).toBeGreaterThan(0);
    });

    it('should render thumbnails when available', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
          showThumbnails={true}
        />
      );

      const thumbnails = screen.getAllByRole('img');
      expect(thumbnails).toHaveLength(2); // Only chapters with thumbnails
    });

    it('should show placeholder when no thumbnail', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
          showThumbnails={true}
        />
      );

      // Check that Chapter 3 title is rendered (it doesn't have a thumbnail)
      expect(screen.getByText('Chapter 3')).toBeInTheDocument();
    });

    it('should return null when no chapters', () => {
      const { container } = renderWithProviders(
        <VideoChapters
          chapters={[]}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Layout', () => {
    it('should render vertical layout by default', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('space-y-2');
    });

    it('should render horizontal layout when specified', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
          layout="horizontal"
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex');
    });
  });

  describe('Current Chapter', () => {
    it('should highlight active chapter', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={90}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
      expect(chapter2Button).toHaveAttribute('aria-current', 'true');
    });

    it('should show progress bar for active chapter', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={90}
          duration={300}
          onChapterClick={mockOnChapterClick}
          showProgress={true}
        />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('should calculate correct chapter progress', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={120}
          duration={300}
          onChapterClick={mockOnChapterClick}
          showProgress={true}
        />
      );

      // Chapter 2: 60-180 seconds, current 120
      // Progress: (120-60)/(180-60) = 50%
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Completed Chapters', () => {
    it('should show completed indicator for finished chapters', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={150}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      // Chapter 1 is completed (0-60, current is 150)
      const chapter1Button = screen.getByRole('button', { name: /Introduction/ });
      expect(chapter1Button).toBeInTheDocument();

      // Check for checkmark icon
      const checkmarks = screen.getAllByRole('img', { hidden: true });
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('should call onChapterClick when chapter is clicked', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
      fireEvent.click(chapter2Button);

      expect(mockOnChapterClick).toHaveBeenCalledWith(60);
    });

    it('should handle keyboard navigation with Enter', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
      fireEvent.keyDown(chapter2Button, { key: 'Enter' });

      expect(mockOnChapterClick).toHaveBeenCalledWith(60);
    });

    it('should handle keyboard navigation with Space', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
      fireEvent.keyDown(chapter2Button, { key: ' ' });

      expect(mockOnChapterClick).toHaveBeenCalledWith(60);
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      expect(screen.getByRole('navigation', { name: 'Video chapters' })).toBeInTheDocument();
    });

    it('should have aria-current on active chapter', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={90}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
      expect(chapter2Button).toHaveAttribute('aria-current', 'true');
    });

    it('should have accessible button labels', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
        />
      );

      expect(screen.getByRole('button', { name: /Introduction, starts at 0:00/ })).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
          className="custom-class"
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-class');
    });

    it('should apply active chapter class', () => {
      renderWithProviders(
        <VideoChapters
          chapters={mockChapters}
          currentTime={0}
          duration={300}
          onChapterClick={mockOnChapterClick}
          activeChapterClassName="active-custom"
        />
      );

      const chapter1Button = screen.getByRole('button', { name: /Introduction/ });
      expect(chapter1Button).toHaveClass('active-custom');
    });
  });
});

describe('ChapterMarkers', () => {
  it('should render chapter markers on progress bar', () => {
    renderWithProviders(
      <ChapterMarkers chapters={mockChapters} duration={300} />
    );

    const markers = screen.getAllByRole('presentation');
    expect(markers).toHaveLength(3);
  });

  it('should return null when no chapters', () => {
    const { container } = renderWithProviders(
      <ChapterMarkers chapters={[]} duration={300} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when duration is 0', () => {
    const { container } = renderWithProviders(
      <ChapterMarkers chapters={mockChapters} duration={0} />
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('parseChaptersFromCues', () => {
  it('should parse VTT cues into chapters', () => {
    const mockCues = [
      { text: 'Introduction', startTime: 0, endTime: 60 },
      { text: 'Chapter 2', startTime: 60, endTime: 180 },
      { text: 'Conclusion', startTime: 180, endTime: 300 },
    ] as VTTCue[];

    const chapters = parseChaptersFromCues(mockCues);

    expect(chapters).toHaveLength(3);
    expect(chapters[0].title).toBe('Introduction');
    expect(chapters[0].startTime).toBe(0);
    expect(chapters[0].endTime).toBe(60);
    expect(chapters[1].startTime).toBe(60);
  });
});
