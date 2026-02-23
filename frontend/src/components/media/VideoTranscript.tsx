/**
 * VideoTranscript Component
 *
 * Synchronized transcript display with search, click-to-seek,
 * and auto-scroll functionality
 */

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';

export interface TranscriptCue {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  speaker?: string;
}

export interface VideoTranscriptProps {
  cues: TranscriptCue[];
  currentTime: number;
  onSeek: (time: number) => void;
  className?: string;
  maxHeight?: string;
  autoScroll?: boolean;
  showSearch?: boolean;
  showTimestamps?: boolean;
  showSpeakers?: boolean;
  highlightColor?: string;
}

export const VideoTranscript: React.FC<VideoTranscriptProps> = ({
  cues,
  currentTime,
  onSeek,
  className,
  maxHeight = '400px',
  autoScroll = true,
  showSearch = true,
  showTimestamps = true,
  showSpeakers = true,
  highlightColor = 'bg-purple-500/30',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCueId, setHighlightedCueId] = useState<string | null>(null);

  // Find current cue
  const currentCue = useMemo(() => {
    return cues.find(
      (cue) => currentTime >= cue.startTime && currentTime < cue.endTime
    );
  }, [cues, currentTime]);

  // Filter cues by search query
  const filteredCues = useMemo(() => {
    if (!searchQuery.trim()) return cues;

    const query = searchQuery.toLowerCase();
    return cues.filter(
      (cue) =>
        cue.text.toLowerCase().includes(query) ||
        cue.speaker?.toLowerCase().includes(query)
    );
  }, [cues, searchQuery]);

  // Auto-scroll to current cue
  useEffect(() => {
    if (!autoScroll || !currentCue || !containerRef.current) return;

    const cueElement = containerRef.current.querySelector(
      `[data-cue-id="${currentCue.id}"]`
    );

    if (cueElement && typeof cueElement.scrollIntoView === 'function') {
      cueElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentCue, autoScroll]);

  // Highlight effect for search navigation
  useEffect(() => {
    if (highlightedCueId) {
      const timer = setTimeout(() => {
        setHighlightedCueId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedCueId]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle cue click
  const handleCueClick = useCallback(
    (cue: TranscriptCue) => {
      onSeek(cue.startTime);
      setHighlightedCueId(cue.id);
    },
    [onSeek]
  );

  // Handle keyboard navigation in search
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredCues.length > 0) {
        const firstMatch = filteredCues[0];
        handleCueClick(firstMatch);
      }
    },
    [filteredCues, handleCueClick]
  );

  // Check if text matches search query and get parts
  const getHighlightedText = useCallback(
    (text: string): React.ReactNode => {
      if (!searchQuery.trim()) return text;

      const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (part.toLowerCase() === searchQuery.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-400/50 text-white rounded px-0.5"
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    },
    [searchQuery]
  );

  // Escape regex special characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Group cues by speaker
  const groupedCues = useMemo(() => {
    if (!showSpeakers) return { '': filteredCues };

    const groups: Record<string, TranscriptCue[]> = {};
    let currentSpeaker = '';

    for (const cue of filteredCues) {
      const speaker = cue.speaker ?? '';
      if (speaker !== currentSpeaker) {
        currentSpeaker = speaker;
      }

      if (!groups[currentSpeaker]) {
        groups[currentSpeaker] = [];
      }
      groups[currentSpeaker].push(cue);
    }

    return groups;
  }, [filteredCues, showSpeakers]);

  return (
    <div className={clsx('video-transcript', className)}>
      {/* Search bar */}
      {showSearch && (
        <div className="mb-3">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search transcript..."
              className={clsx(
                'w-full px-4 py-2 pl-10 rounded-lg',
                'bg-white/5 border border-white/10',
                'text-white placeholder-white/50',
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
                'transition-all duration-200'
              )}
              aria-label="Search transcript"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-white/50 mt-1">
              {filteredCues.length} result{filteredCues.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      )}

      {/* Transcript content */}
      <div
        ref={containerRef}
        className="overflow-y-auto space-y-1"
        style={{ maxHeight }}
        role="list"
        aria-label="Transcript"
      >
        {filteredCues.length === 0 ? (
          <p className="text-center text-white/50 py-8">
            {searchQuery ? 'No matching results found' : 'No transcript available'}
          </p>
        ) : (
          Object.entries(groupedCues).map(([speaker, speakerCues]) => (
            <div key={speaker || 'no-speaker'} className="space-y-1">
              {speaker && (
                <div className="text-xs font-medium text-purple-400 mt-3 mb-1 px-2">
                  {speaker}
                </div>
              )}
              {speakerCues.map((cue) => {
                const isActive = currentCue?.id === cue.id;
                const isHighlighted = highlightedCueId === cue.id;

                return (
                  <div
                    key={cue.id}
                    data-cue-id={cue.id}
                    role="listitem"
                    onClick={() => handleCueClick(cue)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCueClick(cue);
                      }
                    }}
                    tabIndex={0}
                    className={clsx(
                      'group flex items-start space-x-3 p-2 rounded-lg cursor-pointer',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500',
                      'hover:bg-white/10',
                      isActive && highlightColor,
                      isHighlighted && 'ring-2 ring-yellow-400 animate-pulse'
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Timestamp */}
                    {showTimestamps && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(cue.startTime);
                        }}
                        className={clsx(
                          'flex-shrink-0 text-xs px-1.5 py-0.5 rounded',
                          'text-white/60 hover:text-white hover:bg-white/10',
                          'transition-colors duration-200',
                          isActive && 'text-purple-300'
                        )}
                        aria-label={`Jump to ${formatTime(cue.startTime)}`}
                      >
                        {formatTime(cue.startTime)}
                      </button>
                    )}

                    {/* Text */}
                    <p
                      className={clsx(
                        'flex-1 text-sm leading-relaxed',
                        isActive ? 'text-white' : 'text-white/80'
                      )}
                    >
                      {searchQuery ? getHighlightedText(cue.text) : cue.text}
                    </p>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Jump to current button */}
      {currentCue && (
        <button
          type="button"
          onClick={() => {
            const cueElement = containerRef.current?.querySelector(
              `[data-cue-id="${currentCue.id}"]`
            );
            cueElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className={clsx(
            'mt-3 w-full py-2 rounded-lg',
            'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300',
            'text-sm font-medium',
            'transition-colors duration-200'
          )}
        >
          Jump to current
        </button>
      )}
    </div>
  );
};

/**
 * Parse transcript from VTT cues
 */
export function parseTranscriptFromCues(cues: VTTCue[]): TranscriptCue[] {
  return cues.map((cue, index) => ({
    id: `cue-${index}`,
    startTime: cue.startTime,
    endTime: cue.endTime,
    text: cue.text,
    speaker: undefined, // Would need custom parsing for speaker info
  }));
}

/**
 * Parse transcript from SRT format
 */
export function parseSRT(srtContent: string): TranscriptCue[] {
  const blocks = srtContent.trim().split(/\n\n+/);
  const cues: TranscriptCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;

    // Parse timestamp line (format: 00:00:00,000 --> 00:00:00,000)
    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );

    if (!timeMatch) continue;

    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    // Join remaining lines as text
    const text = lines.slice(2).join(' ').replace(/<[^>]+>/g, ''); // Strip HTML tags

    cues.push({
      id: `cue-${cues.length}`,
      startTime,
      endTime,
      text,
    });
  }

  return cues;
}

/**
 * Parse transcript from WebVTT format
 */
export function parseWebVTT(vttContent: string): TranscriptCue[] {
  const lines = vttContent.split('\n');
  const cues: TranscriptCue[] = [];

  let i = 0;
  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  while (i < lines.length) {
    // Find timestamp line
    const timeMatch = lines[i].match(
      /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/
    );

    if (!timeMatch) {
      i++;
      continue;
    }

    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    // Collect text lines until empty line or next cue
    const textLines: string[] = [];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
      textLines.push(lines[i].replace(/<[^>]+>/g, '')); // Strip HTML tags
      i++;
    }

    if (textLines.length > 0) {
      cues.push({
        id: `cue-${cues.length}`,
        startTime,
        endTime,
        text: textLines.join(' '),
      });
    }
  }

  return cues;
}

export default VideoTranscript;
