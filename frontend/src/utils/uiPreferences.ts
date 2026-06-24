/**
 * UI Preferences Utility
 *
 * Centralized utility for localStorage access to non-auth UI preferences.
 * This keeps localStorage usage consistent and trackable.
 * Auth tokens MUST use tokenStorage utility instead.
 *
 * Re-exports from uiStorage for backward compatibility.
 */

// Re-export daily briefing functions from uiStorage
export {
  getDailyBriefingLastViewed,
  setDailyBriefingLastViewed,
  wasDailyBriefingViewedToday,
} from './uiStorage';
