/**
 * useVideoPlayer Hook Tests
 *
 * Comprehensive tests for video player state management and controls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoPlayer, PLAYBACK_RATES } from '../useVideoPlayer';

// Create mock video element
const createMockVideoElement = () => {
  const mockVideo = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    currentTime: 0,
    duration: 100,
    volume: 1,
    muted: false,
    playbackRate: 1,
    buffered: { length: 0 } as TimeRanges,
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
    requestPictureInPicture: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLVideoElement;

  return mockVideo;
};

// Create mock container element
const createMockContainer = () => {
  return {
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
  } as unknown as HTMLDivElement;
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock document.exitFullscreen
  document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

  // Mock Picture-in-Picture
  Object.defineProperty(document, 'pictureInPictureEnabled', {
    writable: true,
    value: true,
  });
  document.exitPictureInPicture = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(document, 'pictureInPictureElement', {
    writable: true,
    value: null,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useVideoPlayer', () => {
  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useVideoPlayer());

      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.currentTime).toBe(0);
      expect(result.current.state.duration).toBe(0);
      expect(result.current.state.volume).toBe(1);
      expect(result.current.state.isMuted).toBe(false);
      expect(result.current.state.isFullscreen).toBe(false);
      expect(result.current.state.isPiP).toBe(false);
      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.isBuffering).toBe(false);
      expect(result.current.state.playbackRate).toBe(1);
      expect(result.current.state.error).toBeNull();
    });

    it('should accept initial options', () => {
      const { result } = renderHook(() =>
        useVideoPlayer({
          volume: 0.5,
          muted: true,
          playbackRate: 1.5,
          startTime: 30,
        }),
      );

      expect(result.current.state.volume).toBe(0.5);
      expect(result.current.state.isMuted).toBe(true);
      expect(result.current.state.playbackRate).toBe(1.5);
    });
  });

  describe('Controls with mocked refs', () => {
    it('should provide play control', async () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      const mockContainer = createMockContainer();

      // Set refs manually
      result.current.videoRef.current = mockVideo;
      result.current.containerRef.current = mockContainer;

      await act(async () => {
        await result.current.controls.play();
      });

      expect(mockVideo.play).toHaveBeenCalled();
    });

    it('should provide pause control', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.pause();
      });

      expect(mockVideo.pause).toHaveBeenCalled();
    });

    it('should toggle play/pause', async () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      // Initial state: not playing
      expect(result.current.state.isPlaying).toBe(false);

      // Toggle to play
      await act(async () => {
        result.current.controls.togglePlay();
      });

      expect(mockVideo.play).toHaveBeenCalled();
    });

    it('should seek to specific time', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.seek(50);
      });

      expect(mockVideo.currentTime).toBe(50);
      expect(result.current.state.currentTime).toBe(50);
    });

    it('should clamp seek time to valid range', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.seek(-10);
      });

      expect(result.current.state.currentTime).toBe(0);
    });

    it('should seek relative to current time', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      mockVideo.currentTime = 30;
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.seekRelative(10);
      });

      expect(result.current.state.currentTime).toBe(40);
    });

    it('should set volume', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.setVolume(0.5);
      });

      expect(result.current.state.volume).toBe(0.5);
    });

    it('should clamp volume to valid range', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.setVolume(1.5);
      });

      expect(result.current.state.volume).toBe(1);

      act(() => {
        result.current.controls.setVolume(-0.5);
      });

      expect(result.current.state.volume).toBe(0);
    });

    it('should toggle mute', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      expect(result.current.state.isMuted).toBe(false);

      act(() => {
        result.current.controls.toggleMute();
      });

      expect(result.current.state.isMuted).toBe(true);

      act(() => {
        result.current.controls.toggleMute();
      });

      expect(result.current.state.isMuted).toBe(false);
    });

    it('should set playback rate', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.setPlaybackRate(1.5);
      });

      expect(result.current.state.playbackRate).toBe(1.5);
    });

    it('should only accept valid playback rates', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.setPlaybackRate(3); // Invalid rate
      });

      expect(result.current.state.playbackRate).toBe(1); // Should remain unchanged
    });

    it('should toggle fullscreen', async () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      const mockContainer = createMockContainer();
      result.current.videoRef.current = mockVideo;
      result.current.containerRef.current = mockContainer;

      await act(async () => {
        await result.current.controls.toggleFullscreen();
      });

      expect(mockContainer.requestFullscreen).toHaveBeenCalled();
    });

    it('should toggle Picture-in-Picture', async () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      await act(async () => {
        await result.current.controls.togglePiP();
      });

      expect(mockVideo.requestPictureInPicture).toHaveBeenCalled();
    });

    it('should restart video', async () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      await act(async () => {
        result.current.controls.restart();
      });

      expect(mockVideo.currentTime).toBe(0);
      expect(mockVideo.play).toHaveBeenCalled();
    });
  });

  describe('Progress Callbacks', () => {
    it('should update state when seek is called', () => {
      const { result } = renderHook(() => useVideoPlayer());

      const mockVideo = createMockVideoElement();
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.controls.seek(50);
      });

      expect(result.current.state.currentTime).toBe(50);
    });

    it('should handle error callback', () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useVideoPlayer({ onError }));

      const mockVideo = {
        ...createMockVideoElement(),
        error: { message: 'Test error' },
      } as unknown as HTMLVideoElement;
      result.current.videoRef.current = mockVideo;

      act(() => {
        result.current.handlers.onError();
      });

      expect(result.current.state.error).toBe('Test error');
    });
  });

  describe('Event Handlers', () => {
    it('should provide all event handlers', () => {
      const { result } = renderHook(() => useVideoPlayer());

      expect(result.current.handlers.onLoadStart).toBeDefined();
      expect(result.current.handlers.onLoadedMetadata).toBeDefined();
      expect(result.current.handlers.onCanPlay).toBeDefined();
      expect(result.current.handlers.onWaiting).toBeDefined();
      expect(result.current.handlers.onPlaying).toBeDefined();
      expect(result.current.handlers.onTimeUpdate).toBeDefined();
      expect(result.current.handlers.onProgress).toBeDefined();
      expect(result.current.handlers.onPlay).toBeDefined();
      expect(result.current.handlers.onPause).toBeDefined();
      expect(result.current.handlers.onEnded).toBeDefined();
      expect(result.current.handlers.onError).toBeDefined();
      expect(result.current.handlers.onVolumeChange).toBeDefined();
    });

    it('should update loading state on loadStart', () => {
      const { result } = renderHook(() => useVideoPlayer());

      act(() => {
        result.current.handlers.onLoadStart();
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should update buffering state on waiting', () => {
      const { result } = renderHook(() => useVideoPlayer());

      act(() => {
        result.current.handlers.onWaiting();
      });

      expect(result.current.state.isBuffering).toBe(true);
    });

    it('should update buffering state on playing', () => {
      const { result } = renderHook(() => useVideoPlayer());

      act(() => {
        result.current.handlers.onWaiting();
        result.current.handlers.onPlaying();
      });

      expect(result.current.state.isBuffering).toBe(false);
    });

    it('should update playing state on play/pause', () => {
      const { result } = renderHook(() => useVideoPlayer());

      act(() => {
        result.current.handlers.onPlay();
      });

      expect(result.current.state.isPlaying).toBe(true);

      act(() => {
        result.current.handlers.onPause();
      });

      expect(result.current.state.isPlaying).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should export playback rates', () => {
      expect(PLAYBACK_RATES).toContain(0.5);
      expect(PLAYBACK_RATES).toContain(1);
      expect(PLAYBACK_RATES).toContain(1.5);
      expect(PLAYBACK_RATES).toContain(2);
    });
  });

  describe('Refs', () => {
    it('should provide video ref', () => {
      const { result } = renderHook(() => useVideoPlayer());

      expect(result.current.videoRef).toBeDefined();
      expect(result.current.videoRef.current).toBeNull(); // Not attached to DOM
    });

    it('should provide container ref', () => {
      const { result } = renderHook(() => useVideoPlayer());

      expect(result.current.containerRef).toBeDefined();
    });
  });
});
