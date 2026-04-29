/**
 * Token Storage - Reads access token from Zustand in-memory state
 *
 * Refresh token is NOT stored on the frontend.
 * Backend sets refresh token as httpOnly cookie which the browser sends automatically.
 */

const AUTH_STORAGE_KEY = 'auth-storage';

interface PersistedAuthState {
  accessToken: string | null;
}

interface PersistedState {
  state: PersistedAuthState;
}

function readPersistedState(): PersistedAuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return readPersistedState()?.accessToken ?? null;
}
