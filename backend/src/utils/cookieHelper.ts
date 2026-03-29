/**
 * Cookie Helper Utilities
 * Provides secure HttpOnly cookie management for authentication tokens
 */

import { Response } from 'express';

export interface TokenCookies {
  accessToken: string;
  refreshToken: string;
}

/**
 * Cookie configuration options
 */
const COOKIE_OPTIONS = {
  // HttpOnly prevents JavaScript access (XSS protection)
  httpOnly: true,
  // Secure in production (HTTPS only)
  secure: process.env.NODE_ENV === 'production',
  // SameSite strict for CSRF protection
  sameSite: 'strict' as const,
  // Path for cookie scope
  path: '/',
  // Domain (optional, for subdomain support)
  domain: process.env.COOKIE_DOMAIN || undefined,
};

/**
 * Access token cookie name
 */
export const ACCESS_TOKEN_COOKIE = 'accessToken';

/**
 * Refresh token cookie name
 */
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

/**
 * Set authentication cookies on response
 * Uses HttpOnly cookies to prevent XSS token theft
 */
export function setAuthCookies(res: Response, tokens: TokenCookies): void {
  // Access token: 1 hour expiry
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // Refresh token: 7 days expiry
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear authentication cookies
 * Call on logout to remove tokens
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    path: COOKIE_OPTIONS.path,
    domain: COOKIE_OPTIONS.domain,
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: COOKIE_OPTIONS.path,
    domain: COOKIE_OPTIONS.domain,
  });
}

/**
 * Get tokens from cookies
 */
export function getTokensFromCookies(req: { cookies: Record<string, string> }): {
  accessToken?: string;
  refreshToken?: string;
} {
  return {
    accessToken: req.cookies[ACCESS_TOKEN_COOKIE],
    refreshToken: req.cookies[REFRESH_TOKEN_COOKIE],
  };
}

/**
 * Check if request has valid auth cookies
 */
export function hasAuthCookies(req: { cookies: Record<string, string> }): boolean {
  return !!(req.cookies[ACCESS_TOKEN_COOKIE] && req.cookies[REFRESH_TOKEN_COOKIE]);
}
