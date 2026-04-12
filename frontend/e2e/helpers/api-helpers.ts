/**
 * E2E API Helpers
 * Typed helper functions using Playwright's APIRequestContext
 * for interacting with the AstroVerse backend API.
 */

import type { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/v1';

// Cache CSRF token to avoid fetching it for every request
let csrfToken: string | null = null;

/**
 * Fetch a CSRF token from the backend.
 * Caches the token for subsequent requests.
 * Returns empty string if CSRF is disabled (test environment).
 */
async function getCsrfToken(request: APIRequestContext): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await request.get(`${API_BASE}/health/csrf-token`);
    if (response.status() === 200) {
      const body = await response.json();
      csrfToken = body.data.token;
      return csrfToken;
    }
  } catch (error) {
    // CSRF endpoint might not exist or CSRF is disabled in test environment
    console.log('CSRF token fetch failed, proceeding without CSRF token');
  }

  // Return empty string if CSRF is disabled or not available
  return '';
}

// --- Response Types ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  timezone: string;
  plan: string;
  preferences: Record<string, unknown>;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface Chart {
  id: string;
  name: string;
  type: string;
  birth_date: string;
  birth_time: string;
  birth_place_name: string;
  calculated_data?: Record<string, unknown>;
  created_at: string;
}

export interface ChartData {
  name: string;
  type?: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: string;
  birth_time: string;
  birth_time_unknown?: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system?: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac?: 'tropical' | 'sidereal';
  sidereal_mode?: string;
}

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    message: string;
  };
}

// --- Helper ---

async function authHeaders(token: string, request: APIRequestContext): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Add CSRF token for state-changing requests (if available)
  const csrf = await getCsrfToken(request);
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }

  return headers;
}

// --- Auth ---

/**
 * Register a new user via the API.
 */
export async function registerUser(
  request: APIRequestContext,
  userData: { name: string; email: string; password: string },
): Promise<AuthResponse> {
  const csrf = await getCsrfToken(request);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add CSRF token if it's available (not disabled)
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }

  const response = await request.post(`${API_BASE}/auth/register`, {
    data: userData,
    headers,
  });

  if (response.status() !== 201) {
    const body = (await response.json().catch(() => ({ error: { message: response.statusText() } }))) as ApiError;
    throw new Error(`Registration failed (${response.status()}): ${body.error?.message ?? response.statusText()}`);
  }

  const body = (await response.json()) as ApiWrapper<AuthResponse>;
  return body.data;
}

/**
 * Login an existing user via the API.
 */
export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const csrf = await getCsrfToken(request);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add CSRF token if it's available (not disabled)
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }

  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
    headers,
  });

  if (response.status() !== 200) {
    const body = (await response.json().catch(() => ({ error: { message: response.statusText() } }))) as ApiError;
    throw new Error(`Login failed (${response.status()}): ${body.error?.message ?? response.statusText()}`);
  }

  const body = (await response.json()) as ApiWrapper<AuthResponse>;
  return body.data;
}

/**
 * Register and login a user in one step.
 * Returns the full auth response with tokens.
 */
export async function registerAndLogin(
  request: APIRequestContext,
  userData?: { name?: string; email?: string; password?: string },
): Promise<AuthResponse> {
  const email = userData?.email ?? `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@astroverse.com`;
  const password = userData?.password ?? 'E2eTest123!';

  return registerUser(request, {
    name: userData?.name ?? 'E2E Test User',
    email,
    password,
  });
}

// --- Charts ---

/**
 * Create a new chart for the authenticated user.
 */
export async function createChart(
  request: APIRequestContext,
  token: string,
  chartData: ChartData,
): Promise<Chart> {
  const headers = await authHeaders(token, request);
  const response = await request.post(`${API_BASE}/charts`, {
    headers,
    data: chartData,
  });

  if (response.status() !== 201) {
    const body = (await response.json().catch(() => ({ error: { message: response.statusText() } }))) as ApiError;
    throw new Error(`Chart creation failed (${response.status()}): ${body.error?.message ?? response.statusText()}`);
  }

  const body = (await response.json()) as ApiWrapper<{ chart: Chart }>;
  return body.data.chart;
}

/**
 * Get all charts for the authenticated user.
 */
export async function getCharts(
  request: APIRequestContext,
  token: string,
  page = 1,
  limit = 20,
): Promise<{ charts: Chart[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const headers = await authHeaders(token, request);
  const response = await request.get(`${API_BASE}/charts?page=${page}&limit=${limit}`, {
    headers,
  });

  if (response.status() !== 200) {
    const body = (await response.json().catch(() => ({ error: { message: response.statusText() } }))) as ApiError;
    throw new Error(`Get charts failed (${response.status()}): ${body.error?.message ?? response.statusText()}`);
  }

  const body = (await response.json()) as ApiWrapper<{ charts: Chart[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
  return body.data;
}

/**
 * Delete a chart for the authenticated user.
 */
export async function deleteChart(
  request: APIRequestContext,
  token: string,
  chartId: string,
): Promise<void> {
  const headers = await authHeaders(token, request);
  const response = await request.delete(`${API_BASE}/charts/${chartId}`, {
    headers,
  });

  if (response.status() !== 200 && response.status() !== 204) {
    const body = (await response.json().catch(() => ({ error: { message: response.statusText() } }))) as ApiError;
    throw new Error(`Chart deletion failed (${response.status()}): ${body.error?.message ?? response.statusText()}`);
  }
}

// --- Cleanup ---

/**
 * Delete all charts for the authenticated user (cleanup helper).
 */
export async function deleteAllCharts(
  request: APIRequestContext,
  token: string,
): Promise<void> {
  const { charts } = await getCharts(request, token, 1, 100);
  await Promise.all(charts.map((chart) => deleteChart(request, token, chart.id)));
}

/**
 * Cleanup user data. Best-effort deletion of user charts.
 * Note: The API does not expose a user deletion endpoint,
 * so this only cleans up associated data.
 */
export async function cleanupUser(
  request: APIRequestContext,
  token: string,
): Promise<void> {
  try {
    await deleteAllCharts(request, token);
  } catch {
    // Best-effort cleanup - don't fail tests on cleanup errors
  }
}

// --- Default test data ---

/**
 * Generate unique test user data.
 */
export function generateTestUser() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `E2E User ${id}`,
    email: `e2e-${id}@astroverse.com`,
    password: 'E2eTest123!',
  };
}

/**
 * Default chart data for testing.
 */
export function defaultChartData(suffix?: string): ChartData {
  return {
    name: `Test Chart ${suffix ?? Date.now()}`,
    type: 'natal',
    birth_date: '1990-01-15',
    birth_time: '14:30',
    birth_place_name: 'New York, NY, USA',
    birth_latitude: 40.7128,
    birth_longitude: -74.006,
    birth_timezone: 'America/New_York',
    house_system: 'placidus',
    zodiac: 'tropical',
  };
}
