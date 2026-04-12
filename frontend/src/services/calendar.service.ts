/**
 * Calendar Service
 * API client for astrological calendar functionality
 * Includes comprehensive error handling and timeout management
 */

import api from './api';
import type { CalendarEvent } from './api.types';

// Re-export canonical type
export type { CalendarEvent } from './api.types';

export interface MonthEventsResponse {
  data: CalendarEvent[];
  meta: {
    year: number;
    month: number;
    total: number;
  };
}

// Error class for calendar-specific errors
export class CalendarServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'CalendarServiceError';
  }
}

class CalendarService {
  private readonly TIMEOUT = 30000; // 30 seconds
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async withRetry<T>(fn: () => Promise<T>, attempts = this.RETRY_ATTEMPTS): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;

        // Retry on network errors or 5xx errors
        if (error instanceof CalendarServiceError) {
          if (error.statusCode && error.statusCode < 500) {
            throw error;
          }
        }

        await this.delay(this.RETRY_DELAY * (i + 1));
      }
    }
    throw new CalendarServiceError('Max retry attempts reached', 'MAX_RETRIES');
  }

  /**
   * Get calendar events for a specific month
   * @throws CalendarServiceError if request fails
   */
  async getMonthEvents(
    year: number,
    month: number,
    includeGlobal = true,
  ): Promise<MonthEventsResponse> {
    return this.withRetry(async () => {
      try {
        const response = await api.get<MonthEventsResponse>(`/calendar/month/${year}/${month}`, {
          params: { includeGlobal: includeGlobal.toString() },
          timeout: this.TIMEOUT,
        });

        if (!response.data) {
          throw new CalendarServiceError('No data received from calendar API', 'NO_DATA');
        }

        return response.data;
      } catch (error) {
        if (error instanceof CalendarServiceError) throw error;

        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new CalendarServiceError(
          `Failed to get calendar events: ${message}`,
          'GET_EVENTS_FAILED',
        );
      }
    });
  }

  /**
   * Create a custom calendar event
   * @throws CalendarServiceError if creation fails
   */
  async createCustomEvent(event: {
    event_type: string;
    event_date: Date;
    end_date?: Date;
    event_data?: Record<string, unknown>;
    interpretation?: string;
  }): Promise<{ data: CalendarEvent }> {
    try {
      const response = await api.post<{ data: CalendarEvent }>('/calendar/events', event, {
        timeout: this.TIMEOUT,
      });

      if (!response.data) {
        throw new CalendarServiceError('No data received after creating event', 'NO_DATA');
      }

      return response.data;
    } catch (error) {
      if (error instanceof CalendarServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CalendarServiceError(
        `Failed to create custom event: ${message}`,
        'CREATE_EVENT_FAILED',
      );
    }
  }

  /**
   * Delete a calendar event
   * @throws CalendarServiceError if deletion fails
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/calendar/events/${id}`, {
        timeout: this.TIMEOUT,
      });
    } catch (error) {
      if (error instanceof CalendarServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CalendarServiceError(`Failed to delete event: ${message}`, 'DELETE_EVENT_FAILED');
    }
  }

  /**
   * Export calendar data
   * @throws CalendarServiceError if export fails
   */
  async exportCalendar(year: number, month: number): Promise<Blob> {
    return this.withRetry(async () => {
      try {
        const response = await api.get<Blob>(`/calendar/export/${year}/${month}`, {
          responseType: 'blob',
          timeout: 60000, // 60 seconds for export
        });

        if (!response.data) {
          throw new CalendarServiceError('No data received from export API', 'NO_DATA');
        }

        return response.data;
      } catch (error) {
        if (error instanceof CalendarServiceError) throw error;

        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new CalendarServiceError(`Failed to export calendar: ${message}`, 'EXPORT_FAILED');
      }
    });
  }

  /**
   * Set reminder for an event
   * @throws CalendarServiceError if reminder setting fails
   */
  async setReminder(eventId: string, reminderDate: Date): Promise<void> {
    try {
      await api.post(
        `/calendar/events/${eventId}/reminder`,
        { reminderDate },
        { timeout: this.TIMEOUT },
      );
    } catch (error) {
      if (error instanceof CalendarServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CalendarServiceError(`Failed to set reminder: ${message}`, 'SET_REMINDER_FAILED');
    }
  }

  /**
   * Update a calendar event
   * @throws CalendarServiceError if update fails
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<{ data: CalendarEvent }> {
    try {
      const response = await api.patch<{ data: CalendarEvent }>(`/calendar/events/${id}`, updates, {
        timeout: this.TIMEOUT,
      });

      if (!response.data) {
        throw new CalendarServiceError('No data received after updating event', 'NO_DATA');
      }

      return response.data;
    } catch (error) {
      if (error instanceof CalendarServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new CalendarServiceError(`Failed to update event: ${message}`, 'UPDATE_EVENT_FAILED');
    }
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
