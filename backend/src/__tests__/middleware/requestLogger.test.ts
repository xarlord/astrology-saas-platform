/**
 * Unit Tests for Request Logger Middleware
 * Tests request/response logging
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import { requestLogger } from '../../middleware/requestLogger';

// Mock logger
jest.mock('../../utils/logger');

const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('Request Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      method: 'GET',
      path: '/api/test',
      query: { page: '1' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };

    mockNext = jest.fn();

    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };
  });

  it('should log incoming request', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockedLogger.info).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
      method: 'GET',
      path: '/api/test',
      query: { page: '1' },
      ip: '127.0.0.1',
    }));
  });

  it('should log user agent', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockedLogger.info).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
      userAgent: 'Mozilla/5.0',
    }));
  });

  it('should register finish event listener', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should call next', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should log response on finish', () => {
    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finishing
    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      method: 'GET',
      path: '/api/test',
      statusCode: 200,
      duration: expect.any(String),
    }));
  });

  it('should log duration in milliseconds', () => {
    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      duration: expect.stringMatching(/\d+ms/),
    }));
  });

  it('should log warning for 4xx status codes', () => {
    mockResponse.statusCode = 404;

    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.warn).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      statusCode: 404,
    }));
  });

  it('should log warning for 5xx status codes', () => {
    mockResponse.statusCode = 500;

    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.warn).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      statusCode: 500,
    }));
  });

  it('should log info for 2xx status codes', () => {
    mockResponse.statusCode = 201;

    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      statusCode: 201,
    }));
  });

  it('should log info for 3xx status codes', () => {
    mockResponse.statusCode = 301;

    let finishCallback: Function | undefined;

    mockResponse.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback as Function;
      }
    });

    requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockedLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
      statusCode: 301,
    }));
  });
});
