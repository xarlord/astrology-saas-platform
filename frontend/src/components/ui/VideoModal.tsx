/**
 * VideoModal Component
 *
 * Video player modal with controls, transcript panel, and chapter markers
 * Designed for the Learning Center video content
 *
 * Features:
 * - Video player with playback controls
 * - Collapsible transcript panel
 * - Chapter navigation
 * - Playback speed and quality controls
 * - Responsive design with glassmorphism theme
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface TranscriptEntry {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  chapters?: VideoChapter[];
  transcript?: TranscriptEntry[];
  duration?: number; // in seconds
  className?: string;
}

const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const qualityLevels = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p HD', value: '1080' },
  { label: '720p HD', value: '720' },
  { label: '480p', value: '480' },
];

// Format time in MM:SS or HH:MM:SS format
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videoUrl,
  posterUrl,
  chapters = [],
  transcript = [],
  duration = 0,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get current chapter
  const currentChapter = chapters.find(
    (chapter) => currentTime >= chapter.startTime && currentTime < chapter.endTime,
  );

  // Get current transcript entry
  const currentTranscriptEntry = transcript.find(
    (entry) => currentTime >= entry.startTime && currentTime < entry.endTime,
  );

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  }, []);

  // Handle seek
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (progressRef.current && videoRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * videoDuration;
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoDuration));
      }
    },
    [videoDuration],
  );

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Change playback speed
  const changePlaybackSpeed = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSettings(false);
  }, []);

  // Seek to chapter
  const seekToChapter = useCallback(
    (startTime: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) {
          void videoRef.current.play();
        }
      }
    },
    [isPlaying],
  );

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        void videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoDuration,
              videoRef.current.currentTime + 10,
            );
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (!showSettings && !showTranscript) {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    showSettings,
    showTranscript,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    videoDuration,
    onClose,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className={clsx(
              'relative w-full max-w-4xl rounded-2xl overflow-hidden',
              'bg-gray-900/95 backdrop-blur-xl border border-white/10',
              'shadow-2xl shadow-purple-500/20',
              className,
            )}
            variants={modalVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 id="video-modal-title" className="text-lg font-semibold text-white truncate">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Play/Pause overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {!isPlaying && (
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <span
                      className="material-symbols-outlined text-[40px] text-white ml-1"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      play_arrow
                    </span>
                  </div>
                )}
              </button>

              {/* Current Chapter Badge */}
              {currentChapter && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm text-white text-sm font-medium">
                  {currentChapter.title}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="px-6 py-4 bg-gray-800/50">
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="relative h-1.5 bg-gray-700 rounded-full cursor-pointer group mb-4"
                onClick={handleSeek}
                role="slider"
                aria-label="Video progress"
                aria-valuemin={0}
                aria-valuemax={videoDuration}
                aria-valuenow={currentTime}
              >
                <div
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${(currentTime / videoDuration) * 100 || 0}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${(currentTime / videoDuration) * 100 || 0}% - 8px)` }}
                />

                {/* Chapter markers */}
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/50 rounded-full"
                    style={{ left: `${(chapter.startTime / videoDuration) * 100}%` }}
                    title={chapter.title}
                  />
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 text-white hover:text-purple-400 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <span className="material-symbols-outlined text-[24px]">pause</span>
                    ) : (
                      <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:text-purple-400 transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <span className="material-symbols-outlined text-[20px]">volume_off</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">volume_up</span>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-purple-500"
                      aria-label="Volume"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-sm text-gray-300">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={clsx(
                        'p-2 transition-colors',
                        showSettings ? 'text-purple-400' : 'text-white hover:text-purple-400',
                      )}
                      aria-label="Settings"
                      aria-expanded={showSettings}
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-gray-800 border border-white/10 shadow-xl min-w-[150px]">
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-2">Speed</p>
                          <div className="flex flex-wrap gap-1">
                            {playbackSpeeds.map((speed) => (
                              <button
                                key={speed}
                                onClick={() => changePlaybackSpeed(speed)}
                                className={clsx(
                                  'px-2 py-1 text-xs rounded',
                                  playbackSpeed === speed
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-2">Quality</p>
                          <div className="space-y-1">
                            {qualityLevels.map((quality) => (
                              <button
                                key={quality.value}
                                className="block w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded"
                              >
                                {quality.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:text-purple-400 transition-colors"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            {transcript.length > 0 && (
              <div className="border-t border-white/10">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center justify-between w-full px-6 py-3 text-gray-300 hover:text-white transition-colors"
                  aria-expanded={showTranscript}
                >
                  <span className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>Transcript</span>
                  </span>
                  {showTranscript ? (
                    <span className="material-symbols-outlined text-[16px]">expand_less</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  )}
                </button>

                <AnimatePresence>
                  {showTranscript && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 max-h-48 overflow-y-auto">
                        {transcript.map((entry) => (
                          <button
                            key={entry.id}
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = entry.startTime;
                              }
                            }}
                            className={clsx(
                              'block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors',
                              currentTranscriptEntry?.id === entry.id
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-300',
                            )}
                          >
                            <span className="text-xs text-gray-500 mr-2">
                              {formatTime(entry.startTime)}
                            </span>
                            {entry.text}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Chapter Navigation */}
            {chapters.length > 0 && (
              <div className="px-6 py-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Chapters</h3>
                <div className="flex flex-wrap gap-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => seekToChapter(chapter.startTime)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        currentChapter?.id === chapter.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50',
                      )}
                    >
                      <span className="text-xs text-gray-400 mr-1">
                        {formatTime(chapter.startTime)}
                      </span>
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
