/**
 * VideoTranscript Component Tests
 *
 * Tests for synchronized transcript display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import {
  VideoTranscript,
  parseSRT,
  parseWebVTT,
  TranscriptCue,
} from '../VideoTranscript';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock transcript cues
const mockCues: TranscriptCue[] = [
  {
    id: 'cue-1',
    startTime: 0,
    endTime: 5,
    text: 'Welcome to this introduction video.',
    speaker: 'Narrator',
  },
  {
    id: 'cue-2',
    startTime: 5,
    endTime: 10,
    text: 'Today we will learn about astrology.',
    speaker: 'Narrator',
  },
  {
    id: 'cue-3',
    startTime: 10,
    endTime: 15,
    text: 'Astrology is an ancient practice.',
    speaker: 'Expert',
  },
];

describe('VideoTranscript', () => {
  const mockOnSeek = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render transcript cues', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('Welcome to this introduction video.')).toBeInTheDocument();
      expect(screen.getByText('Today we will learn about astrology.')).toBeInTheDocument();
      expect(screen.getByText('Astrology is an ancient practice.')).toBeInTheDocument();
    });

    it('should render timestamps', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showTimestamps={true}
        />
      );

      expect(screen.getByLabelText('Jump to 0:00')).toBeInTheDocument();
      expect(screen.getByLabelText('Jump to 0:05')).toBeInTheDocument();
    });

    it('should render speakers when enabled', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSpeakers={true}
        />
      );

      expect(screen.getByText('Narrator')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    it('should hide speakers when disabled', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSpeakers={false}
        />
      );

      expect(screen.queryByText('Narrator')).not.toBeInTheDocument();
    });

    it('should show empty state when no cues', () => {
      renderWithProviders(
        <VideoTranscript
          cues={[]}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('No transcript available')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should render search input when enabled', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      expect(screen.getByPlaceholderText('Search transcript...')).toBeInTheDocument();
    });

    it('should hide search when disabled', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={false}
        />
      );

      expect(screen.queryByPlaceholderText('Search transcript...')).not.toBeInTheDocument();
    });

    it('should filter cues by search query', async () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'introduction' } });

      // Check result count shows 1 result
      await waitFor(() => {
        expect(screen.getByText(/1 result/)).toBeInTheDocument();
      });
    });

    it('should highlight search matches', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'ancient' } });

      // Check that "ancient" is found in the filtered results
      const mark = document.querySelector('mark');
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe('ancient');
    });

    it('should show result count', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'introduction' } });

      expect(screen.getByText(/1 result/)).toBeInTheDocument();
    });

    it('should show no results message', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No matching results found')).toBeInTheDocument();
    });

    it('should clear search when clear button clicked', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('should jump to first result on Enter', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showSearch={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search transcript...');
      fireEvent.change(searchInput, { target: { value: 'introduction' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(mockOnSeek).toHaveBeenCalledWith(0); // First cue starts at 0
    });
  });

  describe('Current Cue Highlighting', () => {
    it('should highlight current cue', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={7}
          onSeek={mockOnSeek}
        />
      );

      const currentCueText = screen.getByText('Today we will learn about astrology.');
      expect(currentCueText.closest('[aria-current="true"]')).toBeInTheDocument();
    });

    it('should update highlighting when time changes', () => {
      const { rerender } = renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={7}
          onSeek={mockOnSeek}
        />
      );

      let currentCueText = screen.getByText('Today we will learn about astrology.');
      expect(currentCueText.closest('[aria-current="true"]')).toBeInTheDocument();

      rerender(
        <VideoTranscript
          cues={mockCues}
          currentTime={12}
          onSeek={mockOnSeek}
        />
      );

      currentCueText = screen.getByText('Astrology is an ancient practice.');
      expect(currentCueText.closest('[aria-current="true"]')).toBeInTheDocument();
    });
  });

  describe('Click to Seek', () => {
    it('should seek when cue is clicked', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      const cueElement = screen.getByText('Today we will learn about astrology.').closest('[role="listitem"]');
      fireEvent.click(cueElement!);

      expect(mockOnSeek).toHaveBeenCalledWith(5);
    });

    it('should seek when timestamp is clicked', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
          showTimestamps={true}
        />
      );

      const timestampButton = screen.getByLabelText('Jump to 0:10');
      fireEvent.click(timestampButton);

      expect(mockOnSeek).toHaveBeenCalledWith(10);
    });

    it('should handle keyboard navigation', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      const cueElement = screen.getByText('Today we will learn about astrology.').closest('[role="listitem"]');
      fireEvent.keyDown(cueElement!, { key: 'Enter' });

      expect(mockOnSeek).toHaveBeenCalledWith(5);
    });
  });

  describe('Jump to Current Button', () => {
    it('should show jump to current button', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={7}
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByText('Jump to current')).toBeInTheDocument();
    });

    it('should scroll to current cue when clicked', () => {
      const mockScrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;

      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={7}
          onSeek={mockOnSeek}
        />
      );

      const jumpButton = screen.getByText('Jump to current');
      fireEvent.click(jumpButton);

      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have list role', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      expect(screen.getByRole('list', { name: 'Transcript' })).toBeInTheDocument();
    });

    it('should have listitem role for cues', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should have aria-current on current cue', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={7}
          onSeek={mockOnSeek}
        />
      );

      const currentCue = screen.getByRole('listitem', { current: true });
      expect(currentCue).toBeInTheDocument();
    });

    it('should be keyboard focusable', () => {
      renderWithProviders(
        <VideoTranscript
          cues={mockCues}
          currentTime={0}
          onSeek={mockOnSeek}
        />
      );

      const listItems = screen.getAllByRole('listitem');
      listItems.forEach((item) => {
        expect(item).toHaveAttribute('tabindex', '0');
      });
    });
  });
});

describe('parseSRT', () => {
  it('should parse SRT format', () => {
    const srtContent = `1
00:00:00,000 --> 00:00:05,000
Welcome to this video.

2
00:00:05,000 --> 00:00:10,000
Today we learn about astrology.`;

    const cues = parseSRT(srtContent);

    expect(cues).toHaveLength(2);
    expect(cues[0].text).toBe('Welcome to this video.');
    expect(cues[0].startTime).toBe(0);
    expect(cues[0].endTime).toBe(5);
    expect(cues[1].startTime).toBe(5);
    expect(cues[1].endTime).toBe(10);
  });

  it('should handle empty content', () => {
    const cues = parseSRT('');
    expect(cues).toHaveLength(0);
  });
});

describe('parseWebVTT', () => {
  it('should parse WebVTT format', () => {
    const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome to this video.

00:00:05.000 --> 00:00:10.000
Today we learn about astrology.`;

    const cues = parseWebVTT(vttContent);

    expect(cues).toHaveLength(2);
    expect(cues[0].text).toBe('Welcome to this video.');
    expect(cues[0].startTime).toBe(0);
    expect(cues[0].endTime).toBe(5);
  });

  it('should handle empty content', () => {
    const cues = parseWebVTT('');
    expect(cues).toHaveLength(0);
  });

  it('should strip HTML tags from text', () => {
    const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
<b>Welcome</b> to this <i>video</i>.`;

    const cues = parseWebVTT(vttContent);

    expect(cues[0].text).toBe('Welcome to this video.');
  });
});
