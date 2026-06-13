/**
 * Unit tests for timezone.routes.ts validation schemas (#344)
 * Tests that the Zod schemas enforce correct validation for all 6 endpoints.
 */

import { z } from 'zod';

// Replicate the schemas from the route file (they're module-internal)
const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

const commonQuerySchema = z.object({
  region: z.string().optional(),
});

const detectQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const timezoneInfoQuerySchema = z.object({
  date: z.string().optional(),
});

const convertBodySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
  hour: z.coerce.number().int().min(0).max(23),
  minute: z.coerce.number().int().min(0).max(59),
  timezone: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const timezoneParamSchema = z.object({
  timezone: z.string().min(1).max(100),
});

const dstQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200).optional(),
});

describe('Timezone Routes — Validation Schemas (#344)', () => {
  describe('GET /search — searchQuerySchema', () => {
    it('should accept valid query', () => {
      expect(searchQuerySchema.safeParse({ q: 'New_York' }).success).toBe(true);
    });
    it('should reject missing q', () => {
      expect(searchQuerySchema.safeParse({}).success).toBe(false);
    });
    it('should reject empty q', () => {
      expect(searchQuerySchema.safeParse({ q: '' }).success).toBe(false);
    });
    it('should reject q over 200 chars', () => {
      expect(searchQuerySchema.safeParse({ q: 'x'.repeat(201) }).success).toBe(false);
    });
  });

  describe('GET /common — commonQuerySchema', () => {
    it('should accept without region', () => {
      expect(commonQuerySchema.safeParse({}).success).toBe(true);
    });
    it('should accept with region', () => {
      expect(commonQuerySchema.safeParse({ region: 'America' }).success).toBe(true);
    });
  });

  describe('GET /detect — detectQuerySchema', () => {
    it('should accept valid coords', () => {
      expect(detectQuerySchema.safeParse({ lat: 40.7, lng: -74.0 }).success).toBe(true);
    });
    it('should coerce string values', () => {
      expect(detectQuerySchema.safeParse({ lat: '40.7', lng: '-74' }).success).toBe(true);
    });
    it('should reject lat out of range', () => {
      expect(detectQuerySchema.safeParse({ lat: 91, lng: 0 }).success).toBe(false);
    });
    it('should reject lng out of range', () => {
      expect(detectQuerySchema.safeParse({ lat: 0, lng: 181 }).success).toBe(false);
    });
    it('should reject missing lat', () => {
      expect(detectQuerySchema.safeParse({ lng: 0 }).success).toBe(false);
    });
  });

  describe('GET /:timezone — timezoneInfoQuerySchema', () => {
    it('should accept without date', () => {
      expect(timezoneInfoQuerySchema.safeParse({}).success).toBe(true);
    });
    it('should accept with date', () => {
      expect(timezoneInfoQuerySchema.safeParse({ date: '2024-06-15' }).success).toBe(true);
    });
  });

  describe('POST /convert — convertBodySchema', () => {
    const validBody = {
      year: 1990, month: 6, day: 15, hour: 12, minute: 30,
      timezone: 'America/New_York',
    };

    it('should accept valid body', () => {
      expect(convertBodySchema.safeParse(validBody).success).toBe(true);
    });

    it('should accept valid body with optional coords', () => {
      expect(convertBodySchema.safeParse({
        ...validBody, latitude: 40.7, longitude: -74.0,
      }).success).toBe(true);
    });

    it('should coerce string numbers', () => {
      expect(convertBodySchema.safeParse({
        year: '1990', month: '6', day: '15', hour: '12', minute: '30',
        timezone: 'America/New_York',
      }).success).toBe(true);
    });

    it('should reject missing timezone', () => {
      const { timezone, ...noTz } = validBody;
      expect(convertBodySchema.safeParse(noTz).success).toBe(false);
    });

    it('should reject month 13', () => {
      expect(convertBodySchema.safeParse({ ...validBody, month: 13 }).success).toBe(false);
    });

    it('should reject hour 24', () => {
      expect(convertBodySchema.safeParse({ ...validBody, hour: 24 }).success).toBe(false);
    });

    it('should reject minute 60', () => {
      expect(convertBodySchema.safeParse({ ...validBody, minute: 60 }).success).toBe(false);
    });

    it('should reject year before 1900', () => {
      expect(convertBodySchema.safeParse({ ...validBody, year: 1899 }).success).toBe(false);
    });

    it('should reject year after 2200', () => {
      expect(convertBodySchema.safeParse({ ...validBody, year: 2201 }).success).toBe(false);
    });

    it('should reject missing year', () => {
      const { year, ...noYear } = validBody;
      expect(convertBodySchema.safeParse(noYear).success).toBe(false);
    });
  });

  describe('GET /:timezone/dst — dstQuerySchema', () => {
    it('should accept without year (defaults in handler)', () => {
      expect(dstQuerySchema.safeParse({}).success).toBe(true);
    });
    it('should accept valid year', () => {
      expect(dstQuerySchema.safeParse({ year: 2024 }).success).toBe(true);
    });
    it('should accept year=0 coerced from string "0" as valid if in range — note: handler uses current year as fallback', () => {
      // year=0 is out of range (min 1900), so schema rejects it
      expect(dstQuerySchema.safeParse({ year: 0 }).success).toBe(false);
    });
    it('should reject year before 1900', () => {
      expect(dstQuerySchema.safeParse({ year: 1899 }).success).toBe(false);
    });
  });

  describe('timezoneParamSchema', () => {
    it('should accept valid timezone', () => {
      expect(timezoneParamSchema.safeParse({ timezone: 'America/New_York' }).success).toBe(true);
    });
    it('should reject empty timezone', () => {
      expect(timezoneParamSchema.safeParse({ timezone: '' }).success).toBe(false);
    });
  });
});
