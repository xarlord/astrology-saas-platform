/**
 * VideoPlayer Component
 *
 * Accessible video player with progress tracking, keyboard controls, and ARIA support
 * Follows WCAG 2.1 AA guidelines for media content
 * Features: Play/pause, volume, progress seeking, fullscreen, PiP, playback rate
 */

import React, { useEffect, useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { useVideoPlayer, PLAYBACK_RATES } from '../../hooks/useVideoPlayer';
import { ChapterMarkers, VideoChapter } from './VideoChapters';
import { getVideoAnalytics } from '../../utils/video/analytics';

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  onProgress?: (progress: VideoProgress) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  startTime?: number;
  showControls?: boolean;
  captions?: CaptionTrack[];
  defaultCaptions?: string;
  chapters?: VideoChapter[];
  videoId?: string;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
}

export interface CaptionTrack {
  kind: 'subtitles' | 'captions' | 'descriptions';
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  className,
  onProgress,
  onComplete,
  autoplay = false,
  startTime = 0,
  showControls = true,
  captions = [],
  defaultCaptions,
  chapters = [],
  videoId = 'default-video',
}) => {
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [selectedCaption, _setSelectedCaption] = useState<string | undefined>(defaultCaptions);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize video player hook
  const {
    videoRef,
    containerRef,
    state,
    controls,
    handlers,
  } = useVideoPlayer({
    autoplay,
    startTime,
    onProgress,
    onComplete,
    onError: (error) => console.error('Video error:', error),
  });

  // Video analytics
  const analytics = getVideoAnalytics();

  // Track analytics events
  useEffect(() => {
    analytics.startSession(videoId);
    return () => {
      analytics.endSession(videoId);
    };
  }, [videoId, analytics]);

  // Track play/pause for analytics
  useEffect(() => {
    if (state.isPlaying) {
      analytics.trackEvent(videoId, 'play', { currentTime: state.currentTime });
    } else if (state.currentTime > 0) {
      analytics.trackEvent(videoId, 'pause', { currentTime: state.currentTime });
    }
  }, [state.isPlaying, state.currentTime, videoId, analytics]);

  // Track buffering
  useEffect(() => {
    if (state.isBuffering) {
      analytics.trackEvent(videoId, 'buffering_start', { currentTime: state.currentTime });
    } else {
      analytics.trackEvent(videoId, 'buffering_end', { currentTime: state.currentTime });
    }
  }, [state.isBuffering, state.currentTime, videoId, analytics]);

  // Track fullscreen changes
  useEffect(() => {
    analytics.trackEvent(videoId, state.isFullscreen ? 'fullscreen_enter' : 'fullscreen_exit', {});
  }, [state.isFullscreen, videoId, analytics]);

  // Track PiP changes
  useEffect(() => {
    analytics.trackEvent(videoId, state.isPiP ? 'pip_enter' : 'pip_exit', {});
  }, [state.isPiP, videoId, analytics]);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (state.isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  }, [controlsTimeout, state.isPlaying]);

  // Handle mouse movement for controls visibility
  const handleMouseMove = useCallback(() => {
    if (showControls) {
      showControlsTemporarily();
    }
  }, [showControls, showControlsTemporarily]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying && showControls) {
      setControlsVisible(false);
    }
  }, [state.isPlaying, showControls]);

  // Handle seek with chapter info
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    controls.seek(time);
    analytics.trackEvent(videoId, 'seek', { targetTime: time });
  }, [controls, videoId, analytics]);

  // Handle chapter click
  const _handleChapterClick = useCallback((startTime: number) => {
    controls.seek(startTime);
  }, [controls]);

  // Handle caption toggle
  const handleCaptionsToggle = useCallback(() => {
    setCaptionsEnabled((prev) => {
      const newValue = !prev;
      analytics.trackEvent(videoId, 'caption_toggle', { enabled: newValue });
      return newValue;
    });
  }, [videoId, analytics]);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    controls.setPlaybackRate(rate);
    analytics.trackEvent(videoId, 'playback_rate_change', { rate });
  }, [controls, videoId, analytics]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    controls.setVolume(newVolume);
  }, [controls]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    void controls.toggleFullscreen();
  }, [controls]);

  // Handle PiP toggle
  const handlePiPToggle = useCallback(() => {
    void controls.togglePiP();
  }, [controls]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Check if PiP is supported
  const isPiPSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative bg-black rounded-lg overflow-hidden group',
        'focus-within:ring-2 focus-within:ring-purple-500',
        className
      )}
      role="region"
      aria-label={title ?? 'Video player'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        onLoadStart={handlers.onLoadStart}
        onLoadedMetadata={handlers.onLoadedMetadata}
        onCanPlay={handlers.onCanPlay}
        onWaiting={handlers.onWaiting}
        onPlaying={handlers.onPlaying}
        onTimeUpdate={handlers.onTimeUpdate}
        onProgress={handlers.onProgress}
        onPlay={handlers.onPlay}
        onPause={handlers.onPause}
        onEnded={handlers.onEnded}
        onError={handlers.onError}
        onVolumeChange={handlers.onVolumeChange}
        aria-label={title}
        aria-describedby="video-shortcuts"
      >
        {captions.map((caption, index) => (
          <track
            key={index}
            kind={caption.kind}
            src={caption.src}
            srcLang={caption.srcLang}
            label={caption.label}
            default={caption.default ?? caption.srcLang === selectedCaption}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading video...</span>
          </div>
        </div>
      )}

      {/* Buffering indicator */}
      {state.isBuffering && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div
            className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Buffering...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <svg
            className="w-12 h-12 text-red-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-lg font-medium">Error loading video</p>
          <p className="text-sm text-white/60 mt-1">{state.error}</p>
          <button
            type="button"
            onClick={() => controls.restart()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* PiP indicator */}
      {state.isPiP && (
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2H5z" />
            <path d="M11 8a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2V8z" />
          </svg>
          <span>Picture-in-Picture</span>
        </div>
      )}

      {/* Custom controls */}
      {showControls && (
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0',
            'bg-gradient-to-t from-black/90 via-black/60 to-transparent',
            'p-4 pt-12 transition-opacity duration-300',
            controlsVisible || !state.isPlaying ? 'opacity-100' : 'opacity-0'
          )}
          role="toolbar"
          aria-label="Video controls"
        >
          {/* Progress bar with chapters */}
          <div className="relative mb-3">
            <input
              type="range"
              min={0}
              max={state.duration || 0}
              value={state.currentTime}
              onChange={handleSeek}
              className={clsx(
                'w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform',
                'focus:outline-none focus:ring-2 focus:ring-purple-500'
              )}
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={state.duration}
              aria-valuenow={state.currentTime}
              aria-valuetext={`${formatTime(state.currentTime)} of ${formatTime(state.duration)}`}
            />

            {/* Chapter markers */}
            {chapters.length > 0 && (
              <ChapterMarkers chapters={chapters} duration={state.duration} />
            )}

            {/* Buffered progress */}
            {state.bufferedRanges && state.bufferedRanges.length > 0 && (
              <div className="absolute inset-x-0 top-0 h-1.5 pointer-events-none">
                {Array.from({ length: state.bufferedRanges.length }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full bg-white/40 rounded"
                    style={{
                      left: `${(state.bufferedRanges!.start(i) / state.duration) * 100}%`,
                      width: `${((state.bufferedRanges!.end(i) - state.bufferedRanges!.start(i)) / state.duration) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                type="button"
                onClick={controls.togglePlay}
                className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                {state.isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Skip backward */}
              <button
                type="button"
                onClick={() => controls.seekRelative(-10)}
                className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                aria-label="Skip back 10 seconds"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Skip forward */}
              <button
                type="button"
                onClick={() => controls.seekRelative(10)}
                className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                aria-label="Skip forward 10 seconds"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2 group/volume">
                <button
                  type="button"
                  onClick={controls.toggleMute}
                  className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                  aria-label={state.isMuted ? 'Unmute' : 'Mute'}
                >
                  {state.isMuted || state.volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : state.volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={handleVolumeChange}
                  className={clsx(
                    'w-0 group-hover/volume:w-20 transition-all duration-200',
                    'h-1 bg-white/20 rounded-lg appearance-none cursor-pointer',
                    '[&::-webkit-slider-thumb]:appearance-none',
                    '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
                    '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full',
                    'focus:outline-none focus:ring-2 focus:ring-white'
                  )}
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <div className="text-white text-sm tabular-nums" aria-live="off">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Playback speed */}
              <select
                value={state.playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
                aria-label="Playback speed"
              >
                {PLAYBACK_RATES.map((rate) => (
                  <option key={rate} value={rate} className="bg-slate-900">
                    {rate === 1 ? 'Normal' : `${rate}x`}
                  </option>
                ))}
              </select>

              {/* Captions */}
              {captions.length > 0 && (
                <button
                  type="button"
                  onClick={handleCaptionsToggle}
                  className={clsx(
                    'text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors',
                    captionsEnabled && 'bg-white/20'
                  )}
                  aria-label={captionsEnabled ? 'Hide captions' : 'Show captions'}
                  aria-pressed={captionsEnabled}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path
                      fillRule="evenodd"
                      d="M5 8a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1zm6-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {/* Picture-in-Picture */}
              {isPiPSupported && (
                <button
                  type="button"
                  onClick={handlePiPToggle}
                  className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                  aria-label={state.isPiP ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2H5z" />
                    <path d="M13 9a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V9z" />
                  </svg>
                </button>
              )}

              {/* Fullscreen */}
              <button
                type="button"
                onClick={handleFullscreenToggle}
                className="text-white hover:text-purple-300 focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1 transition-colors"
                aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {state.isFullscreen ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M5 4a1 1 0 00-1 1v3a1 1 0 01-2 0V5a3 3 0 013-3h3a1 1 0 010 2H5zm10 0a1 1 0 011 1v3a1 1 0 102 0V5a3 3 0 00-3-3h-3a1 1 0 000 2h3zm-9 10a1 1 0 011-1h3a1 1 0 110 2H6a1 1 0 01-1-1zm10 0a1 1 0 011 1v3a1 1 0 01-2 0v-3a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h3a1 1 0 010 2H5v2a1 1 0 01-2 0V4zm11-1a1 1 0 011 1v3a1 1 0 01-2 0V5h-2a1 1 0 010-2h3zM3 15a1 1 0 011-1h3a1 1 0 110 2H5v2a1 1 0 01-2 0v-3zm11 1a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-2 0v-2h-2a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div
        id="video-shortcuts"
        className="sr-only"
        role="note"
        aria-label="Keyboard shortcuts"
      >
        Keyboard shortcuts: Space or K to play/pause, Arrow Left/Right to seek 5 seconds, Arrow
        Up/Down for volume, M to mute, F for fullscreen, Shift+P for Picture-in-Picture, C for
        captions, 0-9 to jump to percentage.
      </div>
    </div>
  );
};

export default VideoPlayer;
