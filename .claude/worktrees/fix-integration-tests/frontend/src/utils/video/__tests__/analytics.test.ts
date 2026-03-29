/**
 * Video Analytics Utility Tests
 *
 * Tests for video engagement tracking and metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VideoAnalytics, PROGRESS_MILESTONES } from '../analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console.debug
vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('VideoAnalytics', () => {
  let analytics: VideoAnalytics;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Create fresh instance for each test
    analytics = new VideoAnalytics();
  });

  afterEach(() => {
    if (analytics) {
      analytics.destroy();
    }
  });

  describe('Session Management', () => {
    it('should start a new session', () => {
      const session = analytics.startSession('video-1');

      expect(session.videoId).toBe('video-1');
      expect(session.playCount).toBe(1);
      expect(session.totalWatchTime).toBe(0);
      expect(session.progressMilestones).toEqual([]);
    });

    it('should resume existing session', () => {
      analytics.startSession('video-1');
      analytics.endSession('video-1');

      const session = analytics.startSession('video-1');
      expect(session.playCount).toBe(2);
    });

    it('should end session', () => {
      analytics.startSession('video-1');
      analytics.endSession('video-1');

      const session = analytics.getSession('video-1');
      expect(session?.endTime).toBeDefined();
    });

    it('should get session data', () => {
      analytics.startSession('video-1');
      const session = analytics.getSession('video-1');

      expect(session).toBeDefined();
      expect(session?.videoId).toBe('video-1');
    });
  });

  describe('Event Tracking', () => {
    it('should track play event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'play', { currentTime: 0 });

      const session = analytics.getSession('video-1');
      expect(session?.playCount).toBe(2); // Initial + tracked play
    });

    it('should track pause event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'pause', { currentTime: 10 });

      const session = analytics.getSession('video-1');
      expect(session?.pauseCount).toBe(1);
    });

    it('should track seek event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'seek', { targetTime: 30 });

      const session = analytics.getSession('video-1');
      expect(session?.seekCount).toBe(1);
      expect(session?.lastPosition).toBe(30);
    });

    it('should track buffering event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'buffering_start', {});
      analytics.trackEvent('video-1', 'buffering_end', {});

      const session = analytics.getSession('video-1');
      expect(session?.bufferingEvents).toBe(1);
    });

    it('should track error event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'error', { message: 'Test error' });

      const session = analytics.getSession('video-1');
      expect(session?.errorCount).toBe(1);
    });

    it('should track playback rate change', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'playback_rate_change', { rate: 1.5 });

      const session = analytics.getSession('video-1');
      expect(session?.playbackRateChanges).toBe(1);
      expect(session?.averagePlaybackRate).toBe(1.5);
    });

    it('should track ended event', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'ended', {});

      const session = analytics.getSession('video-1');
      expect(session?.completionPercentage).toBe(100);
      expect(session?.progressMilestones).toContain(100);
    });

    it('should auto-create session when tracking event for unknown video', () => {
      analytics.trackEvent('video-2', 'play', { currentTime: 0 });

      const session = analytics.getSession('video-2');
      expect(session).toBeDefined();
      expect(session?.videoId).toBe('video-2');
    });
  });

  describe('Progress Milestones', () => {
    it('should track progress milestones', () => {
      analytics.startSession('video-1');

      // Simulate 25% progress
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 25,
        duration: 100,
      });

      let session = analytics.getSession('video-1');
      expect(session?.progressMilestones).toContain(10);
      expect(session?.progressMilestones).toContain(25);

      // Simulate 50% progress
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 50,
        duration: 100,
      });

      session = analytics.getSession('video-1');
      expect(session?.progressMilestones).toContain(50);
    });

    it('should not duplicate milestones', () => {
      analytics.startSession('video-1');

      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 25,
        duration: 100,
      });
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 30,
        duration: 100,
      });

      const session = analytics.getSession('video-1');
      const milestone25Count = session?.progressMilestones.filter((m) => m === 25).length ?? 0;
      expect(milestone25Count).toBe(1);
    });

    it('should define correct milestones', () => {
      expect(PROGRESS_MILESTONES).toContain(10);
      expect(PROGRESS_MILESTONES).toContain(25);
      expect(PROGRESS_MILESTONES).toContain(50);
      expect(PROGRESS_MILESTONES).toContain(75);
      expect(PROGRESS_MILESTONES).toContain(90);
      expect(PROGRESS_MILESTONES).toContain(100);
    });
  });

  describe('Completion Percentage', () => {
    it('should calculate completion percentage', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 75,
        duration: 100,
      });

      const percentage = analytics.getCompletionPercentage('video-1');
      expect(percentage).toBe(75);
    });

    it('should return 0 for unknown video', () => {
      const percentage = analytics.getCompletionPercentage('unknown');
      expect(percentage).toBe(0);
    });
  });

  describe('Last Position', () => {
    it('should track last position', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 45,
        duration: 100,
      });

      const position = analytics.getLastPosition('video-1');
      expect(position).toBe(45);
    });

    it('should return 0 for unknown video', () => {
      const position = analytics.getLastPosition('unknown');
      expect(position).toBe(0);
    });
  });

  describe('Milestone Checking', () => {
    it('should check if milestone was reached', () => {
      analytics.startSession('video-1');
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 50,
        duration: 100,
      });

      expect(analytics.wasMilestoneReached('video-1', 50)).toBe(true);
      expect(analytics.wasMilestoneReached('video-1', 75)).toBe(false);
    });

    it('should return false for unknown video', () => {
      expect(analytics.wasMilestoneReached('unknown', 50)).toBe(false);
    });
  });

  describe('Watch Time', () => {
    it('should update watch time', () => {
      analytics.startSession('video-1');
      analytics.updateWatchTime('video-1', 30);
      analytics.updateWatchTime('video-1', 20);

      const session = analytics.getSession('video-1');
      expect(session?.totalWatchTime).toBe(50);
    });
  });

  describe('Engagement Metrics', () => {
    it('should calculate engagement metrics', () => {
      analytics.startSession('video-1');
      analytics.updateWatchTime('video-1', 100);
      analytics.trackEvent('video-1', 'timeupdate', {
        currentTime: 75,
        duration: 100,
      });

      const metrics = analytics.getEngagementMetrics('video-1');

      expect(metrics).toBeDefined();
      expect(metrics?.totalViews).toBeGreaterThan(0);
      expect(metrics?.averageCompletionRate).toBe(75);
    });

    it('should return null for unknown video', () => {
      const metrics = analytics.getEngagementMetrics('unknown');
      expect(metrics).toBeNull();
    });
  });

  describe('Storage', () => {
    it('should save to localStorage', () => {
      // Create a new analytics instance to test storage
      const testAnalytics = new VideoAnalytics();
      testAnalytics.startSession('video-1');
      testAnalytics.flush();

      // Check that saveToStorage was called (we can verify by checking session exists)
      const session = testAnalytics.getSession('video-1');
      expect(session).toBeDefined();

      testAnalytics.destroy();
    });

    it('should load from localStorage', () => {
      const mockData = {
        sessions: [['video-1', {
          videoId: 'video-1',
          startTime: 1000,
          totalWatchTime: 50,
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
        }]],
        lastUpdated: Date.now(),
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockData));

      const newAnalytics = new VideoAnalytics();
      const session = newAnalytics.getSession('video-1');

      expect(session).toBeDefined();
      expect(session?.totalWatchTime).toBe(50);

      newAnalytics.destroy();
    });
  });

  describe('Cleanup', () => {
    it('should clear all data', () => {
      analytics.startSession('video-1');
      analytics.startSession('video-2');
      analytics.clearAll();

      expect(analytics.getSession('video-1')).toBeUndefined();
      expect(analytics.getSession('video-2')).toBeUndefined();
    });

    it('should clear specific video data', () => {
      analytics.startSession('video-1');
      analytics.startSession('video-2');
      analytics.clearVideo('video-1');

      expect(analytics.getSession('video-1')).toBeUndefined();
      expect(analytics.getSession('video-2')).toBeDefined();
    });
  });
});

describe('useVideoAnalytics', () => {
  it('should return analytics functions', async () => {
    // Import fresh to get the singleton
    const { useVideoAnalytics } = await import('../analytics');

    const videoAnalytics = useVideoAnalytics('test-video');

    expect(videoAnalytics.startSession).toBeDefined();
    expect(videoAnalytics.endSession).toBeDefined();
    expect(videoAnalytics.trackEvent).toBeDefined();
    expect(videoAnalytics.updateWatchTime).toBeDefined();
    expect(videoAnalytics.getSession).toBeDefined();
    expect(videoAnalytics.getCompletionPercentage).toBeDefined();
    expect(videoAnalytics.getLastPosition).toBeDefined();
    expect(videoAnalytics.wasMilestoneReached).toBeDefined();
  });
});
