/**
 * Calendar Event Model
 * Handles CRUD operations for calendar events (astrological events)
 */

import knex from '../../../config/database';

export interface CalendarEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_date: Date;
  end_date?: Date;
  event_data?: any;
  interpretation?: string;
  created_at: Date;
  updated_at: Date;
}

class CalendarEventModel {
  /**
   * Create a new calendar event
   */
  async create(userId: string, event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const [newEvent] = await knex('calendar_events')
      .insert({
        user_id: userId,
        ...event,
      })
      .returning('*');

    return newEvent;
  }

  /**
   * Get calendar events for a user within a date range
   */
  async findByUserId(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return knex('calendar_events')
      .where('user_id', userId)
      .whereBetween('event_date', [startDate, endDate])
      .orderBy('event_date', 'asc');
  }

  /**
   * Get calendar events for a specific month
   */
  async findByMonth(userId: string, year: number, month: number): Promise<CalendarEvent[]> {
    return knex('calendar_events')
      .where('user_id', userId)
      .whereRaw('EXTRACT(YEAR FROM event_date) = ?', [year])
      .whereRaw('EXTRACT(MONTH FROM event_date) = ?', [month])
      .orderBy('event_date', 'asc');
  }

  /**
   * Get calendar event by ID
   */
  async findById(id: string): Promise<CalendarEvent | null> {
    const event = await knex('calendar_events')
      .where('id', id)
      .first();

    return event || null;
  }

  /**
   * Delete a calendar event
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await knex('calendar_events')
      .where({ id, user_id: userId })
      .del();

    return deleted > 0;
  }

  /**
   * Delete all events for a user (for cleanup)
   */
  async deleteAllForUser(userId: string): Promise<number> {
    return knex('calendar_events')
      .where('user_id', userId)
      .del();
  }
}

export default new CalendarEventModel();
