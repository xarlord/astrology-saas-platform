/**
 * Queue Service
 *
 * BullMQ queue registry built on the existing ioredis connection.
 * Provides queue creation, job enqueue, and graceful shutdown.
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { isRedisConnected } from '../shared/services/redis.service';
import logger from '../../utils/logger';
import { JobType, JOB_CONFIG, JobPayload, JobResult } from './job.types';

const queues = new Map<JobType, Queue>();
const workers = new Map<JobType, Worker>();
const queueEvents = new Map<JobType, QueueEvents>();

/**
 * Get Redis connection options for BullMQ.
 * BullMQ needs raw connection opts — not a pre-existing ioredis client.
 */
function getConnectionOpts() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const parsed = new URL(url);
  return {
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '6379', 10),
    password: parsed.password || undefined,
    maxRetriesPerRequest: null as unknown as undefined, // BullMQ requires this
  };
}

/**
 * Get or create a BullMQ queue for the given job type.
 */
export function getQueue(type: JobType): Queue {
  let queue = queues.get(type);
  if (!queue) {
    queue = new Queue(type, { connection: getConnectionOpts() });
    queues.set(type, queue);
    logger.info(`[Queue] Created queue: ${type}`);
  }
  return queue;
}

/**
 * Get or create a BullMQ QueueEvents instance for a job type.
 */
export function getQueueEvents(type: JobType): QueueEvents {
  let events = queueEvents.get(type);
  if (!events) {
    events = new QueueEvents(type, { connection: getConnectionOpts() });
    queueEvents.set(type, events);
  }
  return events;
}

/**
 * Register a processor for a job type and start a worker.
 */
export function registerProcessor(
  type: JobType,
  processor: (job: Job<JobPayload>) => Promise<JobResult>,
): Worker {
  const existing = workers.get(type);
  if (existing) return existing;

  const config = JOB_CONFIG[type];
  const worker = new Worker(type, processor, {
    connection: getConnectionOpts(),
    concurrency: config.concurrency,
    limiter: {
      max: 10,
      duration: 1000,
    },
  });

  worker.on('completed', (job: Job<JobPayload>, result: JobResult) => {
    logger.info(`[Queue] Job ${job.id} (${type}) completed in ${result.durationMs ?? '?'}ms`);
  });

  worker.on('failed', (job: Job<JobPayload> | undefined, err: Error) => {
    logger.error(`[Queue] Job ${job?.id ?? 'unknown'} (${type}) failed: ${err.message}`);
  });

  worker.on('error', (err: Error) => {
    logger.error(`[Queue] Worker error (${type}): ${err.message}`);
  });

  workers.set(type, worker);
  logger.info(`[Queue] Registered processor for: ${type} (concurrency: ${config.concurrency})`);
  return worker;
}

/**
 * Enqueue a job with retry config.
 */
export async function enqueueJob(
  type: JobType,
  payload: JobPayload,
  opts?: { delayMs?: number; jobId?: string; removeOnComplete?: boolean },
): Promise<string | undefined> {
  const config = JOB_CONFIG[type];
  const queue = getQueue(type);

  const job = await queue.add(type, payload, {
    attempts: config.attempts,
    backoff: { type: 'exponential', delay: config.backoffMs },
    delay: opts?.delayMs ?? 0,
    jobId: opts?.jobId,
    removeOnComplete: opts?.removeOnComplete ?? true,
    removeOnFail: false,
  });

  logger.info(`[Queue] Enqueued job ${job.id} (${type})`);
  return job.id;
}

/**
 * Get queue health status — counts of active/waiting/completed/failed jobs.
 */
export async function getQueueHealth(type: JobType) {
  const queue = getQueue(type);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { type, waiting, active, completed, failed, delayed };
}

/**
 * Get health for all registered queues.
 */
export async function getAllQueuesHealth() {
  const results: Record<string, Awaited<ReturnType<typeof getQueueHealth>>> = {};
  for (const type of queues.keys()) {
    results[type] = await getQueueHealth(type);
  }
  return results;
}

/**
 * Check if the queue system is operational.
 */
export function isQueueReady(): boolean {
  return queues.size > 0 && isRedisConnected();
}

/**
 * Gracefully close all workers, queues, and event listeners.
 */
export async function shutdownQueues(): Promise<void> {
  logger.info('[Queue] Shutting down...');

  const workerCloses = Array.from(workers.values()).map((w) => w.close());
  const eventCloses = Array.from(queueEvents.values()).map((e) => e.close());
  const queueCloses = Array.from(queues.values()).map((q) => q.close());

  await Promise.allSettled([...workerCloses, ...eventCloses, ...queueCloses]);

  workers.clear();
  queueEvents.clear();
  queues.clear();

  logger.info('[Queue] Shutdown complete');
}

export default {
  getQueue,
  getQueueEvents,
  registerProcessor,
  enqueueJob,
  getQueueHealth,
  getAllQueuesHealth,
  isQueueReady,
  shutdownQueues,
};
