/**
 * Unit Tests for Validators
 * Tests Joi validation schemas and middleware
 */

import Joi from 'joi';
import {
  registerSchema,
  loginSchema,
  createChartSchema,
  updateChartSchema,
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
        password: 'Password123',
      };

      const { error, value } = registerSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value).toEqual(data);
    });

    it('should require name', () => {
      const data = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error?.details.some(d => d.path.includes('name'))).toBe(true);
    });

    it('should require name min 2 characters', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require email', () => {
      const data = {
        name: 'John Doe',
        password: 'Password123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require valid email format', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require password', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require password min 8 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require password with uppercase, lowercase, and number', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const { error, value } = loginSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value).toEqual(data);
    });

    it('should require email', () => {
      const data = {
        password: 'Password123',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require password', () => {
      const data = {
        email: 'john@example.com',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
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
      const { error, value } = createChartSchema.validate(validChart);

      expect(error).toBeUndefined();
    });

    it('should require name', () => {
      const data = { ...validChart, name: '' };

      const { error } = createChartSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require birth_date', () => {
      const data = { ...validChart, birth_date: undefined };

      const { error } = createChartSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require birth_time format HH:MM:SS', () => {
      const data = { ...validChart, birth_time: 'invalid' };

      const { error } = createChartSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should accept birth_time with HH:MM format', () => {
      const data = { ...validChart, birth_time: '14:30' };

      const { error } = createChartSchema.validate(data);

      expect(error).toBeUndefined();
    });

    it('should require birth_place_name', () => {
      const data = { ...validChart, birth_place_name: undefined };

      const { error } = createChartSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should validate birth_latitude range -90 to 90', () => {
      const data1 = { ...validChart, birth_latitude: 91 };
      const { error: error1 } = createChartSchema.validate(data1);
      expect(error1).toBeDefined();

      const data2 = { ...validChart, birth_latitude: -91 };
      const { error: error2 } = createChartSchema.validate(data2);
      expect(error2).toBeDefined();
    });

    it('should validate birth_longitude range -180 to 180', () => {
      const data1 = { ...validChart, birth_longitude: 181 };
      const { error: error1 } = createChartSchema.validate(data1);
      expect(error1).toBeDefined();

      const data2 = { ...validChart, birth_longitude: -181 };
      const { error: error2 } = createChartSchema.validate(data2);
      expect(error2).toBeDefined();
    });

    it('should accept valid chart types', () => {
      const types = ['natal', 'synastry', 'composite', 'transit', 'progressed'];

      types.forEach(type => {
        const data = { ...validChart, type };
        const { error } = createChartSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    it('should accept valid house systems', () => {
      const systems = ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'];

      systems.forEach(system => {
        const data = { ...validChart, house_system: system };
        const { error } = createChartSchema.validate(data);
        expect(error).toBeUndefined();
      });
    });

    it('should accept valid zodiac types', () => {
      const zodiacs = ['tropical', 'sidereal'];

      zodiacs.forEach(zodiac => {
        const data = { ...validChart, zodiac };
        const { error } = createChartSchema.validate(data);
        expect(error).toBeUndefined();
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
      const { error } = calculateTransitsSchema.validate(validTransit);

      expect(error).toBeUndefined();
    });

    it('should require chartId to be UUID', () => {
      const data = { ...validTransit, chartId: 'not-uuid' };

      const { error } = calculateTransitsSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require startDate', () => {
      const data = { ...validTransit, startDate: undefined };

      const { error } = calculateTransitsSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require endDate', () => {
      const data = { ...validTransit, endDate: undefined };

      const { error } = calculateTransitsSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require endDate after startDate', () => {
      const data = {
        chartId: validTransit.chartId,
        startDate: '2024-01-31',
        endDate: '2024-01-01',
      };

      const { error } = calculateTransitsSchema.validate(data);

      expect(error).toBeDefined();
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination', () => {
      const data = { page: 1, limit: 10 };

      const { error, value } = paginationSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value).toEqual({ page: 1, limit: 10 });
    });

    it('should use default values', () => {
      const data = {};

      const { error, value } = paginationSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value).toEqual({ page: 1, limit: 20 });
    });

    it('should require page >= 1', () => {
      const data = { page: 0 };

      const { error } = paginationSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require limit >= 1', () => {
      const data = { limit: 0 };

      const { error } = paginationSchema.validate(data);

      expect(error).toBeDefined();
    });

    it('should require limit <= 100', () => {
      const data = { limit: 101 };

      const { error } = paginationSchema.validate(data);

      expect(error).toBeDefined();
    });
  });

  describe('validateBody middleware', () => {
    it('should call next with sanitized data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number(),
      });

      const middleware = validateBody(schema);
      const req: any = { body: { name: 'John', age: 30, extra: 'field' } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John', age: 30 });
    });

    it('should return 400 on validation error', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const middleware = validateBody(schema);
      const req: any = { body: {} };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
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
      const schema = Joi.object({
        page: Joi.number().default(1),
      });

      const middleware = validateQuery(schema);
      const req: any = { query: {} };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ page: 1 });
    });

    it('should return 400 on validation error', () => {
      const schema = Joi.object({
        page: Joi.number().required(),
      });

      const middleware = validateQuery(schema);
      const req: any = { query: {} };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
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
