/**
 * Password Reset Service
 */

import crypto from 'crypto';
import { AppError } from '../../../utils/appError';
import { hashPassword } from '../../../utils/helpers';
import UserModel from '../../users/models/user.model';
import * as PasswordResetModel from '../models/passwordReset.model';
import { sendPasswordResetEmail } from '../../../services/email.service';

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Request a password reset
 * Always returns success to prevent email enumeration
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findByEmail(email);

  // Always return success even if user not found (prevents email enumeration)
  if (!user) {
    return;
  }

  // Invalidate any existing unused tokens for this user
  await PasswordResetModel.invalidateUserTokens(user.id);

  // Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString('base64url');

  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await PasswordResetModel.createResetToken(user.id, token, expiresAt);

  // Send email (dev mode logs instead of sending)
  await sendPasswordResetEmail({
    to: user.email,
    resetToken: token,
    userName: user.name,
  });
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const resetToken = await PasswordResetModel.findResetToken(token);

  if (!resetToken) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (resetToken.used) {
    throw new AppError('This reset token has already been used', 400);
  }

  if (new Date() > resetToken.expires_at) {
    throw new AppError('This reset token has expired. Please request a new one.', 400);
  }

  // Hash the new password and update via UserModel
  const password_hash = await hashPassword(newPassword);
  await UserModel.updatePassword(resetToken.user_id, password_hash);

  await PasswordResetModel.markTokenUsed(resetToken.id);
}
