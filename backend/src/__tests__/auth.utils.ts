/**
 * Authentication Test Utilities
 * Helper functions for mocking authentication in tests
 */

import jwt from 'jsonwebtoken';

/**
 * Generate a mock JWT token for testing
 * @param userId - User ID to include in token
 * @param expiresIn - Token expiration time (default: '1h')
 * @returns Mock JWT token
 */
export function generateMockToken(
  userId: number,
  expiresIn: string = '1h'
): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';

  return jwt.sign(
    {
      userId,
      email: `user${userId}@example.com`,
    },
    secret,
    { expiresIn: expiresIn as any }
  );
}

/**
 * Create a mock Authorization header value
 * @param userId - User ID to include in token
 * @returns Authorization header string with Bearer token
 */
export function mockAuthHeader(userId: number): string {
  const token = generateMockToken(userId);
  return `Bearer ${token}`;
}

/**
 * Create an expired mock token for testing expired token scenarios
 * @param userId - User ID to include in token
 * @returns Expired JWT token
 */
export function generateExpiredToken(userId: number): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';

  return jwt.sign(
    {
      userId,
      email: `user${userId}@example.com`,
    },
    secret,
    { expiresIn: '-1h' as any } // Expired 1 hour ago
  );
}

/**
 * Create a mock invalid token (malformed)
 * @returns Invalid token string
 */
export function generateInvalidToken(): string {
  return 'invalid.token.string';
}

/**
 * Extract user ID from a mock token
 * @param token - JWT token
 * @returns User ID from token payload
 */
export function extractUserIdFromToken(token: string): number {
  const secret = process.env.JWT_SECRET || 'test-secret-key';

  try {
    const decoded = jwt.verify(token, secret) as any;
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
