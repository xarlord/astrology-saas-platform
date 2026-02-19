/**
 * API Version Middleware
 * Adds API version information to responses
 */

import { Request, Response, NextFunction } from 'express';

export const addApiVersionHeaders = (req: Request, res: Response, next: NextFunction) => {
  const version = req.path.match(/\/api\/v(\d+)/)?.[1] || '1';

  res.setHeader('API-Version', `v${version}`);
  res.setHeader('X-API-Version', version);

  // Add deprecation warning for old versions
  if (version === '1') {
    res.setHeader('X-API-Deprecation', 'This API version is stable. Consider migrating to v2 when available.');
  }

  next();
};

export const validateApiVersion = (req: Request, res: Response, next: NextFunction): void => {
  const version = req.path.match(/\/api\/v(\d+)/)?.[1];

  if (version && parseInt(version) > 2) {
    res.status(400).json({
      error: 'Invalid API version',
      message: 'API version must be v1 or v2',
      supported_versions: ['v1', 'v2']
    });
    return;
  }

  next();
};
