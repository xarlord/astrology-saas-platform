/**
 * Error Messages Constants
 */

export const ERROR_MESSAGES = {
  // Auth Errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_TOKEN_EXPIRED: 'Token has expired',
  AUTH_TOKEN_INVALID: 'Invalid token',
  AUTH_UNAUTHORIZED: 'Authentication required',
  AUTH_FORBIDDEN: 'Access forbidden',
  AUTH_EMAIL_EXISTS: 'Email already registered',
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_WEAK_PASSWORD: 'Password must be at least 8 characters',

  // Chart Errors
  CHART_NOT_FOUND: 'Chart not found',
  CHART_INVALID_DATA: 'Invalid birth data',
  CHART_CALCULATION_FAILED: 'Failed to calculate chart',
  CHART_DELETE_FAILED: 'Failed to delete chart',

  // Validation Errors
  VALIDATION_INVALID_DATE: 'Invalid date format',
  VALIDATION_INVALID_TIME: 'Invalid time format',
  VALIDATION_INVALID_LOCATION: 'Invalid location',
  VALIDATION_MISSING_FIELD: 'Required field missing',

  // Server Errors
  SERVER_INTERNAL_ERROR: 'Internal server error',
  SERVER_DATABASE_ERROR: 'Database error',
  SERVER_SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
} as const;

export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;
