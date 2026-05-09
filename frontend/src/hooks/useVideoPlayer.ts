     1|/**
     2| * useVideoPlayer Hook
     3| *
     4| * Custom hook for managing video player state, events, and keyboard shortcuts
     5| * Supports Picture-in-Picture, fullscreen, and comprehensive controls
     6| */
     7|
     8|import { useRef, useState, useCallback, useEffect } from 'react';
     9|
    10|export interface VideoPlayerState {
    11|  isPlaying: boolean;
    12|  currentTime: number;
    13|  duration: number;
    14|  volume: number;
    15|  isMuted: boolean;
    16|  isFullscreen: boolean;
    17|  isPiP: boolean;
    18|  isLoading: boolean;
    19|  isBuffering: boolean;
    20|  playbackRate: number;
    21|  bufferedRanges: TimeRanges | null;
    22|  error: string | null;
    23|}
    24|
    25|export interface VideoPlayerControls {
    26|  play: () => Promise<void>;
    27|  pause: () => void;
    28|  togglePlay: () => void;
    29|  seek: (time: number) => void;
    30|  seekRelative: (seconds: number) => void;
    31|  setVolume: (volume: number) => void;
    32|  toggleMute: () => void;
    33|  setPlaybackRate: (rate: number) => void;
    34|  toggleFullscreen: () => Promise<void>;
    35|  togglePiP: () => Promise<void>;
    36|  restart: () => void;
    37|}
    38|
    39|export interface VideoPlayerOptions {
    40|  autoplay?: boolean;
    41|  startTime?: number;
    42|  volume?: number;
    43|  muted?: boolean;
    44|  playbackRate?: number;
    45|  onProgress?: (progress: VideoProgress) => void;
    46|  onComplete?: () => void;
    47|  onError?: (error: string) => void;
    48|}
    49|
    50|export interface VideoProgress {
    51|  currentTime: number;
    52|  duration: number;
    53|  percentage: number;
    54|  completed: boolean;
    55|}
    56|
    57|const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    58|const SEEK_JUMP_SECONDS = 5;
    59|const VOLUME_STEP = 0.1;
    60|const COMPLETION_THRESHOLD = 95; // percentage
    61|
    62|export function useVideoPlayer(options: VideoPlayerOptions = {}) {
    63|  const {
    64|    autoplay = false,
    65|    startTime = 0,
    66|    volume: initialVolume = 1,
    67|    muted: initialMuted = false,
    68|    playbackRate: initialPlaybackRate = 1,
    69|    onProgress,
    70|    onComplete,
    71|    onError,
    72|  } = options;
    73|
    74|  const videoRef = useRef<HTMLVideoElement>(null);
    75|  const containerRef = useRef<HTMLDivElement>(null);
    76|  const progressUpdateRef = useRef<number | null>(null);
    77|
    78|  const [state, setState] = useState<VideoPlayerState>({
    79|    isPlaying: false,
    80|    currentTime: 0,
    81|    duration: 0,
    82|    volume: initialVolume,
    83|    isMuted: initialMuted,
    84|    isFullscreen: false,
    85|    isPiP: false,
    86|    isLoading: true,
    87|    isBuffering: false,
    88|    playbackRate: initialPlaybackRate,
    89|    bufferedRanges: null,
    90|    error: null,
    91|  });
    92|
    93|  // Update state helper
    94|  const updateState = useCallback((updates: Partial<VideoPlayerState>) => {
    95|    setState((prev) => ({ ...prev, ...updates }));
    96|  }, []);
    97|
    98|  // Progress callback
    99|  useEffect(() => {
   100|    if (!state.duration || state.duration === 0) return;
   101|
   102|    const percentage = (state.currentTime / state.duration) * 100;
   103|    const completed = percentage >= COMPLETION_THRESHOLD;
   104|
   105|    onProgress?.({
   106|      currentTime: state.currentTime,
   107|      duration: state.duration,
   108|      percentage,
   109|      completed,
   110|    });
   111|
   112|    if (completed && !state.isPlaying) {
   113|      onComplete?.();
   114|    }
   115|  }, [state.currentTime, state.duration, state.isPlaying, onProgress, onComplete]);
   116|
   117|  // Play
   118|  const play = useCallback(async () => {
   119|    const video = videoRef.current;
   120|    if (!video) return;
   121|
   122|    try {
   123|      await video.play();
   124|    } catch (error) {
   125|      const errorMessage = error instanceof Error ? error.message : 'Failed to play video';
   126|      updateState({ error: errorMessage });
   127|      onError?.(errorMessage);
   128|    }
   129|  }, [updateState, onError]);
   130|
   131|  // Pause
   132|  const pause = useCallback(() => {
   133|    const video = videoRef.current;
   134|    if (!video) return;
   135|    video.pause();
   136|  }, []);
   137|
   138|  // Toggle play/pause
   139|  const togglePlay = useCallback(() => {
   140|    if (state.isPlaying) {
   141|      pause();
   142|    } else {
   143|      void play();
   144|    }
   145|  }, [state.isPlaying, play, pause]);
   146|
   147|  // Seek to specific time
   148|  const seek = useCallback(
   149|    (time: number) => {
   150|      const video = videoRef.current;
   151|      if (!video) return;
   152|
   153|      const clampedTime = Math.max(0, Math.min(time, video.duration || 0));
   154|      video.currentTime = clampedTime;
   155|      updateState({ currentTime: clampedTime });
   156|    },
   157|    [updateState],
   158|  );
   159|
   160|  // Seek relative to current time
   161|  const seekRelative = useCallback(
   162|    (seconds: number) => {
   163|      const video = videoRef.current;
   164|      if (!video) return;
   165|
   166|      const newTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0));
   167|      video.currentTime = newTime;
   168|      updateState({ currentTime: newTime });
   169|    },
   170|    [updateState],
   171|  );
   172|
   173|  // Set volume
   174|  const setVolume = useCallback(
   175|    (newVolume: number) => {
   176|      const video = videoRef.current;
   177|      if (!video) return;
   178|
   179|      const clampedVolume = Math.max(0, Math.min(1, newVolume));
   180|      video.volume = clampedVolume;
   181|      video.muted = clampedVolume === 0;
   182|      updateState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
   183|    },
   184|    [updateState],
   185|  );
   186|
   187|  // Toggle mute
   188|  const toggleMute = useCallback(() => {
   189|    const video = videoRef.current;
   190|    if (!video) return;
   191|
   192|    const newMuted = !video.muted;
   193|    video.muted = newMuted;
   194|    updateState({ isMuted: newMuted });
   195|  }, [updateState]);
   196|
   197|  // Set playback rate
   198|  const setPlaybackRate = useCallback(
   199|    (rate: number) => {
   200|      const video = videoRef.current;
   201|      if (!video) return;
   202|
   203|      if (PLAYBACK_RATES.includes(rate)) {
   204|        video.playbackRate = rate;
   205|        updateState({ playbackRate: rate });
   206|      }
   207|    },
   208|    [updateState],
   209|  );
   210|
   211|  // Toggle fullscreen
   212|  const toggleFullscreen = useCallback(async () => {
   213|    const container = containerRef.current;
   214|    if (!container) return;
   215|
   216|    try {
   217|      if (!document.fullscreenElement) {
   218|        await container.requestFullscreen();
   219|        updateState({ isFullscreen: true });
   220|      } else {
   221|        await document.exitFullscreen();
   222|        updateState({ isFullscreen: false });
   223|      }
   224|    } catch (error) {
   225|      console.error('Fullscreen error:', error);
   226|    }
   227|  }, [updateState]);
   228|
   229|  // Toggle Picture-in-Picture
   230|  const togglePiP = useCallback(async () => {
   231|    const video = videoRef.current;
   232|    if (!video) return;
   233|
   234|    try {
   235|      if (document.pictureInPictureElement) {
   236|        await document.exitPictureInPicture();
   237|        updateState({ isPiP: false });
   238|      } else if (document.pictureInPictureEnabled) {
   239|        await video.requestPictureInPicture();
   240|        updateState({ isPiP: true });
   241|      }
   242|    } catch (error) {
   243|      console.error('Picture-in-Picture error:', error);
   244|    }
   245|  }, [updateState]);
   246|
   247|  // Restart video
   248|  const restart = useCallback(() => {
   249|    const video = videoRef.current;
   250|    if (!video) return;
   251|
   252|    video.currentTime = 0;
   253|    void video.play();
   254|  }, []);
   255|
   256|  // Video event handlers
   257|  const handleLoadStart = useCallback(() => {
   258|    updateState({ isLoading: true, error: null });
   259|  }, [updateState]);
   260|
   261|  const handleLoadedMetadata = useCallback(() => {
   262|    const video = videoRef.current;
   263|    if (!video) return;
   264|
   265|    updateState({ duration: video.duration, isLoading: false });
   266|
   267|    if (startTime > 0 && video.currentTime === 0) {
   268|      video.currentTime = startTime;
   269|    }
   270|
   271|    if (autoplay) {
   272|      void video.play();
   273|    }
   274|  }, [updateState, startTime, autoplay]);
   275|
   276|  const handleCanPlay = useCallback(() => {
   277|    updateState({ isLoading: false, isBuffering: false });
   278|  }, [updateState]);
   279|
   280|  const handleWaiting = useCallback(() => {
   281|    updateState({ isBuffering: true });
   282|  }, [updateState]);
   283|
   284|  const handlePlaying = useCallback(() => {
   285|    updateState({ isBuffering: false });
   286|  }, [updateState]);
   287|
   288|  const handleTimeUpdate = useCallback(() => {
   289|    const video = videoRef.current;
   290|    if (!video) return;
   291|
   292|    updateState({
   293|      currentTime: video.currentTime,
   294|      bufferedRanges: video.buffered,
   295|    });
   296|  }, [updateState]);
   297|
   298|  const handleProgress = useCallback(() => {
   299|    const video = videoRef.current;
   300|    if (!video) return;
   301|
   302|    updateState({ bufferedRanges: video.buffered });
   303|  }, [updateState]);
   304|
   305|  const handlePlay = useCallback(() => {
   306|    updateState({ isPlaying: true });
   307|  }, [updateState]);
   308|
   309|  const handlePause = useCallback(() => {
   310|    updateState({ isPlaying: false });
   311|  }, [updateState]);
   312|
   313|  const handleEnded = useCallback(() => {
   314|    updateState({ isPlaying: false });
   315|    onComplete?.();
   316|  }, [updateState, onComplete]);
   317|
   318|  const handleError = useCallback(() => {
   319|    const video = videoRef.current;
   320|    if (!video) return;
   321|
   322|    const errorMessage = video.error?.message ?? 'An error occurred while loading the video';
   323|    updateState({ error: errorMessage, isPlaying: false, isLoading: false });
   324|    onError?.(errorMessage);
   325|  }, [updateState, onError]);
   326|
   327|  const handleVolumeChange = useCallback(() => {
   328|    const video = videoRef.current;
   329|    if (!video) return;
   330|
   331|    updateState({ volume: video.volume, isMuted: video.muted });
   332|  }, [updateState]);
   333|
   334|  const handleFullscreenChange = useCallback(() => {
   335|    updateState({ isFullscreen: !!document.fullscreenElement });
   336|  }, [updateState]);
   337|
   338|  const handlePiPChange = useCallback(() => {
   339|    updateState({ isPiP: document.pictureInPictureElement === videoRef.current });
   340|  }, [updateState]);
   341|
   342|  // Keyboard shortcuts
   343|  useEffect(() => {
   344|    const handleKeyDown = (e: KeyboardEvent) => {
   345|      // Don't capture if typing in an input
   346|      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
   347|        return;
   348|      }
   349|
   350|      const video = videoRef.current;
   351|      if (!video) return;
   352|
   353|      switch (e.key.toLowerCase()) {
   354|        case ' ':
   355|        case 'k':
   356|          e.preventDefault();
   357|          togglePlay();
   358|          break;
   359|        case 'arrowleft':
   360|        case 'j':
   361|          e.preventDefault();
   362|          seekRelative(-SEEK_JUMP_SECONDS);
   363|          break;
   364|        case 'arrowright':
   365|        case 'l':
   366|          e.preventDefault();
   367|          seekRelative(SEEK_JUMP_SECONDS);
   368|          break;
   369|        case 'arrowup':
   370|          e.preventDefault();
   371|          setVolume(state.volume + VOLUME_STEP);
   372|          break;
   373|        case 'arrowdown':
   374|          e.preventDefault();
   375|          setVolume(state.volume - VOLUME_STEP);
   376|          break;
   377|        case 'm':
   378|          e.preventDefault();
   379|          toggleMute();
   380|          break;
   381|        case 'f':
   382|          e.preventDefault();
   383|          void toggleFullscreen();
   384|          break;
   385|        case 'p':
   386|          if (e.shiftKey) {
   387|            e.preventDefault();
   388|            void togglePiP();
   389|          }
   390|          break;
   391|        case '0':
   392|        case 'home':
   393|          e.preventDefault();
   394|          seek(0);
   395|          break;
   396|        case 'end':
   397|          e.preventDefault();
   398|          seek(video.duration || 0);
   399|          break;
   400|        case '1':
   401|        case '2':
   402|        case '3':
   403|        case '4':
   404|        case '5':
   405|        case '6':
   406|        case '7':
   407|        case '8':
   408|        case '9':
   409|          e.preventDefault();
   410|          if (video.duration) {
   411|            const percentage = parseInt(e.key) * 10;
   412|            seek((video.duration * percentage) / 100);
   413|          }
   414|          break;
   415|      }
     default:
       break;
   416|    };
   417|
   418|    document.addEventListener('keydown', handleKeyDown);
   419|    return () => document.removeEventListener('keydown', handleKeyDown);
   420|  }, [
   421|    togglePlay,
   422|    seekRelative,
   423|    setVolume,
   424|    state.volume,
   425|    toggleMute,
   426|    toggleFullscreen,
   427|    togglePiP,
   428|    seek,
   429|  ]);
   430|
   431|  // Fullscreen change listener
   432|  useEffect(() => {
   433|    document.addEventListener('fullscreenchange', handleFullscreenChange);
   434|    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
   435|  }, [handleFullscreenChange]);
   436|
   437|  // PiP change listener
   438|  useEffect(() => {
   439|    const video = videoRef.current;
   440|    if (!video) return;
   441|
   442|    video.addEventListener('enterpictureinpicture', handlePiPChange);
   443|    video.addEventListener('leavepictureinpicture', handlePiPChange);
   444|
   445|    return () => {
   446|      video.removeEventListener('enterpictureinpicture', handlePiPChange);
   447|      video.removeEventListener('leavepictureinpicture', handlePiPChange);
   448|    };
   449|  }, [handlePiPChange]);
   450|
   451|  // Cleanup on unmount
   452|  useEffect(() => {
   453|    // Capture ref value at cleanup setup time
   454|    const progressUpdateId = progressUpdateRef.current;
   455|
   456|    return () => {
   457|      if (progressUpdateId) {
   458|        cancelAnimationFrame(progressUpdateId);
   459|      }
   460|    };
   461|  }, []);
   462|
   463|  const controls: VideoPlayerControls = {
   464|    play,
   465|    pause,
   466|    togglePlay,
   467|    seek,
   468|    seekRelative,
   469|    setVolume,
   470|    toggleMute,
   471|    setPlaybackRate,
   472|    toggleFullscreen,
   473|    togglePiP,
   474|    restart,
   475|  };
   476|
   477|  return {
   478|    videoRef,
   479|    containerRef,
   480|    state,
   481|    controls,
   482|    handlers: {
   483|      onLoadStart: handleLoadStart,
   484|      onLoadedMetadata: handleLoadedMetadata,
   485|      onCanPlay: handleCanPlay,
   486|      onWaiting: handleWaiting,
   487|      onPlaying: handlePlaying,
   488|      onTimeUpdate: handleTimeUpdate,
   489|      onProgress: handleProgress,
   490|      onPlay: handlePlay,
   491|      onPause: handlePause,
   492|      onEnded: handleEnded,
   493|      onError: handleError,
   494|      onVolumeChange: handleVolumeChange,
   495|    },
   496|  };
   497|}
   498|
   499|export { PLAYBACK_RATES, SEEK_JUMP_SECONDS, VOLUME_STEP, COMPLETION_THRESHOLD };
   500|export default useVideoPlayer;
   501|