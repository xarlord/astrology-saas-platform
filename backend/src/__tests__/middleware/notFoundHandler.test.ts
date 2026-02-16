/**
 * Unit Tests for Not Found Handler
 * Tests 404 error handling middleware
 */

import { Request, Response } from 'express';
import { notFoundHandler } from '../../middleware/notFoundHandler';

describe('Not Found Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/nonexistent-route',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return 404 status code', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  it('should return success: false', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });

  it('should include error object', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Object),
      })
    );
  });

  it('should include error message', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Route not found',
        }),
      })
    );
  });

  it('should include status code 404', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          statusCode: 404,
        }),
      })
    );
  });

  it('should include request path', () => {
    mockRequest.originalUrl = '/api/test/path';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          path: '/api/test/path',
        }),
      })
    );
  });

  it('should include request method', () => {
    mockRequest.method = 'POST';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          method: 'POST',
        }),
      })
    );
  });

  it('should handle different request methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    methods.forEach((method) => {
      mockRequest.method = method;
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            method,
          }),
        })
      );
    });
  });

  it('should handle different paths', () => {
    const paths = [
      '/api/users',
      '/api/charts/123',
      '/invalid/route',
      '/health/check',
    ];

    paths.forEach((path) => {
      mockRequest.originalUrl = path;
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            path,
          }),
        })
      );
    });
  });
});
