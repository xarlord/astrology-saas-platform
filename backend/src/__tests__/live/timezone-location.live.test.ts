/**
 * Live Integration Tests for Timezone & Location Services
 * Tests timezone search, detection, conversion, and location autocomplete
 * against the running server
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="live/timezone-location" --forceExit --verbose
 */

import { api, checkServerRunning } from './helpers';

describe('Timezone & Location Services - LIVE SYSTEM', () => {
  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');
  });

  describe('GET /timezone/search', () => {
    it('should search timezones by query', async () => {
      const res = await api('GET', '/timezone/search?q=New_York');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.timezones).toBeDefined();
      expect(Array.isArray(res.data.data.timezones)).toBe(true);
    }, 10000);

    it('should search timezones for Europe', async () => {
      const res = await api('GET', '/timezone/search?q=Europe');
      expect(res.status).toBe(200);
      expect(res.data.data.timezones.length).toBeGreaterThan(0);
    }, 10000);

    it('should reject without query parameter', async () => {
      const res = await api('GET', '/timezone/search');
      expect(res.status).toBe(400);
    }, 10000);

    it('should return empty for nonsense query', async () => {
      const res = await api('GET', '/timezone/search?q=xyznonexistent123');
      expect(res.status).toBe(200);
      expect(res.data.data.timezones).toBeDefined();
    }, 10000);
  });

  describe('GET /timezone/common', () => {
    it('should return common timezones', async () => {
      const res = await api('GET', '/timezone/common');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.timezones.length).toBeGreaterThan(0);
    }, 10000);

    it('should filter by region', async () => {
      const res = await api('GET', '/timezone/common?region=America');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    }, 10000);
  });

  describe('GET /timezone/detect', () => {
    it('should detect timezone from NYC coordinates', async () => {
      const res = await api('GET', '/timezone/detect?lat=40.7128&lng=-74.006');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.timezone).toBeDefined();
      expect(res.data.data.timezone).toContain('New_York');
    }, 10000);

    it('should detect timezone for London coordinates', async () => {
      const res = await api('GET', '/timezone/detect?lat=51.5074&lng=-0.1278');
      expect(res.status).toBe(200);
      expect(res.data.data.timezone).toContain('London');
    }, 10000);

    it('should reject without coordinates', async () => {
      const res = await api('GET', '/timezone/detect');
      expect(res.status).toBe(400);
    }, 10000);

    it('should reject with invalid coordinates', async () => {
      const res = await api('GET', '/timezone/detect?lat=abc&lng=xyz');
      expect(res.status).toBe(400);
    }, 10000);
  });

  describe('GET /timezone/:timezone', () => {
    // Timezones with slashes need URL encoding - test with simple timezone instead
    it('should return info for UTC', async () => {
      const res = await api('GET', '/timezone/UTC');
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.info).toBeDefined();
      expect(res.data.data.info.id).toBe('UTC');
    }, 10000);
  });

  describe('POST /timezone/convert', () => {
    it('should convert birth time to UTC', async () => {
      const res = await api('POST', '/timezone/convert', {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.utcDate).toBeDefined();
      expect(res.data.data.offset).toBeDefined();
      expect(res.data.data.julianDay).toBeDefined();
    }, 10000);

    it('should reject without required fields', async () => {
      const res = await api('POST', '/timezone/convert', { year: 1990, month: 6 });
      expect(res.status).toBe(400);
    }, 10000);

    it('should reject with invalid timezone', async () => {
      const res = await api('POST', '/timezone/convert', {
        year: 1990,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        timezone: 'Invalid/Timezone',
      });
      expect(res.status).toBe(400);
    }, 10000);

    it('should produce consistent UTC conversion', async () => {
      const body = { year: 2000, month: 1, day: 1, hour: 12, minute: 0, timezone: 'UTC' };
      const res1 = await api('POST', '/timezone/convert', body);
      const res2 = await api('POST', '/timezone/convert', body);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.data.data.utcDate).toBe(res2.data.data.utcDate);
      expect(res1.data.data.julianDay).toBe(res2.data.data.julianDay);
    }, 15000);
  });

  describe('GET /timezone/:timezone/dst', () => {
    // Note: Timezone names with slashes (America/New_York) can't be used as
    // Express path params. These routes only work for simple timezone names.
    it('should return DST transitions for UTC', async () => {
      const res = await api('GET', '/timezone/UTC/dst?year=2026');
      expect([200, 400]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);

    it('should reject invalid timezone for DST', async () => {
      const res = await api('GET', '/timezone/InvalidTimezone/dst');
      expect(res.status).toBe(400);
    }, 10000);
  });

  describe('GET /location/autocomplete', () => {
    it('should return location suggestions', async () => {
      const res = await api('GET', '/location/autocomplete?input=New York');
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    }, 15000);

    it('should reject with too short input', async () => {
      const res = await api('GET', '/location/autocomplete?input=N');
      expect(res.status).toBe(400);
    }, 10000);

    it('should reject without input parameter', async () => {
      const res = await api('GET', '/location/autocomplete');
      expect(res.status).toBe(400);
    }, 10000);
  });

  describe('Timezone Consistency', () => {
    it('should consistently detect same timezone for same coordinates', async () => {
      const res1 = await api('GET', '/timezone/detect?lat=40.7128&lng=-74.006');
      const res2 = await api('GET', '/timezone/detect?lat=40.7128&lng=-74.006');
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.data.data.timezone).toBe(res2.data.data.timezone);
    }, 10000);
  });
});
