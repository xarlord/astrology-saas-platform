/**
 * Live Integration Test Helpers
 * Shared utilities for all live test suites
 */

export const BASE_URL = 'http://localhost:3001/api/v1';

export const TEST_USER = {
  name: 'Live Test User',
  email: `livetest-${Date.now()}@astroverse.com`,
  password: 'LiveTest123!',
};

export const SAMPLE_CHART = {
  name: 'Test Natal Chart',
  birth_date: '1990-06-15',
  birth_time: '14:30:00',
  birth_place_name: 'New York, NY, USA',
  birth_latitude: 40.7128,
  birth_longitude: -74.006,
  birth_timezone: 'America/New_York',
  house_system: 'placidus',
  zodiac: 'tropical',
};

export const SECOND_CHART = {
  name: 'Partner Natal Chart',
  birth_date: '1988-03-22',
  birth_time: '09:15:00',
  birth_place_name: 'London, UK',
  birth_latitude: 51.5074,
  birth_longitude: -0.1278,
  birth_timezone: 'Europe/London',
  house_system: 'placidus',
  zodiac: 'tropical',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse a cookie string into a Map (name -> value).
 * Handles duplicate names by keeping the last value.
 */
function parseCookies(cookieStr: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieStr) return map;
  for (const pair of cookieStr.split(';')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    map.set(name, value);
  }
  return map;
}

/**
 * Merge new set-cookie values into an existing cookie string.
 * Deduplicates by name, keeping the latest value for each cookie.
 */
function mergeCookies(existing: string, newCookies: string[]): string {
  const map = parseCookies(existing);
  for (const raw of newCookies) {
    const pair = raw.split(';')[0].trim();
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    map.set(name, value);
  }
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * Check if the server is running
 */
export async function checkServerRunning(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:3001/health');
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Make an API request to the live server with automatic retry on 429
 */
export async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
  retries = 2
) {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
  };
  if (body) opts.body = JSON.stringify(body);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(BASE_URL + path, opts);
    const setCookie = res.headers.getSetCookie?.() || [];
    let json: Record<string, unknown>;
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      const text = await res.text().catch(() => '');
      json = { success: false, error: { message: text }, status: res.status };
    }

    if (res.status === 429 && attempt < retries) {
      const delay = 1000 * Math.pow(2, attempt); // 1s, 2s (with retries=2)
      await sleep(delay);
      continue;
    }

    return { status: res.status, data: json, cookies: setCookie, headers: res.headers };
  }

  // Should not reach here, but just in case
  throw new Error(`Request to ${path} failed after ${retries + 1} attempts (429 rate limit)`);
}

/**
 * Get CSRF token.
 * Merges response cookies into existing cookies with proper deduplication.
 */
export async function getCsrf(cookies?: string): Promise<{ csrf: string; cookies: string }> {
  const headers: Record<string, string> = {};
  if (cookies) headers.Cookie = cookies;
  try {
    const res = await api('GET', '/csrf-token', undefined, headers, 1);
    const merged = mergeCookies(cookies || '', res.cookies);
    const payload = (res.data?.data ?? {}) as Record<string, unknown>;
    const csrf = (payload.token as string) || '';
    return { csrf, cookies: merged };
  } catch {
    return { csrf: '', cookies: cookies || '' };
  }
}

/**
 * Make an authenticated API request
 */
export async function authed(
  method: string,
  path: string,
  token: string,
  cookies: string,
  csrf: string,
  body?: Record<string, unknown>
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Cookie: cookies || '',
  };
  if (csrf) headers['X-CSRF-Token'] = csrf;
  return api(method, path, body, headers);
}

/**
 * Register a test user and return auth credentials
 */
export async function registerTestUser(): Promise<{
  accessToken: string;
  refreshToken: string;
  cookies: string;
  user: Record<string, unknown>;
}> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const testUser = {
    name: `Test-${suffix}`,
    email: `fulltest-${suffix}@astroverse.com`,
    password: 'TestPass123!',
  };

  const res = await api('POST', '/auth/register', testUser, undefined, 5);

  if (res.status !== 201) {
    throw new Error(`Registration failed: ${res.status} ${JSON.stringify(res.data)}`);
  }

  const authCookies = mergeCookies('', res.cookies);
  const authPayload = (res.data?.data ?? {}) as Record<string, unknown>;

  return {
    accessToken: authPayload.accessToken as string,
    refreshToken: authPayload.refreshToken as string,
    cookies: authCookies,
    user: (authPayload.user ?? {}) as Record<string, unknown>,
  };
}

/**
 * Register user and create a chart in one step
 */
export async function setupUserWithChart(chartOverrides?: Record<string, unknown>): Promise<{
  accessToken: string;
  refreshToken: string;
  cookies: string;
  user: Record<string, unknown>;
  chart: Record<string, unknown>;
}> {
  // Retry the whole setup up to 3 times to handle rate limiting
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const auth = await registerTestUser();

      const chartData = { ...SAMPLE_CHART, ...chartOverrides };
      const chartRes = await authed('POST', '/charts', auth.accessToken, auth.cookies, '', chartData);

      if (chartRes.status !== 201) {
        if (chartRes.status === 429) {
          await sleep(3000 * (attempt + 1));
          continue;
        }
        throw new Error(`Chart creation failed: ${chartRes.status} ${JSON.stringify(chartRes.data)}`);
      }

      const chartPayload = (chartRes.data?.data ?? {}) as Record<string, unknown>;
      const createdChart = (chartPayload.chart ?? {}) as Record<string, unknown>;

      // Calculate the chart so analysis and other endpoints have data
      const { csrf: calcCsrf, cookies: calcCookies } = await getCsrf(auth.cookies);
      const calcRes = await authed('POST', `/charts/${createdChart.id}/calculate`, auth.accessToken, calcCookies, calcCsrf, {});
      const calcPayload = (calcRes.data?.data ?? {}) as Record<string, unknown>;

      if (calcRes.status === 200 && calcPayload.chart) {
        // Use the fully-calculated chart object
        return { ...auth, cookies: calcCookies, chart: (calcPayload.chart ?? {}) as Record<string, unknown> };
      }

      return {
        ...auth,
        cookies: calcCookies,
        chart: createdChart,
      };
    } catch (err) {
      if (attempt < 2 && (err instanceof Error && err.message.includes('429'))) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw new Error('setupUserWithChart failed after 3 attempts');
}

/**
 * Clean up test data after tests complete
 */
export async function cleanupTestData(accessToken: string, cookies: string): Promise<void> {
  try {
    // Get user's charts and delete them
    const chartsRes = await authed('GET', '/charts', accessToken, cookies, '');
    const chartsPayload = (chartsRes.data?.data ?? {}) as Record<string, unknown>;
    if (chartsRes.status === 200 && Array.isArray(chartsPayload.charts)) {
      for (const chart of chartsPayload.charts as Array<Record<string, unknown>>) {
        if (chart.id) {
          await authed('DELETE', `/charts/${chart.id}`, accessToken, cookies, '');
        }
      }
    }
  } catch {
    // Cleanup is best-effort
  }
}
