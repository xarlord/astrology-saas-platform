/**
 * Refresh Token Model
 */

import db from '../../../config/database';

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  revoked: boolean;
  revoked_at: Date | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
}

export interface CreateRefreshTokenInput {
  user_id: string;
  token: string;
  expires_at: Date;
  user_agent?: string;
  ip_address?: string;
}

/**
 * Create a new refresh token
 */
export async function createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshToken> {
  const [refreshToken] = await db<RefreshToken>('refresh_tokens')
    .insert({
      user_id: input.user_id,
      token: input.token,
      expires_at: input.expires_at,
      user_agent: input.user_agent || null,
      ip_address: input.ip_address || null,
    })
    .returning('*');

  return refreshToken;
}

/**
 * Find a refresh token by token value
 */
export async function findRefreshToken(token: string): Promise<RefreshToken | null> {
  const refreshToken = await db<RefreshToken>('refresh_tokens')
    .where({ token })
    .first();

  return refreshToken || null;
}

/**
 * Find all valid (non-expired, non-revoked) refresh tokens for a user
 */
export async function findValidRefreshTokens(userId: string): Promise<RefreshToken[]> {
  return db<RefreshToken>('refresh_tokens')
    .where({
      user_id: userId,
      revoked: false,
    })
    .where('expires_at', '>', new Date())
    .orderBy('created_at', 'desc');
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  const updated = await db<RefreshToken>('refresh_tokens')
    .where({ token })
    .update({
      revoked: true,
      revoked_at: new Date(),
    });

  return updated > 0;
}

/**
 * Revoke all refresh tokens for a user (except current token)
 */
export async function revokeAllUserRefreshTokens(userId: string, exceptToken?: string): Promise<number> {
  const query = db<RefreshToken>('refresh_tokens')
    .where({
      user_id: userId,
      revoked: false,
    })
    .where('expires_at', '>', new Date());

  if (exceptToken) {
    query.whereNot('token', exceptToken);
  }

  const updated = await query.update({
    revoked: true,
    revoked_at: new Date(),
  });

  return updated;
}

/**
 * Delete expired refresh tokens (cleanup job)
 */
export async function deleteExpiredRefreshTokens(): Promise<number> {
  return db<RefreshToken>('refresh_tokens')
    .where('expires_at', '<', new Date())
    .delete();
}

/**
 * Clean up old revoked refresh tokens
 */
export async function cleanupOldRefreshTokens(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return db<RefreshToken>('refresh_tokens')
    .where('revoked', true)
    .where('revoked_at', '<', cutoffDate)
    .delete();
}
