/**
 * Base API Schemas
 * Zod validation schemas for base API response types
 *
 * @module types/schemas/base.schema
 */

import { z } from 'zod';

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Pagination parameters schema
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Pagination metadata schema
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Generic API response wrapper schema
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    error: z.string().optional(),
  });

/**
 * Base API response schema (without generic)
 */
export const baseApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

/**
 * Alternative paginated response schema (with data instead of items)
 */
export const paginatedDataResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });

// ============================================================================
// ERROR SCHEMAS
// ============================================================================

/**
 * Validation error schema (field-level errors)
 */
export const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.unknown().optional(),
  code: z.string().optional(),
});

/**
 * API error response schema
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  validationErrors: z.array(validationErrorSchema).optional(),
  stack: z.string().optional(), // Only present in development
});

/**
 * Simple error response schema
 */
export const simpleErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().int().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// HEALTH CHECK SCHEMAS
// ============================================================================

/**
 * Service health schema
 */
export const serviceHealthSchema = z.object({
  name: z.string(),
  status: z.enum(['up', 'down', 'degraded']),
  latency: z.number().optional(),
  message: z.string().optional(),
});

/**
 * Health check response schema
 */
export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  uptime: z.number().nonnegative(),
  timestamp: z.string().datetime(),
  services: z.array(serviceHealthSchema),
});

// ============================================================================
// SUCCESS RESPONSE SCHEMAS
// ============================================================================

/**
 * Generic success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/**
 * Delete response schema
 */
export const deleteResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  id: z.string().uuid(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PaginatedDataResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type SimpleErrorResponse = z.infer<typeof simpleErrorResponseSchema>;

export type ServiceHealth = z.infer<typeof serviceHealthSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type DeleteResponse = z.infer<typeof deleteResponseSchema>;
