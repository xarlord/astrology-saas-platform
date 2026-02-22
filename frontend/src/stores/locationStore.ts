/**
 * Location Store
 *
 * Manages location search, geocoding, and timezone lookup
 * Caches results for performance optimization
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface GeocodeResult {
  id: string;
  name: string;
  country: string;
  admin1?: string; // state/region
  admin2?: string; // county
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface TimezoneInfo {
  timezone: string;
  utcOffset: number;
  dstOffset: number;
  abbreviation: string;
}

interface LocationState {
  // Search state
  searchQuery: string;
  searchResults: GeocodeResult[];
  isSearching: boolean;
  searchError: string | null;

  // Selected location
  selectedLocation: GeocodeResult | null;

  // Timezone lookup
  timezoneInfo: Record<string, TimezoneInfo>;
  isLoadingTimezone: boolean;

  // Cache
  locationCache: Record<string, GeocodeResult[]>;
  timezoneCache: Record<string, TimezoneInfo>;

  // Actions
  setSearchQuery: (query: string) => void;
  searchLocations: (query: string) => Promise<GeocodeResult[]>;
  clearSearchResults: () => void;
  selectLocation: (location: GeocodeResult | null) => void;
  getTimezone: (latitude: number, longitude: number, date?: string) => Promise<TimezoneInfo>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<GeocodeResult>;
  clearCache: () => void;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    (set, get) => ({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchError: null,
      selectedLocation: null,
      timezoneInfo: {},
      isLoadingTimezone: false,
      locationCache: {},
      timezoneCache: {},

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      searchLocations: async (query) => {
        if (!query.trim()) {
          set({ searchResults: [], searchQuery: query });
          return [];
        }

        set({ isSearching: true, searchError: null, searchQuery: query });

        try {
          // Check cache first
          const cacheKey = query.toLowerCase();
          const cached = get().locationCache[cacheKey];

          if (cached) {
            set({ searchResults: cached, isSearching: false });
            return cached;
          }

          // Call geocoding API
          const response = await fetch(
            `/api/v1/location/geocode?query=${encodeURIComponent(query)}&limit=10`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to search locations');
          }

          const data = await response.json() as { data: GeocodeResult[] };
          const results: GeocodeResult[] = data.data;

          // Update state and cache
          set((state) => ({
            searchResults: results,
            isSearching: false,
            locationCache: {
              ...state.locationCache,
              [cacheKey]: results,
            },
          }));

          return results;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to search locations';
          set({
            searchResults: [],
            isSearching: false,
            searchError: errorMessage,
          });
          throw error;
        }
      },

      clearSearchResults: () => {
        set({
          searchResults: [],
          searchQuery: '',
          searchError: null,
        });
      },

      selectLocation: (location) => {
        set({ selectedLocation: location });
      },

      getTimezone: async (latitude, longitude, date) => {
        const cacheKey = `${latitude},${longitude},${date ?? ''}`;
        const cached = get().timezoneCache[cacheKey];

        if (cached) {
          return cached;
        }

        set({ isLoadingTimezone: true });

        try {
          const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          });

          if (date) {
            params.append('date', date);
          }

          const response = await fetch(`/api/v1/location/timezone?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to get timezone information');
          }

          const data = await response.json() as { data: TimezoneInfo };
          const timezoneInfo: TimezoneInfo = data.data;

          set((state) => ({
            isLoadingTimezone: false,
            timezoneCache: {
              ...state.timezoneCache,
              [cacheKey]: timezoneInfo,
            },
            timezoneInfo: {
              ...state.timezoneInfo,
              [cacheKey]: timezoneInfo,
            },
          }));

          return timezoneInfo;
        } catch (error) {
          set({ isLoadingTimezone: false });
          throw error;
        }
      },

      reverseGeocode: async (latitude, longitude) => {
        const response = await fetch(
          `/api/v1/location/reverse-geocode?latitude=${latitude}&longitude=${longitude}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to reverse geocode');
        }

        const data = await response.json() as { data: GeocodeResult };
        return data.data;
      },

      clearCache: () => {
        set({
          locationCache: {},
          timezoneCache: {},
        });
      },
    }),
    {
      name: 'LocationStore',
    }
  )
);

// Selector hooks for optimized re-renders
export const useSearchResults = () => useLocationStore((state) => state.searchResults);
export const useIsSearchingLocations = () => useLocationStore((state) => state.isSearching);
export const useSelectedLocation = () => useLocationStore((state) => state.selectedLocation);
export const useSearchLocations = () => useLocationStore((state) => state.searchLocations);
export const useSelectLocation = () => useLocationStore((state) => state.selectLocation);

export default useLocationStore;
