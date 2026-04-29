/**
 * Uploads Endpoint Authentication Tests
 * TDD: RED phase - tests must fail before implementation
 */

import request from 'supertest';
import app from '../../server';

describe('GET /uploads/* - Authentication Required', () => {
  it('should return 401 without authentication token', async () => {
    const response = await request(app)
      .get('/uploads/test-file.png')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  it('should return 401 with invalid authentication token', async () => {
    const response = await request(app)
      .get('/uploads/test-file.png')
      .set('Authorization', 'Bearer invalid-token')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });
});
