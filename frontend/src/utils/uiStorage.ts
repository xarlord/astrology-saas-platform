/**
 * UI Storage Utility
 * Centralized localStorage access for non-auth UI preferences
 *
 * For auth tokens, use tokenStorage utility (reads from Zustand store)
 */

const KEYS = {
  DAILY_BRIEFING_LAST_VIEWED: 'dailyBriefingLastViewed',
  THEME: 'theme',
  RECENT_LOCATION_SEARCHES: 'recentLocationSearches',
  LEARN_PAGE_COMPLETED: 'astroscope-learn-completed',
  ONBOARDING_DONE: 'astroscope_onboarding_done',
  SHARE_TEMPLATE: 'astroverse-share-template',
} as const;

/**
 * Get daily briefing last viewed date
 */
export function getDailyBriefingLastViewed(): string | null {
  return localStorage.getItem(KEYS.DAILY_BRIEFING_LAST_VIEWED);
}

/**
 * Set daily briefing last viewed date
 */
export function setDailyBriefingLastViewed(date: string): void {
  localStorage.setItem(KEYS.DAILY_BRIEFING_LAST_VIEWED, date);
}

/**
 * Get theme preference
 */
export function getTheme(): string | null {
  return localStorage.getItem(KEYS.THEME);
}

/**
 * Set theme preference
 */
export function setTheme(theme: string): void {
  localStorage.setItem(KEYS.THEME, theme);
}

/**
 * Get recent location searches
 */
export function getRecentLocationSearches(): { name: string; country: string; latitude: number; longitude: number; timezone: string }[] {
  try {
    const stored = localStorage.getItem(KEYS.RECENT_LOCATION_SEARCHES);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as { name: string; country: string; latitude: number; longitude: number; timezone: string }[]) : [];
  } catch {
    return [];
  }
}

/**
 * Add location to recent searches (max 10, LRU eviction)
 */
export function addRecentLocationSearch(location: { name: string; country: string; latitude: number; longitude: number; timezone: string }): void {
  try {
    const current = getRecentLocationSearches();
    const filtered = current.filter((l) => l.name !== location.name);
    const updated = [location, ...filtered].slice(0, 10);
    localStorage.setItem(KEYS.RECENT_LOCATION_SEARCHES, JSON.stringify(updated));
  } catch {
    // Silently swallow storage errors (e.g. quota exceeded, private mode)
    // to match the defensive error handling used elsewhere in the codebase.
  }
}

/**
 * Clear all recent location searches
 */
export function clearRecentLocationSearches(): void {
  try {
    localStorage.removeItem(KEYS.RECENT_LOCATION_SEARCHES);
  } catch {
    // Silently swallow storage errors (e.g. private mode)
  }
}

/**
 * Get Learn page completed sections
 */
export function getLearnPageCompleted(): string[] {
  const stored = localStorage.getItem(KEYS.LEARN_PAGE_COMPLETED);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Add completed section to Learn page progress
 */
export function addLearnPageCompleted(sectionId: string): void {
  const completed = getLearnPageCompleted();
  if (!completed.includes(sectionId)) {
    completed.push(sectionId);
    localStorage.setItem(KEYS.LEARN_PAGE_COMPLETED, JSON.stringify(completed));
  }
}

/**
 * Check if onboarding is done
 */
export function isOnboardingDone(): boolean {
  return localStorage.getItem(KEYS.ONBOARDING_DONE) === 'true';
}

/**
 * Mark onboarding as done
 */
export function setOnboardingDone(): void {
  localStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}

/**
 * Get share card template
 */
export function getShareTemplate(): string | null {
  return localStorage.getItem(KEYS.SHARE_TEMPLATE);
}

/**
 * Set share card template
 */
export function setShareTemplate(template: string): void {
  localStorage.setItem(KEYS.SHARE_TEMPLATE, template);
}

/**
 * Check if daily briefing was viewed today
 */
export function wasDailyBriefingViewedToday(): boolean {
  const lastViewed = getDailyBriefingLastViewed();
  if (!lastViewed) return false;
  const today = new Date().toISOString().split('T')[0];
  return lastViewed === today;
}

/**
 * Generic storage methods for dynamic keys
 * Handles errors gracefully (e.g., private browsing mode, quota exceeded)
 */
export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently swallow storage errors
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently swallow storage errors
  }
}
