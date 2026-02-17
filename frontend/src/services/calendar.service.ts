/**
 * Calendar Service
 * API client for astrological calendar functionality
 */

import api from './api';

export interface CalendarEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_date: Date;
  end_date?: Date;
  event_data?: any;
  interpretation?: string;
}

export interface MonthEventsResponse {
  data: CalendarEvent[];
  meta: {
    year: number;
    month: number;
    total: number;
  };
}

class CalendarService {
  /**
   * Get calendar events for a specific month
   */
  async getMonthEvents(year: number, month: number, includeGlobal = true): Promise<MonthEventsResponse> {
    const response = await api.get(`/calendar/month/${year}/${month}`, {
      params: { includeGlobal: includeGlobal.toString() },
    });
    return response.data;
  }

  /**
   * Create a custom calendar event
   */
  async createCustomEvent(event: {
    event_type: string;
    event_date: Date;
    end_date?: Date;
    event_data?: any;
    interpretation?: string;
  }): Promise<{ data: CalendarEvent }> {
    const response = await api.post('/calendar/events', event);
    return response.data;
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/calendar/events/${id}`);
  }
}

export default new CalendarService();
