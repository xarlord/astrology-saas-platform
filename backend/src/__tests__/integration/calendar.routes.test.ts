/**
 * Calendar Routes Integration Tests
 * Tests all calendar API endpoints
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { build } from 'express';
import request from 'supertest';
import { generateMockToken } from '../auth.utils';
import '../../server'; // Import server to initialize

describe('Calendar Routes Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    // Initialize Express app for testing
    app = build();
  });

describe('Calendar Routes Integration Tests', () => {
  let authToken: string;

  beforeAll(() => {
    authToken = generateMockToken({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  describe('GET /api/calendar/month', () => {
    test('should return calendar events for a valid month and year', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 2, year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('month', 2);
      expect(response.body).toHaveProperty('year', 2026);
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('dailyWeather');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(typeof response.body.dailyWeather).toBe('object');
    });

    test('should return 400 if month is missing', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 if year is missing', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 2 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 if month is invalid', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 13, year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 400 if month is less than 1', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 0, year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should include global events (retrogrades, moon phases, eclipses)', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 2, year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const { events } = response.body;

      // Should have moon phases
      const hasMoonPhases = events.some((e: any) => e.eventType === 'moon-phase');
      expect(hasMoonPhases).toBe(true);

      // Each event should have required properties
      events.forEach((event: any) => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('eventType');
        expect(event).toHaveProperty('eventName');
        expect(event).toHaveProperty('startDate');
        expect(event).toHaveProperty('intensity');
        expect(event).toHaveProperty('isGlobal');
      });
    });

    test('should generate daily weather for each day of the month', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 2, year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const { dailyWeather } = response.body;

      // February 2026 has 28 days
      const daysCount = Object.keys(dailyWeather).length;
      expect(daysCount).toBe(28);

      // Each daily weather should have required properties
      Object.values(dailyWeather).forEach((weather: any) => {
        expect(weather).toHaveProperty('date');
        expect(weather).toHaveProperty('summary');
        expect(weather).toHaveProperty('rating');
        expect(weather).toHaveProperty('color');
        expect(weather).toHaveProperty('moonPhase');
        expect(weather).toHaveProperty('globalEvents');
        expect(weather).toHaveProperty('personalTransits');
        expect(weather).toHaveProperty('luckyActivities');
        expect(weather).toHaveProperty('challengingActivities');
      });
    });

    test('should work without authentication (returns global events only)', async () => {
      const response = await request(app).get('/api/calendar/month').query({
        month: 2,
        year: 2026,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('dailyWeather');
    });

    test('should handle leap year correctly (February 2024)', async () => {
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 2, year: 2024 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const { dailyWeather } = response.body;

      // February 2024 has 29 days (leap year)
      const daysCount = Object.keys(dailyWeather).length;
      expect(daysCount).toBe(29);
    });
  });

  describe('GET /api/calendar/day/:date', () => {
    test('should return daily weather for a valid date', async () => {
      const response = await request(app)
        .get('/api/calendar/day/2026-02-15')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date', '2026-02-15');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('rating');
      expect(response.body).toHaveProperty('color');
      expect(response.body).toHaveProperty('moonPhase');
    });

    test('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/calendar/day/invalid-date')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should include moon phase information', async () => {
      const response = await request(app)
        .get('/api/calendar/day/2026-02-15')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const { moonPhase } = response.body;

      expect(moonPhase).toHaveProperty('phase');
      expect(moonPhase).toHaveProperty('illumination');
      expect(moonPhase).toHaveProperty('sign');
      expect(moonPhase).toHaveProperty('degree');

      expect(moonPhase.phase).toMatch(
        /^(new|waxing-crescent|first-quarter|waxing-gibbous|full|waning-gibbous|last-quarter|waning-crescent)$/
      );
      expect(moonPhase.illumination).toBeGreaterThanOrEqual(0);
      expect(moonPhase.illumination).toBeLessThanOrEqual(100);
    });

    test('should work without authentication', async () => {
      const response = await request(app).get('/api/calendar/day/2026-02-15');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
    });
  });

  describe('POST /api/calendar/reminders', () => {
    test('should create a new reminder with valid data', async () => {
      const reminderData = {
        eventType: 'all',
        reminderType: 'email',
        reminderAdvanceHours: [24, 72, 168],
        isActive: true,
      };

      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('reminder');
      expect(response.body.reminder).toHaveProperty('id');
      expect(response.body.reminder).toHaveProperty('eventType', 'all');
      expect(response.body.reminder).toHaveProperty('reminderType', 'email');
      expect(response.body.reminder).toHaveProperty('reminderAdvanceHours');
      expect(response.body.reminder).toHaveProperty('isActive', true);
    });

    test('should return 401 if user is not authenticated', async () => {
      const reminderData = {
        eventType: 'all',
        reminderType: 'email',
        reminderAdvanceHours: [24],
      };

      const response = await request(app).post('/api/calendar/reminders').send(reminderData);

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid event type', async () => {
      const reminderData = {
        eventType: 'invalid-type',
        reminderType: 'email',
        reminderAdvanceHours: [24],
      };

      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid reminder type', async () => {
      const reminderData = {
        eventType: 'all',
        reminderType: 'invalid-type',
        reminderAdvanceHours: [24],
      };

      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(400);
    });

    test('should return 400 if reminderAdvanceHours is not an array', async () => {
      const reminderData = {
        eventType: 'all',
        reminderType: 'email',
        reminderAdvanceHours: 24,
      };

      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(400);
    });

    test('should return 400 if reminderAdvanceHours is empty', async () => {
      const reminderData = {
        eventType: 'all',
        reminderType: 'email',
        reminderAdvanceHours: [],
      };

      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reminderData);

      expect(response.status).toBe(400);
    });

    test('should accept valid event types', async () => {
      const validEventTypes = ['all', 'major-transits', 'retrogrades', 'eclipses'];

      for (const eventType of validEventTypes) {
        const reminderData = {
          eventType,
          reminderType: 'email',
          reminderAdvanceHours: [24],
        };

        const response = await request(app)
          .post('/api/calendar/reminders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reminderData);

        expect(response.status).toBe(201);
        expect(response.body.reminder.eventType).toBe(eventType);
      }
    });

    test('should accept both email and push reminder types', async () => {
      const reminderTypes = ['email', 'push'];

      for (const reminderType of reminderTypes) {
        const reminderData = {
          eventType: 'all',
          reminderType,
          reminderAdvanceHours: [24],
        };

        const response = await request(app)
          .post('/api/calendar/reminders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reminderData);

        expect(response.status).toBe(201);
        expect(response.body.reminder.reminderType).toBe(reminderType);
      }
    });
  });

  describe('GET /api/calendar/export', () => {
    test('should export calendar as iCal format', async () => {
      const response = await request(app)
        .get('/api/calendar/export')
        .query({
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/calendar');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('BEGIN:VCALENDAR');
      expect(response.text).toContain('END:VCALENDAR');
    });

    test('should return 400 if startDate is missing', async () => {
      const response = await request(app)
        .get('/api/calendar/export')
        .query({
          endDate: '2026-02-28',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should return 400 if endDate is missing', async () => {
      const response = await request(app)
        .get('/api/calendar/export')
        .query({
          startDate: '2026-02-01',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/calendar/export')
        .query({
          startDate: 'invalid-date',
          endDate: '2026-02-28',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should work without authentication', async () => {
      const response = await request(app).get('/api/calendar/export').query({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(response.status).toBe(200);
    });

    test('should include proper iCal headers', async () => {
      const response = await request(app)
        .get('/api/calendar/export')
        .query({
          startDate: '2026-02-01',
          endDate: '2026-02-28',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.text).toContain('VERSION:2.0');
      expect(response.text).toContain('PRODID:');
      expect(response.text).toContain('CALSCALE:GREGORIAN');
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // This test verifies the error handling middleware works
      const response = await request(app)
        .get('/api/calendar/month')
        .query({ month: 'invalid', year: 2026 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should return consistent error format', async () => {
      const response = await request(app)
        .post('/api/calendar/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventType: 'invalid',
          reminderType: 'email',
          reminderAdvanceHours: [24],
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Data Validation', () => {
    test('should validate month range (1-12)', async () => {
      const invalidMonths = [0, 13, -1, 100];

      for (const month of invalidMonths) {
        const response = await request(app)
          .get('/api/calendar/month')
          .query({ month, year: 2026 })
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
      }
    });

    test('should accept all valid months', async () => {
      const validMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      for (const month of validMonths) {
        const response = await request(app)
          .get('/api/calendar/month')
          .query({ month, year: 2026 })
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.month).toBe(month);
      }
    });

    test('should handle various date formats for day endpoint', async () => {
      const validDates = ['2026-02-15', '2026-12-01', '2024-02-29'];

      for (const date of validDates) {
        const response = await request(app)
          .get(`/api/calendar/day/${date}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('date');
      }
    });
  });
});
});
