/**
 * Token Storage - Single source of truth for auth tokens
 *
 * Reads tokens from Zustand's persisted state (key: 'auth-storage').
 * Eliminates the dual-write problem where tokens were stored both in
 * Zustand persist AND raw localStorage keys.
 */

const AUTH_STORAGE_KEY = 'auth-storage';

interface PersistedAuthState {
  accessToken: string | null;
  refreshToken: string | null;
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

export function getRefreshToken(): string | null {
  return readPersistedState()?.refreshToken ?? null;
}
