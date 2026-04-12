/**
 * Password Reset Token Model
 */

import db from '../../../config/database';

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
 * Create a password reset token
 */
export async function createResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
  const [record] = await db('password_reset_tokens')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })
    .returning('*');

  return record;
}

/**
 * Find a reset token by token value
 */
export async function findResetToken(token: string): Promise<PasswordResetToken | null> {
  const record = await db('password_reset_tokens')
    .where({ token })
    .first();

  return record || null;
}

/**
 * Mark a reset token as used
 */
export async function markTokenUsed(tokenId: string): Promise<void> {
  await db('password_reset_tokens')
    .where({ id: tokenId })
    .update({
      used: true,
      used_at: new Date(),
    });
}

/**
 * Invalidate all unused reset tokens for a user
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
 * Delete expired reset tokens (cleanup)
 */
export async function deleteExpiredTokens(): Promise<number> {
  return db('password_reset_tokens')
    .where('expires_at', '<', new Date())
    .delete();
}
