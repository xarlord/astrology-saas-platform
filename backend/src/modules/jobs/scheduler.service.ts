/**
 * Scheduler Service
 *
 * Cron-based job scheduling using BullMQ delayed/repeatable jobs.
 * Provides methods to schedule recurring jobs for briefings, reports, and digests.
 */

import {
  JobType,
  DailyBriefingPayload,
  MonthlyReportPayload,
  EmailDigestPayload,
} from './job.types';
import { getQueue } from './queue.service';
import logger from '../../utils/logger';

/**
 * Schedule a daily briefing generation for a user.
 * Uses BullMQ repeatable jobs for cron-like scheduling.
 */
export async function scheduleDailyBriefing(
  userId: string,
  hour: number,
  minute: number,
  timezone: string = 'UTC',
): Promise<void> {
  const queue = getQueue(JobType.DAILY_BRIEFING);
  const jobId = `daily-briefing-${userId}`;

  // Remove any existing repeatable job for this user first
  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.key.includes(userId)) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // Cron expression from hour/minute
  const cron = `${minute} ${hour} * * *`;

  await queue.add(JobType.DAILY_BRIEFING, { userId, date: '' } as DailyBriefingPayload, {
    jobId,
    repeat: { pattern: cron, tz: timezone },
    removeOnComplete: true,
  });

  logger.info(`[Scheduler] Daily briefing scheduled for user ${userId} at ${cron} (${timezone})`);
}

/**
 * Schedule a monthly report generation for a user (premium).
 * Runs on the 1st of each month.
 */
export async function scheduleMonthlyReport(
  userId: string,
  timezone: string = 'UTC',
): Promise<void> {
  const queue = getQueue(JobType.MONTHLY_REPORT);
  const jobId = `monthly-report-${userId}`;

  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.key.includes(userId)) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  const now = new Date();
  await queue.add(
    JobType.MONTHLY_REPORT,
    {
      userId,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      year: now.getFullYear(),
    } as MonthlyReportPayload,
    {
      jobId,
      repeat: { pattern: '0 8 1 * *', tz: timezone }, // 8 AM on 1st of month
      removeOnComplete: true,
    },
  );

  logger.info(`[Scheduler] Monthly report scheduled for user ${userId}`);
}

/**
 * Schedule an email digest for a user.
 */
export async function scheduleEmailDigest(
  userId: string,
  digestType: 'daily' | 'weekly',
  timezone: string = 'UTC',
): Promise<void> {
  const queue = getQueue(JobType.EMAIL_DIGEST);
  const jobId = `email-digest-${digestType}-${userId}`;

  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.key.includes(userId) && job.key.includes(digestType)) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  const pattern = digestType === 'daily' ? '0 9 * * *' : '0 9 * * 1'; // 9 AM daily or Monday
  await queue.add(JobType.EMAIL_DIGEST, { userId, digestType } as EmailDigestPayload, {
    jobId,
    repeat: { pattern, tz: timezone },
    removeOnComplete: true,
  });

  logger.info(`[Scheduler] ${digestType} email digest scheduled for user ${userId}`);
}

/**
 * Remove all scheduled jobs for a user.
 */
export async function unscheduleAllForUser(userId: string): Promise<number> {
  let removed = 0;

  for (const type of Object.values(JobType)) {
    const queue = getQueue(type);
    const repeatable = await queue.getRepeatableJobs();
    for (const job of repeatable) {
      if (job.key.includes(userId)) {
        await queue.removeRepeatableByKey(job.key);
        removed++;
      }
    }
  }

  logger.info(`[Scheduler] Removed ${removed} scheduled jobs for user ${userId}`);
  return removed;
}

/**
 * Get all scheduled (repeatable) jobs for a user.
 */
export async function getUserScheduledJobs(userId: string) {
  const result: Array<{ type: JobType; key: string; nextRun: number | undefined }> = [];

  for (const type of Object.values(JobType)) {
    const queue = getQueue(type);
    const repeatable = await queue.getRepeatableJobs();
    for (const job of repeatable) {
      if (job.key.includes(userId)) {
        result.push({ type, key: job.key, nextRun: job.next });
      }
    }
  }

  return result;
}

export default {
  scheduleDailyBriefing,
  scheduleMonthlyReport,
  scheduleEmailDigest,
  unscheduleAllForUser,
  getUserScheduledJobs,
};
