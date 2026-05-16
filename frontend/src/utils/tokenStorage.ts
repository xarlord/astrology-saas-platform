/**
 * Token Storage - Reads access token from Zustand in-memory state
 *
 * Refresh token is NOT stored on the frontend.
 * Backend sets refresh token as httpOnly cookie which the browser sends automatically.
 */

import { useAuthStore } from '../stores/authStore';

export function getAccessToken(): string | null {
  // Read directly from Zustand store's current state (in-memory)
  return useAuthStore.getState().token;
}
