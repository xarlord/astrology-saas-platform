/**
 * Unit Tests for Validators
 * Tests Zod validation schemas and middleware
 */

import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  createChartSchema,
  calculateTransitsSchema,
  paginationSchema,
  validateBody,
  validateQuery,
} from '../../utils/validators';

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should require name', () => {
      const data = {
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('name'))).toBe(true);
      }
    });

    it('should require name min 2 characters', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require email', () => {
      const data = {
        name: 'John Doe',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require valid email format', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require password min 8 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require password with uppercase, lowercase, number, and special character', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      };

      const result = registerSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'john@example.com',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should require email', () => {
      const data = {
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const data = {
        email: 'john@example.com',
      };

      const result = loginSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('createChartSchema', () => {
    const validChart = {
      name: 'My Chart',
      birth_date: '1990-01-15',
      birth_time: '14:30:00',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.0060,
      birth_timezone: 'America/New_York',
    };

    it('should validate valid chart data', () => {
      const result = createChartSchema.safeParse(validChart);

      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const data = { ...validChart, name: '' };

      const result = createChartSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require birth_date', () => {
      const data = { ...validChart, birth_date: undefined };

      const result = createChartSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require birth_time format HH:MM:SS', () => {
      const data = { ...validChart, birth_time: 'invalid' };

      const result = createChartSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should accept birth_time with HH:MM format', () => {
      const data = { ...validChart, birth_time: '14:30' };

      const result = createChartSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('should require birth_place_name', () => {
      const data = { ...validChart, birth_place_name: undefined };

      const result = createChartSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should validate birth_latitude range -90 to 90', () => {
      const data1 = { ...validChart, birth_latitude: 91 };
      const result1 = createChartSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChart, birth_latitude: -91 };
      const result2 = createChartSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('should validate birth_longitude range -180 to 180', () => {
      const data1 = { ...validChart, birth_longitude: 181 };
      const result1 = createChartSchema.safeParse(data1);
      expect(result1.success).toBe(false);

      const data2 = { ...validChart, birth_longitude: -181 };
      const result2 = createChartSchema.safeParse(data2);
      expect(result2.success).toBe(false);
    });

    it('should accept valid chart types', () => {
      const types = ['natal', 'synastry', 'composite', 'transit', 'progressed'] as const;

      types.forEach(type => {
        const data = { ...validChart, type };
        const result = createChartSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid house systems', () => {
      const systems = ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'] as const;

      systems.forEach(system => {
        const data = { ...validChart, house_system: system };
        const result = createChartSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid zodiac types', () => {
      const zodiacs = ['tropical', 'sidereal'] as const;

      zodiacs.forEach(zodiac => {
        const data = { ...validChart, zodiac };
        const result = createChartSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('calculateTransitsSchema', () => {
    const validTransit = {
      chartId: '550e8400-e29b-41d4-a716-446655440000',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    it('should validate valid transit data', () => {
      const result = calculateTransitsSchema.safeParse(validTransit);

      expect(result.success).toBe(true);
    });

    it('should require chartId to be UUID', () => {
      const data = { ...validTransit, chartId: 'not-uuid' };

      const result = calculateTransitsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require startDate', () => {
      const data = { ...validTransit, startDate: undefined };

      const result = calculateTransitsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require endDate', () => {
      const data = { ...validTransit, endDate: undefined };

      const result = calculateTransitsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require endDate after startDate', () => {
      const data = {
        chartId: validTransit.chartId,
        startDate: '2024-01-31',
        endDate: '2024-01-01',
      };

      const result = calculateTransitsSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination', () => {
      const data = { page: 1, limit: 10 };

      const result = paginationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 10 });
      }
    });

    it('should use default values', () => {
      const data = {};

      const result = paginationSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 20 });
      }
    });

    it('should require page >= 1', () => {
      const data = { page: 0 };

      const result = paginationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require limit >= 1', () => {
      const data = { limit: 0 };

      const result = paginationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('should require limit <= 100', () => {
      const data = { limit: 101 };

      const result = paginationSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('validateBody middleware', () => {
    it('should call next with sanitized data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      });

      const middleware = validateBody(schema);
      const req = { body: { name: 'John', age: 30, extra: 'field' } } as unknown as { body: Record<string, unknown> };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as { status: jest.Mock; json: jest.Mock };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Zod strips extra fields only with .strict(), so extra will be included
      expect(req.body.name).toBe('John');
      expect(req.body.age).toBe(30);
    });

    it('should return 400 on validation error', () => {
      const schema = z.object({
        name: z.string().min(1),
      });

      const middleware = validateBody(schema);
      const req = { body: {} } as unknown as { body: Record<string, unknown> };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as { status: jest.Mock; json: jest.Mock };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Validation failed',
            statusCode: 400,
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery middleware', () => {
    it('should call next with sanitized query', () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
      });

      const middleware = validateQuery(schema);
      const req = { query: {} } as unknown as { query: Record<string, unknown> };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as { status: jest.Mock; json: jest.Mock };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 on validation error', () => {
      const schema = z.object({
        page: z.coerce.number().min(1),
      });

      const middleware = validateQuery(schema);
      const req = { query: {} } as unknown as { query: Record<string, unknown> };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as { status: jest.Mock; json: jest.Mock };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });
});
