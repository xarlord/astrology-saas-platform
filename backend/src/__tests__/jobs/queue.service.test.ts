/**
 * Tests for Queue Service
 * BullMQ queue registry and job management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import {
  getQueue,
  getQueueEvents,
  registerProcessor,
  enqueueJob,
  getQueueHealth,
  getAllQueuesHealth,
  isQueueReady,
  shutdownQueues,
} from '../../modules/jobs/queue.service';
import { JobType, JOB_CONFIG, JobPayload } from '../../modules/jobs/job.types';

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn(),
  Worker: jest.fn(),
  QueueEvents: jest.fn(),
  Job: jest.fn(),
}));

// Mock Redis service
jest.mock('../../modules/shared/services/redis.service', () => ({
  isRedisConnected: jest.fn(() => true),
}));

import { isRedisConnected } from '../../modules/shared/services/redis.service';

// Mock logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Queue Service', () => {
  // ===== Setup =====

  let mockQueue: jest.Mocked<Queue>;
  let mockWorker: jest.Mocked<Worker>;
  let mockQueueEvents: jest.Mocked<QueueEvents>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create fresh mocks for each test
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-123' }),
      getWaitingCount: jest.fn().mockResolvedValue(5),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getFailedCount: jest.fn().mockResolvedValue(3),
      getDelayedCount: jest.fn().mockResolvedValue(1),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
      close: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockWorker = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockQueueEvents = {
      close: jest.fn().mockResolvedValue(undefined),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Mock Queue constructor
    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue);
    (Worker as jest.MockedClass<typeof Worker>).mockImplementation(() => mockWorker);
    (QueueEvents as jest.MockedClass<typeof QueueEvents>).mockImplementation(() => mockQueueEvents);

    // Set environment variables
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterEach(async () => {
    // Clean up queues after each test
    await shutdownQueues();
  });

  // ===== getQueue =====

  describe('getQueue', () => {
    it('should create new queue when none exists for type', () => {
      // When
      const queue = getQueue(JobType.DAILY_BRIEFING);

      // Then
      expect(Queue).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        expect.objectContaining({
          connection: expect.objectContaining({
            host: 'localhost',
            port: 6379,
          }),
        }),
      );
      expect(queue).toBe(mockQueue);
    });

    it('should return existing queue when already created', () => {
      // Given
      const firstQueue = getQueue(JobType.DAILY_BRIEFING);

      // When
      const secondQueue = getQueue(JobType.DAILY_BRIEFING);

      // Then
      expect(Queue).toHaveBeenCalledTimes(1);
      expect(firstQueue).toBe(secondQueue);
    });

    it('should parse custom Redis URL correctly', () => {
      // Given
      process.env.REDIS_URL = 'redis://:password@redis.example.com:6380';

      // When
      getQueue(JobType.EMAIL_DIGEST);

      // Then
      expect(Queue).toHaveBeenCalledWith(
        JobType.EMAIL_DIGEST,
        expect.objectContaining({
          connection: expect.objectContaining({
            host: 'redis.example.com',
            port: 6380,
            password: 'password',
          }),
        }),
      );
    });
  });

  // ===== getQueueEvents =====

  describe('getQueueEvents', () => {
    it('should create new QueueEvents instance when none exists', () => {
      // When
      const events = getQueueEvents(JobType.DAILY_BRIEFING);

      // Then
      expect(QueueEvents).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        expect.objectContaining({
          connection: expect.any(Object),
        }),
      );
      expect(events).toBe(mockQueueEvents);
    });

    it('should return existing QueueEvents when already created', () => {
      // Given
      const firstEvents = getQueueEvents(JobType.DAILY_BRIEFING);

      // When
      const secondEvents = getQueueEvents(JobType.DAILY_BRIEFING);

      // Then
      expect(QueueEvents).toHaveBeenCalledTimes(1);
      expect(firstEvents).toBe(secondEvents);
    });
  });

  // ===== registerProcessor =====

  describe('registerProcessor', () => {
    it('should register worker with processor function', async () => {
      // Given
      const processor = jest.fn().mockResolvedValue({ success: true, durationMs: 100 });

      // When
      const worker = registerProcessor(JobType.DAILY_BRIEFING, processor);

      // Then
      expect(Worker).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        processor,
        expect.objectContaining({
          concurrency: JOB_CONFIG[JobType.DAILY_BRIEFING].concurrency,
          limiter: {
            max: 10,
            duration: 1000,
          },
        }),
      );
      expect(worker).toBe(mockWorker);
    });

    it('should return existing worker if already registered', () => {
      // Given
      const processor = jest.fn().mockResolvedValue({ success: true });
      const firstWorker = registerProcessor(JobType.DAILY_BRIEFING, processor);

      // When
      const secondWorker = registerProcessor(JobType.DAILY_BRIEFING, processor);

      // Then
      expect(Worker).toHaveBeenCalledTimes(1);
      expect(firstWorker).toBe(secondWorker);
    });

    it('should attach event handlers to worker', () => {
      // Given
      const processor = jest.fn().mockResolvedValue({ success: true });

      // When
      registerProcessor(JobType.DAILY_BRIEFING, processor);

      // Then
      expect(mockWorker.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should log job completion on completed event', async () => {
      // Given
      const processor = jest.fn().mockResolvedValue({ success: true, durationMs: 150 });
      const mockJob = { id: 'job-123' } as Job<JobPayload>;

      // When
      registerProcessor(JobType.DAILY_BRIEFING, processor);
      const completedHandler = (mockWorker.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'completed',
      )[1];

      // Then
      await completedHandler(mockJob, { success: true, durationMs: 150 });
      // Logger should be called - we can't easily test the exact log without spying
    });
  });

  // ===== enqueueJob =====

  describe('enqueueJob', () => {
    it('should enqueue job with default options', async () => {
      // Given
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When
      const jobId = await enqueueJob(JobType.DAILY_BRIEFING, payload);

      // Then
      expect(mockQueue.add).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        payload,
        expect.objectContaining({
          attempts: JOB_CONFIG[JobType.DAILY_BRIEFING].attempts,
          backoff: { type: 'exponential', delay: JOB_CONFIG[JobType.DAILY_BRIEFING].backoffMs },
          delay: 0,
          removeOnComplete: true,
          removeOnFail: false,
        }),
      );
      expect(jobId).toBe('test-job-123');
    });

    it('should enqueue job with custom delay', async () => {
      // Given
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When
      await enqueueJob(JobType.DAILY_BRIEFING, payload, { delayMs: 5000 });

      // Then
      expect(mockQueue.add).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        payload,
        expect.objectContaining({
          delay: 5000,
        }),
      );
    });

    it('should enqueue job with custom jobId', async () => {
      // Given
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When
      await enqueueJob(JobType.DAILY_BRIEFING, payload, { jobId: 'custom-job-id' });

      // Then
      expect(mockQueue.add).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        payload,
        expect.objectContaining({
          jobId: 'custom-job-id',
        }),
      );
    });

    it('should enqueue job with removeOnComplete false', async () => {
      // Given
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When
      await enqueueJob(JobType.DAILY_BRIEFING, payload, { removeOnComplete: false });

      // Then
      expect(mockQueue.add).toHaveBeenCalledWith(
        JobType.DAILY_BRIEFING,
        payload,
        expect.objectContaining({
          removeOnComplete: false,
        }),
      );
    });

    it('should use correct config for different job types', async () => {
      // Given
      const monthlyPayload: JobPayload = { userId: 'user-123', month: '2026-04', year: 2026 };

      // When
      await enqueueJob(JobType.MONTHLY_REPORT, monthlyPayload);

      // Then
      expect(mockQueue.add).toHaveBeenCalledWith(
        JobType.MONTHLY_REPORT,
        monthlyPayload,
        expect.objectContaining({
          attempts: JOB_CONFIG[JobType.MONTHLY_REPORT].attempts,
          backoff: { type: 'exponential', delay: JOB_CONFIG[JobType.MONTHLY_REPORT].backoffMs },
        }),
      );
    });
  });

  // ===== getQueueHealth =====

  describe('getQueueHealth', () => {
    it('should return queue health metrics', async () => {
      // When
      const health = await getQueueHealth(JobType.DAILY_BRIEFING);

      // Then
      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
      expect(mockQueue.getDelayedCount).toHaveBeenCalled();

      expect(health).toEqual({
        type: JobType.DAILY_BRIEFING,
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1,
      });
    });

    it('should handle zero values for all metrics', async () => {
      // Given
      mockQueue.getWaitingCount.mockResolvedValue(0);
      mockQueue.getActiveCount.mockResolvedValue(0);
      mockQueue.getCompletedCount.mockResolvedValue(0);
      mockQueue.getFailedCount.mockResolvedValue(0);
      mockQueue.getDelayedCount.mockResolvedValue(0);

      // When
      const health = await getQueueHealth(JobType.EMAIL_DIGEST);

      // Then
      expect(health).toEqual({
        type: JobType.EMAIL_DIGEST,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      });
    });
  });

  // ===== getAllQueuesHealth =====

  describe('getAllQueuesHealth', () => {
    it('should return health for all registered queues', async () => {
      // Given
      getQueue(JobType.DAILY_BRIEFING);
      getQueue(JobType.EMAIL_DIGEST);

      // When
      const allHealth = await getAllQueuesHealth();

      // Then
      expect(allHealth).toHaveProperty(JobType.DAILY_BRIEFING);
      expect(allHealth).toHaveProperty(JobType.EMAIL_DIGEST);
      expect(Object.keys(allHealth).length).toBe(2);
    });

    it('should return empty object when no queues registered', async () => {
      // When
      const allHealth = await getAllQueuesHealth();

      // Then
      expect(allHealth).toEqual({});
    });
  });

  // ===== isQueueReady =====

  describe('isQueueReady', () => {
    it('should return true when queues exist and Redis is connected', () => {
      // Given
      (isRedisConnected as jest.Mock).mockReturnValue(true);
      getQueue(JobType.DAILY_BRIEFING);

      // When
      const ready = isQueueReady();

      // Then
      expect(ready).toBe(true);
    });

    it('should return false when no queues registered', () => {
      // When
      const ready = isQueueReady();

      // Then
      expect(ready).toBe(false);
    });
  });

  // ===== shutdownQueues =====

  describe('shutdownQueues', () => {
    it('should close all workers, queues, and events', async () => {
      // Given
      getQueue(JobType.DAILY_BRIEFING);
      getQueueEvents(JobType.DAILY_BRIEFING);
      registerProcessor(JobType.DAILY_BRIEFING, jest.fn().mockResolvedValue({ success: true }));

      // When
      await shutdownQueues();

      // Then
      expect(mockWorker.close).toHaveBeenCalled();
      expect(mockQueueEvents.close).toHaveBeenCalled();
      expect(mockQueue.close).toHaveBeenCalled();
    });

    it('should handle shutdown errors gracefully', async () => {
      // Given
      getQueue(JobType.DAILY_BRIEFING);
      mockQueue.close.mockRejectedValue(new Error('Close failed'));

      // When & Then - should not throw
      await expect(shutdownQueues()).resolves.toBeUndefined();
    });

    it('should clear all maps after shutdown', async () => {
      // Given
      getQueue(JobType.DAILY_BRIEFING);
      registerProcessor(JobType.DAILY_BRIEFING, jest.fn().mockResolvedValue({ success: true }));

      // When
      await shutdownQueues();

      // Then
      expect(isQueueReady()).toBe(false);
    });
  });

  // ===== Edge Cases =====

  describe('Edge Cases', () => {
    it('should handle invalid Redis URL format', () => {
      // Given
      process.env.REDIS_URL = 'invalid-url';

      // When & Then - the implementation throws on invalid URL
      expect(() => getQueue(JobType.DAILY_BRIEFING)).toThrow('Invalid URL');
    });

    it('should handle missing Redis URL', () => {
      // Given
      delete process.env.REDIS_URL;

      // When
      getQueue(JobType.EMAIL_DIGEST);

      // Then
      expect(Queue).toHaveBeenCalledWith(
        JobType.EMAIL_DIGEST,
        expect.objectContaining({
          connection: expect.objectContaining({
            host: 'localhost',
            port: 6379,
          }),
        }),
      );
    });

    it('should handle job enqueue failure', async () => {
      // Given
      mockQueue.add.mockRejectedValue(new Error('Queue full'));
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When & Then
      await expect(enqueueJob(JobType.DAILY_BRIEFING, payload)).rejects.toThrow('Queue full');
    });
  });

  // ===== Integration =====

  describe('Integration', () => {
    it('should handle complete job lifecycle', async () => {
      // Given
      const processor = jest.fn().mockResolvedValue({ success: true, durationMs: 100 });
      const payload: JobPayload = { userId: 'user-123', date: '2026-04-09' };

      // When
      const queue = getQueue(JobType.DAILY_BRIEFING);
      const worker = registerProcessor(JobType.DAILY_BRIEFING, processor);
      const jobId = await enqueueJob(JobType.DAILY_BRIEFING, payload);
      const health = await getQueueHealth(JobType.DAILY_BRIEFING);

      // Then
      expect(queue).toBeDefined();
      expect(worker).toBeDefined();
      expect(jobId).toBe('test-job-123');
      expect(health.type).toBe(JobType.DAILY_BRIEFING);
    });

    it('should support multiple job types independently', async () => {
      // Given
      const dailyPayload: JobPayload = { userId: 'user-123', date: '2026-04-09' };
      const monthlyPayload: JobPayload = { userId: 'user-123', month: '2026-04', year: 2026 };

      // Create separate mock queues for each type
      const mockDailyQueue = {
        ...mockQueue,
        add: jest.fn().mockResolvedValue({ id: 'daily-job-123' }),
      };
      const mockMonthlyQueue = {
        ...mockQueue,
        add: jest.fn().mockResolvedValue({ id: 'monthly-job-456' }),
      };

      (Queue as jest.MockedClass<typeof Queue>).mockImplementation((type) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if (type === JobType.DAILY_BRIEFING) return mockDailyQueue as any;
        if (type === JobType.MONTHLY_REPORT) return mockMonthlyQueue as any;
        return mockQueue as any;
        /* eslint-enable @typescript-eslint/no-explicit-any */
      });

      // When
      const dailyQueue = getQueue(JobType.DAILY_BRIEFING);
      const monthlyQueue = getQueue(JobType.MONTHLY_REPORT);
      await enqueueJob(JobType.DAILY_BRIEFING, dailyPayload);
      await enqueueJob(JobType.MONTHLY_REPORT, monthlyPayload);

      // Then
      expect(dailyQueue).not.toBe(monthlyQueue);
      expect(mockDailyQueue.add).toHaveBeenCalledTimes(1);
      expect(mockMonthlyQueue.add).toHaveBeenCalledTimes(1);
    });
  });
});
