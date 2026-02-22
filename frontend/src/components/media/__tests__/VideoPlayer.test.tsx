/**
 * VideoPlayer Component Tests
 * Comprehensive tests for video player functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import { VideoPlayer, VideoPlayerProps, CaptionTrack } from '../VideoPlayer';

// Mock HTMLMediaElement methods
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  HTMLMediaElement.prototype.play = mockPlay;
  HTMLMediaElement.prototype.pause = mockPause;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const defaultProps: VideoPlayerProps = {
  src: 'https://example.com/video.mp4',
  title: 'Test Video',
};

describe('VideoPlayer', () => {
  describe('Rendering', () => {
    it('should render the video element with correct src', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const video = screen.getByRole('region', { name: 'Test Video' });
      expect(video).toBeInTheDocument();

      const videoElement = video.querySelector('video');
      expect(videoElement).toHaveAttribute('src', 'https://example.com/video.mp4');
    });

    it('should render with poster image when provided', () => {
      renderWithProviders(
        <VideoPlayer {...defaultProps} poster="https://example.com/poster.jpg" />
      );

      const videoElement = document.querySelector('video');
      expect(videoElement).toHaveAttribute('poster', 'https://example.com/poster.jpg');
    });

    it('should use default aria-label when title not provided', () => {
      renderWithProviders(<VideoPlayer src="test.mp4" />);

      expect(screen.getByRole('region', { name: 'Video player' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('region', { name: 'Test Video' });
      expect(container).toHaveClass('custom-class');
    });

    it('should show loading overlay initially', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByText('Loading video...')).toBeInTheDocument();
    });
  });

  describe('Controls Visibility', () => {
    it('should show custom controls by default', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByRole('toolbar', { name: 'Video controls' })).toBeInTheDocument();
    });

    it('should hide custom controls when showControls is false', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} showControls={false} />);

      expect(screen.queryByRole('toolbar', { name: 'Video controls' })).not.toBeInTheDocument();
    });
  });

  describe('Play/Pause Controls', () => {
    it('should render play button initially', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });
  });

  describe('Volume Controls', () => {
    it('should render mute button', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    });

    it('should toggle mute when mute button is clicked', async () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const muteButton = screen.getByLabelText('Mute');
      fireEvent.click(muteButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
      });
    });

    it('should change volume when slider is adjusted', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const volumeSlider = screen.getByLabelText('Volume');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });

      expect(volumeSlider).toHaveValue('0.5');
    });
  });

  describe('Seek/Progress Controls', () => {
    it('should render progress bar', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByLabelText('Video progress')).toBeInTheDocument();
    });

    it('should display time as 0:00 initially', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });
  });

  describe('Playback Speed', () => {
    it('should render playback speed selector', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByLabelText('Playback speed')).toBeInTheDocument();
    });

    it('should default to 1x speed', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const speedSelector = screen.getByLabelText('Playback speed') as HTMLSelectElement;
      expect(speedSelector.value).toBe('1');
    });

    it('should change playback speed when selected', async () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const speedSelector = screen.getByLabelText('Playback speed');
      fireEvent.change(speedSelector, { target: { value: '1.5' } });

      await waitFor(() => {
        expect(speedSelector).toHaveValue('1.5');
      });
    });

    it('should have all speed options', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const speedSelector = screen.getByLabelText('Playback speed');
      const options = speedSelector.querySelectorAll('option');

      expect(options).toHaveLength(6);
      expect(options[0]).toHaveValue('0.5');
      expect(options[5]).toHaveValue('2');
    });
  });

  describe('Fullscreen', () => {
    it('should render fullscreen button', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument();
    });

    it('should request fullscreen when button is clicked', async () => {
      // Mock requestFullscreen to return a promise
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      HTMLElement.prototype.requestFullscreen = mockRequestFullscreen;

      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const fullscreenButton = screen.getByLabelText('Enter fullscreen');
      fireEvent.click(fullscreenButton);

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalled();
      });
    });
  });

  describe('Captions', () => {
    const captions: CaptionTrack[] = [
      {
        kind: 'subtitles',
        src: 'https://example.com/subs-en.vtt',
        srcLang: 'en',
        label: 'English',
        default: true,
      },
      {
        kind: 'captions',
        src: 'https://example.com/caps-es.vtt',
        srcLang: 'es',
        label: 'Spanish',
      },
    ];

    it('should render caption tracks when provided', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} captions={captions} />);

      const tracks = document.querySelectorAll('track');
      expect(tracks).toHaveLength(2);
    });

    it('should show captions button when captions are provided', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} captions={captions} />);

      expect(screen.getByLabelText('Hide captions')).toBeInTheDocument();
    });

    it('should toggle captions when button is clicked', async () => {
      renderWithProviders(<VideoPlayer {...defaultProps} captions={captions} />);

      const captionsButton = screen.getByLabelText('Hide captions');
      fireEvent.click(captionsButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Show captions')).toBeInTheDocument();
      });
    });

    it('should not show captions button when no captions provided', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.queryByLabelText(/captions/i)).not.toBeInTheDocument();
    });
  });

  describe('Progress Callbacks', () => {
    it('should call onComplete when video ends', async () => {
      const onComplete = vi.fn();
      renderWithProviders(<VideoPlayer {...defaultProps} onComplete={onComplete} />);

      const videoElement = document.querySelector('video') as HTMLVideoElement;
      // Manually trigger the ended event
      fireEvent.ended(videoElement);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should toggle mute on m key', async () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'm' });

      await waitFor(() => {
        expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
      });
    });

    it('should toggle fullscreen on f key', async () => {
      // Mock requestFullscreen to return a promise
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      HTMLElement.prototype.requestFullscreen = mockRequestFullscreen;

      renderWithProviders(<VideoPlayer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'f' });

      await waitFor(() => {
        expect(mockRequestFullscreen).toHaveBeenCalled();
      });
    });

    it('should toggle captions on c key', async () => {
      const captions: CaptionTrack[] = [
        { kind: 'subtitles', src: 'subs.vtt', srcLang: 'en', label: 'English' },
      ];
      renderWithProviders(<VideoPlayer {...defaultProps} captions={captions} />);

      // Initial state - captions enabled
      expect(screen.getByLabelText('Hide captions')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'c' });

      await waitFor(() => {
        expect(screen.getByLabelText('Show captions')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on region', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} title="My Video" />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'My Video');
    });

    it('should have correct ARIA attributes on controls toolbar', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Video controls');
    });

    it('should have aria-pressed on captions button', () => {
      const captions: CaptionTrack[] = [
        { kind: 'subtitles', src: 'subs.vtt', srcLang: 'en', label: 'English' },
      ];
      renderWithProviders(<VideoPlayer {...defaultProps} captions={captions} />);

      const captionsButton = screen.getByLabelText(/captions/i);
      expect(captionsButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have screen reader text for keyboard shortcuts', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      expect(screen.getByRole('note', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    });

    it('should have accessible progress bar attributes', () => {
      renderWithProviders(<VideoPlayer {...defaultProps} />);

      const progressBar = screen.getByLabelText('Video progress');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration gracefully', () => {
      const onProgress = vi.fn();
      renderWithProviders(<VideoPlayer {...defaultProps} onProgress={onProgress} />);

      // Video starts with duration 0, onProgress should not be called yet
      expect(onProgress).not.toHaveBeenCalled();
    });
  });
});
