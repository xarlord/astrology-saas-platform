     1|/**
     2| * Video Analytics Utility
     3| *
     4| * Tracks video engagement metrics including play progress,
     5| * watch time, completion rate, and user interactions
     6| */
     7|
     8|export interface VideoAnalyticsEvent {
     9|  type: VideoEventType;
    10|  timestamp: number;
    11|  videoId: string;
    12|  data: Record<string, unknown>;
    13|}
    14|
    15|export interface VideoSessionData {
    16|  videoId: string;
    17|  startTime: number;
    18|  endTime?: number;
    19|  totalWatchTime: number;
    20|  playCount: number;
    21|  pauseCount: number;
    22|  seekCount: number;
    23|  bufferingEvents: number;
    24|  errorCount: number;
    25|  progressMilestones: number[]; // percentages reached (25, 50, 75, 100)
    26|  lastPosition: number;
    27|  completionPercentage: number;
    28|  averagePlaybackRate: number;
    29|  playbackRateChanges: number;
    30|}
    31|
    32|export interface VideoEngagementMetrics {
    33|  videoId: string;
    34|  totalViews: number;
    35|  uniqueViewers: number;
    36|  averageWatchTime: number;
    37|  averageCompletionRate: number;
    38|  dropOffPoints: DropOffPoint[];
    39|  rewatchRate: number;
    40|  peakConcurrentViewers: number;
    41|}
    42|
    43|export interface DropOffPoint {
    44|  timestamp: number; // seconds
    45|  percentage: number; // of viewers who dropped off at this point
    46|  reason?: string;
    47|}
    48|
    49|type VideoEventType =
    50|  | 'play'
    51|  | 'pause'
    52|  | 'seek'
    53|  | 'seeking'
    54|  | 'seeked'
    55|  | 'ended'
    56|  | 'timeupdate'
    57|  | 'progress'
    58|  | 'buffering_start'
    59|  | 'buffering_end'
    60|  | 'error'
    61|  | 'fullscreen_enter'
    62|  | 'fullscreen_exit'
    63|  | 'pip_enter'
    64|  | 'pip_exit'
    65|  | 'playback_rate_change'
    66|  | 'volume_change'
    67|  | 'mute'
    68|  | 'unmute'
    69|  | 'quality_change'
    70|  | 'caption_toggle';
    71|
    72|// Progress milestones to track
    73|const PROGRESS_MILESTONES = [10, 25, 50, 75, 90, 100];
    74|
    75|class VideoAnalytics {
    76|  private sessions = new Map<string, VideoSessionData>();
    77|  private eventQueue: VideoAnalyticsEvent[] = [];
    78|  private flushInterval: ReturnType<typeof setInterval> | null = null;
    79|  private readonly FLUSH_INTERVAL_MS = 10000; // 10 seconds
    80|  private readonly STORAGE_KEY = 'astroverse_video_analytics';
    81|
    82|  constructor() {
    83|    this.loadFromStorage();
    84|    this.startFlushInterval();
    85|  }
    86|
    87|  /**
    88|   * Start tracking a video session
    89|   */
    90|  startSession(videoId: string): VideoSessionData {
    91|    const existingSession = this.sessions.get(videoId);
    92|
    93|    if (existingSession) {
    94|      // Resume existing session
    95|      existingSession.startTime = Date.now();
    96|      existingSession.playCount++;
    97|      return existingSession;
    98|    }
    99|
   100|    const session: VideoSessionData = {
   101|      videoId,
   102|      startTime: Date.now(),
   103|      totalWatchTime: 0,
   104|      playCount: 1,
   105|      pauseCount: 0,
   106|      seekCount: 0,
   107|      bufferingEvents: 0,
   108|      errorCount: 0,
   109|      progressMilestones: [],
   110|      lastPosition: 0,
   111|      completionPercentage: 0,
   112|      averagePlaybackRate: 1,
   113|      playbackRateChanges: 0,
   114|    };
   115|
   116|    this.sessions.set(videoId, session);
   117|    return session;
   118|  }
   119|
   120|  /**
   121|   * End a video session
   122|   */
   123|  endSession(videoId: string): void {
   124|    const session = this.sessions.get(videoId);
   125|    if (session) {
   126|      session.endTime = Date.now();
   127|      this.flush();
   128|    }
   129|  }
   130|
   131|  /**
   132|   * Track a video event
   133|   */
   134|  trackEvent(videoId: string, type: VideoEventType, data: Record<string, unknown> = {}): void {
   135|    const event: VideoAnalyticsEvent = {
   136|      type,
   137|      timestamp: Date.now(),
   138|      videoId,
   139|      data,
   140|    };
   141|
   142|    this.eventQueue.push(event);
   143|    this.updateSessionFromEvent(videoId, type, data);
   144|
   145|    // Flush if queue is getting large
   146|    if (this.eventQueue.length >= 50) {
   147|      this.flush();
   148|    }
   149|  }
   150|
   151|  /**
   152|   * Update session data from an event
   153|   */
   154|  private updateSessionFromEvent(
   155|    videoId: string,
   156|    type: VideoEventType,
   157|    data: Record<string, unknown>,
   158|  ): void {
   159|    let session = this.sessions.get(videoId);
   160|    session ??= this.startSession(videoId);
   161|
   162|    switch (type) {
   163|      case 'play':
   164|        session.playCount++;
   165|        break;
   166|      case 'pause':
   167|        session.pauseCount++;
   168|        break;
   169|      case 'seek':
   170|      case 'seeking':
   171|        session.seekCount++;
   172|        if (typeof data.targetTime === 'number') {
   173|          session.lastPosition = data.targetTime;
   174|        }
   175|        break;
   176|      case 'timeupdate':
   177|        if (typeof data.currentTime === 'number') {
   178|          session.lastPosition = data.currentTime;
   179|          this.checkMilestones(session, data.currentTime, data.duration as number);
   180|        }
   181|        break;
   182|      case 'buffering_start':
   183|        session.bufferingEvents++;
   184|        break;
   185|      case 'error':
   186|        session.errorCount++;
   187|        break;
   188|      case 'playback_rate_change':
   189|        session.playbackRateChanges++;
   190|        if (typeof data.rate === 'number') {
   191|          // Calculate running average
   192|          session.averagePlaybackRate =
   193|            (session.averagePlaybackRate * (session.playbackRateChanges - 1) + data.rate) /
   194|            session.playbackRateChanges;
   195|        }
   196|        break;
   197|      case 'ended':
   198|        session.completionPercentage = 100;
   199|        if (!session.progressMilestones.includes(100)) {
   200|          session.progressMilestones.push(100);
   201|        }
   202|        break;
   203|    }
   204|
   205|    this.sessions.set(videoId, session);
     default:
       break;
   206|  }
   207|
   208|  /**
   209|   * Check and record progress milestones
   210|   */
   211|  private checkMilestones(session: VideoSessionData, currentTime: number, duration: number): void {
   212|    if (!duration || duration === 0) return;
   213|
   214|    const percentage = Math.round((currentTime / duration) * 100);
   215|
   216|    for (const milestone of PROGRESS_MILESTONES) {
   217|      if (percentage >= milestone && !session.progressMilestones.includes(milestone)) {
   218|        session.progressMilestones.push(milestone);
   219|        this.trackEvent(session.videoId, 'progress', {
   220|          milestone,
   221|          currentTime,
   222|          duration,
   223|          percentage,
   224|        });
   225|      }
   226|    }
   227|
   228|    session.completionPercentage = Math.max(session.completionPercentage, percentage);
   229|  }
   230|
   231|  /**
   232|   * Update watch time for a video
   233|   */
   234|  updateWatchTime(videoId: string, secondsWatched: number): void {
   235|    const session = this.sessions.get(videoId);
   236|    if (session) {
   237|      session.totalWatchTime += secondsWatched;
   238|      this.sessions.set(videoId, session);
   239|    }
   240|  }
   241|
   242|  /**
   243|   * Get session data for a video
   244|   */
   245|  getSession(videoId: string): VideoSessionData | undefined {
   246|    return this.sessions.get(videoId);
   247|  }
   248|
   249|  /**
   250|   * Get engagement metrics for a video
   251|   */
   252|  getEngagementMetrics(videoId: string): VideoEngagementMetrics | null {
   253|    const session = this.sessions.get(videoId);
   254|    if (!session) return null;
   255|
   256|    return {
   257|      videoId,
   258|      totalViews: session.playCount,
   259|      uniqueViewers: 1, // Per device
   260|      averageWatchTime: session.totalWatchTime / session.playCount,
   261|      averageCompletionRate: session.completionPercentage,
   262|      dropOffPoints: [], // Would need aggregate data
   263|      rewatchRate: session.playCount > 1 ? (session.playCount - 1) / session.playCount : 0,
   264|      peakConcurrentViewers: 1, // Per device
   265|    };
   266|  }
   267|
   268|  /**
   269|   * Get completion percentage
   270|   */
   271|  getCompletionPercentage(videoId: string): number {
   272|    const session = this.sessions.get(videoId);
   273|    return session?.completionPercentage ?? 0;
   274|  }
   275|
   276|  /**
   277|   * Get last watched position
   278|   */
   279|  getLastPosition(videoId: string): number {
   280|    const session = this.sessions.get(videoId);
   281|    return session?.lastPosition ?? 0;
   282|  }
   283|
   284|  /**
   285|   * Check if a milestone was reached
   286|   */
   287|  wasMilestoneReached(videoId: string, milestone: number): boolean {
   288|    const session = this.sessions.get(videoId);
   289|    return session?.progressMilestones.includes(milestone) ?? false;
   290|  }
   291|
   292|  /**
   293|   * Flush events to storage/server
   294|   */
   295|  flush(): void {
   296|    if (this.eventQueue.length === 0) return;
   297|
   298|    // Save to local storage
   299|    this.saveToStorage();
   300|
   301|    // In production, this would send to an analytics server
   302|    // For now, we just log and clear
   303|    console.debug('[VideoAnalytics] Flushing events:', this.eventQueue.length);
   304|    this.eventQueue = [];
   305|  }
   306|
   307|  /**
   308|   * Start the flush interval
   309|   */
   310|  private startFlushInterval(): void {
   311|    if (typeof window !== 'undefined') {
   312|      this.flushInterval = setInterval(() => {
   313|        this.flush();
   314|      }, this.FLUSH_INTERVAL_MS);
   315|    }
   316|  }
   317|
   318|  /**
   319|   * Save analytics to local storage
   320|   */
   321|  private saveToStorage(): void {
   322|    try {
   323|      const data = {
   324|        sessions: Array.from(this.sessions.entries()),
   325|        lastUpdated: Date.now(),
   326|      };
   327|      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
   328|    } catch (error) {
   329|      console.warn('[VideoAnalytics] Failed to save to storage:', error);
   330|    }
   331|  }
   332|
   333|  /**
   334|   * Load analytics from local storage
   335|   */
   336|  private loadFromStorage(): void {
   337|    try {
   338|      const stored = localStorage.getItem(this.STORAGE_KEY);
   339|      if (stored) {
   340|        const data = JSON.parse(stored) as {
   341|          sessions: [string, VideoSessionData][];
   342|          lastUpdated: number;
   343|        };
   344|        this.sessions = new Map(data.sessions);
   345|      }
   346|    } catch (error) {
   347|      console.warn('[VideoAnalytics] Failed to load from storage:', error);
   348|    }
   349|  }
   350|
   351|  /**
   352|   * Clear all analytics data
   353|   */
   354|  clearAll(): void {
   355|    this.sessions.clear();
   356|    this.eventQueue = [];
   357|    localStorage.removeItem(this.STORAGE_KEY);
   358|  }
   359|
   360|  /**
   361|   * Clear analytics for a specific video
   362|   */
   363|  clearVideo(videoId: string): void {
   364|    this.sessions.delete(videoId);
   365|    this.eventQueue = this.eventQueue.filter((e) => e.videoId !== videoId);
   366|    this.saveToStorage();
   367|  }
   368|
   369|  /**
   370|   * Destroy the analytics instance
   371|   */
   372|  destroy(): void {
   373|    if (this.flushInterval) {
   374|      clearInterval(this.flushInterval);
   375|    }
   376|    this.flush();
   377|  }
   378|}
   379|
   380|// Singleton instance
   381|let analyticsInstance: VideoAnalytics | null = null;
   382|
   383|/**
   384| * Get the video analytics instance
   385| */
   386|export function getVideoAnalytics(): VideoAnalytics {
   387|  analyticsInstance ??= new VideoAnalytics();
   388|  return analyticsInstance;
   389|}
   390|
   391|/**
   392| * Hook-friendly analytics tracker
   393| */
   394|export function useVideoAnalytics(videoId: string) {
   395|  const analytics = getVideoAnalytics();
   396|
   397|  return {
   398|    startSession: () => analytics.startSession(videoId),
   399|    endSession: () => analytics.endSession(videoId),
   400|    trackEvent: (type: VideoEventType, data?: Record<string, unknown>) =>
   401|      analytics.trackEvent(videoId, type, data),
   402|    updateWatchTime: (seconds: number) => analytics.updateWatchTime(videoId, seconds),
   403|    getSession: () => analytics.getSession(videoId),
   404|    getCompletionPercentage: () => analytics.getCompletionPercentage(videoId),
   405|    getLastPosition: () => analytics.getLastPosition(videoId),
   406|    wasMilestoneReached: (milestone: number) => analytics.wasMilestoneReached(videoId, milestone),
   407|  };
   408|}
   409|
   410|export { PROGRESS_MILESTONES };
   411|export { VideoAnalytics };
   412|export default VideoAnalytics;
   413|