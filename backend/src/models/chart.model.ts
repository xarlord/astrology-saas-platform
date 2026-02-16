/**
 * Chart Model
 */

import db from '../db';

export interface Chart {
  id: string;
  user_id: string;
  name: string;
  type: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: Date;
  birth_time: string;
  birth_time_unknown: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac: 'tropical' | 'sidereal';
  sidereal_mode?: string;
  calculated_data?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateChartData {
  user_id: string;
  name: string;
  type?: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: Date;
  birth_time: string;
  birth_time_unknown?: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system?: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac?: 'tropical' | 'sidereal';
  sidereal_mode?: string;
}

export interface UpdateChartData {
  name?: string;
  house_system?: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac?: 'tropical' | 'sidereal';
  sidereal_mode?: string;
  calculated_data?: any;
}

class ChartModel {
  private tableName = 'charts';

  /**
   * Find chart by ID
   */
  async findById(id: string): Promise<Chart | null> {
    const chart = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();

    return chart || null;
  }

  /**
   * Find chart by ID and user ID (ensures ownership)
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Chart | null> {
    const chart = await db(this.tableName)
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .first();

    return chart || null;
  }

  /**
   * Get all charts for a user
   */
  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Chart[]> {
    return db(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Create new chart
   */
  async create(data: CreateChartData): Promise<Chart> {
    const [chart] = await db(this.tableName)
      .insert({
        ...data,
        type: data.type || 'natal',
        house_system: data.house_system || 'placidus',
        zodiac: data.zodiac || 'tropical',
        birth_time_unknown: data.birth_time_unknown || false,
      })
      .returning('*');

    return chart;
  }

  /**
   * Update chart
   */
  async update(id: string, userId: string, data: UpdateChartData): Promise<Chart | null> {
    const [chart] = await db(this.tableName)
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return chart || null;
  }

  /**
   * Update calculated data
   */
  async updateCalculatedData(id: string, userId: string, calculatedData: any): Promise<Chart | null> {
    const [chart] = await db(this.tableName)
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({
        calculated_data: calculatedData,
        updated_at: new Date(),
      })
      .returning('*');

    return chart || null;
  }

  /**
   * Soft delete chart
   */
  async softDelete(id: string, userId: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id, user_id: userId })
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });

    return count > 0;
  }

  /**
   * Permanently delete chart
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id, user_id: userId })
      .del();

    return count > 0;
  }

  /**
   * Count charts for user
   */
  async countByUserId(userId: string): Promise<number> {
    const [{ count }] = await db(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .count('* as count');

    return Number(count);
  }
}

export default new ChartModel();
