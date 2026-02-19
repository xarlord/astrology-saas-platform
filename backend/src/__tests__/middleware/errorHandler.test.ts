/**
 * Unit Tests for Error Handler Middleware
 * Tests error catching, formatting, and AppError class
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError, asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Mock dependencies
jest.mock('../utils/logger');

// Mock request/response/next
const mockRequest = (path: string = '/test', method: string = 'GET') => ({
  path,
  method,
} as Request);

const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('errorHandler', () => {
    it('should handle AppError with correct status code and message', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const appError = new AppError('Not found', 404);
      errorHandler(appError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Not found',
          statusCode: 404,
        },
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should default to 500 for errors without statusCode', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const genericError = new Error('Something went wrong');
      errorHandler(genericError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Something went wrong',
          statusCode: 500,
        },
      });
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const appError = new AppError('Development error', 400);
      errorHandler(appError, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Development error',
          statusCode: 400,
          details: {
            stack: expect.any(String),
            originalError: undefined,
          },
        },
      });
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const appError = new AppError('Production error', 400);
      errorHandler(appError, req, res, next);

      const responseObj = (res.json as jest.Mock).mock.calls[0][0];

      expect(responseObj.error.details).toBeUndefined();
    });

    it('should include error details when provided', () => {
      process.env.NODE_ENV = 'development';

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const details = { field: 'email', value: 'invalid' };
      const appError = new AppError('Validation error', 400, true, details);
      errorHandler(appError, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          statusCode: 400,
          details: {
            stack: expect.any(String),
            originalError: details,
          },
        },
      });
    });

    it('should log error with correct context', () => {
      const req = mockRequest('/api/charts', 'POST');
      const res = mockResponse();
      const next = mockNext;

      const appError = new AppError('Chart creation failed', 500);
      errorHandler(appError, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Error occurred:', {
        message: 'Chart creation failed',
        statusCode: 500,
        path: '/api/charts',
        method: 'POST',
        isOperational: true,
        stack: expect.any(String),
      });
    });

    it('should log isOperational flag from AppError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const operationalError = new AppError('User not found', 404, true);
      errorHandler(operationalError, req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          isOperational: true,
        })
      );
    });

    it('should handle errors with default message', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const errorWithoutMessage = new Error();
      errorHandler(errorWithoutMessage, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
        },
      });
    });
  });

  describe('AppError Class', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError('Test error', 400, true, { details: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ details: 'test' });
    });

    it('should have default statusCode of 500', () => {
      const error = new AppError('Server error');

      expect(error.statusCode).toBe(500);
    });

    it('should have default isOperational of true', () => {
      const error = new AppError('Operational error');

      expect(error.isOperational).toBe(true);
    });

    it('should maintain proper stack trace', () => {
      const error = new AppError('Stack trace error', 500);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack trace error');
    });

    it('should allow optional details parameter', () => {
      const error = new AppError('Error with details', 400);

      expect(error.details).toBeUndefined();
    });

    it('should work with Error instance checks', () => {
      const error = new AppError('Test', 500);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it('should be throwable and catchable', () => {
      try {
        throw new AppError('Thrown error', 400);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Thrown error');
        expect((error as AppError).statusCode).toBe(400);
      }
    });
  });

  describe('asyncHandler', () => {
    it('should resolve promise and call next on success', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const mockAsyncFn = jest.fn().mockResolvedValue({ success: true });
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(req, res, next);

      expect(mockAsyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch rejected promise and pass to next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const rejection = new AppError('Async error', 500);
      const mockAsyncFn = jest.fn().mockRejectedValue(rejection);
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(rejection);
    });

    it('should handle async functions with void return', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      const mockAsyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(req, res, next);

      expect(mockAsyncFn).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should preserve request/response/next context', async () => {
      const req = mockRequest('/test', 'GET');
      const res = mockResponse();
      const next = mockNext;

      const mockAsyncFn = jest.fn(async (request, response, nextFn) => {
        expect(request).toBe(req);
        expect(response).toBe(res);
        expect(nextFn).toBe(next);
        return { data: 'test' };
      });

      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(req, res, next);

      expect(mockAsyncFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should work with async route handlers', async () => {
      const req = mockRequest('/api/test', 'POST');
      const res = mockResponse();
      const next = mockNext;

      const mockController = jest.fn().mockImplementation(async (req, res) => {
        res.status(201).json({ created: true });
      });

      (res.status as jest.Mock).mockReturnValue(res);

      const wrappedController = asyncHandler(mockController);

      await wrappedController(req, res, next);

      expect(mockController).toHaveBeenCalledWith(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ created: true });
    });

    it('should catch errors in async route handlers', async () => {
      const req = mockRequest('/api/error', 'POST');
      const res = mockResponse();
      const next = mockNext;

      const error = new AppError('Controller error', 500);
      const failingController = jest.fn().mockRejectedValue(error);

      const wrappedController = asyncHandler(failingController);

      await wrappedController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Error Response Structure', () => {
    it('should always return success: false', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(new Error('Test'), req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(false);
    });

    it('should always include error object', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(new Error('Test'), req, res, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.error).toBeDefined();
      expect(response.error.message).toBeDefined();
      expect(response.error.statusCode).toBeDefined();
    });
  });

  describe('Error Type Guards', () => {
    it('should allow checking if error is AppError', () => {
      const error = new AppError('Test', 400);

      if (error instanceof AppError) {
        expect(error.statusCode).toBe(400);
        expect(error.isOperational).toBe(true);
      }
    });

    it('should allow checking error properties', () => {
      const error: AppError = new Error('Test') as AppError;
      error.statusCode = 404;
      error.isOperational = true;

      if (error.statusCode && error.isOperational) {
        expect(error.statusCode).toBe(404);
      }
    });
  });
});
