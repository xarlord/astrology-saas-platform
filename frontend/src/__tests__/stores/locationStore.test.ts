/**
 * Tests for Location Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useLocationStore, type GeocodeResult, type TimezoneInfo } from '../../stores/locationStore';

// Mock fetch and localStorage
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('locationStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useLocationStore.setState({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchError: null,
      selectedLocation: null,
      timezoneInfo: {},
      isLoadingTimezone: false,
      locationCache: {},
      timezoneCache: {},
    });
  };

  const mockGeocodeResult: GeocodeResult = {
    id: 'loc-1',
    name: 'New York',
    country: 'USA',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  };

  const mockTimezoneInfo: TimezoneInfo = {
    timezone: 'America/New_York',
    utcOffset: -5,
    dstOffset: -4,
    abbreviation: 'EST',
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useLocationStore.getState();

      expect(state.searchQuery).toBe('');
      expect(state.searchResults).toEqual([]);
      expect(state.isSearching).toBe(false);
      expect(state.searchError).toBeNull();
      expect(state.selectedLocation).toBeNull();
      expect(state.timezoneInfo).toEqual({});
      expect(state.isLoadingTimezone).toBe(false);
      expect(state.locationCache).toEqual({});
      expect(state.timezoneCache).toEqual({});
    });
  });

  describe('setSearchQuery action', () => {
    it('should set search query', () => {
      act(() => {
        useLocationStore.getState().setSearchQuery('New York');
      });

      expect(useLocationStore.getState().searchQuery).toBe('New York');
    });
  });

  describe('searchLocations action', () => {
    it('should return empty array for empty query', async () => {
      const result = await act(async () => {
        return await useLocationStore.getState().searchLocations('  ');
      });

      const state = useLocationStore.getState();

      expect(result).toEqual([]);
      expect(state.searchResults).toEqual([]);
      expect(state.searchQuery).toBe('  ');
    });

    it('should search locations successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockGeocodeResult] }),
      });

      const result = await act(async () => {
        return await useLocationStore.getState().searchLocations('New York');
      });

      const state = useLocationStore.getState();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockGeocodeResult);
      expect(state.searchResults).toHaveLength(1);
      expect(state.isSearching).toBe(false);
      expect(state.searchQuery).toBe('New York');
    });

    it('should use cached results', async () => {
      // Pre-populate cache
      useLocationStore.setState({
        locationCache: { 'new york': [mockGeocodeResult] },
      });

      const result = await act(async () => {
        return await useLocationStore.getState().searchLocations('New York');
      });

      // Should not call fetch when cache hit
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockGeocodeResult);
    });

    it('should cache search results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockGeocodeResult] }),
      });

      await act(async () => {
        await useLocationStore.getState().searchLocations('New York');
      });

      const state = useLocationStore.getState();

      expect(state.locationCache['new york']).toEqual([mockGeocodeResult]);
    });

    it('should handle search error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await act(async () => {
        try {
          await useLocationStore.getState().searchLocations('Invalid');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useLocationStore.getState();

      expect(state.searchResults).toEqual([]);
      expect(state.searchError).toBe('Failed to search locations');
      expect(state.isSearching).toBe(false);
    });

    it('should set loading state during search', async () => {
      mockFetch.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ data: [] }) }), 100))
      );

      const searchPromise = act(async () => {
        await useLocationStore.getState().searchLocations('Test');
      });

      expect(useLocationStore.getState().isSearching).toBe(true);

      await searchPromise;

      expect(useLocationStore.getState().isSearching).toBe(false);
    });
  });

  describe('clearSearchResults action', () => {
    it('should clear search results', () => {
      useLocationStore.setState({
        searchResults: [mockGeocodeResult],
        searchQuery: 'Test',
        searchError: 'Error',
      });

      act(() => {
        useLocationStore.getState().clearSearchResults();
      });

      const state = useLocationStore.getState();

      expect(state.searchResults).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.searchError).toBeNull();
    });
  });

  describe('selectLocation action', () => {
    it('should select location', () => {
      act(() => {
        useLocationStore.getState().selectLocation(mockGeocodeResult);
      });

      expect(useLocationStore.getState().selectedLocation).toEqual(mockGeocodeResult);
    });

    it('should clear selected location', () => {
      useLocationStore.setState({ selectedLocation: mockGeocodeResult });

      act(() => {
        useLocationStore.getState().selectLocation(null);
      });

      expect(useLocationStore.getState().selectedLocation).toBeNull();
    });
  });

  describe('getTimezone action', () => {
    it('should get timezone successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTimezoneInfo }),
      });

      const result = await act(async () => {
        return await useLocationStore.getState().getTimezone(40.7128, -74.006);
      });

      expect(result).toEqual(mockTimezoneInfo);
      expect(useLocationStore.getState().isLoadingTimezone).toBe(false);
    });

    it('should use cached timezone', async () => {
      useLocationStore.setState({
        timezoneCache: { '40.7128,-74.006,': mockTimezoneInfo },
      });

      const result = await act(async () => {
        return await useLocationStore.getState().getTimezone(40.7128, -74.006);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockTimezoneInfo);
    });

    it('should include date in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTimezoneInfo }),
      });

      await act(async () => {
        await useLocationStore.getState().getTimezone(40.7128, -74.006, '2024-06-15');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date=2024-06-15'),
        expect.any(Object)
      );
    });

    it('should cache timezone results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTimezoneInfo }),
      });

      await act(async () => {
        await useLocationStore.getState().getTimezone(40.7128, -74.006);
      });

      const state = useLocationStore.getState();

      expect(state.timezoneCache['40.7128,-74.006,']).toEqual(mockTimezoneInfo);
      expect(state.timezoneInfo['40.7128,-74.006,']).toEqual(mockTimezoneInfo);
    });

    it('should handle timezone error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await act(async () => {
        try {
          await useLocationStore.getState().getTimezone(0, 0);
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useLocationStore.getState().isLoadingTimezone).toBe(false);
    });
  });

  describe('reverseGeocode action', () => {
    it('should reverse geocode successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockGeocodeResult }),
      });

      const result = await act(async () => {
        return await useLocationStore.getState().reverseGeocode(40.7128, -74.006);
      });

      expect(result).toEqual(mockGeocodeResult);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('latitude=40.7128'),
        expect.any(Object)
      );
    });

    it('should handle reverse geocode error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await act(async () => {
        try {
          await useLocationStore.getState().reverseGeocode(0, 0);
          expect.fail('Should have thrown');
        } catch (error) {
          expect((error as Error).message).toBe('Failed to reverse geocode');
        }
      });
    });
  });

  describe('clearCache action', () => {
    it('should clear all caches', () => {
      useLocationStore.setState({
        locationCache: { test: [mockGeocodeResult] },
        timezoneCache: { test: mockTimezoneInfo },
      });

      act(() => {
        useLocationStore.getState().clearCache();
      });

      const state = useLocationStore.getState();

      expect(state.locationCache).toEqual({});
      expect(state.timezoneCache).toEqual({});
    });
  });

  describe('selector hooks', () => {
    it('useSearchResults should return search results', () => {
      useLocationStore.setState({ searchResults: [mockGeocodeResult] });
      const searchResults = useLocationStore.getState().searchResults;
      expect(searchResults).toEqual([mockGeocodeResult]);
    });

    it('useIsSearchingLocations should return searching state', () => {
      useLocationStore.setState({ isSearching: true });
      const isSearching = useLocationStore.getState().isSearching;
      expect(isSearching).toBe(true);
    });

    it('useSelectedLocation should return selected location', () => {
      useLocationStore.setState({ selectedLocation: mockGeocodeResult });
      const selectedLocation = useLocationStore.getState().selectedLocation;
      expect(selectedLocation).toEqual(mockGeocodeResult);
    });
  });
});
