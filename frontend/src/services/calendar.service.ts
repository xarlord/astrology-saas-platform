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

  /**
   * Export calendar data
   */
  async exportCalendar(year: number, month: number): Promise<Blob> {
    const response = await api.get(`/calendar/export/${year}/${month}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Set reminder for an event
   */
  async setReminder(eventId: string, reminderDate: Date): Promise<void> {
    await api.post(`/calendar/events/${eventId}/reminder`, { reminderDate });
  }
}

// Export singleton instance
const calendarService = new CalendarService();

// Export named functions for convenience
export const getCalendarMonth = (year: number, month: number, includeGlobal = true) =>
  calendarService.getMonthEvents(year, month, includeGlobal);

export const exportCalendar = (year: number, month: number) =>
  calendarService.exportCalendar(year, month);

export const setReminder = (eventId: string, reminderDate: Date) =>
  calendarService.setReminder(eventId, reminderDate);

export default calendarService;
