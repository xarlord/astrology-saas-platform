/**
 * Validators using Zod
 */

import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ─── Shared reusable schemas ──────────────────────────────────────────

// Auth validators
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?])/;

export const registerSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  })
  .strict();

// Chart validators
export const createChartSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['natal', 'synastry', 'composite', 'transit', 'progressed']).optional(),
  birth_date: z.string(), // ISO date string
  birth_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/),
  birth_time_unknown: z.boolean().optional().default(false),
  birth_place_name: z.string().min(1).max(200),
  birth_latitude: z.number().min(-90).max(90),
  birth_longitude: z.number().min(-180).max(180),
  birth_timezone: z.string().min(1),
  house_system: z
    .enum(['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'])
    .optional(),
  zodiac: z.enum(['tropical', 'sidereal']).optional(),
  sidereal_mode: z.string().optional(),
});

export const updateChartSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  house_system: z
    .enum(['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'])
    .optional(),
  zodiac: z.enum(['tropical', 'sidereal']).optional(),
  sidereal_mode: z.string().optional(),
});

// Transit validators
export const calculateTransitsSchema = z
  .object({
    chartId: z.string().uuid(),
    startDate: z.string(), // ISO date string
    endDate: z.string(),   // ISO date string
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'endDate must be greater than startDate',
    path: ['endDate'],
  });

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Calendar event validators
export const createCalendarEventSchema = z.object({
  event_type: z.string().min(1).max(100),
  event_date: z.string(), // ISO date string
  event_data: z.record(z.unknown()).optional(),
  interpretation: z.string().max(5000).optional(),
});

// Reusable param schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const shareTokenParamSchema = z.object({
  shareToken: z.string().min(1).max(256),
});

export const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// ─── Validation middleware helpers ─────────────────────────────────────

/**
 * Validate request body against schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      });
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request query against schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      });
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
      return;
    }
    // Merge validated data into query (preserve original req.query structure)
    Object.assign(req.query, result.data);
    next();
  };
}

/**
 * Validate route params against schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const field = issue.path.join('.');
        return `${field}: ${issue.message}`;
      });
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
      return;
    }
    req.params = result.data as Record<string, string>;
    next();
  };
}
