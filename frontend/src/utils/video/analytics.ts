/**
 * Video Analytics Utility
 *
 * Tracks video engagement metrics including play progress,
 * watch time, completion rate, and user interactions
 */

export interface VideoAnalyticsEvent {
  type: VideoEventType;
  timestamp: number;
  videoId: string;
  data: Record<string, unknown>;
}

export interface VideoSessionData {
  videoId: string;
  startTime: number;
  endTime?: number;
  totalWatchTime: number;
  playCount: number;
  pauseCount: number;
  seekCount: number;
  bufferingEvents: number;
  errorCount: number;
  progressMilestones: number[]; // percentages reached (25, 50, 75, 100)
  lastPosition: number;
  completionPercentage: number;
  averagePlaybackRate: number;
  playbackRateChanges: number;
}

export interface VideoEngagementMetrics {
  videoId: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  averageCompletionRate: number;
  dropOffPoints: DropOffPoint[];
  rewatchRate: number;
  peakConcurrentViewers: number;
}

export interface DropOffPoint {
  timestamp: number; // seconds
  percentage: number; // of viewers who dropped off at this point
  reason?: string;
}

type VideoEventType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'seeking'
  | 'seeked'
  | 'ended'
  | 'timeupdate'
  | 'progress'
  | 'buffering_start'
  | 'buffering_end'
  | 'error'
  | 'fullscreen_enter'
  | 'fullscreen_exit'
  | 'pip_enter'
  | 'pip_exit'
  | 'playback_rate_change'
  | 'volume_change'
  | 'mute'
  | 'unmute'
  | 'quality_change'
  | 'caption_toggle';

// Progress milestones to track
const PROGRESS_MILESTONES = [10, 25, 50, 75, 90, 100];

class VideoAnalytics {
  private sessions = new Map<string, VideoSessionData>();
  private eventQueue: VideoAnalyticsEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private readonly FLUSH_INTERVAL_MS = 10000; // 10 seconds
  private readonly STORAGE_KEY = 'astroverse_video_analytics';

  constructor() {
    this.loadFromStorage();
    this.startFlushInterval();
  }

  /**
   * Start tracking a video session
   */
  startSession(videoId: string): VideoSessionData {
    const existingSession = this.sessions.get(videoId);

    if (existingSession) {
      // Resume existing session
      existingSession.startTime = Date.now();
      existingSession.playCount++;
      return existingSession;
    }

    const session: VideoSessionData = {
      videoId,
      startTime: Date.now(),
      totalWatchTime: 0,
      playCount: 1,
      pauseCount: 0,
      seekCount: 0,
      bufferingEvents: 0,
      errorCount: 0,
      progressMilestones: [],
      lastPosition: 0,
      completionPercentage: 0,
      averagePlaybackRate: 1,
      playbackRateChanges: 0,
    };

    this.sessions.set(videoId, session);
    return session;
  }

  /**
   * End a video session
   */
  endSession(videoId: string): void {
    const session = this.sessions.get(videoId);
    if (session) {
      session.endTime = Date.now();
      this.flush();
    }
  }

  /**
   * Track a video event
   */
  trackEvent(videoId: string, type: VideoEventType, data: Record<string, unknown> = {}): void {
    const event: VideoAnalyticsEvent = {
      type,
      timestamp: Date.now(),
      videoId,
      data,
    };

    this.eventQueue.push(event);
    this.updateSessionFromEvent(videoId, type, data);

    // Flush if queue is getting large
    if (this.eventQueue.length >= 50) {
      this.flush();
    }
  }

  /**
   * Update session data from an event
   */
  private updateSessionFromEvent(
    videoId: string,
    type: VideoEventType,
    data: Record<string, unknown>,
  ): void {
    let session = this.sessions.get(videoId);
    session ??= this.startSession(videoId);

    switch (type) {
      case 'play':
        session.playCount++;
        break;
      case 'pause':
        session.pauseCount++;
        break;
      case 'seek':
      case 'seeking':
        session.seekCount++;
        if (typeof data.targetTime === 'number') {
          session.lastPosition = data.targetTime;
        }
        break;
      case 'timeupdate':
        if (typeof data.currentTime === 'number') {
          session.lastPosition = data.currentTime;
          this.checkMilestones(session, data.currentTime, data.duration as number);
        }
        break;
      case 'buffering_start':
        session.bufferingEvents++;
        break;
      case 'error':
        session.errorCount++;
        break;
      case 'playback_rate_change':
        session.playbackRateChanges++;
        if (typeof data.rate === 'number') {
          // Calculate running average
          session.averagePlaybackRate =
            (session.averagePlaybackRate * (session.playbackRateChanges - 1) + data.rate) /
            session.playbackRateChanges;
        }
        break;
      case 'ended':
        session.completionPercentage = 100;
        if (!session.progressMilestones.includes(100)) {
          session.progressMilestones.push(100);
        }
        break;
    }

    this.sessions.set(videoId, session);
  }

