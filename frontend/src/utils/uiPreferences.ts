/**
 * UI Preferences Utility
 *
 * Centralized utility for localStorage access to non-auth UI preferences.
 * This keeps localStorage usage consistent and trackable.
 * Auth tokens MUST use tokenStorage utility instead.
 */

/**
 * Get the last viewed date for the daily briefing
 * @returns ISO date string (YYYY-MM-DD) or null if never viewed
 */
export const getDailyBriefingLastViewed = (): string | null => {
  return localStorage.getItem('dailyBriefingLastViewed');
};

/**
 * Set the last viewed date for the daily briefing
 * @param date ISO date string (YYYY-MM-DD)
 */
export const setDailyBriefingLastViewed = (date: string): void => {
  localStorage.setItem('dailyBriefingLastViewed', date);
};

/**
 * Check if daily briefing was viewed today
 * @returns true if viewed today, false otherwise
 */
export const wasDailyBriefingViewedToday = (): boolean => {
  const lastViewed = getDailyBriefingLastViewed();
  const today = new Date().toISOString().split('T')[0];
  return lastViewed === today;
};
