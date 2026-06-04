/**
 * User Model
 */

import knex from '../../../config/database';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  timezone: string;
  plan: 'free' | 'pro' | 'premium';
  subscription_status: 'active' | 'canceled' | 'expired';
  subscription_renews_at?: Date;
  preferences: Record<string, unknown>;
  failed_login_attempts: number;
  locked_until?: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password_hash: string;
  timezone?: string;
}

export interface UpdateUserData {
  name?: string;
  avatar_url?: string;
  timezone?: string;
  preferences?: Record<string, unknown>;
}

class UserModel {
  private tableName = 'users';

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await knex(this.tableName).where({ id }).whereNull('deleted_at').first();

    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await knex(this.tableName).where({ email }).whereNull('deleted_at').first();

    return user || null;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    const [user] = await knex(this.tableName)
      .insert({
        ...data,
        preferences: {},
        plan: 'free',
        subscription_status: 'active',
        timezone: data.timezone || 'UTC',
      })
      .returning('*');

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const [user] = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return user || null;
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<boolean> {
    const count = await knex(this.tableName).where({ id }).update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    return count > 0;
  }

  /**
   * Update user's plan
   */
  async updatePlan(
    id: string,
    plan: 'free' | 'pro' | 'premium',
    status: 'active' | 'canceled' | 'expired' = 'active',
    renewsAt?: Date,
  ): Promise<User | null> {
    const [user] = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        plan,
        subscription_status: status,
        subscription_renews_at: renewsAt,
        updated_at: new Date(),
      })
      .returning('*');

    return user || null;
  }

  /**
   * Get user's charts
   */
  async getCharts(userId: string, limit = 20, offset = 0) {
    return knex('charts')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(id: string, preferences: Record<string, unknown>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const updatedPreferences = { ...user.preferences, ...preferences };

    const [updatedUser] = await knex(this.tableName)
      .where({ id })
      .update({
        preferences: updatedPreferences,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedUser || null;
  }

  /**
   * Update user password directly
   */
  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const count = await knex(this.tableName).where({ id }).whereNull('deleted_at').update({
      password_hash: passwordHash,
      updated_at: new Date(),
    });

    return count > 0;
  }

  /**
   * Increment failed login attempts and lock account if threshold reached.
   * Returns the updated user.
   */
  async incrementFailedLoginAttempts(id: string): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const newCount = (user.failed_login_attempts || 0) + 1;
    const updates: Record<string, unknown> = {
      failed_login_attempts: newCount,
      updated_at: new Date(),
    };

    // Lock account after 5 failed attempts for 30 minutes
    if (newCount >= 5) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);
      updates.locked_until = lockedUntil;
    }

    const [updated] = await knex(this.tableName)
      .where({ id })
      .update(updates)
      .returning('*');

    return updated || null;
  }

  /**
   * Reset failed login attempts and clear lock (called on successful login).
   */
  async resetLoginAttempts(id: string): Promise<void> {
    await knex(this.tableName)
      .where({ id })
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date(),
      });
  }

  /**
   * Check if the account is currently locked.
   */
  isAccountLocked(user: User): boolean {
    if (!user.locked_until) return false;
    return new Date() < new Date(user.locked_until);
  }
}

export default new UserModel();
