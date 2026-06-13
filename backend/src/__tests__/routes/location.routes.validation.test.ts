/**
 * Unit tests for location.routes.ts validation schemas (#343)
 * Tests that the Zod schemas enforce correct validation for all endpoints.
 */

import { z } from 'zod';

// Replicate the schemas from the route file (they're module-internal)
const autocompleteQuerySchema = z.object({
  input: z.string().min(2).max(100),
  sessiontoken: z.string().optional(),
  language: z.string().optional(),
});

const detailsQuerySchema = z.object({
  sessiontoken: z.string().optional(),
  language: z.string().optional(),
});

const timezoneQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

const placeIdParamSchema = z.object({
  placeId: z.string().min(1).max(512),
});

describe('Location Routes — Validation Schemas (#343)', () => {
  describe('autocompleteQuerySchema', () => {
    it('should accept valid input', () => {
      const result = autocompleteQuerySchema.safeParse({
        input: 'New York',
        sessiontoken: 'abc123',
        language: 'en',
      });
      expect(result.success).toBe(true);
    });

    it('should accept input without optional params', () => {
      const result = autocompleteQuerySchema.safeParse({ input: 'London' });
      expect(result.success).toBe(true);
    });

    it('should reject missing input', () => {
      const result = autocompleteQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject input shorter than 2 chars', () => {
      const result = autocompleteQuerySchema.safeParse({ input: 'A' });
      expect(result.success).toBe(false);
    });

    it('should reject input longer than 100 chars', () => {
      const result = autocompleteQuerySchema.safeParse({ input: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('detailsQuerySchema', () => {
    it('should accept empty object (all optional)', () => {
      const result = detailsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept sessiontoken and language', () => {
      const result = detailsQuerySchema.safeParse({
        sessiontoken: 'tok',
        language: 'fr',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('timezoneQuerySchema', () => {
    it('should accept valid coordinates', () => {
      const result = timezoneQuerySchema.safeParse({ lat: 40.7, lon: -74.0 });
      expect(result.success).toBe(true);
    });

    it('should coerce string to number', () => {
      const result = timezoneQuerySchema.safeParse({ lat: '40.7', lon: '-74.0' });
      expect(result.success).toBe(true);
    });

    it('should reject lat > 90', () => {
      const result = timezoneQuerySchema.safeParse({ lat: 91, lon: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject lat < -90', () => {
      const result = timezoneQuerySchema.safeParse({ lat: -91, lon: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject lon > 180', () => {
      const result = timezoneQuerySchema.safeParse({ lat: 0, lon: 181 });
      expect(result.success).toBe(false);
    });

    it('should reject lon < -180', () => {
      const result = timezoneQuerySchema.safeParse({ lat: 0, lon: -181 });
      expect(result.success).toBe(false);
    });

    it('should reject missing lat', () => {
      const result = timezoneQuerySchema.safeParse({ lon: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject missing lon', () => {
      const result = timezoneQuerySchema.safeParse({ lat: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('placeIdParamSchema', () => {
    it('should accept valid placeId', () => {
      const result = placeIdParamSchema.safeParse({ placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4' });
      expect(result.success).toBe(true);
    });

    it('should reject empty placeId', () => {
      const result = placeIdParamSchema.safeParse({ placeId: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing placeId', () => {
      const result = placeIdParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
