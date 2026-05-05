/**
 * Uploads Endpoint Tests
 * Verifies that /uploads/* routes are handled by the server
 */

import request from 'supertest';
import app from '../../server';

describe('GET /uploads/* - Route Handling', () => {
  it('should return 404 for non-existent upload files', async () => {
    const response = await request(app)
      .get('/uploads/test-file.png');

    // No static file serving or /uploads route configured
    expect(response.status).toBe(404);
  });

  it('should return 404 for upload path without file', async () => {
    const response = await request(app)
      .get('/uploads/');

    expect(response.status).toBe(404);
  });
});
