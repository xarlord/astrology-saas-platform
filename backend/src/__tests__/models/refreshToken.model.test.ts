/**
 * Unit Tests for Refresh Token Model
 * Tests refresh token database operations
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import db from '../../config/database';
import {
  createRefreshToken,
  findRefreshToken,
  findValidRefreshTokens,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  deleteExpiredRefreshTokens,
  cleanupOldRefreshTokens,
  RefreshToken,
  CreateRefreshTokenInput,
} from '../../modules/auth/models/refreshToken.model';

// Mock database
jest.mock('../../config/database');

// Mock bcryptjs — model uses bcrypt.compare for token lookup
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-token-value'),
}));

import bcrypt from 'bcryptjs';

const mockDb = db as jest.MockedFunction<typeof db>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Helper to build a mock query builder with the specified chain methods
function createMockQueryBuilder(overrides: Record<string, unknown> = {}) {
  // Internal resolve value for when the chain is awaited directly
  let _resolveValue: unknown = undefined;

  const qb: Record<string, unknown> = {};
  // Default all chainable methods to return this
  qb.where = jest.fn().mockReturnValue(qb);
  qb.whereNot = jest.fn().mockReturnValue(qb);
  qb.whereNull = jest.fn().mockReturnValue(qb);
  qb.orderBy = jest.fn().mockReturnValue(qb);
  qb.limit = jest.fn().mockReturnValue(qb);
  qb.first = jest.fn().mockResolvedValue(undefined);
  qb.insert = jest.fn().mockReturnValue(qb);
  qb.returning = jest.fn().mockResolvedValue([]);
  qb.update = jest.fn().mockResolvedValue(0);
  qb.delete = jest.fn().mockResolvedValue(0);

  // Thenable interface — makes `await knexChain` resolve to _resolveValue
  qb.then = jest.fn((resolve: any, reject?: any) =>
    Promise.resolve(_resolveValue).then(resolve, reject),
  );

  // Apply overrides
  Object.entries(overrides).forEach(([key, value]) => {
    qb[key] = value;
  });

  // Helper for tests to set what the chain resolves to when awaited
  (qb as any)._setResolveValue = (val: unknown) => {
    _resolveValue = val;
  };

  return qb;
}

describe('Refresh Token Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore bcrypt.hash default mock (clearAllMocks resets implementations)
    mockBcrypt.hash.mockResolvedValue('hashed-token-value');
  });

  // ------------------------------------------------------------------ //
  // createRefreshToken
  // ------------------------------------------------------------------ //
  describe('createRefreshToken', () => {
    it('should create a refresh token with required fields', async () => {
      const expiresAt = new Date('2026-12-31');
      const input: CreateRefreshTokenInput = {
        user_id: 'user-1',
        token: 'refresh-token-abc',
        expires_at: expiresAt,
      };
      const returnedToken: RefreshToken = {
        id: 'rt-1',
        user_id: 'user-1',
        token: 'refresh-token-abc',
        expires_at: expiresAt,
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const qb = createMockQueryBuilder({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([returnedToken]),
        }),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await createRefreshToken(input);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(qb.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        token: 'hashed-token-value',
        expires_at: expiresAt,
        user_agent: null,
        ip_address: null,
      });
      expect(result).toEqual(returnedToken);
    });

    it('should create a refresh token with optional user_agent and ip_address', async () => {
      const expiresAt = new Date('2026-12-31');
      const input: CreateRefreshTokenInput = {
        user_id: 'user-2',
        token: 'refresh-token-def',
        expires_at: expiresAt,
        user_agent: 'Mozilla/5.0',
        ip_address: '192.168.1.1',
      };
      const returnedToken: RefreshToken = {
        id: 'rt-2',
        user_id: 'user-2',
        token: 'hashed-token-value',
        expires_at: expiresAt,
        revoked: false,
        revoked_at: null,
        user_agent: 'Mozilla/5.0',
        ip_address: '192.168.1.1',
        created_at: new Date(),
      };

      const qb = createMockQueryBuilder({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([returnedToken]),
        }),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await createRefreshToken(input);

      expect(qb.insert).toHaveBeenCalledWith({
        user_id: 'user-2',
        token: 'hashed-token-value',
        expires_at: expiresAt,
        user_agent: 'Mozilla/5.0',
        ip_address: '192.168.1.1',
      });
      expect(result).toEqual(returnedToken);
    });

    it('should use transaction when provided', async () => {
      const expiresAt = new Date('2026-12-31');
      const input: CreateRefreshTokenInput = {
        user_id: 'user-3',
        token: 'refresh-token-ghi',
        expires_at: expiresAt,
      };
      const returnedToken: RefreshToken = {
        id: 'rt-3',
        user_id: 'user-3',
        token: 'refresh-token-ghi',
        expires_at: expiresAt,
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const trxQb = createMockQueryBuilder({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([returnedToken]),
        }),
      });
      const mockTrx = jest.fn().mockReturnValue(trxQb) as unknown as ReturnType<typeof db>;

      const result = await createRefreshToken(input, mockTrx as never);

      // Should NOT call db, should call the transaction instead
      expect(mockDb).not.toHaveBeenCalled();
      expect(mockTrx).toHaveBeenCalledWith('refresh_tokens');
      expect(trxQb.insert).toHaveBeenCalledWith({
        user_id: 'user-3',
        token: 'hashed-token-value',
        expires_at: expiresAt,
        user_agent: null,
        ip_address: null,
      });
      expect(result).toEqual(returnedToken);
    });

    it('should set null for optional fields when not provided', async () => {
      const expiresAt = new Date('2026-12-31');
      const input: CreateRefreshTokenInput = {
        user_id: 'user-4',
        token: 'refresh-token-jkl',
        expires_at: expiresAt,
        // user_agent and ip_address omitted
      };

      const qb = createMockQueryBuilder({
        insert: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: 'rt-4',
              user_id: 'user-4',
              token: 'refresh-token-jkl',
              expires_at: expiresAt,
              revoked: false,
              revoked_at: null,
              user_agent: null,
              ip_address: null,
              created_at: new Date(),
            },
          ]),
        }),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      await createRefreshToken(input);

      expect(qb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_agent: null,
          ip_address: null,
        }),
      );
    });
  });

  // ------------------------------------------------------------------ //
  // findRefreshToken
  // ------------------------------------------------------------------ //
  describe('findRefreshToken', () => {
    it('should return token when found', async () => {
      const foundToken: RefreshToken = {
        id: 'rt-10',
        user_id: 'user-10',
        token: 'hashed-found-token',
        expires_at: new Date('2026-12-31'),
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const qb = createMockQueryBuilder();
      (qb as any)._setResolveValue([foundToken]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
      mockBcrypt.compare.mockResolvedValueOnce(true);

      const result = await findRefreshToken('found-token');

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(qb.where).toHaveBeenCalledWith({ revoked: false });
      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
      expect(qb.limit).toHaveBeenCalledWith(50);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('found-token', 'hashed-found-token');
      expect(result).toEqual(foundToken);
    });

    it('should return null when token not found', async () => {
      const qb = createMockQueryBuilder();
      (qb as any)._setResolveValue([]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await findRefreshToken('nonexistent-token');

      expect(result).toBeNull();
    });
  });

  // ------------------------------------------------------------------ //
  // findValidRefreshTokens
  // ------------------------------------------------------------------ //
  describe('findValidRefreshTokens', () => {
    it('should query with correct where clauses and order', async () => {
      const validTokens: RefreshToken[] = [
        {
          id: 'rt-20',
          user_id: 'user-20',
          token: 'valid-token-1',
          expires_at: new Date('2026-12-31'),
          revoked: false,
          revoked_at: null,
          user_agent: null,
          ip_address: null,
          created_at: new Date(),
        },
        {
          id: 'rt-21',
          user_id: 'user-20',
          token: 'valid-token-2',
          expires_at: new Date('2027-01-15'),
          revoked: false,
          revoked_at: null,
          user_agent: 'Safari',
          ip_address: '10.0.0.1',
          created_at: new Date(),
        },
      ];

      // orderBy resolves with the final array
      const qb = createMockQueryBuilder({
        orderBy: jest.fn().mockResolvedValue(validTokens),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await findValidRefreshTokens('user-20');

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(qb.where).toHaveBeenCalledWith({
        user_id: 'user-20',
        revoked: false,
      });
      // Second where call for expires_at check
      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(result).toEqual(validTokens);
    });

    it('should return empty array when no valid tokens exist', async () => {
      const qb = createMockQueryBuilder({
        orderBy: jest.fn().mockResolvedValue([]),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await findValidRefreshTokens('user-no-tokens');

      expect(result).toEqual([]);
    });
  });

  // ------------------------------------------------------------------ //
  // revokeRefreshToken
  // ------------------------------------------------------------------ //
  describe('revokeRefreshToken', () => {
    it('should return true when token was found and updated', async () => {
      const foundRecord: RefreshToken = {
        id: 'rt-found',
        user_id: 'user-1',
        token: 'hashed-token',
        expires_at: new Date('2026-12-31'),
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const qb = createMockQueryBuilder({
        update: jest.fn().mockResolvedValue(1),
      });
      (qb as any)._setResolveValue([foundRecord]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
      mockBcrypt.compare.mockResolvedValueOnce(true);

      const result = await revokeRefreshToken('token-to-revoke');

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      // findRefreshToken calls: where({revoked:false}), where('expires_at',...), limit(50)
      // then revokeRefreshToken calls: where({id: 'rt-found'}), update({...})
      expect(qb.update).toHaveBeenCalledWith({
        revoked: true,
        revoked_at: expect.any(Date),
      });
      expect(result).toBe(true);
    });

    it('should return false when token not found', async () => {
      const qb = createMockQueryBuilder();
      (qb as any)._setResolveValue([]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await revokeRefreshToken('nonexistent-token');

      expect(result).toBe(false);
    });

    it('should use transaction when provided', async () => {
      const foundRecord: RefreshToken = {
        id: 'rt-trx',
        user_id: 'user-1',
        token: 'hashed-trx-token',
        expires_at: new Date('2026-12-31'),
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const findQb = createMockQueryBuilder();
      (findQb as any)._setResolveValue([foundRecord]);
      mockDb.mockReturnValueOnce(findQb as ReturnType<typeof db>);
      mockBcrypt.compare.mockResolvedValueOnce(true);

      const trxQb = createMockQueryBuilder({
        update: jest.fn().mockResolvedValue(1),
      });
      const mockTrx = jest.fn().mockReturnValue(trxQb) as unknown as ReturnType<typeof db>;

      const result = await revokeRefreshToken('token-with-trx', mockTrx as never);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(mockTrx).toHaveBeenCalledWith('refresh_tokens');
      expect(trxQb.where).toHaveBeenCalledWith({ id: 'rt-trx' });
      expect(trxQb.update).toHaveBeenCalledWith({
        revoked: true,
        revoked_at: expect.any(Date),
      });
      expect(result).toBe(true);
    });

    it('should set revoked=true and revoked_at to a new Date', async () => {
      const foundRecord: RefreshToken = {
        id: 'rt-date',
        user_id: 'user-1',
        token: 'hashed-token',
        expires_at: new Date('2026-12-31'),
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const qb = createMockQueryBuilder({
        update: jest.fn().mockResolvedValue(1),
      });
      (qb as any)._setResolveValue([foundRecord]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
      mockBcrypt.compare.mockResolvedValueOnce(true);

      const beforeRevoke = new Date();
      await revokeRefreshToken('some-token');
      const afterRevoke = new Date();

      const updateCall = (qb.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.revoked).toBe(true);
      expect(updateCall.revoked_at.getTime()).toBeGreaterThanOrEqual(beforeRevoke.getTime());
      expect(updateCall.revoked_at.getTime()).toBeLessThanOrEqual(afterRevoke.getTime());
    });
  });

  // ------------------------------------------------------------------ //
  // revokeAllUserRefreshTokens
  // ------------------------------------------------------------------ //
  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all valid tokens for user', async () => {
      const qb = createMockQueryBuilder({
        whereNot: undefined, // not called when no exceptToken
        update: jest.fn().mockResolvedValue(3),
      });
      // The implementation chains where().where().update()
      // where is called twice: once for object, once for expires_at
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await revokeAllUserRefreshTokens('user-30');

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(qb.where).toHaveBeenCalledWith({
        user_id: 'user-30',
        revoked: false,
      });
      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
      expect(qb.update).toHaveBeenCalledWith({
        revoked: true,
        revoked_at: expect.any(Date),
      });
      expect(result).toBe(3);
    });

    it('should exclude specified token when exceptToken provided', async () => {
      const exceptRecord: RefreshToken = {
        id: 'rt-except',
        user_id: 'user-31',
        token: 'hashed-keep-token',
        expires_at: new Date('2026-12-31'),
        revoked: false,
        revoked_at: null,
        user_agent: null,
        ip_address: null,
        created_at: new Date(),
      };

      const mockWhereNot = jest.fn().mockReturnThis();
      const qb = createMockQueryBuilder({
        whereNot: mockWhereNot,
        update: jest.fn().mockResolvedValue(2),
      });
      (qb as any)._setResolveValue([exceptRecord]);
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
      mockBcrypt.compare.mockResolvedValueOnce(true);

      const result = await revokeAllUserRefreshTokens('user-31', 'keep-this-token');

      // findRefreshToken was called for the exceptToken
      expect(mockBcrypt.compare).toHaveBeenCalledWith('keep-this-token', 'hashed-keep-token');
      // Main revoke query
      expect(qb.whereNot).toHaveBeenCalledWith('id', 'rt-except');
      expect(qb.update).toHaveBeenCalledWith({
        revoked: true,
        revoked_at: expect.any(Date),
      });
      expect(result).toBe(2);
    });

    it('should return 0 when no tokens to revoke', async () => {
      const qb = createMockQueryBuilder({
        update: jest.fn().mockResolvedValue(0),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await revokeAllUserRefreshTokens('user-no-tokens');

      expect(result).toBe(0);
    });
  });

  // ------------------------------------------------------------------ //
  // deleteExpiredRefreshTokens
  // ------------------------------------------------------------------ //
  describe('deleteExpiredRefreshTokens', () => {
    it('should delete tokens with expires_at before now', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(5),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await deleteExpiredRefreshTokens();

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(qb.where).toHaveBeenCalledWith('expires_at', '<', expect.any(Date));
      expect(qb.delete).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return 0 when no expired tokens exist', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(0),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await deleteExpiredRefreshTokens();

      expect(result).toBe(0);
    });
  });

  // ------------------------------------------------------------------ //
  // cleanupOldRefreshTokens
  // ------------------------------------------------------------------ //
  describe('cleanupOldRefreshTokens', () => {
    it('should use default 30 days when not specified', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(7),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const beforeCall = new Date();
      const result = await cleanupOldRefreshTokens();

      expect(result).toBe(7);

      // Verify the cutoff date is approximately 30 days ago
      // where is called as: where('revoked', true) then where('revoked_at', '<', cutoffDate)
      // So the date is at index 2 of the second call
      const whereCalls = (qb.where as jest.Mock).mock.calls;
      const revokedAtCall = whereCalls.find((call: unknown[]) => call[0] === 'revoked_at');
      expect(revokedAtCall).toBeDefined();
      const cutoffDate = revokedAtCall![2] as Date;
      const expectedCutoff = new Date(beforeCall);
      expectedCutoff.setDate(expectedCutoff.getDate() - 30);
      // Allow 2 second tolerance for test execution
      expect(Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())).toBeLessThan(2000);
    });

    it('should use custom days when specified', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(3),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const beforeCall = new Date();
      await cleanupOldRefreshTokens(60);

      const whereCalls = (qb.where as jest.Mock).mock.calls;
      const revokedAtCall = whereCalls.find((call: unknown[]) => call[0] === 'revoked_at');
      const cutoffDate = revokedAtCall![2] as Date;
      const expectedCutoff = new Date(beforeCall);
      expectedCutoff.setDate(expectedCutoff.getDate() - 60);
      expect(Math.abs(cutoffDate.getTime() - expectedCutoff.getTime())).toBeLessThan(2000);
    });

    it('should delete only revoked tokens older than cutoff', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(12),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await cleanupOldRefreshTokens(14);

      expect(qb.where).toHaveBeenCalledWith('revoked', true);
      expect(qb.where).toHaveBeenCalledWith('revoked_at', '<', expect.any(Date));
      expect(qb.delete).toHaveBeenCalled();
      expect(result).toBe(12);
    });

    it('should return 0 when no old revoked tokens exist', async () => {
      const qb = createMockQueryBuilder({
        delete: jest.fn().mockResolvedValue(0),
      });
      mockDb.mockReturnValue(qb as ReturnType<typeof db>);

      const result = await cleanupOldRefreshTokens();

      expect(result).toBe(0);
    });
  });
});
