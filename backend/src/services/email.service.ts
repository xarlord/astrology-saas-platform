/**
 * Email Service
 * Uses Resend for transactional emails.
 * Falls back to logging in development (no RESEND_API_KEY).
 * Queues sends to avoid blocking request handlers.
 */

import logger from '../utils/logger';

const fromEmail = process.env.EMAIL_FROM || 'noreply@astroverse.app';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Resend client singleton (lazy-initialised)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _resend: any = null;

async function getResend() {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const Resend = (await import('resend')).default;
  _resend = new Resend(apiKey);
  return _resend;
}

// ---------------------------------------------------------------------------
// Simple in-memory queue — fire-and-forget sends that don't block callers
// ---------------------------------------------------------------------------

const queue: Array<() => Promise<void>> = [];
let flushing = false;

function enqueue(task: () => Promise<void>): void {
  queue.push(task);
  if (!flushing) flush();
}

async function flush(): Promise<void> {
  if (flushing) return;
  flushing = true;
  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) break;
    try {
      await task();
    } catch {
      // Errors are already logged inside each task
    }
  }
  flushing = false;
}

// ---------------------------------------------------------------------------
// Email types
// ---------------------------------------------------------------------------

export interface EmailPreferences {
  marketing?: boolean;
  transactional?: boolean; // defaults to true — password reset, welcome, etc.
}

export const DEFAULT_EMAIL_PREFS: EmailPreferences = {
  marketing: true,
  transactional: true,
};

// ---------------------------------------------------------------------------
// Template helpers — return HTML strings
// ---------------------------------------------------------------------------

function baseStyles(): string {
  return `
    <style>
      body { margin: 0; padding: 0; background: #0f0f1a; }
      .container { font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #b23de1, #2563EB); padding: 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 24px; }
      .content { padding: 32px; color: #e0e0e0; }
      .content p { line-height: 1.6; }
      .btn { display: inline-block; padding: 12px 32px; background: linear-gradient(90deg, #b23de1, #2563EB); color: #fff; text-decoration: none; border-radius: 9999px; font-weight: bold; }
      .footer { padding: 16px 32px; text-align: center; color: #666; font-size: 12px; }
    </style>
  `;
}

function passwordResetHtml(resetUrl: string, userName: string): string {
  return `
    <!DOCTYPE html><html><head>${baseStyles()}</head><body>
    <div class="container">
      <div class="header"><h1>Reset Your Password</h1></div>
      <div class="content">
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <p style="text-align: center;"><a href="${resetUrl}" class="btn">Reset Password</a></p>
        <p style="color: #999; font-size: 14px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
      </div>
      <div class="footer">AstroVerse &mdash; Your Stars, Your Story</div>
    </div>
    </body></html>
  `;
}

function welcomeHtml(userName: string): string {
  const dashboardUrl = `${frontendUrl}/dashboard`;
  return `
    <!DOCTYPE html><html><head>${baseStyles()}</head><body>
    <div class="container">
      <div class="header"><h1>Welcome to AstroVerse!</h1></div>
      <div class="content">
        <p>Hi ${userName},</p>
        <p>Your account is ready. Dive into your birth chart, explore personality insights, and discover what the stars have in store for you.</p>
        <p style="text-align: center;"><a href="${dashboardUrl}" class="btn">Go to Dashboard</a></p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Generate your free natal chart</li>
          <li>Get AI-powered personality readings</li>
          <li>Track transits and forecasts</li>
          <li>Sync with the lunar calendar</li>
        </ul>
      </div>
      <div class="footer">AstroVerse &mdash; Your Stars, Your Story</div>
    </div>
    </body></html>
  `;
}

