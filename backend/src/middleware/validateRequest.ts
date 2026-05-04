/**
 * Validation Middleware
 * Validates request bodies against Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError';

/**
 * Extend Express Request to include validated data
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validated?: unknown;
    }
  }
}

/**
 * Middleware factory that validates request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.post('/register',
 *   validateRequest(RegisterSchema),
 *   authController.register
 * );
 * ```
 */
export function validateRequest<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate request body
      const validatedData = schema.parse(req.body);

      // Attach validated data to request
      req.validated = validatedData;

      // Continue to next middleware
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((err) => {
            const field = err.path.join('.');
            const message = err.message;
            return `${field}: ${message}`;
          })
          .join(', ');

        res.status(400).json({
          success: false,
          error: `Validation failed: ${errorMessages}`,
          validationErrors: error.issues,
        });
        return;
      }

      // Handle other errors
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      // Unknown error
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }
  };
}
