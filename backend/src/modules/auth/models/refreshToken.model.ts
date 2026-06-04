/**
 * Refresh Token Model
 *
 * Uses SHA-256 lookup hash for O(1) token retrieval, then bcrypt.compare
 * for cryptographic verification. See Issue #244.
 */

import crypto from 'crypto';
import db, { Knex } from '../../../config/database';
import * as bcrypt from 'bcryptjs';

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  token_lookup_hash: string | null;
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
 * Compute a SHA-256 hex digest of the raw token for O(1) database lookup.
 */
function computeLookupHash(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Create a new refresh token (stores bcrypt-hashed token + SHA-256 lookup hash)
 */
export async function createRefreshToken(
  input: CreateRefreshTokenInput,
  trx?: Knex.Transaction,
): Promise<RefreshToken> {
  const query = trx || db;
  const hashedToken = await bcrypt.hash(input.token, 10);
  const lookupHash = computeLookupHash(input.token);

  const [refreshToken] = await query<RefreshToken>('refresh_tokens')
    .insert({
      user_id: input.user_id,
      token: hashedToken,
      token_lookup_hash: lookupHash,
      expires_at: input.expires_at,
      user_agent: input.user_agent || null,
      ip_address: input.ip_address || null,
    })
    .returning('*');

  return refreshToken;
}

/**
 * Find a refresh token by its plaintext value.
 *
 * Strategy:
 *  1. Compute SHA-256 of the provided token → single-row DB lookup (O(1) with index).
 *  2. bcrypt.compare for cryptographic verification.
 *  3. If lookup-hash lookup misses, fall back to full scan (handles legacy rows
 *     created before the migration).
 */
export async function findRefreshToken(token: string): Promise<RefreshToken | null> {
  const lookupHash = computeLookupHash(token);

  // --- Fast path: indexed lookup by SHA-256 hash ---
  const candidate = await db<RefreshToken>('refresh_tokens')
    .where({ token_lookup_hash: lookupHash })
    .first();

  if (candidate) {
    const match = await bcrypt.compare(token, candidate.token);
    if (match) return candidate;
  }

  // --- Slow fallback for legacy rows without token_lookup_hash ---
  // Only needed until all rows are migrated.
  const activeCandidates = await db<RefreshToken>('refresh_tokens')
    .where({ revoked: false })
    .whereNull('token_lookup_hash')
    .where('expires_at', '>', new Date())
    .limit(50);

  for (const c of activeCandidates) {
    const match = await bcrypt.compare(token, c.token);
    if (match) return c;
  }

  const revokedCandidates = await db<RefreshToken>('refresh_tokens')
    .where({ revoked: true })
    .whereNull('token_lookup_hash')
    .limit(50);

  for (const c of revokedCandidates) {
    const match = await bcrypt.compare(token, c.token);
    if (match) return c;
  }

  return null;
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
 * Revoke a refresh token (looks up by plaintext, revokes the hashed match)
 */
export async function revokeRefreshToken(token: string, trx?: Knex.Transaction): Promise<boolean> {
  const record = await findRefreshToken(token);
  if (!record) return false;

  const query = trx || db;
  const updated = await query<RefreshToken>('refresh_tokens').where({ id: record.id }).update({
    revoked: true,
    revoked_at: new Date(),
  });

  return updated > 0;
}

/**
 * Revoke all refresh tokens for a user (except current token)
 */
export async function revokeAllUserRefreshTokens(
  userId: string,
  exceptToken?: string,
): Promise<number> {
  // Find the current token record to exclude it
  let exceptId: string | undefined;
  if (exceptToken) {
    const record = await findRefreshToken(exceptToken);
    exceptId = record?.id;
  }

  const query = db<RefreshToken>('refresh_tokens')
    .where({
      user_id: userId,
      revoked: false,
    })
    .where('expires_at', '>', new Date());

  if (exceptId) {
    query.whereNot('id', exceptId);
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
  return db<RefreshToken>('refresh_tokens').where('expires_at', '<', new Date()).delete();
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