function subscriptionConfirmationHtml(userName: string, planName: string): string {
  const subscriptionUrl = `${frontendUrl}/subscription`;
  return `
    <!DOCTYPE html><html><head>${baseStyles()}</head><body>
    <div class="container">
      <div class="header"><h1>Subscription Activated!</h1></div>
      <div class="content">
        <p>Hi ${userName},</p>
        <p>Your <strong>${planName}</strong> plan is now active. Enjoy unlimited access to premium features.</p>
        <p style="text-align: center;"><a href="${subscriptionUrl}" class="btn">Manage Subscription</a></p>
        <p style="color: #999; font-size: 14px;">You can manage or cancel your subscription at any time from your account settings.</p>
      </div>
      <div class="footer">AstroVerse &mdash; Your Stars, Your Story</div>
    </div>
    </body></html>
  `;
}

// ---------------------------------------------------------------------------
// Core send helper (used by all public functions)
// ---------------------------------------------------------------------------

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = await getResend();
  if (!resend) {
    logger.info('Email (dev mode — no RESEND_API_KEY)', { to, subject });
    return;
  }

  try {
    await resend.emails.send({
      from: `AstroVerse <${fromEmail}>`,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject });
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw — never leak whether an email address exists
  }
}

// ---------------------------------------------------------------------------
// Public API — all enqueued so callers don't block
// ---------------------------------------------------------------------------

export interface SendResetEmailParams {
  to: string;
  resetToken: string;
  userName?: string;
}

/**
 * Send a password reset email (transactional — always sent)
 */
export function sendPasswordResetEmail(params: SendResetEmailParams): void {
  const resetUrl = `${frontendUrl}/reset-password?token=${params.resetToken}`;
  const name = params.userName || 'there';

  enqueue(() =>
    sendEmail(params.to, 'Reset your AstroVerse password', passwordResetHtml(resetUrl, name)),
  );
}

/**
 * Send a welcome email after registration (transactional — always sent)
 */
export function sendWelcomeEmail(to: string, userName: string): void {
  enqueue(() => sendEmail(to, 'Welcome to AstroVerse!', welcomeHtml(userName)));
}

/**
 * Send a subscription confirmation email (transactional — always sent)
 */
export function sendSubscriptionConfirmationEmail(
  to: string,
  userName: string,
  planName: string,
): void {
  enqueue(() =>
    sendEmail(
      to,
      `Your AstroVerse ${planName} plan is active!`,
      subscriptionConfirmationHtml(userName, planName),
    ),
  );
}

/**
 * Send monthly transit report notification email (premium feature).
 * Links to dashboard download rather than attaching PDF (avoids Resend attachment limits).
 */
export function sendMonthlyReportEmail(
  to: string,
  userName: string,
  month: string,
  year: number,
): void {
  const monthNames = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = monthNames[parseInt(month)] || month;
  const dashboardUrl = `${frontendUrl}/dashboard/monthly-report?month=${month}&year=${year}`;

  const html = `
    <!DOCTYPE html><html><head>${baseStyles()}</head><body>
    <div class="container">
      <div class="header"><h1>Your ${monthName} ${year} Transit Report</h1></div>
      <div class="content">
        <p>Hi ${userName},</p>
        <p>Your personalized Monthly Transit Report for <strong>${monthName} ${year}</strong> is ready.</p>
        <p>This premium report includes:</p>
        <ul>
          <li>Monthly cosmic overview</li>
          <li>Key transit dates with intensity ratings</li>
          <li>Life area breakdowns (Career, Love, Health, Growth, Communication, Finance)</li>
          <li>Retrograde periods and their effects</li>
        </ul>
        <p style="text-align: center;"><a href="${dashboardUrl}" class="btn">Download Your Report</a></p>
        <p style="color: #999; font-size: 14px;">This report is available in your AstroVerse dashboard as a downloadable PDF.</p>
      </div>
      <div class="footer">AstroVerse Premium &mdash; Your Stars, Your Story</div>
    </div>
    </body></html>
  `;

  enqueue(() => sendEmail(to, `Your ${monthName} ${year} Transit Report is Ready`, html));
}
