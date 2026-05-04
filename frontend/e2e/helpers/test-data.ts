/**
 * Shared Test Data for E2E Tests
 * Consolidates constants and generators used across spec files.
 */

import type { APIRequestContext } from '@playwright/test';

export const API_BASE = 'http://localhost:3001/api/v1';

/** Unique suffix to avoid name/email collisions between tests. */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Generate a unique email for test isolation. */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}-${uid()}@example.com`;
}

/** Standard chart data used across chart creation, sharing, PDF, and transit tests. */
export const SAMPLE_CHART = {
  name: 'E2E Test Chart',
  birth_date: '1990-06-15',
  birth_time: '14:30:00',
  birth_place_name: 'New York, NY',
  birth_latitude: 40.7128,
  birth_longitude: -74.006,
  birth_timezone: 'America/New_York',
  house_system: 'placidus',
  zodiac: 'tropical',
} as const;

/** Standard test password used across all E2E tests. */
export const TEST_PASSWORD = 'E2Epass123!';

/** Fetch a CSRF token (sets cookie via Playwright request context). */
export async function fetchCsrfToken(request: APIRequestContext): Promise<string> {
  const res = await request.get(`${API_BASE}/csrf-token`);
  const body = await res.json();
  if (!body.success) throw new Error(`CSRF fetch failed: ${JSON.stringify(body)}`);
  return body.data.token as string;
}

/** Build headers with CSRF token for mutating API requests. */
export function csrfHeaders(csrfToken: string, auth?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  };
  if (auth) h['Authorization'] = `Bearer ${auth}`;
  return h;
}
