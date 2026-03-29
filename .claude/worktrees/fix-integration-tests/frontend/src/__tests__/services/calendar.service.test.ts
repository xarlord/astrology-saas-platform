/**
 * Calendar Service Tests
 * Testing calendar API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import calendarService, {
  CalendarServiceError,
  getCalendarMonth,
  exportCalendar,
  setReminder,
} from '../../services/calendar.service';
import {
  mockCalendarEvent,
  createMockResponse,
  createMockError,
} from './utils';

// Mock the api module with hoisted mock
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Import after mock
import api from '../../services/api';

describe('calendarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMonthEvents', () => {
    it('should fetch calendar events for a specific month', async () => {
      const mockResponse = {
        data: {
          data: [mockCalendarEvent],
          meta: { year: 2024, month: 2, total: 1 },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await calendarService.getMonthEvents(2024, 2);

      expect(api.get).toHaveBeenCalledWith(
        '/calendar/month/2024/2',
        expect.objectContaining({
          params: { includeGlobal: 'true' },
          timeout: 30000,
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.year).toBe(2024);
    });

    it('should pass includeGlobal parameter correctly', async () => {
      const mockResponse = {
        data: {
          data: [],
          meta: { year: 2024, month: 1, total: 0 },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      await calendarService.getMonthEvents(2024, 1, false);

      expect(api.get).toHaveBeenCalledWith(
        '/calendar/month/2024/1',
        expect.objectContaining({
          params: { includeGlobal: 'false' },
        })
      );
    });

    it('should throw CalendarServiceError on failure', async () => {
      const mockError = createMockError('Failed to fetch', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(calendarService.getMonthEvents(2024, 2)).rejects.toThrow(CalendarServiceError);
    });

    it('should throw error with NO_DATA code when no data received', async () => {
      (api.get as any).mockResolvedValue({ data: null });

      await expect(calendarService.getMonthEvents(2024, 2)).rejects.toThrow('No data received');
    });

    it('should implement retry logic for failed requests', async () => {
      const mockError = createMockError('Network error', 500);
      const mockSuccessResponse = {
        data: {
          data: [],
          meta: { year: 2024, month: 2, total: 0 },
        },
      };

      (api.get as any)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await calendarService.getMonthEvents(2024, 2);

      expect(result.data).toEqual([]);
      expect(api.get).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx errors', async () => {
      const mockError = new CalendarServiceError('Bad request', 'BAD_REQUEST', 400);
      (api.get as any).mockRejectedValue(mockError);

      await expect(calendarService.getMonthEvents(2024, 2)).rejects.toThrow('Bad request');

      // Should only be called once (no retry)
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCustomEvent', () => {
    it('should create a custom calendar event', async () => {
      const newEvent = {
        event_type: 'custom',
        event_date: new Date('2024-02-15'),
        event_data: { note: 'Special day' },
        interpretation: 'Personal event',
      };
      const mockResponse = createMockResponse(mockCalendarEvent);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await calendarService.createCustomEvent(newEvent);

      expect(api.post).toHaveBeenCalledWith(
        '/calendar/events',
        newEvent,
        { timeout: 30000 }
      );
      expect(result.data).toEqual(mockCalendarEvent);
    });

    it('should throw CalendarServiceError on creation failure', async () => {
      const mockError = createMockError('Validation failed', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(calendarService.createCustomEvent({
        event_type: 'custom',
        event_date: new Date(),
      })).rejects.toThrow(CalendarServiceError);
    });

    it('should include end_date when provided', async () => {
      const mockResponse = createMockResponse(mockCalendarEvent);
      (api.post as any).mockResolvedValue(mockResponse);

      await calendarService.createCustomEvent({
        event_type: 'custom',
        event_date: new Date('2024-02-15'),
        end_date: new Date('2024-02-16'),
      });

      expect(api.post).toHaveBeenCalledWith(
        '/calendar/events',
        expect.objectContaining({
          end_date: expect.any(Date),
        }),
        expect.any(Object)
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete a calendar event', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await calendarService.deleteEvent('event-123');

      expect(api.delete).toHaveBeenCalledWith('/calendar/events/event-123', {
        timeout: 30000,
      });
    });

    it('should throw CalendarServiceError on delete failure', async () => {
      const mockError = createMockError('Delete failed', 500);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(calendarService.deleteEvent('event-123')).rejects.toThrow(CalendarServiceError);
    });

    it('should handle not found error', async () => {
      const mockError = createMockError('Event not found', 404);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(calendarService.deleteEvent('nonexistent')).rejects.toThrow('Failed to delete event');
    });
  });

  describe('exportCalendar', () => {
    it('should export calendar as blob', async () => {
      const mockBlob = new Blob(['calendar data'], { type: 'text/calendar' });
      (api.get as any).mockResolvedValue({ data: mockBlob });

      const result = await calendarService.exportCalendar(2024, 2);

      expect(api.get).toHaveBeenCalledWith('/calendar/export/2024/2', {
        responseType: 'blob',
        timeout: 60000,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it('should use longer timeout for export', async () => {
      const mockBlob = new Blob(['data']);
      (api.get as any).mockResolvedValue({ data: mockBlob });

      await calendarService.exportCalendar(2024, 2);

      expect(api.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 60000 })
      );
    });

    it('should throw CalendarServiceError on export failure', async () => {
      const mockError = createMockError('Export failed', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(calendarService.exportCalendar(2024, 2)).rejects.toThrow(CalendarServiceError);
    });

    it('should retry on export failure', async () => {
      const mockError = createMockError('Timeout', 500);
      const mockBlob = new Blob(['data']);

      (api.get as any)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ data: mockBlob });

      const result = await calendarService.exportCalendar(2024, 2);

      expect(result).toBeInstanceOf(Blob);
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('setReminder', () => {
    it('should set reminder for an event', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      const reminderDate = new Date('2024-02-15T09:00:00Z');
      await calendarService.setReminder('event-123', reminderDate);

      expect(api.post).toHaveBeenCalledWith(
        '/calendar/events/event-123/reminder',
        { reminderDate },
        { timeout: 30000 }
      );
    });

    it('should throw CalendarServiceError on reminder failure', async () => {
      const mockError = createMockError('Reminder failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(
        calendarService.setReminder('event-123', new Date())
      ).rejects.toThrow(CalendarServiceError);
    });
  });

  describe('updateEvent', () => {
    it('should update a calendar event', async () => {
      const updatedEvent = { ...mockCalendarEvent, title: 'Updated Title' };
      const mockResponse = createMockResponse(updatedEvent);
      (api.patch as any).mockResolvedValue(mockResponse);

      const result = await calendarService.updateEvent('event-123', {
        title: 'Updated Title',
      });

      expect(api.patch).toHaveBeenCalledWith(
        '/calendar/events/event-123',
        { title: 'Updated Title' },
        { timeout: 30000 }
      );
      expect(result.data.title).toBe('Updated Title');
    });

    it('should handle partial updates', async () => {
      const mockResponse = createMockResponse(mockCalendarEvent);
      (api.patch as any).mockResolvedValue(mockResponse);

      await calendarService.updateEvent('event-123', {
        priority: 'high',
      });

      expect(api.patch).toHaveBeenCalledWith(
        '/calendar/events/event-123',
        { priority: 'high' },
        { timeout: 30000 }
      );
    });

    it('should throw CalendarServiceError on update failure', async () => {
      const mockError = createMockError('Update failed', 500);
      (api.patch as any).mockRejectedValue(mockError);

      await expect(
        calendarService.updateEvent('event-123', {})
      ).rejects.toThrow(CalendarServiceError);
    });
  });

  describe('Named exports', () => {
    it('should export getCalendarMonth function', async () => {
      const mockResponse = {
        data: {
          data: [],
          meta: { year: 2024, month: 2, total: 0 },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await getCalendarMonth(2024, 2);

      expect(result).toBeDefined();
    });

    it('should export exportCalendar function', async () => {
      const mockBlob = new Blob(['data']);
      (api.get as any).mockResolvedValue({ data: mockBlob });

      const result = await exportCalendar(2024, 2);

      expect(result).toBeInstanceOf(Blob);
    });

    it('should export setReminder function', async () => {
      (api.post as any).mockResolvedValue({ data: {} });

      await setReminder('event-123', new Date());

      expect(api.post).toHaveBeenCalled();
    });
  });

  describe('CalendarServiceError', () => {
    it('should create error with message and code', () => {
      const error = new CalendarServiceError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('CalendarServiceError');
    });

    it('should create error with status code', () => {
      const error = new CalendarServiceError('Not found', 'NOT_FOUND', 404);

      expect(error.statusCode).toBe(404);
    });

    it('should be instance of Error', () => {
      const error = new CalendarServiceError('Test', 'CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CalendarServiceError);
    });
  });
});
