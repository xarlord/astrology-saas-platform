/**
 * Timezone Service
 *
 * @requirement FINDING-008
 * @description Timezone handling and historical timezone data using Luxon
 * Handles DST transitions, historical timezone changes, and coordinate-based timezone detection
 */

import { DateTime, IANAZone } from 'luxon';

export interface TimezoneInfo {
  id: string;
  name: string;
  offset: number; // minutes from UTC
  offsetStr: string; // e.g., "+05:30"
  isDST: boolean;
  isValid: boolean;
}

export interface BirthTimeConversion {
  utcDate: Date;
  localDate: DateTime;
  timezone: string;
  offset: number;
  isDST: boolean;
  julianDay: number;
}

export interface TimezoneSearchResult {
  id: string;
  name: string;
  offset: string;
  country?: string;
}

export class TimezoneService {
  /**
   * Convert local birth time to UTC using timezone
   */
  convertBirthTimeToUTC(params: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone: string;
    latitude?: number;
    longitude?: number;
  }): BirthTimeConversion {
    const { year, month, day, hour, minute, timezone } = params;

    // Create DateTime in the specified timezone
    const localDate = DateTime.fromObject(
      { year, month, day, hour, minute },
      { zone: timezone }
    );

    if (!localDate.isValid) {
      throw new Error(`Invalid date/time for timezone ${timezone}: ${localDate.invalidExplanation}`);
    }

    // Get UTC date
    const utcDate = localDate.toUTC().toJSDate();

    // Get timezone info
    const offset = localDate.offset; // minutes from UTC
    const isDST = this.isDST(localDate, timezone);

    // Calculate Julian Day
    const julianDay = this.calculateJulianDay(utcDate);

    return {
      utcDate,
      localDate,
      timezone,
      offset,
      isDST,
      julianDay,
    };
  }

  /**
   * Get timezone information for a given date and timezone
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

    const _zone = dt.zone as IANAZone;
    const offset = dt.offset;

    return {
      id: _zone.name,
      name: this.getTimezoneName(_zone, dt),
      offset,
      offsetStr: this.formatOffset(offset),
      isDST: this.isDST(dt, timezone),
      isValid: true,
    };
  }

  /**
   * Detect timezone from coordinates (simplified - uses timezone names)
   * In production, use @turf/tz or timezone-boundary-builder
   */
  detectTimezoneFromCoordinates(latitude: number, longitude: number): string | null {
    // Simplified timezone detection based on longitude ranges
    // This is a basic approximation - production should use proper geo-timezone

    // Common timezone offsets by longitude

    // Adjust for known exceptions (very simplified)
    if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
      // Continental US - return Eastern as default, should be refined
      return 'America/New_York';
    }

    if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 40) {
      // Europe
      if (longitude < 0) return 'Europe/London';
      if (longitude < 10) return 'Europe/Paris';
      return 'Europe/Berlin';
    }

    if (latitude >= 20 && latitude <= 45 && longitude >= 120 && longitude <= 150) {
      // Japan/Korea
      return 'Asia/Tokyo';
    }

    if (latitude >= -10 && latitude <= 10 && longitude >= 90 && longitude <= 140) {
      // Indonesia
      return 'Asia/Jakarta';
    }

    // Default to UTC
    return 'UTC';
  }

  /**
   * Search timezones by query
   */
  searchTimezones(query: string): TimezoneSearchResult[] {
    const normalizedQuery = query.toLowerCase();
    // Luxon 3.x removed Info.listZones() — use Intl API instead
    const zones: string[] = Intl.supportedValuesOf?.('timeZone') || [];

    const results: TimezoneSearchResult[] = [];

    for (const zoneName of zones) {
      if (zoneName.toLowerCase().includes(normalizedQuery)) {
        const info = this.getTimezoneInfo(zoneName);
        if (info.isValid) {
          results.push({
            id: zoneName,
            name: info.name,
            offset: info.offsetStr,
            country: this.extractCountry(zoneName),
          });
        }
      }

      if (results.length >= 20) break;
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get common timezones for a region
   */
  getCommonTimezones(region?: string): TimezoneSearchResult[] {
    const commonZones: Record<string, string[]> = {
      'US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'],
      'EU': ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Athens'],
      'ASIA': ['Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata'],
      'AU': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Brisbane'],
    };

    const zones = region ? (commonZones[region.toUpperCase()] || []) : [
      ...commonZones.US,
      ...commonZones.EU,
      ...commonZones.ASIA,
      ...commonZones.AU,
    ];

    return zones.map(zone => {
      const info = this.getTimezoneInfo(zone);
      return {
        id: zone,
        name: info.name,
        offset: info.offsetStr,
        country: this.extractCountry(zone),
      };
    });
  }

  /**
   * Validate timezone string
   */
  isValidTimezone(timezone: string): boolean {
    try {
      const zone = new IANAZone(timezone);
      return zone.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Get current time in timezone
   */
  getCurrentTime(timezone: string): DateTime {
    return DateTime.now().setZone(timezone);
  }

  /**
   * Format date in timezone
   */
  formatDateInTimezone(date: Date, timezone: string, format: string = 'yyyy-MM-dd HH:mm'): string {
    const dt = DateTime.fromJSDate(date, { zone: timezone });
    return dt.toFormat(format);
  }

  /**
   * Get DST transition dates for a year and timezone
   */
  getDSTTransitions(year: number, timezone: string): { start: Date | null; end: Date | null } {
    // DST transitions are complex - this is a simplified approach
    // Check offset changes throughout the year
    const transitions = { start: null as Date | null, end: null as Date | null };

    // Check each day of the year for offset changes
    let lastOffset: number | null = null;

    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 28; day += 7) {
        const dt = DateTime.fromObject({ year, month, day }, { zone: timezone });
        if (!dt.isValid) continue;

        const currentOffset = dt.offset;
        if (lastOffset !== null && currentOffset !== lastOffset) {
          // DST transition detected
          const transitionDate = dt.toJSDate();
          if (currentOffset > lastOffset) {
            // Spring forward (DST start in Northern hemisphere)
            transitions.start = transitionDate;
          } else {
            // Fall back (DST end in Northern hemisphere)
            transitions.end = transitionDate;
          }
        }
        lastOffset = currentOffset;
      }
    }

    return transitions;
  }

  // Private helper methods

  private isDST(dt: DateTime, timezone: string): boolean {
    // Check if current offset differs from standard offset
    // This works by comparing January and July offsets
    const year = dt.year;
    const janOffset = DateTime.fromObject({ year, month: 1, day: 15 }, { zone: timezone }).offset;
    const julOffset = DateTime.fromObject({ year, month: 7, day: 15 }, { zone: timezone }).offset;
    const standardOffset = Math.max(janOffset, julOffset);
    return dt.offset !== standardOffset;
  }

  private formatOffset(offsetMinutes: number): string {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private getTimezoneName(zone: IANAZone, _dt: DateTime): string {
    // Get the display name for the timezone
    const zoneName = zone.name;

    // Map common zones to friendly names
    const friendlyNames: Record<string, string> = {
      'America/New_York': 'Eastern Time',
      'America/Chicago': 'Central Time',
      'America/Denver': 'Mountain Time',
      'America/Los_Angeles': 'Pacific Time',
      'Europe/London': 'GMT/BST',
      'Europe/Paris': 'Central European Time',
      'Europe/Berlin': 'Central European Time',
      'Asia/Tokyo': 'Japan Standard Time',
      'Asia/Shanghai': 'China Standard Time',
      'Asia/Kolkata': 'India Standard Time',
      'UTC': 'Coordinated Universal Time',
    };

    return friendlyNames[zoneName] || zoneName.replace(/_/g, ' ');
  }

  private extractCountry(zoneName: string): string {
    // Extract country/region from timezone name
    const parts = zoneName.split('/');
    if (parts.length >= 1) {
      return parts[0];
    }
    return '';
  }

  private calculateJulianDay(date: Date): number {
    // Julian Day calculation
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;

    // Julian Day
    let jd = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;

    // Add fractional day
    jd += (h - 12) / 24;

    return jd;
  }
}

// Singleton instance
export const timezoneService = new TimezoneService();

export default TimezoneService;
