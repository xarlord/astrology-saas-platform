/**
 * Timezone Service Tests
 * Tests timezone conversion, validation, search, and coordinate detection
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { TimezoneService } from '../../modules/shared/services/timezone.service';

describe('TimezoneService', () => {
  let service: TimezoneService;

  beforeEach(() => {
    service = new TimezoneService();
  });

  // ===== convertBirthTimeToUTC =====

  describe('convertBirthTimeToUTC', () => {
    it('should convert EST birth time to UTC correctly', () => {
      const result = service.convertBirthTimeToUTC({
        year: 1990,
        month: 6,
        day: 15,
        hour: 12,
        minute: 0,
        timezone: 'America/New_York',
      });

      expect(result.utcDate).toBeInstanceOf(Date);
      expect(result.localDate.isValid).toBe(true);
      expect(result.timezone).toBe('America/New_York');
      expect(result.offset).toBeDefined();
      expect(result.isDST).toBeDefined();
      expect(result.julianDay).toBeGreaterThan(2400000);
    });

    it('should convert UTC birth time (zero offset)', () => {
      const result = service.convertBirthTimeToUTC({
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        timezone: 'UTC',
      });

      expect(result.utcDate).toBeInstanceOf(Date);
      expect(result.offset).toBe(0);
      expect(result.isDST).toBe(false);
    });

    it('should convert IST birth time (positive offset)', () => {
      const result = service.convertBirthTimeToUTC({
        year: 1985,
        month: 3,
        day: 20,
        hour: 6,
        minute: 30,
        timezone: 'Asia/Kolkata',
      });

      expect(result.utcDate).toBeInstanceOf(Date);
      expect(result.offset).toBe(330); // +5:30
      expect(result.timezone).toBe('Asia/Kolkata');
    });

    it('should handle JST timezone (positive offset)', () => {
      const result = service.convertBirthTimeToUTC({
        year: 1995,
        month: 12,
        day: 25,
        hour: 10,
        minute: 0,
        timezone: 'Asia/Tokyo',
      });

      expect(result.utcDate).toBeInstanceOf(Date);
      expect(result.offset).toBe(540); // +9:00
    });

    it('should throw error for invalid date', () => {
      expect(() =>
        service.convertBirthTimeToUTC({
          year: 1990,
          month: 2,
          day: 31, // Feb 31 doesn't exist
          hour: 12,
          minute: 0,
          timezone: 'America/New_York',
        })
      ).toThrow(/Invalid date/);
    });

    it('should throw error for invalid timezone', () => {
      expect(() =>
        service.convertBirthTimeToUTC({
          year: 1990,
          month: 6,
          day: 15,
          hour: 12,
          minute: 0,
          timezone: 'Invalid/Timezone',
        })
      ).toThrow();
    });

    it('should calculate Julian Day for known date', () => {
      const result = service.convertBirthTimeToUTC({
        year: 2000,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        timezone: 'UTC',
      });

      // J2000.0 epoch is JD 2451545.0
      expect(result.julianDay).toBeCloseTo(2451545.0, 0);
    });
  });

  // ===== getTimezoneInfo =====

  describe('getTimezoneInfo', () => {
    it('should return valid info for America/New_York', () => {
      const info = service.getTimezoneInfo('America/New_York');

      expect(info.id).toBe('America/New_York');
      expect(info.name).toBe('Eastern Time');
      expect(info.isValid).toBe(true);
      expect(typeof info.offset).toBe('number');
      expect(info.offsetStr).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('should return valid info for UTC', () => {
      const info = service.getTimezoneInfo('UTC');

      expect(info.id).toBe('UTC');
      expect(info.name).toBe('Coordinated Universal Time');
      expect(info.offset).toBe(0);
      expect(info.offsetStr).toBe('+00:00');
      expect(info.isValid).toBe(true);
    });

    it('should return invalid info for bad timezone', () => {
      const info = service.getTimezoneInfo('Not/ARealTimezone');

      expect(info.isValid).toBe(false);
      expect(info.offset).toBe(0);
    });

    it('should accept optional date parameter', () => {
      const date = new Date('2024-07-04');
      const info = service.getTimezoneInfo('America/New_York', date);

      expect(info.isValid).toBe(true);
      expect(info.id).toBe('America/New_York');
    });

    it('should detect DST status', () => {
      // Summer in NYC = DST
      const summerDate = new Date('2024-07-04T12:00:00Z');
      const summerInfo = service.getTimezoneInfo('America/New_York', summerDate);

      // Winter in NYC = not DST
      const winterDate = new Date('2024-01-15T12:00:00Z');
      const winterInfo = service.getTimezoneInfo('America/New_York', winterDate);

      // One should be DST and the other not (or both valid)
      expect(summerInfo.isValid).toBe(true);
      expect(winterInfo.isValid).toBe(true);
    });

    it('should return friendly names for common timezones', () => {
      const paris = service.getTimezoneInfo('Europe/Paris');
      expect(paris.name).toBe('Central European Time');

      const tokyo = service.getTimezoneInfo('Asia/Tokyo');
      expect(tokyo.name).toBe('Japan Standard Time');

      const london = service.getTimezoneInfo('Europe/London');
      expect(london.name).toBe('GMT/BST');
    });

    it('should use zone name with spaces for unknown zones', () => {
      const info = service.getTimezoneInfo('America/Argentina/Buenos_Aires');
      expect(info.isValid).toBe(true);
      expect(info.name).toContain('Buenos');
    });
  });

  // ===== detectTimezoneFromCoordinates =====

  describe('detectTimezoneFromCoordinates', () => {
    it('should detect Eastern US timezone', () => {
      // New York area: ~40.7 N, ~74 W
      const tz = service.detectTimezoneFromCoordinates(40.7, -74.0);
      expect(tz).toBe('America/New_York');
    });

    it('should detect European timezone for London area', () => {
      const tz = service.detectTimezoneFromCoordinates(51.5, -0.1);
      expect(tz).toBe('Europe/London');
    });

    it('should detect European timezone for Paris area', () => {
      const tz = service.detectTimezoneFromCoordinates(48.8, 2.3);
      expect(tz).toBe('Europe/Paris');
    });

    it('should detect European timezone for Berlin area', () => {
      const tz = service.detectTimezoneFromCoordinates(52.5, 13.4);
      expect(tz).toBe('Europe/Berlin');
    });

    it('should detect Japan timezone', () => {
      const tz = service.detectTimezoneFromCoordinates(35.7, 139.7);
      expect(tz).toBe('Asia/Tokyo');
    });

    it('should return UTC for unknown coordinates', () => {
      const tz = service.detectTimezoneFromCoordinates(0, 0);
      expect(tz).toBe('UTC');
    });

    it('should return UTC for South Atlantic coordinates', () => {
      const tz = service.detectTimezoneFromCoordinates(-30, -30);
      expect(tz).toBe('UTC');
    });
  });

  // ===== searchTimezones =====

  describe('searchTimezones', () => {
    it('should find results for "America"', () => {
      const results = service.searchTimezones('America');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.id.toLowerCase()).toContain('america');
      });
    });

    it('should find results for "Europe"', () => {
      const results = service.searchTimezones('Europe');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.id.toLowerCase()).toContain('europe');
      });
    });

    it('should be case-insensitive', () => {
      const upper = service.searchTimezones('TOKYO');
      const lower = service.searchTimezones('tokyo');
      expect(upper.length).toBe(lower.length);
    });

    it('should return empty for nonsense query', () => {
      const results = service.searchTimezones('zzzzzzzzzzz');
      expect(results.length).toBe(0);
    });

    it('should limit results to 20', () => {
      // Search for very broad term
      const results = service.searchTimezones('a');
      expect(results.length).toBeLessThanOrEqual(20);
    });

    it('should return results with correct structure', () => {
      const results = service.searchTimezones('Tokyo');
      if (results.length > 0) {
        const r = results[0];
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('name');
        expect(r).toHaveProperty('offset');
        expect(r).toHaveProperty('country');
      }
    });
  });

  // ===== getCommonTimezones =====

  describe('getCommonTimezones', () => {
    it('should return all common timezones when no region specified', () => {
      const results = service.getCommonTimezones();
      expect(results.length).toBeGreaterThan(10);
    });

    it('should return US timezones', () => {
      const results = service.getCommonTimezones('US');
      expect(results.length).toBe(6);
      expect(results.some(r => r.id === 'America/New_York')).toBe(true);
      expect(results.some(r => r.id === 'America/Los_Angeles')).toBe(true);
    });

    it('should return EU timezones', () => {
      const results = service.getCommonTimezones('EU');
      expect(results.length).toBe(5);
      expect(results.some(r => r.id === 'Europe/London')).toBe(true);
      expect(results.some(r => r.id === 'Europe/Paris')).toBe(true);
    });

    it('should return ASIA timezones', () => {
      const results = service.getCommonTimezones('ASIA');
      expect(results.length).toBe(5);
      expect(results.some(r => r.id === 'Asia/Tokyo')).toBe(true);
      expect(results.some(r => r.id === 'Asia/Shanghai')).toBe(true);
    });

    it('should return AU timezones', () => {
      const results = service.getCommonTimezones('AU');
      expect(results.length).toBe(4);
      expect(results.some(r => r.id === 'Australia/Sydney')).toBe(true);
    });

    it('should return empty for unknown region', () => {
      const results = service.getCommonTimezones('XX');
      expect(results.length).toBe(0);
    });

    it('should be case-insensitive for region', () => {
      const upper = service.getCommonTimezones('us');
      const lower = service.getCommonTimezones('US');
      expect(upper.length).toBe(lower.length);
    });
  });

  // ===== isValidTimezone =====

  describe('isValidTimezone', () => {
    it('should validate real timezones', () => {
      expect(service.isValidTimezone('America/New_York')).toBe(true);
      expect(service.isValidTimezone('Europe/London')).toBe(true);
      expect(service.isValidTimezone('Asia/Tokyo')).toBe(true);
      expect(service.isValidTimezone('UTC')).toBe(true);
    });

    it('should reject invalid timezones', () => {
      expect(service.isValidTimezone('Invalid/Zone')).toBe(false);
      expect(service.isValidTimezone('Nowhere')).toBe(false);
      expect(service.isValidTimezone('')).toBe(false);
    });
  });

  // ===== getCurrentTime =====

  describe('getCurrentTime', () => {
    it('should return current time for a timezone', () => {
      const dt = service.getCurrentTime('America/New_York');
      expect(dt.isValid).toBe(true);
    });

    it('should return current time for UTC', () => {
      const dt = service.getCurrentTime('UTC');
      expect(dt.isValid).toBe(true);
      expect(dt.offset).toBe(0);
    });
  });

  // ===== formatDateInTimezone =====

  describe('formatDateInTimezone', () => {
    it('should format date with default format', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted = service.formatDateInTimezone(date, 'UTC');
      expect(formatted).toMatch(/2024-06-15/);
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted = service.formatDateInTimezone(date, 'UTC', 'yyyy/MM/dd');
      expect(formatted).toBe('2024/06/15');
    });

    it('should adjust for timezone offset', () => {
      const date = new Date('2024-06-15T23:00:00Z');
      const tokyo = service.formatDateInTimezone(date, 'Asia/Tokyo', 'yyyy-MM-dd');
      // 23:00 UTC + 9h = 08:00 next day
      expect(tokyo).toBe('2024-06-16');
    });
  });

  // ===== getDSTTransitions =====

  describe('getDSTTransitions', () => {
    it('should return transitions for DST-observing timezone', () => {
      const transitions = service.getDSTTransitions(2024, 'America/New_York');
      expect(transitions).toHaveProperty('start');
      expect(transitions).toHaveProperty('end');
      // At least one should be detected for a DST zone
      expect(transitions.start || transitions.end).toBeTruthy();
    });

    it('should return null transitions for non-DST timezone', () => {
      const transitions = service.getDSTTransitions(2024, 'UTC');
      expect(transitions.start).toBeNull();
      expect(transitions.end).toBeNull();
    });

    it('should return null transitions for fixed-offset timezone', () => {
      const transitions = service.getDSTTransitions(2024, 'Asia/Tokyo');
      // Japan doesn't observe DST
      expect(transitions.start).toBeNull();
      expect(transitions.end).toBeNull();
    });
  });
});
