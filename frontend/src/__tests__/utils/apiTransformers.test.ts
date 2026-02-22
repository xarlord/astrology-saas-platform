/**
 * Tests for API Transformers
 */

import { describe, it, expect } from 'vitest';
import {
  transformBirthData,
  birthDataToAPI,
  transformChart,
  transformCharts,
  transformPlanetPosition,
  transformPlanetPositions,
  transformUser,
  transformUserSettings,
  transformNotificationSettings,
  userToAPI,
  safeTransform,
  isAPIData,
  smartTransformChart,
  type APIChart,
  type APIBirthData,
  type APIPlanetPosition,
  type APIUser,
  type APIUserSettings,
  type APINotificationSettings,
  type BirthData,
} from '../../utils/apiTransformers';

describe('apiTransformers', () => {
  describe('transformBirthData', () => {
    it('should transform complete API birth data to frontend format', () => {
      const apiData: APIBirthData = {
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
      };

      const result = transformBirthData(apiData);

      expect(result).toEqual({
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        unknownTime: false,
      });
    });

    it('should handle missing optional fields with defaults', () => {
      const apiData: APIBirthData = {};

      const result = transformBirthData(apiData);

      expect(result).toEqual({
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        unknownTime: false,
      });
    });

    it('should handle partial data', () => {
      const apiData: APIBirthData = {
        birth_date: '1990-01-15',
        birth_place_name: 'Los Angeles',
      };

      const result = transformBirthData(apiData);

      expect(result.birthDate).toBe('1990-01-15');
      expect(result.birthPlace).toBe('Los Angeles');
      expect(result.birthTime).toBe('');
      expect(result.latitude).toBe(0);
    });

    it('should handle unknown time flag', () => {
      const apiData: APIBirthData = {
        birth_date: '1990-01-15',
        birth_time_unknown: true,
      };

      const result = transformBirthData(apiData);

      expect(result.unknownTime).toBe(true);
    });
  });

  describe('birthDataToAPI', () => {
    it('should transform frontend birth data to API format', () => {
      const frontendData: BirthData = {
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        unknownTime: false,
      };

      const result = birthDataToAPI(frontendData);

      expect(result).toEqual({
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        birth_time_unknown: false,
      });
    });

    it('should handle missing optional fields', () => {
      const frontendData: BirthData = {
        birthDate: '1990-01-15',
        birthTime: '',
        birthPlace: '',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      };

      const result = birthDataToAPI(frontendData);

      expect(result.birth_time).toBe('');
      expect(result.birth_place_name).toBe('');
      expect(result.birth_time_unknown).toBeUndefined();
    });

    it('should be reversible with transformBirthData', () => {
      const original: BirthData = {
        birthDate: '1990-01-15',
        birthTime: '14:30',
        birthPlace: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        unknownTime: false,
      };

      const toApi = birthDataToAPI(original);
      const backToFrontend = transformBirthData(toApi);

      expect(backToFrontend).toEqual(original);
    });
  });

  describe('transformChart', () => {
    it('should transform complete API chart to frontend format', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'My Birth Chart',
        type: 'natal',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformChart(apiChart);

      expect(result.id).toBe('chart-123');
      expect(result.userId).toBe('user-456');
      expect(result.name).toBe('My Birth Chart');
      expect(result.type).toBe('natal');
      expect(result.birthData.birthDate).toBe('1990-01-15');
      expect(result.birthData.birthTime).toBe('14:30');
      expect(result.birthData.birthPlace).toBe('New York, NY');
      expect(result.birthData.latitude).toBe(40.7128);
      expect(result.birthData.longitude).toBe(-74.006);
      expect(result.birthData.timezone).toBe('America/New_York');
      expect(result.birthData.unknownTime).toBe(false);
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
      expect(result.isDefault).toBe(true);
    });

    it('should handle synastry chart type', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'Synastry Chart',
        type: 'synastry',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformChart(apiChart);

      expect(result.type).toBe('synastry');
    });

    it('should handle transit chart type', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'Transit Chart',
        type: 'transit',
        birth_date: '2024-01-15',
        birth_time: '12:00',
        birth_time_unknown: false,
        birth_place_name: 'London',
        birth_latitude: 51.5074,
        birth_longitude: -0.1278,
        birth_timezone: 'Europe/London',
        house_system: 'koch',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformChart(apiChart);

      expect(result.type).toBe('transit');
    });

    it('should set isDefault to true by default', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'Test Chart',
        type: 'natal',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformChart(apiChart);

      expect(result.isDefault).toBe(true);
    });

    it('should set notes to undefined', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'Test Chart',
        type: 'natal',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformChart(apiChart);

      expect(result.notes).toBeUndefined();
    });
  });

  describe('transformCharts', () => {
    it('should transform an array of charts', () => {
      const apiCharts: APIChart[] = [
        {
          id: 'chart-1',
          user_id: 'user-1',
          name: 'Chart 1',
          type: 'natal',
          birth_date: '1990-01-15',
          birth_time: '14:30',
          birth_time_unknown: false,
          birth_place_name: 'New York, NY',
          birth_latitude: 40.7128,
          birth_longitude: -74.006,
          birth_timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac: 'tropical',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'chart-2',
          user_id: 'user-1',
          name: 'Chart 2',
          type: 'synastry',
          birth_date: '1985-06-20',
          birth_time: '08:00',
          birth_time_unknown: true,
          birth_place_name: 'Los Angeles, CA',
          birth_latitude: 34.0522,
          birth_longitude: -118.2437,
          birth_timezone: 'America/Los_Angeles',
          house_system: 'whole',
          zodiac: 'sidereal',
          sidereal_mode: 'lahiri',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      ];

      const result = transformCharts(apiCharts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('chart-1');
      expect(result[1].id).toBe('chart-2');
      expect(result[0].type).toBe('natal');
      expect(result[1].type).toBe('synastry');
    });

    it('should return empty array for empty input', () => {
      const result = transformCharts([]);
      expect(result).toEqual([]);
    });
  });

  describe('transformPlanetPosition', () => {
    it('should transform complete planet position', () => {
      const apiPos: APIPlanetPosition = {
        planet: 'Sun',
        sign: 'Capricorn',
        degree: 25,
        minute: 30,
        house: 1,
        retrograde: false,
      };

      const result = transformPlanetPosition(apiPos);

      expect(result).toEqual({
        name: 'Sun',
        sign: 'Capricorn',
        degree: 25,
        minute: 30,
        house: 1,
        retrograde: false,
      });
    });

    it('should transform position without optional fields', () => {
      const apiPos: APIPlanetPosition = {
        planet: 'Mercury',
        sign: 'Aquarius',
        degree: 10,
        minute: 15,
      };

      const result = transformPlanetPosition(apiPos);

      expect(result.name).toBe('Mercury');
      expect(result.sign).toBe('Aquarius');
      expect(result.degree).toBe(10);
      expect(result.minute).toBe(15);
      expect(result.house).toBeUndefined();
      expect(result.retrograde).toBeUndefined();
    });

    it('should handle retrograde planets', () => {
      const apiPos: APIPlanetPosition = {
        planet: 'Mars',
        sign: 'Gemini',
        degree: 15,
        minute: 0,
        retrograde: true,
      };

      const result = transformPlanetPosition(apiPos);

      expect(result.retrograde).toBe(true);
    });
  });

  describe('transformPlanetPositions', () => {
    it('should transform an array of planet positions', () => {
      const apiPositions: APIPlanetPosition[] = [
        { planet: 'Sun', sign: 'Capricorn', degree: 25, minute: 30 },
        { planet: 'Moon', sign: 'Pisces', degree: 12, minute: 45, retrograde: false },
        { planet: 'Mercury', sign: 'Aquarius', degree: 5, minute: 0, retrograde: true },
      ];

      const result = transformPlanetPositions(apiPositions);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Sun');
      expect(result[1].name).toBe('Moon');
      expect(result[2].name).toBe('Mercury');
      expect(result[2].retrograde).toBe(true);
    });

    it('should return empty array for empty input', () => {
      const result = transformPlanetPositions([]);
      expect(result).toEqual([]);
    });
  });

  describe('transformUser', () => {
    it('should transform complete API user to frontend format', () => {
      const apiUser: APIUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        role: 'user',
        subscription_tier: 'pro',
        subscription_expires_at: '2025-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformUser(apiUser);

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.fullName).toBe('John Doe');
      expect(result.avatar).toBe('https://example.com/avatar.jpg');
      expect(result.role).toBe('user');
      expect(result.subscriptionTier).toBe('pro');
      expect(result.subscriptionExpiresAt).toBe('2025-01-01T00:00:00Z');
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
    });

    it('should handle user without avatar', () => {
      const apiUser: APIUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        role: 'user',
        subscription_tier: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformUser(apiUser);

      expect(result.avatar).toBeUndefined();
    });

    it('should handle admin role', () => {
      const apiUser: APIUser = {
        id: 'user-123',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'admin',
        subscription_tier: 'lifetime',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = transformUser(apiUser);

      expect(result.role).toBe('admin');
      expect(result.subscriptionTier).toBe('lifetime');
    });

    it('should transform user settings when present', () => {
      const apiUser: APIUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        role: 'user',
        subscription_tier: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        settings: {
          timezone: 'America/New_York',
          language: 'en',
          date_format: 'MM/DD/YYYY',
          time_format: '12h',
        },
      };

      const result = transformUser(apiUser);

      expect(result.settings).toBeDefined();
      expect(result.settings?.timezone).toBe('America/New_York');
      expect(result.settings?.language).toBe('en');
      expect(result.settings?.timeFormat).toBe('12h');
    });

    it('should handle preferences', () => {
      const preferences = { theme: 'dark', notifications: true };
      const apiUser: APIUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        role: 'user',
        subscription_tier: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        preferences,
      };

      const result = transformUser(apiUser);

      expect(result.preferences).toEqual(preferences);
    });
  });

  describe('transformUserSettings', () => {
    it('should transform complete user settings', () => {
      const apiSettings: APIUserSettings = {
        timezone: 'America/New_York',
        language: 'en',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        notifications: {
          email_enabled: true,
          push_enabled: false,
          lunar_returns: true,
          solar_returns: true,
          daily_forecast: false,
        },
      };

      const result = transformUserSettings(apiSettings);

      expect(result.timezone).toBe('America/New_York');
      expect(result.language).toBe('en');
      expect(result.dateFormat).toBe('MM/DD/YYYY');
      expect(result.timeFormat).toBe('12h');
      expect(result.notifications.email).toBe(true);
      expect(result.notifications.push).toBe(false);
      expect(result.notifications.lunarReturns).toBe(true);
      expect(result.notifications.solarReturns).toBe(true);
      expect(result.notifications.dailyDigest).toBe(false);
    });

    it('should provide default notifications when not present', () => {
      const apiSettings: APIUserSettings = {
        timezone: 'UTC',
        language: 'en',
        date_format: 'YYYY-MM-DD',
        time_format: '24h',
      };

      const result = transformUserSettings(apiSettings);

      expect(result.notifications).toEqual({
        email: false,
        push: false,
        dailyDigest: false,
        transitAlerts: false,
        lunarReturns: false,
        solarReturns: false,
      });
    });
  });

  describe('transformNotificationSettings', () => {
    it('should transform notification settings', () => {
      const apiSettings: APINotificationSettings = {
        email_enabled: true,
        push_enabled: true,
        lunar_returns: false,
        solar_returns: true,
        daily_forecast: true,
      };

      const result = transformNotificationSettings(apiSettings);

      expect(result.email).toBe(true);
      expect(result.push).toBe(true);
      expect(result.lunarReturns).toBe(false);
      expect(result.solarReturns).toBe(true);
      expect(result.dailyDigest).toBe(true);
      expect(result.transitAlerts).toBe(false); // Always false by default
    });
  });

  describe('userToAPI', () => {
    it('should transform partial user to API format', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = userToAPI(user);

      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
    });

    it('should only include defined fields', () => {
      const user = {
        firstName: 'John',
        lastName: undefined,
      };

      const result = userToAPI(user);

      expect(result.first_name).toBe('John');
      expect('last_name' in result).toBe(false);
    });

    it('should handle avatar field', () => {
      const user = {
        avatar: 'https://example.com/new-avatar.jpg',
      };

      const result = userToAPI(user);

      expect(result.avatar_url).toBe('https://example.com/new-avatar.jpg');
    });

    it('should handle null avatar', () => {
      const user = {
        avatar: null,
      };

      const result = userToAPI(user as any);

      expect(result.avatar_url).toBeNull();
    });

    it('should handle subscription fields', () => {
      const user = {
        subscriptionTier: 'pro' as const,
        subscriptionExpiresAt: '2025-01-01T00:00:00Z',
      };

      const result = userToAPI(user);

      expect(result.subscription_tier).toBe('pro');
      expect(result.subscription_expires_at).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle fullName', () => {
      const user = {
        fullName: 'Jane Smith',
      };

      const result = userToAPI(user);

      expect(result.full_name).toBe('Jane Smith');
    });

    it('should return empty object for empty input', () => {
      const result = userToAPI({});
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('safeTransform', () => {
    it('should transform valid data', () => {
      const data = { value: 42 };
      const result = safeTransform(
        data,
        (d) => ({ transformed: d.value * 2 }),
        { transformed: 0 }
      );
      expect(result).toEqual({ transformed: 84 });
    });

    it('should return default value for null input', () => {
      const defaultValue = { transformed: -1 };
      const result = safeTransform(
        null,
        (d: any) => ({ transformed: d.value }),
        defaultValue
      );
      expect(result).toEqual(defaultValue);
    });

    it('should return default value for undefined input', () => {
      const defaultValue = { transformed: -1 };
      const result = safeTransform(
        undefined,
        (d: any) => ({ transformed: d.value }),
        defaultValue
      );
      expect(result).toEqual(defaultValue);
    });

    it('should return default value on transform error', () => {
      const data = { value: 'not a number' };
      const defaultValue = { transformed: 0 };

      const result = safeTransform(
        data,
        (d: any) => {
          if (typeof d.value !== 'number') throw new Error('Invalid');
          return { transformed: d.value };
        },
        defaultValue
      );

      expect(result).toEqual(defaultValue);
    });

    it('should log error on transform failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const data = { value: 'invalid' };

      safeTransform(
        data,
        () => {
          throw new Error('Transform failed');
        },
        { default: true }
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('isAPIData', () => {
    it('should return true for data with birth_date', () => {
      const data = { birth_date: '1990-01-15' };
      expect(isAPIData(data)).toBe(true);
    });

    it('should return true for data with birth_time', () => {
      const data = { birth_time: '14:30' };
      expect(isAPIData(data)).toBe(true);
    });

    it('should return true for data with created_at', () => {
      const data = { created_at: '2024-01-01' };
      expect(isAPIData(data)).toBe(true);
    });

    it('should return false for camelCase data', () => {
      const data = { birthDate: '1990-01-15', createdAt: '2024-01-01' };
      expect(isAPIData(data)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isAPIData(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAPIData(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isAPIData('string')).toBe(false);
      expect(isAPIData(42)).toBe(false);
      expect(isAPIData(true)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isAPIData({})).toBe(false);
    });
  });

  describe('smartTransformChart', () => {
    it('should transform API chart data', () => {
      const apiChart: APIChart = {
        id: 'chart-123',
        user_id: 'user-456',
        name: 'Test Chart',
        type: 'natal',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const result = smartTransformChart(apiChart);

      expect(result.id).toBe('chart-123');
      expect(result.userId).toBe('user-456');
      expect(result.birthData.birthDate).toBe('1990-01-15');
    });

    it('should return frontend chart as-is', () => {
      const frontendChart = {
        id: 'chart-123',
        userId: 'user-456',
        name: 'Test Chart',
        type: 'natal' as const,
        birthData: {
          birthDate: '1990-01-15',
          birthTime: '14:30',
          birthPlace: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.006,
          timezone: 'America/New_York',
          unknownTime: false,
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        isDefault: true,
      };

      const result = smartTransformChart(frontendChart as any);

      expect(result).toEqual(frontendChart);
    });
  });
});

// Need to import vi for the safeTransform test
import { vi } from 'vitest';
