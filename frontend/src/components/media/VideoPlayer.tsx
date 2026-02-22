/**
 * VideoPlayer Component
 *
 * Accessible video player with progress tracking, keyboard controls, and ARIA support
 * Follows WCAG 2.1 AA guidelines for media content
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  onProgress?: (progress: VideoProgress) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  startTime?: number; // seconds
  showControls?: boolean;
  captions?: CaptionTrack[];
  defaultCaptions?: string;
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
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  // State for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  // State for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCaption, setSelectedCaption] = useState<string | undefined>(defaultCaptions);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Update progress
  useEffect(() => {
    if (!duration || duration === 0) return;

    const percentage = (currentTime / duration) * 100;
    const completed = percentage >= 95; // Consider 95% as completed

    onProgress?.({
      currentTime,
      duration,
      percentage,
      completed,
    });

    if (completed) {
      onComplete?.();
    }
  }, [currentTime, duration, onProgress, onComplete]);

  // Handle video events
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    if (autoplay && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [autoplay]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (startTime > 0) {
        videoRef.current.currentTime = startTime;
      }
    }
  }, [startTime]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  // Control handlers
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      void videoRef.current.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  }, [isMuted]);

  const handlePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      videoRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime -= 5;
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime += 5;
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'c':
          e.preventDefault();
          setCaptionsEnabled((prev) => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  // Format time helpers
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={clsx(
        'relative bg-black rounded-lg overflow-hidden',
        className
      )}
      role="region"
      aria-label={title ?? 'Video player'}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        controls={!showControls}
        aria-label={title}
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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" role="status">
            <span className="sr-only">Loading video...</span>
          </div>
        </div>
      )}

      {/* Custom controls */}
      {showControls && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          role="toolbar"
          aria-label="Video controls"
        >
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
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

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <div className="text-white text-sm" aria-live="off">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback speed */}
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRate(parseFloat(e.target.value))}
                className="bg-transparent text-white text-sm border border-gray-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Playback speed"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {/* Captions */}
              {captions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCaptionsEnabled((prev) => !prev)}
                  className={clsx(
                    'text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded p-1',
                    captionsEnabled && 'bg-white/20'
                  )}
                  aria-label={captionsEnabled ? 'Hide captions' : 'Show captions'}
                  aria-pressed={captionsEnabled}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm0 2h12v8H4V7zm2 2h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M5 4a1 1 0 00-1 1v4a1 1 0 01-2 0V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 0a1 1 0 011 1v4a1 1 0 102 0V5a3 3 0 00-3-3h-4a1 1 0 000 2h4zm-9 10a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm9 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h4v-4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-2 0V5h-3a1 1 0 01-1-1zM3 15a1 1 0 011-1h4a1 1 0 110 2H5v3a1 1 0 01-2 0v-4zm11 1a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-2 0v-3h-3a1 1 0 01-1-1z"
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
      <div className="sr-only" role="note" aria-label="Keyboard shortcuts">
        Space or K: Play/Pause, Arrow Left/Right: Seek 5s, Arrow Up/Down: Volume, M: Mute, F: Fullscreen, C: Captions
      </div>
    </div>
  );
};

export default VideoPlayer;
