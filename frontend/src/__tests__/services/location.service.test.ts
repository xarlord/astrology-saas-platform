/**
 * Location Service Tests
 * Testing geocoding and location management API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import locationService from '../../services/location.service';
import { mockLocation, createMockResponse, setupLocalStorageMock } from './utils';

// Mock the api module with hoisted mock
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Import after mock
import api from '../../services/api';

describe('locationService', () => {
  let localStorageMock: ReturnType<typeof setupLocalStorageMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = setupLocalStorageMock();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchLocation', () => {
    it('should search for locations by name', async () => {
      const mockGeocodingResponse = {
        results: [
          {
            name: 'New York',
            country: 'United States',
            latitude: 40.7128,
            longitude: -74.006,
            timezone: 'America/New_York',
          },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });

      const result = await locationService.searchLocation('New York');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding-api.open-meteo.com/v1/search'),
      );
      expect(result.locations).toHaveLength(1);
      expect(result.locations[0].name).toBe('New York, United States');
      expect(result.query).toBe('New York');
    });

    it('should return empty array for short queries', async () => {
      const result = await locationService.searchLocation('N');

      expect(result.locations).toEqual([]);
      expect(result.query).toBe('N');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for empty query', async () => {
      const result = await locationService.searchLocation('');

      expect(result.locations).toEqual([]);
    });

    it('should return empty array for whitespace query', async () => {
      const result = await locationService.searchLocation('   ');

      expect(result.locations).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const result = await locationService.searchLocation('New York');

      expect(result.locations).toEqual([]);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await locationService.searchLocation('New York');

      expect(result.locations).toEqual([]);
    });

    it('should handle response without results', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await locationService.searchLocation('NonexistentPlace');

      expect(result.locations).toEqual([]);
    });

    it('should encode query parameters', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      await locationService.searchLocation('New York, NY');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('New York, NY')),
      );
    });

    it('should use UTC as default timezone', async () => {
      const mockGeocodingResponse = {
        results: [
          {
            name: 'Remote Place',
            country: 'Unknown',
            latitude: 0,
            longitude: 0,
            // No timezone provided
          },
        ],
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });

      const result = await locationService.searchLocation('Remote Place');

      expect(result.locations[0].timezone).toBe('UTC');
    });
  });

  describe('getTimezone', () => {
    it('should get timezone for coordinates', async () => {
      const mockTimezoneResponse = {
        timezone: 'America/New_York',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTimezoneResponse),
      });

      const result = await locationService.getTimezone(40.7128, -74.006);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timezone-api.open-meteo.com/v1/timezone'),
      );
      expect(result).toBe('America/New_York');
    });

    it('should return UTC as fallback', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await locationService.getTimezone(0, 0);

      expect(result).toBe('UTC');
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const result = await locationService.getTimezone(40.7128, -74.006);

      expect(result).toBe('UTC');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await locationService.getTimezone(40.7128, -74.006);

      expect(result).toBe('UTC');
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      // Mock getTimezone call
      const timezoneResponse = { timezone: 'America/New_York' };
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(timezoneResponse),
        });

      const result = await locationService.reverseGeocode(40.7128, -74.006);

      expect(result).not.toBeNull();
      expect(result?.latitude).toBe(40.7128);
      expect(result?.longitude).toBe(-74.006);
    });

    it('should return null on error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await locationService.reverseGeocode(40.7128, -74.006);

      expect(result).toBeNull();
    });
  });

  describe('validateLocation', () => {
    it('should validate a complete location', () => {
      const isValid = locationService.validateLocation(mockLocation);

      expect(isValid).toBe(true);
    });

    it('should reject location without name', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        name: '',
      });

      expect(isValid).toBe(false);
    });

    it('should reject location without latitude', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        latitude: undefined as any,
      });

      expect(isValid).toBe(false);
    });

    it('should reject location without longitude', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        longitude: undefined as any,
      });

      expect(isValid).toBe(false);
    });

    it('should reject invalid latitude (too high)', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        latitude: 91,
      });

      expect(isValid).toBe(false);
    });

    it('should reject invalid latitude (too low)', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        latitude: -91,
      });

      expect(isValid).toBe(false);
    });

    it('should reject invalid longitude (too high)', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        longitude: 181,
      });

      expect(isValid).toBe(false);
    });

    it('should reject invalid longitude (too low)', () => {
      const isValid = locationService.validateLocation({
        ...mockLocation,
        longitude: -181,
      });

      expect(isValid).toBe(false);
    });

    it('should accept boundary values', () => {
      expect(
        locationService.validateLocation({
          name: 'Test',
          latitude: 90,
          longitude: 180,
        }),
      ).toBe(true);

      expect(
        locationService.validateLocation({
          name: 'Test',
          latitude: -90,
          longitude: -180,
        }),
      ).toBe(true);
    });
  });

  describe('formatLocation', () => {
    it('should format location for display', () => {
      const formatted = locationService.formatLocation(mockLocation);

      expect(formatted).toBe('New York, United States');
    });
  });

  describe('getSavedLocations', () => {
    it('should fetch saved locations', async () => {
      const mockResponse = createMockResponse({
        locations: [mockLocation],
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await locationService.getSavedLocations();

      expect(api.get).toHaveBeenCalledWith('/locations', {
        timeout: 10000,
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      (api.get as any).mockRejectedValue(new Error('Failed'));

      const result = await locationService.getSavedLocations();

      expect(result).toEqual([]);
    });
  });

  describe('saveLocation', () => {
    it('should save a location', async () => {
      const mockResponse = createMockResponse({ location: mockLocation });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await locationService.saveLocation(mockLocation);

      expect(api.post).toHaveBeenCalledWith('/locations', mockLocation, {
        timeout: 10000,
      });
      expect(result).toEqual(mockLocation);
    });

    it('should throw error on save failure', async () => {
      (api.post as any).mockRejectedValue(new Error('Save failed'));

      await expect(locationService.saveLocation(mockLocation)).rejects.toThrow(
        'Failed to save location',
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete a saved location', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await locationService.deleteLocation('location-123');

      expect(api.delete).toHaveBeenCalledWith('/locations/location-123', {
        timeout: 10000,
      });
    });

    it('should throw error on delete failure', async () => {
      (api.delete as any).mockRejectedValue(new Error('Delete failed'));

      await expect(locationService.deleteLocation('location-123')).rejects.toThrow(
        'Failed to delete location',
      );
    });
  });

  describe('getRecentSearches', () => {
    it('should get recent searches from localStorage', () => {
      const searches = [mockLocation];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(searches));

      const result = locationService.getRecentSearches();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('recentLocationSearches');
      expect(result).toEqual(searches);
    });

    it('should return empty array when no searches stored', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = locationService.getRecentSearches();

      expect(result).toEqual([]);
    });

    it('should limit results to maxItems', () => {
      const searches = Array(10).fill(mockLocation);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(searches));

      const result = locationService.getRecentSearches(3);

      expect(result).toHaveLength(3);
    });

    it('should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = locationService.getRecentSearches();

      expect(result).toEqual([]);
    });

    it('should handle non-array data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ not: 'array' }));

      const result = locationService.getRecentSearches();

      expect(result).toEqual([]);
    });
  });

  describe('addRecentSearch', () => {
    it('should add location to recent searches', () => {
      localStorageMock.getItem.mockReturnValue('[]');

      locationService.addRecentSearch(mockLocation);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentLocationSearches',
        JSON.stringify([mockLocation]),
      );
    });

    it('should add to beginning of list', () => {
      const existingLocation = { ...mockLocation, name: 'Existing' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingLocation]));

      locationService.addRecentSearch(mockLocation);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const savedSearches = JSON.parse(setItemCall[1]);
      expect(savedSearches[0]).toEqual(mockLocation);
    });

    it('should remove duplicates', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockLocation]));

      locationService.addRecentSearch(mockLocation);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const savedSearches = JSON.parse(setItemCall[1]);
      expect(savedSearches).toHaveLength(1);
    });

    it('should limit to 10 items', () => {
      const existingSearches = Array(10)
        .fill(null)
        .map((_, i) => ({
          ...mockLocation,
          name: `Location ${i}`,
        }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSearches));

      locationService.addRecentSearch({ ...mockLocation, name: 'New Location' });

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const savedSearches = JSON.parse(setItemCall[1]);
      expect(savedSearches).toHaveLength(10);
    });

    it('should handle localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => locationService.addRecentSearch(mockLocation)).not.toThrow();
    });
  });

  describe('clearRecentSearches', () => {
    it('should clear recent searches', () => {
      locationService.clearRecentSearches();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('recentLocationSearches');
    });

    it('should handle localStorage errors', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => locationService.clearRecentSearches()).not.toThrow();
    });
  });
});
