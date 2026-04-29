/**
 * Job Type Definitions
 *
 * Defines all scheduled job types and their payload shapes.
 */

export enum JobType {
  /** Generate and send daily cosmic briefing for subscribed users */
  DAILY_BRIEFING = 'daily-briefing',
  /** Generate monthly transit report PDF (premium feature) */
  MONTHLY_REPORT = 'monthly-report',
  /** Send aggregated email digest of transits/notifications */
  EMAIL_DIGEST = 'email-digest',
}

export interface DailyBriefingPayload {
  userId: string;
  date: string; // ISO date string
}

export interface MonthlyReportPayload {
  userId: string;
  month: string; // YYYY-MM format
  year: number;
}

export interface EmailDigestPayload {
  userId: string;
  digestType: 'daily' | 'weekly';
}

export type JobPayload = DailyBriefingPayload | MonthlyReportPayload | EmailDigestPayload;

export interface JobResult {
  success: boolean;
  message?: string;
  error?: string;
  durationMs?: number;
}

export const JOB_CONFIG: Record<
  JobType,
  { concurrency: number; attempts: number; backoffMs: number }
> = {
  [JobType.DAILY_BRIEFING]: { concurrency: 5, attempts: 3, backoffMs: 5000 },
  [JobType.MONTHLY_REPORT]: { concurrency: 2, attempts: 3, backoffMs: 10000 },
  [JobType.EMAIL_DIGEST]: { concurrency: 5, attempts: 3, backoffMs: 5000 },
};
