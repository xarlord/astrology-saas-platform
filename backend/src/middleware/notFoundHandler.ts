/**
 * 404 Not Found Handler
 */

import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
    },
  });
};
