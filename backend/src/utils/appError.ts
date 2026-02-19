/**
 * Enhanced Error Handling System
 * Custom error classes for application errors
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;
  timestamp: Date;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errorCode?: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    this.details = details;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set the name explicitly for debugging
    this.name = this.constructor.name;
  }

  toJSON() {
    const result: Record<string, unknown> = {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.details) {
      result.details = this.details;
    }

    return result;
  }
}

/**
 * HTTP 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(message, 400, true, 'BAD_REQUEST', details);
  }
}

/**
 * HTTP 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, 401, true, 'UNAUTHORIZED', details);
  }
}

/**
 * HTTP 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(message, 403, true, 'FORBIDDEN', details);
  }
}

/**
 * HTTP 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, true, 'NOT_FOUND', details);
  }
}

/**
 * HTTP 409 Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(message, 409, true, 'CONFLICT', details);
  }
}

/**
 * HTTP 422 Unprocessable Entity Error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 422, true, 'VALIDATION_ERROR', details);
  }
}

/**
 * HTTP 429 Too Many Requests Error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: unknown) {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * HTTP 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, false, 'INTERNAL_ERROR', details);
  }
}

/**
 * HTTP 503 Service Unavailable Error
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', details?: unknown) {
    super(message, 503, true, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error occurred', details?: unknown) {
    super(message, 500, false, 'DATABASE_ERROR', details);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 401, true, 'AUTH_ERROR', details);
  }
}

/**
 * Token Error
 */
export class TokenError extends AppError {
  constructor(message: string = 'Token error occurred', details?: unknown) {
    super(message, 401, true, 'TOKEN_ERROR', details);
  }
}

/**
 * Error Factory
 * Creates appropriate error instances based on error code
 */
export class ErrorFactory {
  static create(errorCode: string, message?: string, details?: unknown): AppError {
    const errors: Record<string, new (msg?: string, details?: unknown) => AppError> = {
      BAD_REQUEST: BadRequestError,
      UNAUTHORIZED: UnauthorizedError,
      FORBIDDEN: ForbiddenError,
      NOT_FOUND: NotFoundError,
      CONFLICT: ConflictError,
      VALIDATION_ERROR: ValidationError,
      RATE_LIMIT_EXCEEDED: RateLimitError,
      INTERNAL_ERROR: InternalServerError,
      SERVICE_UNAVAILABLE: ServiceUnavailableError,
      DATABASE_ERROR: DatabaseError,
      AUTH_ERROR: AuthenticationError,
      TOKEN_ERROR: TokenError
    };

    const ErrorClass = errors[errorCode];
    if (ErrorClass) {
      return new ErrorClass(message, details);
    }

    // Default to Internal Server Error
    return new InternalServerError(message || 'An error occurred', { errorCode, details });
  }
}

export default AppError;
