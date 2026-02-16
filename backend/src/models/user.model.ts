/**
 * User Model
 */

import db from '../db';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  timezone: string;
  plan: 'free' | 'premium' | 'professional';
  subscription_status: 'active' | 'canceled' | 'expired';
  subscription_renews_at?: Date;
  preferences: Record<string, any>;
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
  preferences?: Record<string, any>;
}

class UserModel {
  private tableName = 'users';

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();

    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await db(this.tableName)
      .where({ email })
      .whereNull('deleted_at')
      .first();

    return user || null;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    const [user] = await db(this.tableName)
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
    const [user] = await db(this.tableName)
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
    const count = await db(this.tableName)
      .where({ id })
      .update({
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
    plan: 'free' | 'premium' | 'professional',
    status: 'active' | 'canceled' | 'expired' = 'active',
    renewsAt?: Date
  ): Promise<User | null> {
    const [user] = await db(this.tableName)
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
    return db('charts')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(id: string, preferences: Record<string, any>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const updatedPreferences = { ...user.preferences, ...preferences };

    const [updatedUser] = await db(this.tableName)
      .where({ id })
      .update({
        preferences: updatedPreferences,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedUser || null;
  }
}

export default new UserModel();
