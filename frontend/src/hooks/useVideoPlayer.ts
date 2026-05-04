/**
 * useVideoPlayer Hook
 *
 * Custom hook for managing video player state, events, and keyboard shortcuts
 * Supports Picture-in-Picture, fullscreen, and comprehensive controls
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  playbackRate: number;
  bufferedRanges: TimeRanges | null;
  error: string | null;
}

export interface VideoPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  seekRelative: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => Promise<void>;
  togglePiP: () => Promise<void>;
  restart: () => void;
}

export interface VideoPlayerOptions {
  autoplay?: boolean;
  startTime?: number;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  onProgress?: (progress: VideoProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_JUMP_SECONDS = 5;
const VOLUME_STEP = 0.1;
const COMPLETION_THRESHOLD = 95; // percentage

export function useVideoPlayer(options: VideoPlayerOptions = {}) {
  const {
    autoplay = false,
    startTime = 0,
    volume: initialVolume = 1,
    muted: initialMuted = false,
    playbackRate: initialPlaybackRate = 1,
    onProgress,
    onComplete,
    onError,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressUpdateRef = useRef<number | null>(null);

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: initialVolume,
    isMuted: initialMuted,
    isFullscreen: false,
    isPiP: false,
    isLoading: true,
    isBuffering: false,
    playbackRate: initialPlaybackRate,
    bufferedRanges: null,
    error: null,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<VideoPlayerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Progress callback
  useEffect(() => {
    if (!state.duration || state.duration === 0) return;

    const percentage = (state.currentTime / state.duration) * 100;
    const completed = percentage >= COMPLETION_THRESHOLD;

    onProgress?.({
      currentTime: state.currentTime,
      duration: state.duration,
      percentage,
      completed,
    });

    if (completed && !state.isPlaying) {
      onComplete?.();
    }
  }, [state.currentTime, state.duration, state.isPlaying, onProgress, onComplete]);

  // Play
  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play video';
      updateState({ error: errorMessage });
      onError?.(errorMessage);
    }
  }, [updateState, onError]);

  // Pause
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      void play();
    }
  }, [state.isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      const clampedTime = Math.max(0, Math.min(time, video.duration || 0));
      video.currentTime = clampedTime;
      updateState({ currentTime: clampedTime });
    },
    [updateState],
  );

  // Seek relative to current time
  const seekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      const newTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0));
      video.currentTime = newTime;
      updateState({ currentTime: newTime });
    },
    [updateState],
  );

  // Set volume
  const setVolume = useCallback(
    (newVolume: number) => {
      const video = videoRef.current;
      if (!video) return;

      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      video.volume = clampedVolume;
      video.muted = clampedVolume === 0;
      updateState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
    },
    [updateState],
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    updateState({ isMuted: newMuted });
  }, [updateState]);

  // Set playback rate
  const setPlaybackRate = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;

      if (PLAYBACK_RATES.includes(rate)) {
        video.playbackRate = rate;
        updateState({ playbackRate: rate });
      }
    },
    [updateState],
  );

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        updateState({ isFullscreen: true });
      } else {
        await document.exitFullscreen();
        updateState({ isFullscreen: false });
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [updateState]);

  // Toggle Picture-in-Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        updateState({ isPiP: false });
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        updateState({ isPiP: true });
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  }, [updateState]);

  // Restart video
  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    void video.play();
  }, []);

  // Video event handlers
  const handleLoadStart = useCallback(() => {
    updateState({ isLoading: true, error: null });
  }, [updateState]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    updateState({ duration: video.duration, isLoading: false });

    if (startTime > 0 && video.currentTime === 0) {
      video.currentTime = startTime;
    }

    if (autoplay) {
      void video.play();
    }
  }, [updateState, startTime, autoplay]);

  const handleCanPlay = useCallback(() => {
    updateState({ isLoading: false, isBuffering: false });
  }, [updateState]);

  const handleWaiting = useCallback(() => {
    updateState({ isBuffering: true });
  }, [updateState]);

  const handlePlaying = useCallback(() => {
    updateState({ isBuffering: false });
  }, [updateState]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    updateState({
      currentTime: video.currentTime,
      bufferedRanges: video.buffered,
    });
  }, [updateState]);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    updateState({ bufferedRanges: video.buffered });
  }, [updateState]);

  const handlePlay = useCallback(() => {
    updateState({ isPlaying: true });
  }, [updateState]);

  const handlePause = useCallback(() => {
    updateState({ isPlaying: false });
  }, [updateState]);

  const handleEnded = useCallback(() => {
    updateState({ isPlaying: false });
    onComplete?.();
  }, [updateState, onComplete]);

  const handleError = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const errorMessage = video.error?.message ?? 'An error occurred while loading the video';
    updateState({ error: errorMessage, isPlaying: false, isLoading: false });
    onError?.(errorMessage);
  }, [updateState, onError]);

  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    updateState({ volume: video.volume, isMuted: video.muted });
  }, [updateState]);

  const handleFullscreenChange = useCallback(() => {
    updateState({ isFullscreen: !!document.fullscreenElement });
  }, [updateState]);

  const handlePiPChange = useCallback(() => {
    updateState({ isPiP: document.pictureInPictureElement === videoRef.current });
  }, [updateState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekRelative(-SEEK_JUMP_SECONDS);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekRelative(SEEK_JUMP_SECONDS);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(state.volume + VOLUME_STEP);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(state.volume - VOLUME_STEP);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          void toggleFullscreen();
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            void togglePiP();
          }
          break;
        case '0':
        case 'home':
          e.preventDefault();
          seek(0);
          break;
        case 'end':
          e.preventDefault();
          seek(video.duration || 0);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          if (video.duration) {
            const percentage = parseInt(e.key) * 10;
            seek((video.duration * percentage) / 100);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    seekRelative,
    setVolume,
    state.volume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    seek,
  ]);

  // Fullscreen change listener
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  // PiP change listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('enterpictureinpicture', handlePiPChange);
    video.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      video.removeEventListener('enterpictureinpicture', handlePiPChange);
      video.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, [handlePiPChange]);

  // Cleanup on unmount
  useEffect(() => {
    // Capture ref value at cleanup setup time
    const progressUpdateId = progressUpdateRef.current;

    return () => {
      if (progressUpdateId) {
        cancelAnimationFrame(progressUpdateId);
      }
    };
  }, []);

  const controls: VideoPlayerControls = {
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    togglePiP,
    restart,
  };

  return {
    videoRef,
    containerRef,
    state,
    controls,
    handlers: {
      onLoadStart: handleLoadStart,
      onLoadedMetadata: handleLoadedMetadata,
      onCanPlay: handleCanPlay,
      onWaiting: handleWaiting,
      onPlaying: handlePlaying,
      onTimeUpdate: handleTimeUpdate,
      onProgress: handleProgress,
      onPlay: handlePlay,
      onPause: handlePause,
      onEnded: handleEnded,
      onError: handleError,
      onVolumeChange: handleVolumeChange,
    },
  };
}

export { PLAYBACK_RATES, SEEK_JUMP_SECONDS, VOLUME_STEP, COMPLETION_THRESHOLD };
export default useVideoPlayer;
