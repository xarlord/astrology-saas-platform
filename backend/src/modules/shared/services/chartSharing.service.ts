/**
 * Chart Sharing Service
 *
 * @requirement FINDING-009
 * @description Secure chart sharing with UUID links and optional password protection
 * @storage Supports both database (production) and in-memory (development/fallback)
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import type { Knex } from 'knex';
import logger from '../../../utils/logger';

export interface SharedChart {
  id: string;
  chartId: string;
  shareToken: string;
  passwordHash?: string;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface ShareCreationOptions {
  chartId: string;
  userId: string;
  password?: string;
  expiresInDays?: number;
}

export interface ShareAccessResult {
  success: boolean;
  chart?: Record<string, unknown>;
  error?: string;
}

export class ChartSharingService {
  private readonly TOKEN_LENGTH = 32;
  private readonly DEFAULT_EXPIRY_DAYS = 30;
  private readonly BCRYPT_ROUNDS = 10;

  // Database connection (production)
  private db: Knex | null = null;

  // In-memory store for demo/fallback
  private sharedCharts: Map<string, SharedChart> = new Map();
  private tokenToId: Map<string, string> = new Map();

  /**
   * Initialize database connection for persistent storage
   */
  initializeDatabase(db: Knex): void {
    this.db = db;
    logger.info('ChartSharingService: Database storage enabled');
  }

  /**
   * Check if using database storage
   */
  isUsingDatabase(): boolean {
    return this.db !== null;
  }

  /**
   * Create a new share link for a chart
   */
  async createShareLink(options: ShareCreationOptions): Promise<SharedChart> {
    const { chartId, userId, password, expiresInDays } = options;

    // Generate unique share token
    const shareToken = this.generateShareToken();

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || this.DEFAULT_EXPIRY_DAYS));

    // Create share record
    const sharedChart: SharedChart = {
      id: crypto.randomUUID(),
      chartId,
      shareToken,
      passwordHash,
      expiresAt,
      createdBy: userId,
      createdAt: new Date(),
      accessCount: 0,
    };

    // Store in database if available
    if (this.db) {
      await this.db('shared_charts').insert({
        id: sharedChart.id,
        chart_id: sharedChart.chartId,
        share_token: sharedChart.shareToken,
        password_hash: sharedChart.passwordHash,
        expires_at: sharedChart.expiresAt,
        created_by: sharedChart.createdBy,
        created_at: sharedChart.createdAt,
        access_count: sharedChart.accessCount,
      });
    } else {
      // Fallback to in-memory storage
      this.sharedCharts.set(sharedChart.id, sharedChart);
      this.tokenToId.set(shareToken, sharedChart.id);
    }

    return sharedChart;
  }

  /**
   * Access a shared chart by token
   */
  async accessSharedChart(
    shareToken: string,
    password?: string,
    chartDataProvider?: (chartId: string) => Promise<Record<string, unknown>>
  ): Promise<ShareAccessResult> {
    // Find share by token
    let sharedChart: SharedChart | null = null;

    if (this.db) {
      const row = await this.db('shared_charts')
        .where('share_token', shareToken)
        .where('expires_at', '>', new Date())
        .first();

      if (row) {
        sharedChart = {
          id: row.id,
          chartId: row.chart_id,
          shareToken: row.share_token,
          passwordHash: row.password_hash,
          expiresAt: new Date(row.expires_at),
          createdBy: row.created_by,
          createdAt: new Date(row.created_at),
          accessCount: row.access_count,
          lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined,
        };
      }
    } else {
      // Fallback to in-memory
      const shareId = this.tokenToId.get(shareToken);
      if (shareId) {
        sharedChart = this.sharedCharts.get(shareId) || null;
      }
    }

    if (!sharedChart) {
      return { success: false, error: 'Share link not found or has expired' };
    }

    // Check expiration
    if (new Date() > sharedChart.expiresAt) {
      // Clean up expired share
      if (!this.db) {
        const shareId = this.tokenToId.get(shareToken);
        if (shareId) {
          this.sharedCharts.delete(shareId);
          this.tokenToId.delete(shareToken);
        }
      }
      return { success: false, error: 'Share link has expired' };
    }

    // Check password if required
    if (sharedChart.passwordHash) {
      if (!password) {
        return { success: false, error: 'Password required' };
      }

      const passwordValid = await bcrypt.compare(password, sharedChart.passwordHash);
      if (!passwordValid) {
        return { success: false, error: 'Invalid password' };
      }
    }

    // Update access stats
    if (this.db) {
      await this.db('shared_charts')
        .where('id', sharedChart.id)
        .update({
          access_count: this.db.raw('access_count + 1'),
          last_accessed_at: new Date(),
        });
    } else {
      sharedChart.accessCount++;
      sharedChart.lastAccessedAt = new Date();
    }

    // Get chart data if provider is available
    let chartData;
    if (chartDataProvider) {
      try {
        chartData = await chartDataProvider(sharedChart.chartId);
      } catch (error) {
        return { success: false, error: 'Failed to retrieve chart data' };
      }
    }

    return {
      success: true,
      chart: {
        id: sharedChart.chartId,
        ...chartData,
      },
    };
  }

  /**
   * Revoke a share link
   */
  async revokeShareLink(shareToken: string, userId: string): Promise<boolean> {
    if (this.db) {
      const result = await this.db('shared_charts')
        .where('share_token', shareToken)
        .where('created_by', userId)
        .delete();

      return result > 0;
    }

    // Fallback to in-memory
    const shareId = this.tokenToId.get(shareToken);
    if (!shareId) {
      return false;
    }

    const sharedChart = this.sharedCharts.get(shareId);
    if (!sharedChart) {
      return false;
    }

    // Only creator can revoke
    if (sharedChart.createdBy !== userId) {
      return false;
    }

    // Remove from maps
    this.sharedCharts.delete(shareId);
    this.tokenToId.delete(shareToken);

    return true;
  }

  /**
   * Get all shares for a user
   */
  async getSharesByUser(userId: string): Promise<SharedChart[]> {
    if (this.db) {
      const rows = await this.db('shared_charts')
        .where('created_by', userId)
        .where('expires_at', '>', new Date())
        .orderBy('created_at', 'desc');

      return rows.map((row) => ({
        id: row.id,
        chartId: row.chart_id,
        shareToken: row.share_token,
        passwordHash: row.password_hash,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        accessCount: row.access_count,
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined,
      }));
    }

    // Fallback to in-memory
    const shares: SharedChart[] = [];
    for (const share of Array.from(this.sharedCharts.values())) {
      if (share.createdBy === userId) {
        shares.push(share);
      }
    }
    return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all shares for a specific chart
   */
  async getSharesByChart(chartId: string): Promise<SharedChart[]> {
    if (this.db) {
      const rows = await this.db('shared_charts')
        .where('chart_id', chartId)
        .where('expires_at', '>', new Date())
        .orderBy('created_at', 'desc');

      return rows.map((row) => ({
        id: row.id,
        chartId: row.chart_id,
        shareToken: row.share_token,
        passwordHash: row.password_hash,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        accessCount: row.access_count,
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined,
      }));
    }

    // Fallback to in-memory
    const shares: SharedChart[] = [];
    for (const share of Array.from(this.sharedCharts.values())) {
      if (share.chartId === chartId) {
        shares.push(share);
      }
    }
    return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get share details by token
   */
  async getShareByToken(shareToken: string): Promise<SharedChart | null> {
    if (this.db) {
      const row = await this.db('shared_charts')
        .where('share_token', shareToken)
        .first();

      if (!row) return null;

      return {
        id: row.id,
        chartId: row.chart_id,
        shareToken: row.share_token,
        passwordHash: row.password_hash,
        expiresAt: new Date(row.expires_at),
        createdBy: row.created_by,
        createdAt: new Date(row.created_at),
        accessCount: row.access_count,
        lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined,
      };
    }

    // Fallback to in-memory
    const shareId = this.tokenToId.get(shareToken);
    if (!shareId) {
      return null;
    }
    return this.sharedCharts.get(shareId) || null;
  }

  /**
   * Extend share expiration
   */
  async extendShare(shareToken: string, userId: string, additionalDays: number = 30): Promise<SharedChart | null> {
    if (this.db) {
      const share = await this.getShareByToken(shareToken);
      if (!share || share.createdBy !== userId) {
        return null;
      }

      const newExpiresAt = new Date(share.expiresAt);
      newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

      await this.db('shared_charts')
        .where('share_token', shareToken)
        .update({ expires_at: newExpiresAt });

      return { ...share, expiresAt: newExpiresAt };
    }

    // Fallback to in-memory
    const shareId = this.tokenToId.get(shareToken);
    if (!shareId) {
      return null;
    }

    const sharedChart = this.sharedCharts.get(shareId);
    if (!sharedChart || sharedChart.createdBy !== userId) {
      return null;
    }

    // Extend expiration (create new Date to avoid mutation issues)
    sharedChart.expiresAt = new Date(sharedChart.expiresAt.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    return sharedChart;
  }

  /**
   * Clean up expired shares
   */
  async cleanupExpiredShares(): Promise<number> {
    if (this.db) {
      const result = await this.db('shared_charts')
        .where('expires_at', '<=', new Date())
        .delete();

      return result;
    }

    // Fallback to in-memory
    const now = new Date();
    let cleaned = 0;

    for (const [id, share] of Array.from(this.sharedCharts.entries())) {
      if (now > share.expiresAt) {
        this.sharedCharts.delete(id);
        this.tokenToId.delete(share.shareToken);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Generate share statistics
   */
  async getShareStats(shareToken: string): Promise<{
    accessCount: number;
    lastAccessedAt?: Date;
    expiresAt: Date;
    daysRemaining: number;
  } | null> {
    const share = await this.getShareByToken(shareToken);
    if (!share) {
      return null;
    }

    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((share.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      accessCount: share.accessCount,
      lastAccessedAt: share.lastAccessedAt,
      expiresAt: share.expiresAt,
      daysRemaining,
    };
  }

  /**
   * Generate a secure share token
   */
  private generateShareToken(): string {
    // Generate URL-safe token
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('base64url');
  }

  /**
   * Validate share token format
   */
  isValidTokenFormat(token: string): boolean {
    // Check length and format
    if (!token || token.length < 20) {
      return false;
    }
    // Base64url characters only
    return /^[A-Za-z0-9_-]+$/.test(token);
  }

  /**
   * Generate share URL
   */
  generateShareUrl(shareToken: string, baseUrl: string): string {
    return `${baseUrl}/share/${shareToken}`;
  }
}

// Singleton instance
export const chartSharingService = new ChartSharingService();

export default ChartSharingService;