  /**
   * Check and record progress milestones
   */
  private checkMilestones(session: VideoSessionData, currentTime: number, duration: number): void {
    if (!duration || duration === 0) return;

    const percentage = Math.round((currentTime / duration) * 100);

    for (const milestone of PROGRESS_MILESTONES) {
      if (percentage >= milestone && !session.progressMilestones.includes(milestone)) {
        session.progressMilestones.push(milestone);
        this.trackEvent(session.videoId, 'progress', {
          milestone,
          currentTime,
          duration,
          percentage,
        });
      }
    }

    session.completionPercentage = Math.max(session.completionPercentage, percentage);
  }

  /**
   * Update watch time for a video
   */
  updateWatchTime(videoId: string, secondsWatched: number): void {
    const session = this.sessions.get(videoId);
    if (session) {
      session.totalWatchTime += secondsWatched;
      this.sessions.set(videoId, session);
    }
  }

  /**
   * Get session data for a video
   */
  getSession(videoId: string): VideoSessionData | undefined {
    return this.sessions.get(videoId);
  }

  /**
   * Get engagement metrics for a video
   */
  getEngagementMetrics(videoId: string): VideoEngagementMetrics | null {
    const session = this.sessions.get(videoId);
    if (!session) return null;

    return {
      videoId,
      totalViews: session.playCount,
      uniqueViewers: 1, // Per device
      averageWatchTime: session.totalWatchTime / session.playCount,
      averageCompletionRate: session.completionPercentage,
      dropOffPoints: [], // Would need aggregate data
      rewatchRate: session.playCount > 1 ? (session.playCount - 1) / session.playCount : 0,
      peakConcurrentViewers: 1, // Per device
    };
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(videoId: string): number {
    const session = this.sessions.get(videoId);
    return session?.completionPercentage ?? 0;
  }

  /**
   * Get last watched position
   */
  getLastPosition(videoId: string): number {
    const session = this.sessions.get(videoId);
    return session?.lastPosition ?? 0;
  }

  /**
   * Check if a milestone was reached
   */
  wasMilestoneReached(videoId: string, milestone: number): boolean {
    const session = this.sessions.get(videoId);
    return session?.progressMilestones.includes(milestone) ?? false;
  }

  /**
   * Flush events to storage/server
   */
  flush(): void {
    if (this.eventQueue.length === 0) return;

    // Save to local storage
    this.saveToStorage();

    // In production, this would send to an analytics server
    // For now, we just log and clear
    console.debug('[VideoAnalytics] Flushing events:', this.eventQueue.length);
    this.eventQueue = [];
  }

  /**
   * Start the flush interval
   */
  private startFlushInterval(): void {
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => {
        this.flush();
      }, this.FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Save analytics to local storage
   */
  private saveToStorage(): void {
    try {
      const data = {
        sessions: Array.from(this.sessions.entries()),
        lastUpdated: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[VideoAnalytics] Failed to save to storage:', error);
    }
  }

  /**
   * Load analytics from local storage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as {
          sessions: [string, VideoSessionData][];
          lastUpdated: number;
        };
        this.sessions = new Map(data.sessions);
      }
    } catch (error) {
      console.warn('[VideoAnalytics] Failed to load from storage:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  clearAll(): void {
    this.sessions.clear();
    this.eventQueue = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Clear analytics for a specific video
   */
  clearVideo(videoId: string): void {
    this.sessions.delete(videoId);
    this.eventQueue = this.eventQueue.filter((e) => e.videoId !== videoId);
    this.saveToStorage();
  }

  /**
   * Destroy the analytics instance
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
let analyticsInstance: VideoAnalytics | null = null;

/**
 * Get the video analytics instance
 */
export function getVideoAnalytics(): VideoAnalytics {
  analyticsInstance ??= new VideoAnalytics();
  return analyticsInstance;
}

/**
 * Hook-friendly analytics tracker
 */
export function useVideoAnalytics(videoId: string) {
  const analytics = getVideoAnalytics();

  return {
    startSession: () => analytics.startSession(videoId),
    endSession: () => analytics.endSession(videoId),
    trackEvent: (type: VideoEventType, data?: Record<string, unknown>) =>
      analytics.trackEvent(videoId, type, data),
    updateWatchTime: (seconds: number) => analytics.updateWatchTime(videoId, seconds),
    getSession: () => analytics.getSession(videoId),
    getCompletionPercentage: () => analytics.getCompletionPercentage(videoId),
    getLastPosition: () => analytics.getLastPosition(videoId),
    wasMilestoneReached: (milestone: number) => analytics.wasMilestoneReached(videoId, milestone),
  };
}

export { PROGRESS_MILESTONES };
export { VideoAnalytics };
export default VideoAnalytics;
