/**
 * Calendar Controller Unit Tests
 * Tests calendar controller logic without database dependencies
 */

import { Request, Response, NextFunction } from 'express';
import * as CalendarController from '../../controllers/calendar.controller';
import { AppError } from '../../utils/appError';

// Mock response object
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock next function
const mockNext = jest.fn() as NextFunction;

describe('Calendar Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCalendarMonth', () => {
    test('should return 400 if month is missing', async () => {
      const req = {
        query: { year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0]).toHaveProperty('statusCode', 400);
    });

    test('should return 400 if year is missing', async () => {
      const req = {
        query: { month: 2 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0]).toHaveProperty('statusCode', 400);
    });

    test('should return 400 if month is invalid (> 12)', async () => {
      const req = {
        query: { month: 13, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 if month is invalid (< 1)', async () => {
      const req = {
        query: { month: 0, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return calendar data for valid month and year', async () => {
      const req = {
        query: { month: 2, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          month: 2,
          year: 2026,
          events: expect.any(Array),
          dailyWeather: expect.any(Object),
        })
      );
    });

    test('should include events in response', async () => {
      const req = {
        query: { month: 2, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(responseData.events)).toBe(true);
      expect(responseData.events.length).toBeGreaterThan(0);
    });

    test('should include daily weather for each day', async () => {
      const req = {
        query: { month: 2, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(typeof responseData.dailyWeather).toBe('object');

      // February has 28 days
      const daysCount = Object.keys(responseData.dailyWeather).length;
      expect(daysCount).toBe(28);
    });

    test('should handle leap year (February)', async () => {
      const req = {
        query: { month: 2, year: 2024 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      const daysCount = Object.keys(responseData.dailyWeather).length;
      expect(daysCount).toBe(29); // Leap year
    });

    test('should work without user authentication (returns global events)', async () => {
      const req = {
        query: { month: 2, year: 2026 },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarMonth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getCalendarDay', () => {
    test('should return 400 if date is missing', async () => {
      const req = {
        params: {},
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarDay(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 for invalid date format', async () => {
      const req = {
        params: { date: 'invalid-date' },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarDay(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return daily weather for valid date', async () => {
      const req = {
        params: { date: '2026-02-15' },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarDay(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-02-15',
          summary: expect.any(String),
          rating: expect.any(Number),
          color: expect.any(String),
          moonPhase: expect.any(Object),
        })
      );
    });

    test('should include moon phase information', async () => {
      const req = {
        params: { date: '2026-02-15' },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.getCalendarDay(req, res, mockNext);

      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.moonPhase).toHaveProperty('phase');
      expect(responseData.moonPhase).toHaveProperty('illumination');
      expect(responseData.moonPhase).toHaveProperty('sign');
      expect(responseData.moonPhase).toHaveProperty('degree');

      expect(responseData.moonPhase.illumination).toBeGreaterThanOrEqual(0);
      expect(responseData.moonPhase.illumination).toBeLessThanOrEqual(100);
    });
  });

  describe('setReminder', () => {
    test('should return 401 if user is not authenticated', async () => {
      const req = {
        body: {
          eventType: 'all',
          reminderType: 'email',
          reminderAdvanceHours: [24],
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect((mockNext as jest.Mock).mock.calls[0][0]).toHaveProperty('statusCode', 401);
    });

    test('should return 400 for invalid event type', async () => {
      const req = {
        user: { id: 'test-user-id' },
        body: {
          eventType: 'invalid-type',
          reminderType: 'email',
          reminderAdvanceHours: [24],
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 for invalid reminder type', async () => {
      const req = {
        user: { id: 'test-user-id' },
        body: {
          eventType: 'all',
          reminderType: 'invalid-type',
          reminderAdvanceHours: [24],
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 if reminderAdvanceHours is not an array', async () => {
      const req = {
        user: { id: 'test-user-id' },
        body: {
          eventType: 'all',
          reminderType: 'email',
          reminderAdvanceHours: 24,
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 if reminderAdvanceHours is empty', async () => {
      const req = {
        user: { id: 'test-user-id' },
        body: {
          eventType: 'all',
          reminderType: 'email',
          reminderAdvanceHours: [],
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should create reminder with valid data', async () => {
      const req = {
        user: { id: 'test-user-id' },
        body: {
          eventType: 'all',
          reminderType: 'email',
          reminderAdvanceHours: [24, 72, 168],
          isActive: true,
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.setReminder(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          reminder: expect.objectContaining({
            id: expect.any(String),
            userId: 'test-user-id',
            eventType: 'all',
            reminderType: 'email',
            reminderAdvanceHours: [24, 72, 168],
            isActive: true,
          }),
        })
      );
    });

    test('should accept valid event types', async () => {
      const validEventTypes = ['all', 'major-transits', 'retrogrades', 'eclipses'];

      for (const eventType of validEventTypes) {
        const req = {
          user: { id: 'test-user-id' },
          body: {
            eventType,
            reminderType: 'email',
            reminderAdvanceHours: [24],
          },
        } as Partial<Request> as Request;

        const res = mockResponse();

        await CalendarController.setReminder(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should accept both email and push reminder types', async () => {
      const reminderTypes = ['email', 'push'];

      for (const reminderType of reminderTypes) {
        const req = {
          user: { id: 'test-user-id' },
          body: {
            eventType: 'all',
            reminderType,
            reminderAdvanceHours: [24],
          },
        } as Partial<Request> as Request;

        const res = mockResponse();

        await CalendarController.setReminder(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(201);
      }
    });
  });

  describe('exportCalendar', () => {
    test('should return 400 if startDate is missing', async () => {
      const req = {
        query: { endDate: '2026-02-28' },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 if endDate is missing', async () => {
      const req = {
        query: { startDate: '2026-02-01' },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 for invalid startDate format', async () => {
      const req = {
        query: {
          startDate: 'invalid-date',
          endDate: '2026-02-28',
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should return 400 for invalid endDate format', async () => {
      const req = {
        query: {
          startDate: '2026-02-01',
          endDate: 'invalid-date',
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    test('should export iCal format for valid dates', async () => {
      const req = {
        query: {
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/calendar');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment')
      );
      expect(res.send).toHaveBeenCalled();

      const iCalContent = (res.send as jest.Mock).mock.calls[0][0];
      expect(iCalContent).toContain('BEGIN:VCALENDAR');
      expect(iCalContent).toContain('END:VCALENDAR');
    });

    test('should include proper iCal headers', async () => {
      const req = {
        query: {
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        },
      } as Partial<Request> as Request;

      const res = mockResponse();

      await CalendarController.exportCalendar(req, res, mockNext);

      const iCalContent = (res.send as jest.Mock).mock.calls[0][0];
      expect(iCalContent).toContain('VERSION:2.0');
      expect(iCalContent).toContain('PRODID:');
      expect(iCalContent).toContain('CALSCALE:GREGORIAN');
    });
  });
});
