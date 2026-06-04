/**
 * Password Reset Token Model
 * Tokens are stored hashed using SHA-256 for lookup efficiency.
 * Issue #254.
 */

import db from '../../../config/database';
import * as crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  used_at: Date | null;
  created_at: Date;
}

/**
 * Hash a token using SHA-256 for storage.
 * Uses HMAC with a server secret for additional security.
 */
function hashToken(token: string): string {
  const secret = process.env.PASSWORD_RESET_HASH_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_HASH_SECRET environment variable is required');
  }
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Create a password reset token (stored hashed).
 */
export async function createResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<PasswordResetToken> {
  const hashedToken = hashToken(token);

  const [record] = await db('password_reset_tokens')
    .insert({
      user_id: userId,
      token: hashedToken,
      expires_at: expiresAt,
    })
    .returning('*');

  return record;
}

/**
 * Find a reset token by plaintext token value (hashes for lookup).
 */
export async function findResetToken(token: string): Promise<PasswordResetToken | null> {
  const hashedToken = hashToken(token);

  const record = await db('password_reset_tokens')
    .where({ token: hashedToken })
    .first();

  return record || null;
}

/**
 * Mark a reset token as used.
 */
export async function markTokenUsed(tokenId: string): Promise<void> {
  await db('password_reset_tokens').where({ id: tokenId }).update({
    used: true,
    used_at: new Date(),
  });
}

/**
 * Invalidate all unused reset tokens for a user.
 */
export async function invalidateUserTokens(userId: string): Promise<number> {
  return db('password_reset_tokens')
    .where({
      user_id: userId,
      used: false,
    })
    .update({ used: true, used_at: new Date() });
}

/**
 * Delete expired reset tokens (cleanup).
 */
export async function deleteExpiredTokens(): Promise<number> {
  return db('password_reset_tokens').where('expires_at', '<', new Date()).delete();
}
