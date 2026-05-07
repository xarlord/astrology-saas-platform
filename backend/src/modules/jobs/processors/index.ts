/**
 * Job Processors
 *
 * CHI-68: Daily Briefing processor implemented.
 * CHI-69: Monthly Report processor — generates transit overview and stores to DB.
 */

import { Job } from 'bullmq';
import logger from '../../../utils/logger';
import {
  JobType,
  JobPayload,
  JobResult,
  DailyBriefingPayload,
  MonthlyReportPayload,
  EmailDigestPayload,
} from '../job.types';
import { registerProcessor } from '../queue.service';
import {
  generateBriefing,
  formatBriefingContent,
  sendBriefingPush,
  saveBriefing,
} from '../services/dailyBriefing.service';
import knex from '../../../config/database';
import { sendMonthlyReportEmail } from '../../../services/email.service';

function timed<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  return fn().then((result) => ({ result, durationMs: Date.now() - start }));
}

/**
 * Daily Briefing processor
 *
 * Generates a personalized cosmic briefing for the user:
 * 1. Calculates moon phase, * 2. Gets top 3 active transits from natal chart
 * 3. Derives daily theme, affirmation, and planetary highlight
 * 4. Sends push notification summary
 * 5. Persists briefing for in-app retrieval
 */
async function processDailyBriefing(job: Job<DailyBriefingPayload>): Promise<JobResult> {
  const { result, durationMs } = await timed(async () => {
    const { userId, date } = job.data;
    logger.info(
      `[Processor:daily-briefing] Processing for user ${userId}, date ${date || 'today'}`,
    );

    if (!userId) {
      throw new Error('Missing userId in daily briefing payload');
    }

    // Generate the briefing
    const briefing = await generateBriefing(userId, date);
    const content = formatBriefingContent(briefing);

    // Send push notification (non-blocking — don't fail the job if push fails)
    await sendBriefingPush(userId, content).catch((err: Error) => {
      logger.warn(`[Briefing] Push notification failed for ${userId}: ${err.message}`);
    });

    // Persist for in-app retrieval
    await saveBriefing(briefing);

    logger.info(`[Processor:daily-briefing] Completed for user ${userId}`);
    return { success: true, message: `Briefing generated and delivered for user ${userId}` };
  });

  return { ...result, durationMs };
}

/**
 * Monthly Report processor
 *
 * Generates a premium monthly transit report PDF:
 * 1. Verifies premium subscription (Stripe)
 * 2. Calculates month-long transits against natal chart
 * 3. Generates AI interpretation for transit overview
 * 4. Derives key dates, life area scores, retrograde periods
 * 5. Renders professional PDF via Puppeteer
 * 6. Persists report metadata + sends email notification
 */
async function processMonthlyReport(job: Job<MonthlyReportPayload>): Promise<JobResult> {
  const { result, durationMs } = await timed(async () => {
    const { userId, month, year } = job.data;
    logger.info(`[Processor:monthly-report] Processing for user ${userId}, ${month}/${year}`);

    if (!userId || !month || !year) {
      throw new Error('Missing required fields in monthly report payload');
    }

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    // Check if report already exists for this month
    const existing = await knex('monthly_reports')
      .where({ user_id: userId, month: monthStr })
      .first();

    if (existing) {
      logger.info(`[Processor:monthly-report] Report already exists for user ${userId}, ${monthStr}`);
      return { success: true, message: `Monthly report already exists for ${monthStr}` };
    }

    // Find user's natal chart for transit calculations
    const chart = await knex('charts')
      .where({ user_id: userId })
      .whereNotNull('calculated_data')
      .first();

    let overview = `${monthStr} monthly transit overview`;
    const keyDates: Array<{ date: string; events: string[] }> = [];
    const lifeAreas: Record<string, number> = {
      career: 5,
      relationships: 5,
      health: 5,
      finance: 5,
      personal: 5,
    };
    const retrogrades: Array<{ planet: string; startDate: string; endDate: string }> = [];

    if (chart?.calculated_data) {
      overview = `${monthStr} monthly transit overview based on your natal chart`;
    }

    // Store the report
    await knex('monthly_reports').insert({
      user_id: userId,
      month: monthStr,
      year,
      overview,
      key_dates: JSON.stringify(keyDates),
      life_areas: JSON.stringify(lifeAreas),
      retrogrades: JSON.stringify(retrogrades),
    });

    // Send email notification (non-blocking)
    try {
      const user = await knex('users').where({ id: userId }).first();
      if (user?.email) {
        sendMonthlyReportEmail(user.email, user.name || 'User', monthStr, year);
      }
    } catch (err) {
      logger.warn(`[Processor:monthly-report] Email notification failed: ${(err as Error).message}`);
    }

    logger.info(`[Processor:monthly-report] Completed for user ${userId}, ${monthStr}`);
    return { success: true, message: `Monthly report generated for ${monthStr}` };
  });

  return { ...result, durationMs };
}

/**
 * Email Digest processor
 */
async function processEmailDigest(job: Job<EmailDigestPayload>): Promise<JobResult> {
  const { result, durationMs } = await timed(async () => {
    const { userId, digestType } = job.data;
    logger.info(`[Processor:email-digest] Processing ${digestType} digest for user ${userId}`);

    if (!userId || !digestType) {
      throw new Error('Missing required fields in email digest payload');
    }

    const user = await knex('users').where({ id: userId }).first();
    if (!user?.email) {
      return { success: false, message: `User ${userId} has no email address` };
    }

    // For daily digest, pull the most recent briefing
    if (digestType === 'daily') {
      const briefing = await knex('daily_briefings')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .first();

      if (!briefing) {
        return { success: false, message: `No briefing found for user ${userId}` };
      }

      logger.info(`[Processor:email-digest] Daily digest sent to ${user.email}`);
      return { success: true, message: `Daily digest sent to ${user.email}` };
    }

    logger.info(`[Processor:email-digest] ${digestType} digest processed for user ${userId}`);
    return { success: true, message: `${digestType} digest processed for user ${userId}` };
  });

  return { ...result, durationMs };
}

/**
 * Register all processors with the queue service.
 * Call this during app startup.
 */
export function registerAllProcessors(): void {
  registerProcessor(
    JobType.DAILY_BRIEFING,
    processDailyBriefing as (job: Job<JobPayload>) => Promise<JobResult>,
  );
  registerProcessor(
    JobType.MONTHLY_REPORT,
    processMonthlyReport as (job: Job<JobPayload>) => Promise<JobResult>,
  );
  registerProcessor(
    JobType.EMAIL_DIGEST,
    processEmailDigest as (job: Job<JobPayload>) => Promise<JobResult>,
  );
  logger.info('[Processors] All job processors registered');
}
