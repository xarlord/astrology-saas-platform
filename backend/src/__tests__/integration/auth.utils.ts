/**
 * Authentication Test Utilities for Integration Tests
 */

import jwt from 'jsonwebtoken';
import config from '../../config';

/**
 * Create a mock Authorization header value
 */
export function mockAuthHeader(userId: number): string {
  const secret = config.jwt.secret;

  const token = jwt.sign(
    {
      userId,
      email: `user${userId}@example.com`,
    },
    secret,
    { expiresIn: '1h' as any }
  );

  return `Bearer ${token}`;
}
