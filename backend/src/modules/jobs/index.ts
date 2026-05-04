/**
 * Jobs Module
 *
 * BullMQ job queue for scheduled tasks (daily briefings, monthly reports, email digests).
 */

export { JobType } from './job.types';
export type {
  DailyBriefingPayload,
  MonthlyReportPayload,
  EmailDigestPayload,
  JobPayload,
  JobResult,
} from './job.types';

export {
  getQueue,
  enqueueJob,
  getQueueHealth,
  getAllQueuesHealth,
  isQueueReady,
  shutdownQueues,
} from './queue.service';
export {
  scheduleDailyBriefing,
  scheduleMonthlyReport,
  scheduleEmailDigest,
  unscheduleAllForUser,
  getUserScheduledJobs,
} from './scheduler.service';
export { registerAllProcessors } from './processors';
export { briefingRoutes } from './routes/briefing.routes';
