/**
 * Tests for uiPreferences utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDailyBriefingLastViewed,
  setDailyBriefingLastViewed,
  wasDailyBriefingViewedToday,
} from '../uiPreferences';

describe('uiPreferences utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock Date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-22T12:00:00Z'));
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('getDailyBriefingLastViewed', () => {
    it('should return null if never viewed', () => {
      const result = getDailyBriefingLastViewed();
      expect(result).toBeNull();
    });

    it('should return the date string if previously set', () => {
      localStorage.setItem('dailyBriefingLastViewed', '2026-06-22');
      const result = getDailyBriefingLastViewed();
      expect(result).toBe('2026-06-22');
    });
  });

  describe('setDailyBriefingLastViewed', () => {
    it('should store the date in localStorage', () => {
      setDailyBriefingLastViewed('2026-06-22');
      expect(localStorage.getItem('dailyBriefingLastViewed')).toBe('2026-06-22');
    });

    it('should overwrite existing value', () => {
      setDailyBriefingLastViewed('2026-06-21');
      setDailyBriefingLastViewed('2026-06-22');
      expect(localStorage.getItem('dailyBriefingLastViewed')).toBe('2026-06-22');
    });
  });

  describe('wasDailyBriefingViewedToday', () => {
    it('should return false if never viewed', () => {
      const result = wasDailyBriefingViewedToday();
      expect(result).toBe(false);
    });

    it('should return true if viewed today', () => {
      // Set to the mocked today's date
      setDailyBriefingLastViewed('2026-06-22');
      const result = wasDailyBriefingViewedToday();
      expect(result).toBe(true);
    });

    it('should return false if viewed yesterday', () => {
      // Set to yesterday's date
      setDailyBriefingLastViewed('2026-06-21');
      const result = wasDailyBriefingViewedToday();
      expect(result).toBe(false);
    });
  });
});
