/**
 * Uploads Endpoint Authentication Tests
 * TDD: RED phase - tests must fail before implementation
 */

import express, { Request, Response } from 'express';
import request from 'supertest';
import { authenticate } from '../../middleware/auth';
import { errorHandler } from '../../middleware/errorHandler';

// Create a minimal Express app that mounts the uploads route with auth middleware
const app = express();

// Mount a static uploads route protected by authenticate middleware
app.use('/uploads', authenticate, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'File served' });
});

app.use(errorHandler);

describe('GET /uploads/* - Authentication Required', () => {
  it('should return 401 without authentication token', async () => {
    const response = await request(app)
      .get('/uploads/test-file.png');

    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid authentication token', async () => {
    const response = await request(app)
      .get('/uploads/test-file.png')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
