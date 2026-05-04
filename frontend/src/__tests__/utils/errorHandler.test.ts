/**
 * Tests for Error Handling Utilities
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ApplicationError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  parseAPIError,
  getUserFriendlyError,
  logError,
  withErrorHandling,
  useErrorHandler,
  type AppError,
} from '../../utils/errorHandler';

describe('errorHandler', () => {
  describe('ApplicationError', () => {
    it('should create an ApplicationError with message', () => {
      const error = new ApplicationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApplicationError');
    });

    it('should create an ApplicationError with code', () => {
      const error = new ApplicationError('Test error', 'TEST_CODE');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should create an ApplicationError with statusCode', () => {
      const error = new ApplicationError('Test error', 'TEST_CODE', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should create an ApplicationError with details', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new ApplicationError('Test error', 'TEST_CODE', 400, details);
      expect(error.details).toEqual(details);
    });

    it('should be an instance of Error', () => {
      const error = new ApplicationError('Test error');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with message', () => {
      const error = new NetworkError('Connection failed');
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create a NetworkError with statusCode', () => {
      const error = new NetworkError('Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should create a NetworkError with details', () => {
      const details = { url: '/api/test' };
      const error = new NetworkError('Request failed', 500, details);
      expect(error.details).toEqual(details);
    });

    it('should be an instance of ApplicationError', () => {
      const error = new NetworkError('Test');
      expect(error).toBeInstanceOf(ApplicationError);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create a ValidationError with details', () => {
      const details = { fields: ['email', 'password'] };
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });

    it('should be an instance of ApplicationError', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(ApplicationError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should create an AuthenticationError with details', () => {
      const details = { attempts: 3 };
      const error = new AuthenticationError('Too many attempts', details);
      expect(error.details).toEqual(details);
    });

    it('should be an instance of ApplicationError', () => {
      const error = new AuthenticationError('Test');
      expect(error).toBeInstanceOf(ApplicationError);
    });
  });

  describe('parseAPIError', () => {
    it('should return ApplicationError as-is', () => {
      const appError = new ApplicationError('Test', 'CODE', 500);
      const result = parseAPIError(appError);
      expect(result).toBe(appError);
    });

    it('should parse standard Error instance', () => {
      const error = new Error('Standard error');
      const result = parseAPIError(error);
      expect(result.message).toBe('Standard error');
      expect(result.details).toBe(error);
    });

    it('should parse string error', () => {
      const result = parseAPIError('String error message');
      expect(result.message).toBe('String error message');
    });

    it('should parse API error with response.data.error', () => {
      const apiError = {
        response: {
          data: {
            error: 'API error message',
          },
        },
      };
      const result = parseAPIError(apiError);
      expect(result.message).toBe('API error message');
      expect(result.details).toEqual(apiError);
    });

    it('should parse API error with response.data.message', () => {
      const apiError = {
        response: {
          data: {
            message: 'API message',
          },
        },
      };
      const result = parseAPIError(apiError);
      expect(result.message).toBe('API message');
    });

    it('should prefer error over message in response.data', () => {
      const apiError = {
        response: {
          data: {
            error: 'Error takes priority',
            message: 'Secondary message',
          },
        },
      };
      const result = parseAPIError(apiError);
      expect(result.message).toBe('Error takes priority');
    });

    it('should return default message for unknown error types', () => {
      const result = parseAPIError(null);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.details).toBeNull();
    });

    it('should handle undefined error', () => {
      const result = parseAPIError(undefined);
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should handle object without response', () => {
      const result = parseAPIError({ some: 'object' });
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should handle number error', () => {
      const result = parseAPIError(404);
      expect(result.message).toBe('An unknown error occurred');
    });
  });

  describe('getUserFriendlyError', () => {
    it('should return login message for 401 NETWORK_ERROR', () => {
      const error: AppError = {
        message: 'Unauthorized',
        code: 'NETWORK_ERROR',
        statusCode: 401,
      };
      expect(getUserFriendlyError(error)).toBe('Please log in to continue');
    });

    it('should return permission message for 403 NETWORK_ERROR', () => {
      const error: AppError = {
        message: 'Forbidden',
        code: 'NETWORK_ERROR',
        statusCode: 403,
      };
      expect(getUserFriendlyError(error)).toBe("You don't have permission to access this resource");
    });

    it('should return not found message for 404 NETWORK_ERROR', () => {
      const error: AppError = {
        message: 'Not found',
        code: 'NETWORK_ERROR',
        statusCode: 404,
      };
      expect(getUserFriendlyError(error)).toBe('The requested resource was not found');
    });

    it('should return server error message for 500 NETWORK_ERROR', () => {
      const error: AppError = {
        message: 'Internal server error',
        code: 'NETWORK_ERROR',
        statusCode: 500,
      };
      expect(getUserFriendlyError(error)).toBe('Server error. Please try again later');
    });

    it('should return original message for VALIDATION_ERROR', () => {
      const error: AppError = {
        message: 'Email is required',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      };
      expect(getUserFriendlyError(error)).toBe('Email is required');
    });

    it('should return original message for AUTH_ERROR', () => {
      const error: AppError = {
        message: 'Invalid password',
        code: 'AUTH_ERROR',
        statusCode: 401,
      };
      expect(getUserFriendlyError(error)).toBe('Invalid password');
    });

    it('should return default message for errors without code', () => {
      const error: AppError = {
        message: 'Some error',
      };
      expect(getUserFriendlyError(error)).toBe('Some error');
    });

    it('should return fallback message for empty error', () => {
      const error: AppError = {
        message: '',
      };
      expect(getUserFriendlyError(error)).toBe('Something went wrong. Please try again.');
    });

    it('should return fallback message for undefined message', () => {
      const error: AppError = {};
      expect(getUserFriendlyError(error)).toBe('Something went wrong. Please try again.');
    });

    it('should handle NETWORK_ERROR with unknown status code', () => {
      const error: AppError = {
        message: 'Network failed',
        code: 'NETWORK_ERROR',
        statusCode: 418, // I'm a teapot
      };
      expect(getUserFriendlyError(error)).toBe('Network failed');
    });
  });

  describe('logError', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log error message', () => {
      const error: AppError = {
        message: 'Test error',
      };
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Test error');
    });

    it('should log error with context prefix', () => {
      const error: AppError = {
        message: 'Test error',
      };
      logError(error, 'AuthService');
      expect(consoleSpy).toHaveBeenCalledWith('[AuthService] Error:', 'Test error');
    });

    it('should log error code when present', () => {
      const error: AppError = {
        message: 'Test error',
        code: 'TEST_CODE',
      };
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('Error Code:', 'TEST_CODE');
    });

    it('should not log error code when absent', () => {
      const error: AppError = {
        message: 'Test error',
      };
      logError(error);
      const calls = consoleSpy.mock.calls;
      const hasErrorCodeLog = calls.some((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('Error Code:')),
      );
      expect(hasErrorCodeLog).toBe(false);
    });

    it('should log status code when present', () => {
      const error: AppError = {
        message: 'Test error',
        statusCode: 404,
      };
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('Status Code:', 404);
    });

    it('should log details in dev mode', () => {
      const originalDev = import.meta.env.DEV;
      (import.meta as any).env = { ...(import.meta as any).env, DEV: true };

      const details = { field: 'test' };
      const error: AppError = {
        message: 'Test error',
        details,
      };
      logError(error);
      expect(consoleSpy).toHaveBeenCalledWith('Details:', details);

      (import.meta as any).env = { ...(import.meta as any).env, DEV: originalDev };
    });

    it('should log all fields with context', () => {
      const error: AppError = {
        message: 'Full error',
        code: 'FULL_ERROR',
        statusCode: 500,
      };
      logError(error, 'TestContext');

      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Error:', 'Full error');
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Error Code:', 'FULL_ERROR');
      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Status Code:', 500);
    });
  });

  describe('withErrorHandling', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withErrorHandling(fn);
      expect(result).toBe('success');
    });

    it('should return null on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));
      const result = await withErrorHandling(fn);
      expect(result).toBeNull();
    });

    it('should call onError callback on failure', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));
      const onError = vi.fn();
      await withErrorHandling(fn, onError);
      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
        }),
      );
    });

    it('should not call onError callback on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const onError = vi.fn();
      await withErrorHandling(fn, onError);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should log error on failure', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));
      await withErrorHandling(fn);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle async function that returns object', async () => {
      const data = { id: 1, name: 'test' };
      const fn = vi.fn().mockResolvedValue(data);
      const result = await withErrorHandling(fn);
      expect(result).toEqual(data);
    });

    it('should handle async function that returns null', async () => {
      const fn = vi.fn().mockResolvedValue(null);
      const result = await withErrorHandling(fn);
      expect(result).toBeNull();
    });

    it('should handle async function that returns undefined', async () => {
      const fn = vi.fn().mockResolvedValue(undefined);
      const result = await withErrorHandling(fn);
      expect(result).toBeUndefined();
    });
  });

  describe('useErrorHandler', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should return handleError function', () => {
      const { handleError } = useErrorHandler();
      expect(typeof handleError).toBe('function');
    });

    it('should parse and log errors', () => {
      const { handleError } = useErrorHandler();
      handleError(new Error('Test error'));
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Test error');
    });

    it('should handle errors with context', () => {
      const { handleError } = useErrorHandler();
      handleError(new Error('Test error'), 'Component');
      expect(consoleSpy).toHaveBeenCalledWith('[Component] Error:', 'Test error');
    });

    it('should handle ApplicationError', () => {
      const { handleError } = useErrorHandler();
      handleError(new NetworkError('Network failed', 500));
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Network failed');
    });

    it('should handle string errors', () => {
      const { handleError } = useErrorHandler();
      handleError('String error');
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'String error');
    });

    it('should handle unknown error types', () => {
      const { handleError } = useErrorHandler();
      handleError({ unknown: 'object' });
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'An unknown error occurred');
    });
  });
});
