/**
 * Timezone Service (Frontend)
 *
 * @requirement FINDING-008
 * @description Frontend timezone utilities using Luxon
 */

import { DateTime } from 'luxon';
import api from './api';

export interface TimezoneInfo {
  id: string;
  name: string;
  offset: number;
  offsetStr: string;
  isDST: boolean;
  isValid: boolean;
}

export interface TimezoneSearchResult {
  id: string;
  name: string;
  offset: string;
  country?: string;
}

class TimezoneServiceClass {
  /**
   * Get current timezones list
   */
  getCommonTimezones(): TimezoneSearchResult[] {
    const commonZones = [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Perth',
      'UTC',
    ];

    return commonZones.map((zone) => {
      const info = this.getTimezoneInfo(zone);
      return {
        id: zone,
        name: info.name,
        offset: info.offsetStr,
      };
    });
  }

  /**
   * Get timezone info for a timezone string
   */
  getTimezoneInfo(timezone: string, date?: Date): TimezoneInfo {
    const dt = date
      ? DateTime.fromJSDate(date, { zone: timezone })
      : DateTime.now().setZone(timezone);

    if (!dt.isValid) {
      return {
        id: timezone,
        name: timezone,
        offset: 0,
        offsetStr: '+00:00',
        isDST: false,
        isValid: false,
      };
    }

    const offset = dt.offset;

    return {
      id: timezone,
      name: this.getFriendlyName(timezone),
      offset,
      offsetStr: this.formatOffset(offset),
      isDST: this.isDST(dt, timezone),
      isValid: true,
    };
  }

  /**
   * Search timezones via API
   */
  async searchTimezones(query: string): Promise<TimezoneSearchResult[]> {
    try {
      const response = await api.get<{ data: { timezones: TimezoneSearchResult[] } }>('/timezone/search', {
        params: { q: query },
      });
      return response.data.data.timezones;
    } catch (error) {
      // Fallback to local search
      return this.localSearchTimezones(query);
    }
  }

  /**
   * Local timezone search (fallback)
   */
  private localSearchTimezones(query: string): TimezoneSearchResult[] {
    const zones: string[] = (Intl as unknown as Record<string, (key: string) => string[]>).supportedValuesOf?.('timeZone') ?? [];
    const normalizedQuery = query.toLowerCase();
    const results: TimezoneSearchResult[] = [];

    for (const zoneName of zones) {
      if (zoneName.toLowerCase().includes(normalizedQuery)) {
        const info = this.getTimezoneInfo(zoneName);
        if (info.isValid) {
          results.push({
            id: zoneName,
            name: info.name,
            offset: info.offsetStr,
          });
        }
      }

      if (results.length >= 20) break;
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Detect timezone from coordinates via API
   */
  async detectTimezone(
    latitude: number,
    longitude: number
  ): Promise<TimezoneInfo | null> {
    try {
      const response = await api.get<{ data: { info: TimezoneInfo } }>('/timezone/detect', {
        params: { lat: latitude, lng: longitude },
      });
      return response.data.data.info;
    } catch (error) {
      // Fallback to local detection
      const timezone = this.localDetectTimezone(latitude, longitude);
      if (timezone) {
        return this.getTimezoneInfo(timezone);
      }
      return null;
    }
  }

  /**
   * Local timezone detection
   * Uses browser Intl API as primary method, falls back to coordinate-based approximation
   */
  private localDetectTimezone(latitude: number, longitude: number): string | null {
    // Primary: use browser's built-in timezone detection
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (browserTz) return browserTz;
    } catch {
      // Intl not available, fall through to coordinate approximation
    }

    // Fallback: coordinate-based approximation
    if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
      // US - approximate by longitude
      if (longitude < -100) return 'America/Los_Angeles';
      if (longitude < -85) return 'America/Denver';
      if (longitude < -70) return 'America/Chicago';
      return 'America/New_York';
    }

    if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 40) {
      // Europe
      if (longitude < 0) return 'Europe/London';
      if (longitude < 10) return 'Europe/Paris';
      return 'Europe/Berlin';
    }

