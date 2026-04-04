/**
 * Email Service
 * Uses Resend in production, falls back to logging in development
 */

import logger from '../utils/logger';

const fromEmail = process.env.EMAIL_FROM || 'noreply@astroverse.app';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export interface SendResetEmailParams {
  to: string;
  resetToken: string;
  userName?: string;
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(params: SendResetEmailParams): Promise<void> {
  const resetUrl = `${frontendUrl}/reset-password?token=${params.resetToken}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.info('Password reset email (dev mode — no RESEND_API_KEY)', {
      to: params.to,
      resetUrl,
    });
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: `AstroVerse <${fromEmail}>`,
      to: params.to,
      subject: 'Reset your AstroVerse password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Reset Your Password</h2>
          <p>Hi ${params.userName || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to choose a new one:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #b23de1, #2563EB); color: white; text-decoration: none; border-radius: 9999px; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    logger.info('Password reset email sent', { to: params.to });
  } catch (error) {
    logger.error('Failed to send password reset email', {
      to: params.to,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw — we don't want to leak whether an email exists
  }
}
