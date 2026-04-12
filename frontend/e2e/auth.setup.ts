/**
 * Auth Setup for Playwright
 *
 * This file runs as part of the 'setup' project before any authenticated tests.
 * It registers a test user, seeds a test chart, and saves the auth state
 * to 'e2e/.auth/user.json' for reuse by the 'authenticated-chromium' project.
 */

import { test as setup, expect } from '@playwright/test';
import {
  registerAndLogin,
  createChart,
  defaultChartData,
} from './helpers/api-helpers';

const AUTH_FILE = 'e2e/.auth/user.json';

setup('authenticate and seed test data', async ({ request }) => {
  // Register a new test user
  const auth = await registerAndLogin(request);

  // Seed a test chart for the user
  await createChart(request, auth.accessToken, defaultChartData('setup'));

  // Build localStorage entries matching what the frontend expects.
  // The frontend stores tokens in two places:
  //   1. Directly in localStorage (read by the axios interceptor in api.ts)
  //   2. In Zustand's persisted state under 'auth-storage' key (read by authStore.ts)
  const zustandAuthState = JSON.stringify({
    state: {
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
    version: 0,
  });

  // Save storage state for reuse by authenticated test projects
  await request.storageState({
    path: AUTH_FILE,
  });

  // Now we need to add localStorage entries to the saved state file.
  // Playwright's storageState() only captures cookies by default from API contexts.
  // We manually merge in the localStorage entries.
  const fs = await import('fs');
  const existingState = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  const localStorageEntries = [
    { name: 'accessToken', value: auth.accessToken },
    { name: 'refreshToken', value: auth.refreshToken || '' },
    { name: 'auth-storage', value: zustandAuthState },
  ];

  // Merge with existing origins or create new one
  const existingOrigin = existingState.origins?.find(
    (o: { origin: string }) => o.origin === baseUrl,
  );

  if (existingOrigin) {
    existingOrigin.localStorage.push(...localStorageEntries);
  } else {
    existingState.origins = [
      ...(existingState.origins ?? []),
      {
        origin: baseUrl,
        localStorage: localStorageEntries,
      },
    ];
  }

  fs.writeFileSync(AUTH_FILE, JSON.stringify(existingState, null, 2));

  // Verify the auth works by calling the profile endpoint
  const profileResponse = await request.get('http://localhost:3001/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  expect(profileResponse.ok()).toBeTruthy();
});
