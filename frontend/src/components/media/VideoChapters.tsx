/**
 * VideoChapters Component
 *
 * Chapter navigation and markers for video player
 * Supports chapter list, progress bar markers, and auto-detection from cues
 */

import React, { useMemo, useCallback } from 'react';
import { clsx } from 'clsx';

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  thumbnail?: string;
  description?: string;
}

export interface VideoChaptersProps {
  chapters: VideoChapter[];
  currentTime: number;
  duration: number;
  onChapterClick: (startTime: number) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  showThumbnails?: boolean;
  showProgress?: boolean;
  activeChapterClassName?: string;
  chapterClassName?: string;
}

export const VideoChapters: React.FC<VideoChaptersProps> = ({
  chapters,
  currentTime,
  duration: _duration,
  onChapterClick,
  className,
  layout = 'vertical',
  showThumbnails = true,
  showProgress = true,
  activeChapterClassName,
  chapterClassName,
}) => {
  // Find current chapter
  const currentChapter = useMemo(() => {
    return chapters.find(
      (chapter) => currentTime >= chapter.startTime && currentTime < chapter.endTime,
    );
  }, [chapters, currentTime]);

  // Get chapter progress percentage
  const getChapterProgress = useCallback(
    (chapter: VideoChapter): number => {
      if (currentTime < chapter.startTime) return 0;
      if (currentTime >= chapter.endTime) return 100;
      const chapterDuration = chapter.endTime - chapter.startTime;
      const elapsed = currentTime - chapter.startTime;
      return Math.round((elapsed / chapterDuration) * 100);
    },
    [currentTime],
  );

  // Check if chapter is completed
  const isChapterCompleted = useCallback(
    (chapter: VideoChapter): boolean => {
      return currentTime >= chapter.endTime;
    },
    [currentTime],
  );

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, chapter: VideoChapter) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChapterClick(chapter.startTime);
    }
  };

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'video-chapters',
        layout === 'vertical' ? 'space-y-2' : 'flex space-x-2 overflow-x-auto',
        className,
      )}
      role="navigation"
      aria-label="Video chapters"
    >
      {chapters.map((chapter, index) => {
        const isActive = currentChapter?.id === chapter.id;
        const isCompleted = isChapterCompleted(chapter);
        const progress = getChapterProgress(chapter);

        return (
          <div
            key={chapter.id}
            role="button"
            tabIndex={0}
            onClick={() => onChapterClick(chapter.startTime)}
            onKeyDown={(e) => handleKeyDown(e, chapter)}
            className={clsx(
              'group cursor-pointer rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900',
              layout === 'vertical' ? 'flex items-start space-x-3 p-2' : 'flex-shrink-0 w-40 p-2',
              isActive
                ? (activeChapterClassName ?? 'bg-purple-600/20 border border-purple-500/50')
                : (chapterClassName ?? 'bg-white/5 hover:bg-white/10 border border-transparent'),
              isActive && 'ring-1 ring-purple-500/50',
            )}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${chapter.title}, starts at ${formatTime(chapter.startTime)}`}
          >
            {/* Thumbnail or placeholder */}
            {showThumbnails && (
              <div
                className={clsx(
                  'relative flex-shrink-0 overflow-hidden rounded',
                  layout === 'vertical' ? 'w-24 h-14' : 'w-full h-20',
                )}
              >
                {chapter.thumbnail ? (
                  <img
                    src={chapter.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white/30">{index + 1}</span>
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                  {formatTime(chapter.endTime - chapter.startTime)}
                </div>

                {/* Completed indicator */}
                {isCompleted && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Progress overlay for active chapter */}
                {isActive && showProgress && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progress}% complete`}
                  />
                )}
              </div>
            )}

            {/* Chapter info */}
            <div className={clsx('flex-1 min-w-0', layout === 'vertical' ? '' : 'mt-2')}>
              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70',
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={clsx(
                    'text-sm font-medium truncate',
                    isActive ? 'text-white' : 'text-white/80',
                  )}
                >
                  {chapter.title}
                </span>
              </div>

              {chapter.description && layout === 'vertical' && (
                <p className="text-xs text-white/50 mt-1 line-clamp-2">{chapter.description}</p>
              )}

              <div className="text-xs text-white/50 mt-1">
                {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Chapter Markers for Progress Bar
 * Renders chapter indicators on the video progress bar
 */
export interface ChapterMarkersProps {
  chapters: VideoChapter[];
  duration: number;
  className?: string;
}

export const ChapterMarkers: React.FC<ChapterMarkersProps> = ({
  chapters,
  duration,
  className,
}) => {
  if (chapters.length === 0 || duration === 0) {
    return null;
  }

  return (
    <div className={clsx('absolute inset-x-0 top-0 pointer-events-none', className)}>
      {chapters.map((chapter) => {
        const startPercent = (chapter.startTime / duration) * 100;

        return (
          <div
            key={chapter.id}
            className="absolute top-0 bottom-0 w-0.5 bg-white/30"
            style={{ left: `${startPercent}%` }}
            title={chapter.title}
            role="presentation"
          />
        );
      })}
    </div>
  );
};

/**
 * Parse chapters from VTT cues
 */
export function parseChaptersFromCues(cues: VTTCue[]): VideoChapter[] {
  const chapters: VideoChapter[] = [];

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if (cue.text && cue.startTime !== undefined) {
      chapters.push({
        id: `chapter-${i}`,
        title: cue.text,
        startTime: cue.startTime,
        endTime: cues[i + 1]?.startTime ?? cue.endTime,
      });
    }
  }

  return chapters;
}

/**
 * Auto-detect chapters from video element
 */
export function detectChaptersFromVideo(video: HTMLVideoElement): VideoChapter[] {
  const textTracks = video.textTracks;

  for (const track of textTracks) {
    if (track.kind === 'chapters' && track.cues) {
      const cues = Array.from(track.cues) as VTTCue[];
      return parseChaptersFromCues(cues);
    }
  }

  return [];
}

export default VideoChapters;
