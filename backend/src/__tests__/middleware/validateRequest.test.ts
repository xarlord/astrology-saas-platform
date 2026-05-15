/**
 * Validation Middleware Tests
 * TDD: RED phase - tests must fail before implementation
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validateRequest';

// Mock response and next function
const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('validateRequest middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid data', () => {
    it('should call next() with validated data', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should attach validated data to req.validated', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect((req as any).validated).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('with invalid data', () => {
    it('should return 400 with validation errors', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      const req = {
        body: {
          name: 'J',
          email: 'not-an-email',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });

    it('should include field-level validation errors in response', () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        email: z.string().email('Invalid email'),
      });

      const req = {
        body: {
          name: 'J',
          email: 'not-an-email',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error).toBeDefined();
      expect(typeof jsonCall.error).toBe('string');
    });

    it('should not attach validated data when validation fails', () => {
      const schema = z.object({
        name: z.string().min(2),
      });

      const req = {
        body: {
          name: 'J',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect((req as any).validated).toBeUndefined();
    });
  });

  describe('with missing body', () => {
    it('should return 400 error', () => {
      const schema = z.object({
        name: z.string(),
      });

      const req = {
        body: undefined,
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('with strict schema (extra fields)', () => {
    it('should reject extra fields when schema is strict', () => {
      const schema = z
        .object({
          name: z.string(),
        })
        .strict();

      const req = {
        body: {
          name: 'John',
          extraField: 'should not be here',
        },
      } as unknown as Request;

      const res = mockResponse();
      const middleware = validateRequest(schema);

      middleware(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
