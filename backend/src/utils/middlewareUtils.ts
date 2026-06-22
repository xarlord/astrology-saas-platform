/**
 * Type-safe middleware utilities
 *
 * Common middleware utilities with proper TypeScript typing.
 */

import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Re-export middleware types for convenience
 */
export type { AuthenticatedRequest } from '../middleware/auth';

/**
 * Type-safe middleware wrapper
 * 
 * Use this to wrap middleware functions that use AuthenticatedRequest
 * instead of Express's standard Request type.
 * 
 * Example:
 * ```ts
 * export const myMiddleware = asRequestHandler(async (req, res, next) => {
 *   // req is properly typed as AuthenticatedRequest
 *   const userId = req.user.id; // Type-safe!
 * });
 * ```
 */
export const asRequestHandler = (
  handler: (req: AuthenticatedRequest, res: any, next: any) => Promise<void> | void
): RequestHandler => {
  return handler as RequestHandler;
};
