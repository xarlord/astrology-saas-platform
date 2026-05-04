/**
 * Chart Sharing Service Tests
 * Tests share link creation, access, revocation, expiry, statistics, and both DB/in-memory paths
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  ChartSharingService,
  chartSharingService,
} from '../../modules/shared/services/chartSharing.service';
import type {
  SharedChart,
  ShareCreationOptions,
} from '../../modules/shared/services/chartSharing.service';

// ---------- Mocks ----------

// Mock logger (also mocked globally in setup.ts, but we override here for clean per-test spies)
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------- Knex mock factory ----------

function createMockDb() {
  const insertFn = jest.fn().mockResolvedValue(undefined);
  const updateFn = jest.fn().mockResolvedValue(undefined);
  const deleteFn = jest.fn().mockResolvedValue(0);
  const whereFn = jest.fn().mockReturnThis();
  const firstFn = jest.fn().mockResolvedValue(undefined);
  const orderByFn = jest.fn().mockReturnThis();
  const rawFn = jest.fn((sql: string) => sql);

  const queryBuilder: Record<string, jest.Mock> = {
    where: whereFn,
    first: firstFn,
    insert: insertFn,
    update: updateFn,
    delete: deleteFn,
    orderBy: orderByFn,
  };

  // db('shared_charts') returns queryBuilder chain
  const db = jest.fn().mockReturnValue(queryBuilder);
  (db as unknown as { raw: jest.Mock }).raw = rawFn;

  return {
    db,
    queryBuilder,
    helpers: { insertFn, updateFn, deleteFn, whereFn, firstFn, orderByFn, rawFn },
  };
}

// ---------- Helpers ----------

function makeExpiredDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

function makeFutureDate(daysAhead: number = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

// Access internal maps for direct manipulation in tests
function getInternalMaps(svc: ChartSharingService) {
  return svc as unknown as {
    sharedCharts: Map<string, SharedChart>;
    tokenToId: Map<string, string>;
  };
}

// ---------- Test Suite ----------

describe('ChartSharingService', () => {
  let service: ChartSharingService;

  beforeEach(() => {
    service = new ChartSharingService();
  });

  // ===== initializeDatabase / isUsingDatabase =====

  describe('initializeDatabase / isUsingDatabase', () => {
    it('should start without database', () => {
      expect(service.isUsingDatabase()).toBe(false);
    });

    it('should enable database storage after init', () => {
      const { db } = createMockDb();
      service.initializeDatabase(db as unknown as ReturnType<typeof db>);
      expect(service.isUsingDatabase()).toBe(true);
    });
  });

  // ===== createShareLink (in-memory) =====

  describe('createShareLink - in-memory', () => {
    it('should create a share link without password', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
      };

      const result = await service.createShareLink(opts);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.chartId).toBe('chart-1');
      expect(result.shareToken).toBeDefined();
      expect(result.shareToken.length).toBeGreaterThanOrEqual(20);
      expect(result.passwordHash).toBeUndefined();
      expect(result.createdBy).toBe('user-1');
      expect(result.accessCount).toBe(0);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create a share link with password', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
        password: 'secret123',
      };

      const result = await service.createShareLink(opts);

      expect(result.passwordHash).toBeDefined();
      expect(result.passwordHash).not.toBe('secret123');
    });

    it('should respect custom expiresInDays', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
        expiresInDays: 7,
      };

      const result = await service.createShareLink(opts);
      const now = new Date();
      const diffMs = result.expiresAt.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });

    it('should default to 30 days expiry when expiresInDays not provided', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
      };

      const result = await service.createShareLink(opts);
      const now = new Date();
      const diffMs = result.expiresAt.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(29.9);
      expect(diffDays).toBeLessThanOrEqual(30.1);
    });

    it('should store share in in-memory maps', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
      };

      const created = await service.createShareLink(opts);

      // Retrieve by token
      const found = await service.getShareByToken(created.shareToken);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });
  });

  // ===== createShareLink (database) =====

  describe('createShareLink - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should insert into database when db is available', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
      };

      const result = await service.createShareLink(opts);

      expect(mockDbObj.db).toHaveBeenCalledWith('shared_charts');
      expect(mockDbObj.helpers.insertFn).toHaveBeenCalled();

      const insertCall = mockDbObj.helpers.insertFn.mock.calls[0][0];
      expect(insertCall.id).toBeDefined();
      expect(typeof insertCall.id).toBe('string');
      expect(insertCall.chart_id).toBe('chart-1');
      expect(insertCall.created_by).toBe('user-1');
      expect(insertCall.access_count).toBe(0);
    });

    it('should insert password hash when password is provided', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
        password: 'mypass',
      };

      await service.createShareLink(opts);

      const insertCall = mockDbObj.helpers.insertFn.mock.calls[0][0];
      expect(insertCall.password_hash).toBeDefined();
    });

    it('should insert undefined password_hash when no password', async () => {
      const opts: ShareCreationOptions = {
        chartId: 'chart-1',
        userId: 'user-1',
      };

      await service.createShareLink(opts);

      const insertCall = mockDbObj.helpers.insertFn.mock.calls[0][0];
      expect(insertCall.password_hash).toBeUndefined();
    });
  });

  // ===== accessSharedChart (in-memory) =====

  describe('accessSharedChart - in-memory', () => {
    it('should return error for non-existent token', async () => {
      const result = await service.accessSharedChart('nonexistent-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Share link not found or has expired');
    });

    it('should access a share without password', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.accessSharedChart(created.shareToken);

      expect(result.success).toBe(true);
      expect(result.chart).toBeDefined();
      expect(result.chart!.id).toBe('chart-1');
    });

    it('should require password when share has one', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
        password: 'secret',
      });

      const result = await service.accessSharedChart(created.shareToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password required');
    });

    it('should reject wrong password', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
        password: 'secret',
      });

      const result = await service.accessSharedChart(created.shareToken, 'wrongpass');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
    });

    it('should accept correct password', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
        password: 'secret',
      });

      const result = await service.accessSharedChart(created.shareToken, 'secret');

      expect(result.success).toBe(true);
      expect(result.chart).toBeDefined();
    });

    it('should increment access count on each access', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      await service.accessSharedChart(created.shareToken);
      await service.accessSharedChart(created.shareToken);
      await service.accessSharedChart(created.shareToken);

      const share = await service.getShareByToken(created.shareToken);
      expect(share!.accessCount).toBe(3);
    });

    it('should set lastAccessedAt on access', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      await service.accessSharedChart(created.shareToken);

      const share = await service.getShareByToken(created.shareToken);
      expect(share!.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should return error for expired share and clean it up', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      // Force expiry by directly mutating the stored share
      const maps = getInternalMaps(service);
      const shareId = maps.tokenToId.get(created.shareToken)!;
      maps.sharedCharts.get(shareId)!.expiresAt = makeExpiredDate();

      const result = await service.accessSharedChart(created.shareToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Share link has expired');

      // Verify cleanup - token should be removed
      expect(maps.tokenToId.has(created.shareToken)).toBe(false);
      expect(maps.sharedCharts.has(shareId)).toBe(false);
    });

    it('should use chartDataProvider when provided', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const mockProvider = jest.fn().mockResolvedValue({ title: 'My Chart', data: [1, 2, 3] });

      const result = await service.accessSharedChart(created.shareToken, undefined, mockProvider);

      expect(result.success).toBe(true);
      expect(mockProvider).toHaveBeenCalledWith('chart-1');
      expect(result.chart!.title).toBe('My Chart');
      expect(result.chart!.data).toEqual([1, 2, 3]);
      expect(result.chart!.id).toBe('chart-1');
    });

    it('should handle chartDataProvider error', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const mockProvider = jest.fn().mockRejectedValue(new Error('DB down'));

      const result = await service.accessSharedChart(created.shareToken, undefined, mockProvider);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve chart data');
    });

    it('should return chart with only id when no provider given', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.accessSharedChart(created.shareToken);

      expect(result.success).toBe(true);
      expect(result.chart).toEqual({ id: 'chart-1' });
    });
  });

  // ===== accessSharedChart (database) =====

  describe('accessSharedChart - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should query database by token and return error when not found', async () => {
      mockDbObj.helpers.firstFn.mockResolvedValue(undefined);

      const result = await service.accessSharedChart('some-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Share link not found or has expired');
    });

    it('should return chart data from database row without password', async () => {
      const futureDate = makeFutureDate();
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: null,
        expires_at: futureDate,
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 5,
        last_accessed_at: null,
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      const result = await service.accessSharedChart('valid-token');

      expect(result.success).toBe(true);
      expect(result.chart!.id).toBe('chart-1');
    });

    it('should update access count in database', async () => {
      const futureDate = makeFutureDate();
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: null,
        expires_at: futureDate,
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 5,
        last_accessed_at: null,
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      await service.accessSharedChart('valid-token');

      expect(mockDbObj.helpers.updateFn).toHaveBeenCalled();
      const updateCall = mockDbObj.helpers.updateFn.mock.calls[0][0];
      expect(updateCall.last_accessed_at).toBeInstanceOf(Date);
    });

    it('should require password when database row has password_hash', async () => {
      const futureDate = makeFutureDate();
      // Need a real bcrypt hash for 'secret'
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('secret', 1);

      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'pw-token',
        password_hash: hash,
        expires_at: futureDate,
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 0,
        last_accessed_at: null,
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      // No password provided
      const resultNoPass = await service.accessSharedChart('pw-token');
      expect(resultNoPass.success).toBe(false);
      expect(resultNoPass.error).toBe('Password required');

      // Wrong password
      const resultWrongPass = await service.accessSharedChart('pw-token', 'wrong');
      expect(resultWrongPass.success).toBe(false);
      expect(resultWrongPass.error).toBe('Invalid password');

      // Correct password
      const resultOk = await service.accessSharedChart('pw-token', 'secret');
      expect(resultOk.success).toBe(true);
    });
  });

  // ===== revokeShareLink (in-memory) =====

  describe('revokeShareLink - in-memory', () => {
    it('should revoke own share link', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.revokeShareLink(created.shareToken, 'user-1');

      expect(result).toBe(true);

      const found = await service.getShareByToken(created.shareToken);
      expect(found).toBeNull();
    });

    it('should not allow non-creator to revoke', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.revokeShareLink(created.shareToken, 'user-2');

      expect(result).toBe(false);

      // Share should still exist
      const found = await service.getShareByToken(created.shareToken);
      expect(found).not.toBeNull();
    });

    it('should return false for non-existent token', async () => {
      const result = await service.revokeShareLink('nonexistent', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false when token exists in tokenToId but not in sharedCharts', async () => {
      // Create a share
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      // Manually corrupt the maps: remove from sharedCharts but leave tokenToId
      const maps = getInternalMaps(service);
      const shareId = maps.tokenToId.get(created.shareToken)!;
      maps.sharedCharts.delete(shareId);

      const result = await service.revokeShareLink(created.shareToken, 'user-1');
      expect(result).toBe(false);
    });
  });

  // ===== revokeShareLink (database) =====

  describe('revokeShareLink - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should delete from database and return true when row deleted', async () => {
      mockDbObj.helpers.deleteFn.mockResolvedValue(1);

      const result = await service.revokeShareLink('some-token', 'user-1');

      expect(result).toBe(true);
    });

    it('should return false when no rows deleted', async () => {
      mockDbObj.helpers.deleteFn.mockResolvedValue(0);

      const result = await service.revokeShareLink('some-token', 'user-1');

      expect(result).toBe(false);
    });
  });

  // ===== getSharesByUser (in-memory) =====

  describe('getSharesByUser - in-memory', () => {
    it('should return empty array when user has no shares', async () => {
      const result = await service.getSharesByUser('user-1');
      expect(result).toEqual([]);
    });

    it('should return shares for a specific user sorted by createdAt desc', async () => {
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });
      await service.createShareLink({ chartId: 'chart-2', userId: 'user-1' });
      await service.createShareLink({ chartId: 'chart-3', userId: 'user-2' });

      const result = await service.getSharesByUser('user-1');

      expect(result.length).toBe(2);
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(result[1].createdAt.getTime());
      expect(result.every((s) => s.createdBy === 'user-1')).toBe(true);
    });
  });

  // ===== getSharesByUser (database) =====

  describe('getSharesByUser - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should query database and map rows', async () => {
      const futureDate = makeFutureDate();
      const rows = [
        {
          id: 'id-1',
          chart_id: 'chart-1',
          share_token: 'token-1',
          password_hash: null,
          expires_at: futureDate,
          created_by: 'user-1',
          created_at: new Date(),
          access_count: 0,
          last_accessed_at: null,
        },
        {
          id: 'id-2',
          chart_id: 'chart-2',
          share_token: 'token-2',
          password_hash: 'hash',
          expires_at: futureDate,
          created_by: 'user-1',
          created_at: new Date(),
          access_count: 3,
          last_accessed_at: new Date(),
        },
      ];

      // orderBy returns rows via the chain
      mockDbObj.helpers.orderByFn.mockResolvedValue(rows);

      const result = await service.getSharesByUser('user-1');

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('id-1');
      expect(result[0].chartId).toBe('chart-1');
      expect(result[1].passwordHash).toBe('hash');
      expect(result[1].lastAccessedAt).toBeInstanceOf(Date);
    });
  });

  // ===== getSharesByChart (in-memory) =====

  describe('getSharesByChart - in-memory', () => {
    it('should return empty array when chart has no shares', async () => {
      const result = await service.getSharesByChart('chart-1');
      expect(result).toEqual([]);
    });

    it('should return shares for a specific chart sorted by createdAt desc', async () => {
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-2' });
      await service.createShareLink({ chartId: 'chart-2', userId: 'user-1' });

      const result = await service.getSharesByChart('chart-1');

      expect(result.length).toBe(2);
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(result[1].createdAt.getTime());
      expect(result.every((s) => s.chartId === 'chart-1')).toBe(true);
    });
  });

  // ===== getSharesByChart (database) =====

  describe('getSharesByChart - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should query database by chart_id', async () => {
      const futureDate = makeFutureDate();
      const rows = [
        {
          id: 'id-1',
          chart_id: 'chart-1',
          share_token: 'token-1',
          password_hash: null,
          expires_at: futureDate,
          created_by: 'user-1',
          created_at: new Date(),
          access_count: 0,
          last_accessed_at: null,
        },
      ];
      mockDbObj.helpers.orderByFn.mockResolvedValue(rows);

      const result = await service.getSharesByChart('chart-1');

      expect(result.length).toBe(1);
      expect(result[0].chartId).toBe('chart-1');
    });
  });

  // ===== getShareByToken (in-memory) =====

  describe('getShareByToken - in-memory', () => {
    it('should return null for non-existent token', async () => {
      const result = await service.getShareByToken('nonexistent');
      expect(result).toBeNull();
    });

    it('should return the share when found', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.getShareByToken(created.shareToken);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.chartId).toBe('chart-1');
    });

    it('should return null when token is in tokenToId but not in sharedCharts', async () => {
      // Manually insert orphaned token mapping
      getInternalMaps(service).tokenToId.set('orphan-token', 'nonexistent-id');

      const result = await service.getShareByToken('orphan-token');
      expect(result).toBeNull();
    });
  });

  // ===== getShareByToken (database) =====

  describe('getShareByToken - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should return null when not found in database', async () => {
      mockDbObj.helpers.firstFn.mockResolvedValue(undefined);

      const result = await service.getShareByToken('some-token');
      expect(result).toBeNull();
    });

    it('should return mapped share when found', async () => {
      const futureDate = makeFutureDate();
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: 'somehash',
        expires_at: futureDate,
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 7,
        last_accessed_at: new Date(),
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      const result = await service.getShareByToken('valid-token');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('share-id');
      expect(result!.chartId).toBe('chart-1');
      expect(result!.accessCount).toBe(7);
      expect(result!.expiresAt).toBeInstanceOf(Date);
      expect(result!.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should handle null last_accessed_at', async () => {
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: null,
        expires_at: makeFutureDate(),
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 0,
        last_accessed_at: null,
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      const result = await service.getShareByToken('valid-token');
      expect(result!.lastAccessedAt).toBeUndefined();
    });
  });

  // ===== extendShare (in-memory) =====

  describe('extendShare - in-memory', () => {
    it('should extend share expiration by default 30 days', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const originalExpiry = new Date(created.expiresAt);

      const extended = await service.extendShare(created.shareToken, 'user-1');

      expect(extended).not.toBeNull();
      expect(extended!.expiresAt.getTime()).toBeGreaterThan(originalExpiry.getTime());
    });

    it('should extend by custom number of days', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const originalExpiry = new Date(created.expiresAt);

      const extended = await service.extendShare(created.shareToken, 'user-1', 60);

      const diffDays =
        (extended!.expiresAt.getTime() - originalExpiry.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(59.9);
      expect(diffDays).toBeLessThanOrEqual(60.1);
    });

    it('should return null for non-existent token', async () => {
      const result = await service.extendShare('nonexistent', 'user-1');
      expect(result).toBeNull();
    });

    it('should return null if user is not the creator', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const result = await service.extendShare(created.shareToken, 'user-2');
      expect(result).toBeNull();
    });
  });

  // ===== extendShare (database) =====

  describe('extendShare - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should update expires_at in database', async () => {
      const futureDate = makeFutureDate();
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: null,
        expires_at: futureDate,
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 0,
        last_accessed_at: null,
      };
      // First call: getShareByToken -> first
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      const result = await service.extendShare('valid-token', 'user-1', 60);

      expect(result).not.toBeNull();
      expect(mockDbObj.helpers.updateFn).toHaveBeenCalled();
    });

    it('should return null when share not found', async () => {
      mockDbObj.helpers.firstFn.mockResolvedValue(undefined);

      const result = await service.extendShare('missing-token', 'user-1');
      expect(result).toBeNull();
    });

    it('should return null when user is not the creator', async () => {
      const row = {
        id: 'share-id',
        chart_id: 'chart-1',
        share_token: 'valid-token',
        password_hash: null,
        expires_at: makeFutureDate(),
        created_by: 'user-1',
        created_at: new Date(),
        access_count: 0,
        last_accessed_at: null,
      };
      mockDbObj.helpers.firstFn.mockResolvedValue(row);

      const result = await service.extendShare('valid-token', 'user-2');
      expect(result).toBeNull();
    });
  });

  // ===== cleanupExpiredShares (in-memory) =====

  describe('cleanupExpiredShares - in-memory', () => {
    it('should return 0 when no expired shares', async () => {
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });

      const cleaned = await service.cleanupExpiredShares();
      expect(cleaned).toBe(0);
    });

    it('should remove expired shares and return count', async () => {
      // Create two shares
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });
      await service.createShareLink({ chartId: 'chart-2', userId: 'user-1' });

      // Expire first one manually via internal maps
      const maps = getInternalMaps(service);
      const firstShare = Array.from(maps.sharedCharts.values())[0];
      firstShare.expiresAt = makeExpiredDate();

      const cleaned = await service.cleanupExpiredShares();

      expect(cleaned).toBe(1);
      expect(maps.sharedCharts.size).toBe(1);
    });

    it('should clean up token mappings too', async () => {
      await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });

      const maps = getInternalMaps(service);
      const firstShare = Array.from(maps.sharedCharts.values())[0];
      const token = firstShare.shareToken;
      firstShare.expiresAt = makeExpiredDate();

      await service.cleanupExpiredShares();

      expect(maps.tokenToId.has(token)).toBe(false);
    });

    it('should return 0 when no shares exist', async () => {
      const cleaned = await service.cleanupExpiredShares();
      expect(cleaned).toBe(0);
    });
  });

  // ===== cleanupExpiredShares (database) =====

  describe('cleanupExpiredShares - database', () => {
    let mockDbObj: ReturnType<typeof createMockDb>;

    beforeEach(() => {
      mockDbObj = createMockDb();
      service.initializeDatabase(mockDbObj.db as unknown as ReturnType<typeof mockDbObj.db>);
    });

    it('should delete expired rows and return count', async () => {
      mockDbObj.helpers.deleteFn.mockResolvedValue(5);

      const cleaned = await service.cleanupExpiredShares();

      expect(cleaned).toBe(5);
    });
  });

  // ===== getShareStats =====

  describe('getShareStats', () => {
    it('should return null for non-existent token', async () => {
      const result = await service.getShareStats('nonexistent');
      expect(result).toBeNull();
    });

    it('should return stats for a valid share', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      const stats = await service.getShareStats(created.shareToken);

      expect(stats).not.toBeNull();
      expect(stats!.accessCount).toBe(0);
      expect(stats!.expiresAt).toBeInstanceOf(Date);
      expect(stats!.daysRemaining).toBeGreaterThanOrEqual(0);
      expect(stats!.daysRemaining).toBeLessThanOrEqual(31);
      expect(stats!.lastAccessedAt).toBeUndefined();
    });

    it('should return 0 daysRemaining for expired share', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      // Force expiry via internal maps
      const maps = getInternalMaps(service);
      const shareId = maps.tokenToId.get(created.shareToken)!;
      maps.sharedCharts.get(shareId)!.expiresAt = makeExpiredDate();

      const stats = await service.getShareStats(created.shareToken);

      expect(stats!.daysRemaining).toBe(0);
    });

    it('should include lastAccessedAt after access', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      await service.accessSharedChart(created.shareToken);

      const stats = await service.getShareStats(created.shareToken);

      expect(stats!.lastAccessedAt).toBeInstanceOf(Date);
      expect(stats!.accessCount).toBe(1);
    });
  });

  // ===== isValidTokenFormat =====

  describe('isValidTokenFormat', () => {
    it('should reject empty string', () => {
      expect(service.isValidTokenFormat('')).toBe(false);
    });

    it('should reject short tokens (< 20 chars)', () => {
      expect(service.isValidTokenFormat('shorttoken123')).toBe(false);
    });

    it('should reject tokens with invalid characters', () => {
      expect(service.isValidTokenFormat('invalid@token#with!special chars!!!')).toBe(false);
    });

    it('should accept valid base64url tokens', () => {
      const token = 'abcdefghijklmnopqrstuvwxYZ0123456789_-';
      expect(service.isValidTokenFormat(token)).toBe(true);
    });

    it('should accept a real generated token', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });

      expect(service.isValidTokenFormat(created.shareToken)).toBe(true);
    });

    it('should reject token with spaces', () => {
      expect(service.isValidTokenFormat('has a space in it somewhere')).toBe(false);
    });
  });

  // ===== generateShareUrl =====

  describe('generateShareUrl', () => {
    it('should generate correct URL', () => {
      const url = service.generateShareUrl('my-token-123', 'https://example.com');
      expect(url).toBe('https://example.com/share/my-token-123');
    });

    it('should handle base URL without trailing slash', () => {
      const url = service.generateShareUrl('abc', 'https://app.astroverse.io');
      expect(url).toBe('https://app.astroverse.io/share/abc');
    });

    it('should handle base URL with trailing slash', () => {
      const url = service.generateShareUrl('abc', 'https://app.astroverse.io/');
      expect(url).toBe('https://app.astroverse.io//share/abc');
    });
  });

  // ===== Singleton export =====

  describe('singleton instance', () => {
    it('should export a ChartSharingService instance', () => {
      expect(chartSharingService).toBeInstanceOf(ChartSharingService);
    });
  });

  // ===== Edge cases =====

  describe('edge cases', () => {
    it('should handle creating multiple shares for the same chart', async () => {
      const s1 = await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });
      const s2 = await service.createShareLink({ chartId: 'chart-1', userId: 'user-1' });

      expect(s1.shareToken).not.toBe(s2.shareToken);
      expect(s1.id).not.toBe(s2.id);

      const shares = await service.getSharesByChart('chart-1');
      expect(shares.length).toBe(2);
    });

    it('should handle empty password (falsy) as no password', async () => {
      const created = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
        password: '',
      });

      expect(created.passwordHash).toBeUndefined();

      // Access without password should succeed
      const result = await service.accessSharedChart(created.shareToken);
      expect(result.success).toBe(true);
    });

    it('should not clean up non-expired shares when accessing expired ones', async () => {
      const expiredShare = await service.createShareLink({
        chartId: 'chart-1',
        userId: 'user-1',
      });
      const validShare = await service.createShareLink({
        chartId: 'chart-2',
        userId: 'user-1',
      });

      // Force expire only the first one via internal maps
      const maps = getInternalMaps(service);
      const expiredId = maps.tokenToId.get(expiredShare.shareToken)!;
      maps.sharedCharts.get(expiredId)!.expiresAt = makeExpiredDate();

      // Access the expired one (triggers cleanup)
      await service.accessSharedChart(expiredShare.shareToken);

      // The valid one should still be accessible
      const validResult = await service.accessSharedChart(validShare.shareToken);
      expect(validResult.success).toBe(true);
    });
  });
});
