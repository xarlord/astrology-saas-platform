/**
 * VideoModal Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoModal } from '../VideoModal';

describe('VideoModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Introduction to Birth Charts',
    videoUrl: 'https://example.com/video.mp4',
    posterUrl: 'https://example.com/poster.jpg',
  };

  const mockChapters = [
    { id: '1', title: 'Chapter 1: The Basics', startTime: 0, endTime: 225 },
    { id: '2', title: 'Chapter 2: Planets', startTime: 225, endTime: 460 },
    { id: '3', title: 'Chapter 3: Houses', startTime: 460, endTime: 754 },
  ];

  const mockTranscript = [
    { id: '1', text: 'Welcome to this introduction.', startTime: 0, endTime: 10 },
    { id: '2', text: 'Let us explore the basics.', startTime: 10, endTime: 20 },
    { id: '3', text: 'Next we cover planets.', startTime: 225, endTime: 235 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when isOpen is false', () => {
      render(<VideoModal {...mockProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render the modal when isOpen is true', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display the title', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByText('Introduction to Birth Charts')).toBeInTheDocument();
    });

    it('should render the video element with correct src', () => {
      render(<VideoModal {...mockProps} />);
      // Video elements don't have role="video" by default, query by tag name
      const video = document.querySelector('video');
      expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    });

    it('should render the video poster', () => {
      render(<VideoModal {...mockProps} />);
      const video = document.querySelector('video');
      expect(video).toHaveAttribute('poster', 'https://example.com/poster.jpg');
    });

    it('should render close button', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('Chapters', () => {
    it('should render chapters when provided', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} chapters={mockChapters} />);

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Chapters')).toBeInTheDocument();
      });

      // Click on chapter buttons to verify they exist
      const chapter1Button = screen.getByRole('button', { name: /Chapter 1: The Basics/ });
      expect(chapter1Button).toBeInTheDocument();
    });

    it('should not render chapters section when not provided', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.queryByText('Chapters')).not.toBeInTheDocument();
    });

    it('should display chapter navigation', () => {
      render(<VideoModal {...mockProps} chapters={mockChapters} />);
      expect(screen.getByText('Chapters')).toBeInTheDocument();
    });
  });

  describe('Transcript', () => {
    it('should render transcript toggle button when transcript is provided', () => {
      render(<VideoModal {...mockProps} transcript={mockTranscript} />);
      expect(screen.getByText('Transcript')).toBeInTheDocument();
    });

    it('should not render transcript section when not provided', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.queryByText('Transcript')).not.toBeInTheDocument();
    });

    it('should toggle transcript visibility', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} transcript={mockTranscript} />);

      const transcriptButton = screen.getByText('Transcript');
      await user.click(transcriptButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to this introduction.')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} />);

      await user.click(screen.getByLabelText('Close modal'));
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} />);

      const backdrop = screen.getByRole('dialog').parentElement?.firstChild;
      if (backdrop) {
        await user.click(backdrop as Element);
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should render play/pause button', () => {
      render(<VideoModal {...mockProps} />);
      // The play button is on the video overlay
      const playButtons = screen.getAllByLabelText(/Play|Pause/);
      expect(playButtons.length).toBeGreaterThan(0);
    });

    it('should render volume control', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByLabelText('Volume')).toBeInTheDocument();
    });

    it('should render fullscreen button', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByLabelText(/fullscreen/i)).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<VideoModal {...mockProps} />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      render(<VideoModal {...mockProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<VideoModal {...mockProps} />);
      const dialog = screen.getByRole('dialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have accessible video progress slider', () => {
      render(<VideoModal {...mockProps} />);
      const progressSlider = screen.getByRole('slider', { name: /progress/i });
      expect(progressSlider).toBeInTheDocument();
    });
  });

  describe('Settings Panel', () => {
    it('should toggle settings panel visibility', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} />);

      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Speed')).toBeInTheDocument();
      });
    });

    it('should show playback speed options', async () => {
      const user = userEvent.setup();
      render(<VideoModal {...mockProps} />);

      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('1x')).toBeInTheDocument();
      });
    });
  });

  describe('Time Display', () => {
    it('should display current time and duration', () => {
      render(<VideoModal {...mockProps} />);
      // Initial state should show 0:00 / 0:00
      const timeDisplay = screen.getByText(/0:00/);
      expect(timeDisplay).toBeInTheDocument();
    });
  });
});