    return 'UTC';
  }

  /**
   * Convert birth time to UTC via API
   */
  async convertBirthTime(params: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone: string;
  }): Promise<{
    utcDate: string;
    offset: number;
    offsetStr: string;
    isDST: boolean;
    julianDay: number;
  }> {
    const response = await api.post<{ data: {
      utcDate: string;
      offset: number;
      offsetStr: string;
      isDST: boolean;
      julianDay: number;
    } }>('/timezone/convert', params);
    return response.data.data;
  }

  /**
   * Convert birth time locally using Luxon
   */
  convertBirthTimeLocal(params: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone: string;
  }): {
    utcDate: Date;
    localDate: DateTime;
    offset: number;
    isDST: boolean;
  } {
    const { year, month, day, hour, minute, timezone } = params;

    const localDate = DateTime.fromObject(
      { year, month, day, hour, minute },
      { zone: timezone }
    );

    if (!localDate.isValid) {
      throw new Error(`Invalid date/time: ${localDate.invalidExplanation}`);
    }

    return {
      utcDate: localDate.toUTC().toJSDate(),
      localDate,
      offset: localDate.offset,
      isDST: this.isDST(localDate, timezone),
    };
  }

  /**
   * Format date in timezone
   */
  formatDateInTimezone(
    date: Date,
    timezone: string,
    format = 'yyyy-MM-dd HH:mm'
  ): string {
    const dt = DateTime.fromJSDate(date, { zone: timezone });
    return dt.toFormat(format);
  }

  /**
   * Get current time in timezone
   */
  getCurrentTime(timezone: string): DateTime {
    return DateTime.now().setZone(timezone);
  }

  /**
   * Validate timezone string
   */
  isValidTimezone(timezone: string): boolean {
    try {
      const dt = DateTime.now().setZone(timezone);
      return dt.isValid;
    } catch {
      return false;
    }
  }

  // Private helpers

  private formatOffset(offsetMinutes: number): string {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private isDST(dt: DateTime, timezone: string): boolean {
    const year = dt.year;
    const janOffset = DateTime.fromObject(
      { year, month: 1, day: 15 },
      { zone: timezone }
    ).offset;
    const julOffset = DateTime.fromObject(
      { year, month: 7, day: 15 },
      { zone: timezone }
    ).offset;
    const standardOffset = Math.max(janOffset, julOffset);
    return dt.offset !== standardOffset;
  }

  private getFriendlyName(timezone: string): string {
    const friendlyNames: Record<string, string> = {
      'America/New_York': 'Eastern Time (US)',
      'America/Chicago': 'Central Time (US)',
      'America/Denver': 'Mountain Time (US)',
      'America/Los_Angeles': 'Pacific Time (US)',
      'America/Anchorage': 'Alaska Time',
      'Pacific/Honolulu': 'Hawaii Time',
      'Europe/London': 'GMT/BST (UK)',
      'Europe/Paris': 'Central European Time',
      'Europe/Berlin': 'Central European Time',
      'Europe/Moscow': 'Moscow Time',
      'Asia/Tokyo': 'Japan Standard Time',
      'Asia/Shanghai': 'China Standard Time',
      'Asia/Singapore': 'Singapore Time',
      'Asia/Dubai': 'Gulf Standard Time',
      'Asia/Kolkata': 'India Standard Time',
      'Australia/Sydney': 'Australian Eastern Time',
      'Australia/Melbourne': 'Australian Eastern Time',
      'Australia/Perth': 'Australian Western Time',
      'UTC': 'Coordinated Universal Time',
    };

    return friendlyNames[timezone] || timezone.replace(/_/g, ' ');
  }
}

export const timezoneService = new TimezoneServiceClass();

export default timezoneService;
