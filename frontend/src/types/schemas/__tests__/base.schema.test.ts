/**
 * Base Schema Tests
 * Unit tests for base API Zod schemas
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  paginationParamsSchema,
  paginationMetaSchema,
  baseApiResponseSchema,
  apiResponseSchema,
  paginatedResponseSchema,
  validationErrorSchema,
  apiErrorResponseSchema,
  simpleErrorResponseSchema,
  healthCheckResponseSchema,
  serviceHealthSchema,
  successResponseSchema,
  deleteResponseSchema,
} from '../base.schema';

describe('Base Schemas', () => {
  describe('paginationParamsSchema', () => {
    it('should validate valid pagination params', () => {
      const result = paginationParamsSchema.safeParse({
        page: 1,
        limit: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const result = paginationParamsSchema.safeParse({});
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe('asc');
      }
    });

    it('should reject page <= 0', () => {
      const result = paginationParamsSchema.safeParse({
        page: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit > 100', () => {
      const result = paginationParamsSchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it('should validate with sort options', () => {
      const result = paginationParamsSchema.safeParse({
        page: 2,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('paginationMetaSchema', () => {
    const validMeta = {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    };

    it('should validate valid pagination meta', () => {
      const result = paginationMetaSchema.safeParse(validMeta);
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const result = paginationMetaSchema.safeParse({
        page: 1,
        limit: 20,
        // Missing other fields
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative total', () => {
      const result = paginationMetaSchema.safeParse({
        ...validMeta,
        total: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('baseApiResponseSchema', () => {
    it('should validate a success response', () => {
      const result = baseApiResponseSchema.safeParse({
        success: true,
        data: { id: 1, name: 'Test' },
        message: 'Operation successful',
      });
      expect(result.success).toBe(true);
    });

    it('should validate an error response', () => {
      const result = baseApiResponseSchema.safeParse({
        success: false,
        data: null,
        error: 'Something went wrong',
      });
      expect(result.success).toBe(true);
    });

    it('should require success field', () => {
      const result = baseApiResponseSchema.safeParse({
        data: { id: 1 },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('apiResponseSchema (generic)', () => {
    const stringResponseSchema = apiResponseSchema(z.string());
    const objectResponseSchema = apiResponseSchema(z.object({ id: z.number() }));

    it('should validate a string data response', () => {
      const result = stringResponseSchema.safeParse({
        success: true,
        data: 'Hello World',
      });
      expect(result.success).toBe(true);
    });

    it('should validate an object data response', () => {
      const result = objectResponseSchema.safeParse({
        success: true,
        data: { id: 123 },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid data type', () => {
      const result = objectResponseSchema.safeParse({
        success: true,
        data: 'not an object',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('paginatedResponseSchema', () => {
    const itemSchema = z.object({ id: z.number(), name: z.string() });
    const schema = paginatedResponseSchema(itemSchema);

    const validResponse = {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    };

    it('should validate a valid paginated response', () => {
      const result = schema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate empty items', () => {
      const result = schema.safeParse({
        ...validResponse,
        items: [],
        total: 0,
        totalPages: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid item schema', () => {
      const result = schema.safeParse({
        ...validResponse,
        items: [{ id: 'not-a-number' }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validationErrorSchema', () => {
    const validError = {
      field: 'email',
      message: 'Invalid email format',
    };

    it('should validate a validation error', () => {
      const result = validationErrorSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = validationErrorSchema.safeParse({
        ...validError,
        value: 'invalid-email',
        code: 'INVALID_FORMAT',
      });
      expect(result.success).toBe(true);
    });

    it('should require field and message', () => {
      const result = validationErrorSchema.safeParse({
        code: 'SOME_ERROR',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('apiErrorResponseSchema', () => {
    const validError = {
      success: false as const,
      error: 'ValidationError',
      message: 'Invalid input data',
      statusCode: 400,
    };

    it('should validate a valid API error response', () => {
      const result = apiErrorResponseSchema.safeParse(validError);
      expect(result.success).toBe(true);
    });

    it('should validate with validation errors', () => {
      const result = apiErrorResponseSchema.safeParse({
        ...validError,
        validationErrors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should validate with stack trace', () => {
      const result = apiErrorResponseSchema.safeParse({
        ...validError,
        stack: 'Error at line 42...',
      });
      expect(result.success).toBe(true);
    });

    it('should require success to be false', () => {
      const result = apiErrorResponseSchema.safeParse({
        ...validError,
        success: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('simpleErrorResponseSchema', () => {
    it('should validate a simple error response', () => {
      const result = simpleErrorResponseSchema.safeParse({
        message: 'Something went wrong',
      });
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const result = simpleErrorResponseSchema.safeParse({
        message: 'Error',
        code: 'ERR001',
        statusCode: 500,
        details: { reason: 'unknown' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('serviceHealthSchema', () => {
    const validService = {
      name: 'database',
      status: 'up' as const,
    };

    it('should validate valid service health', () => {
      const result = serviceHealthSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    it('should validate all status types', () => {
      const statuses = ['up', 'down', 'degraded'] as const;
      statuses.forEach((status) => {
        const result = serviceHealthSchema.safeParse({
          ...validService,
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate with optional fields', () => {
      const result = serviceHealthSchema.safeParse({
        ...validService,
        latency: 42,
        message: 'Connection stable',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('healthCheckResponseSchema', () => {
    const validHealth = {
      status: 'healthy' as const,
      version: '1.0.0',
      uptime: 86400,
      timestamp: '2024-01-01T00:00:00Z',
      services: [
        { name: 'database', status: 'up' as const },
        { name: 'cache', status: 'up' as const },
      ],
    };

    it('should validate a valid health check response', () => {
      const result = healthCheckResponseSchema.safeParse(validHealth);
      expect(result.success).toBe(true);
    });

    it('should validate all health statuses', () => {
      const statuses = ['healthy', 'degraded', 'unhealthy'] as const;
      statuses.forEach((status) => {
        const result = healthCheckResponseSchema.safeParse({
          ...validHealth,
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject negative uptime', () => {
      const result = healthCheckResponseSchema.safeParse({
        ...validHealth,
        uptime: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('successResponseSchema', () => {
    it('should validate a success response', () => {
      const result = successResponseSchema.safeParse({
        success: true,
        message: 'Operation completed',
      });
      expect(result.success).toBe(true);
    });

    it('should require success to be true', () => {
      const result = successResponseSchema.safeParse({
        success: false,
        message: 'Not successful',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteResponseSchema', () => {
    it('should validate a delete response', () => {
      const result = deleteResponseSchema.safeParse({
        success: true,
        message: 'Resource deleted',
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should require valid UUID', () => {
      const result = deleteResponseSchema.safeParse({
        success: true,
        message: 'Deleted',
        id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });
});
