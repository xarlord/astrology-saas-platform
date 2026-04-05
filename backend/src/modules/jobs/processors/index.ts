/**
 * Job Processors
 *
 * CHI-68: Daily Briefing processor implemented.
 * CHI-69: Monthly Report processor still a stub.
 */

import { Job } from 'bullmq';
import logger from '../../../utils/logger';
import { JobType, JobPayload, JobResult, DailyBriefingPayload, MonthlyReportPayload, EmailDigestPayload } from '../job.types';
import { registerProcessor } from '../queue.service';
import {
  generateBriefing,
  formatBriefingContent,
  sendBriefingPush,
  saveBriefing,
} from '../services/dailyBriefing.service';

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
    logger.info(`[Processor:daily-briefing] Processing for user ${userId}, date ${date || 'today'}`);

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

    // TODO: CHI-69 full implementation - monthly report generation pipeline
    // Core infrastructure is in place:
    // - Database migration: monthly_reports table
    // - Routes: GET /api/v1/monthly-report, POST /api/v1/monthly-report/generate
    // - Controller: getMonthlyReport, triggerReportGeneration
    // - Email: sendMonthlyReportEmail function added
    // - Processor: stub returns success
    //
    // Remaining work: implement generateMonthlyReport() service function with:
    // - Transit calculation for full month ( AstronomyEngineService )
    // - AI interpretation via OpenAI ( TransitEvent[] -> interpretation )
    // - PDF generation via Puppeteer ( monthlyReportPDF module )
    // - Persistence to monthly_reports table
    // - Email delivery via Resend

    logger.info(`[Processor:monthly-report] Stub completed for user ${userId}`);
    return { success: true, message: `Monthly report stub processed for user ${userId}` };
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

    // TODO: Wire email digest via Resend once daily briefing is in place
    return { success: true, message: `Digest stub processed for user ${userId}` };
  });

  return { ...result, durationMs };
}

/**
 * Register all processors with the queue service.
 * Call this during app startup.
 */
export function registerAllProcessors(): void {
  registerProcessor(JobType.DAILY_BRIEFING, processDailyBriefing as (job: Job<JobPayload>) => Promise<JobResult>);
  registerProcessor(JobType.MONTHLY_REPORT, processMonthlyReport as (job: Job<JobPayload>) => Promise<JobResult>);
  registerProcessor(JobType.EMAIL_DIGEST, processEmailDigest as (job: Job<JobPayload>) => Promise<JobResult>);
  logger.info('[Processors] All job processors registered');
}
