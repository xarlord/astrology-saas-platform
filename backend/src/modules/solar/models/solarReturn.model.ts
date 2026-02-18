/**
 * Solar Return Model
 * Handles database operations for solar returns
 */

import knex from '../../../config/database';
import { SolarReturn, SolarReturnInput, SolarReturnLocation, SolarReturnChartData } from './types';

export class SolarReturnModel {
  private tableName = 'solar_returns';

  /**
   * Create a new solar return
   */
  async create(data: SolarReturnInput): Promise<SolarReturn> {
    const [solarReturn] = await knex(this.tableName)
      .insert({
        user_id: data.userId,
        chart_id: data.chartId,
        year: data.year,
        return_date: data.returnDate,
        return_location: data.returnLocation as any,
        calculated_data: data.calculatedData as any,
        interpretation: data.interpretation as any,
        is_relocated: data.isRelocated || false,
        notes: data.notes,
      })
      .returning('*');

    return this.mapToSolarReturn(solarReturn);
  }

  /**
   * Find solar return by ID
   */
  async findById(id: string): Promise<SolarReturn | null> {
    const solarReturn = await knex(this.tableName)
      .where({ id })
      .first();

    return solarReturn ? this.mapToSolarReturn(solarReturn) : null;
  }

  /**
   * Find solar return by user and year
   */
  async findByUserAndYear(userId: string, year: number): Promise<SolarReturn | null> {
    const solarReturn = await knex(this.tableName)
      .where({ user_id: userId, year })
      .first();

    return solarReturn ? this.mapToSolarReturn(solarReturn) : null;
  }

  /**
   * Get all solar returns for a user
   */
  async findByUserId(userId: string): Promise<SolarReturn[]> {
    const solarReturns = await knex(this.tableName)
      .where({ user_id: userId })
      .orderBy('year', 'desc');

    return solarReturns.map(sr => this.mapToSolarReturn(sr));
  }

  /**
   * Get solar returns within a date range
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<SolarReturn[]> {
    const solarReturns = await knex(this.tableName)
      .where({ user_id: userId })
      .whereBetween('return_date', [startDate, endDate])
      .orderBy('return_date', 'asc');

    return solarReturns.map(sr => this.mapToSolarReturn(sr));
  }

  /**
   * Get recent solar returns (last N years)
   */
  async findRecent(userId: string, limit: number = 5): Promise<SolarReturn[]> {
    const solarReturns = await knex(this.tableName)
      .where({ user_id: userId })
      .orderBy('year', 'desc')
      .limit(limit);

    return solarReturns.map(sr => this.mapToSolarReturn(sr));
  }

  /**
   * Get all relocated solar returns
   */
  async findRelocated(userId: string): Promise<SolarReturn[]> {
    const solarReturns = await knex(this.tableName)
      .where({ user_id: userId, is_relocated: true })
      .orderBy('year', 'desc');

    return solarReturns.map(sr => this.mapToSolarReturn(sr));
  }

  /**
   * Update solar return
   */
  async update(id: string, data: Partial<SolarReturnInput>): Promise<SolarReturn | null> {
    const [solarReturn] = await knex(this.tableName)
      .where({ id })
      .update({
        ...(data.returnDate && { return_date: data.returnDate }),
        ...(data.returnLocation && { return_location: data.returnLocation as any }),
        ...(data.calculatedData && { calculated_data: data.calculatedData as any }),
        ...(data.interpretation && { interpretation: data.interpretation as any }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    return solarReturn ? this.mapToSolarReturn(solarReturn) : null;
  }

  /**
   * Delete solar return
   */
  async delete(id: string): Promise<boolean> {
    const count = await knex(this.tableName)
      .where({ id })
      .del();

    return count > 0;
  }

  /**
   * Check if solar return exists for user and year
   */
  async exists(userId: string, year: number): Promise<boolean> {
    const result = await knex(this.tableName)
      .where({ user_id: userId, year })
      .first();

    return !!result;
  }

  /**
   * Get solar return statistics
   */
  async getStats(userId: string): Promise<{
    total: number;
    relocated: number;
    byYear: Record<number, number>;
  }> {
    const solarReturns = await this.findByUserId(userId);

    return {
      total: solarReturns.length,
      relocated: solarReturns.filter(sr => sr.isRelocated).length,
      byYear: solarReturns.reduce((acc, sr) => {
        acc[sr.year] = (acc[sr.year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };
  }

  /**
   * Map database row to SolarReturn interface
   */
  private mapToSolarReturn(row: any): SolarReturn {
    return {
      id: row.id,
      userId: row.user_id,
      chartId: row.chart_id,
      year: row.year,
      returnDate: new Date(row.return_date),
      returnLocation: row.return_location as SolarReturnLocation,
      calculatedData: row.calculated_data as SolarReturnChartData,
      interpretation: row.interpretation,
      isRelocated: row.is_relocated,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export default new SolarReturnModel();
