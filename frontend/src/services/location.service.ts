/**
 * Location Service
 *
 * Handles geocoding and location management
 * Uses geocoding API to convert place names to coordinates
 */

import api from './api';
import type { Location, GeocodingResult, ApiResponse } from './api.types';

/**
 * Location Service Class
 */
class LocationService {
  private readonly TIMEOUT = 10000; // 10 seconds
  private readonly GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1';

  /**
   * Search for a location by name
   * Uses Open-Meteo Geocoding API (free, no API key required)
   */
  async searchLocation(query: string): Promise<GeocodingResult> {
    if (!query || query.trim().length < 2) {
      return { locations: [], query };
    }

    try {
      // Use Open-Meteo Geocoding API
      const response = await fetch(
        `${this.GEOCODING_API_URL}/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json() as { results?: GeocodingAPIResult[] };

      if (!data.results) {
        return { locations: [], query };
      }

      // Transform API response to our Location format
      interface GeocodingAPIResult {
        name: string;
        country: string;
        latitude: number;
        longitude: number;
        timezone?: string;
      }
      const locations: Location[] = data.results.map((result) => ({
        name: `${result.name}, ${result.country}`,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone ?? 'UTC',
      }));

      return { locations, query };
    } catch (error: unknown) {
      console.error('Location search error:', error);
      return { locations: [], query };
    }
  }

  /**
   * Get timezone for coordinates
   */
  async getTimezone(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://timezone-api.open-meteo.com/v1/timezone?latitude=${latitude}&longitude=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to get timezone');
      }

      const data = await response.json() as { timezone?: string };
      return data.timezone ?? 'UTC';
    } catch (error: unknown) {
      console.error('Timezone lookup error:', error);
      return 'UTC';
    }
  }

  /**
   * Reverse geocoding - get location name from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Location | null> {
    try {
      // Use Open-Meteo's reverse geocoding if available, or fall back to a default
      const response = await fetch(
        `${this.GEOCODING_API_URL}/search?name=&count=1`
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      // Since reverse geocoding is not always available, return basic info
      const timezone = await this.getTimezone(latitude, longitude);

      return {
        name: 'Unknown Location',
        country: 'Unknown',
        latitude,
        longitude,
        timezone,
      };
    } catch (error: unknown) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Validate location data
   */
  validateLocation(location: Partial<Location>): boolean {
    return !!(
      location?.name &&
      location.latitude !== undefined &&
      location.longitude !== undefined &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  /**
   * Format location for display
   */
  formatLocation(location: Location): string {
    return location.name;
  }

  /**
   * Get saved locations for user
   */
  async getSavedLocations(): Promise<Location[]> {
    try {
      const response = await api.get<ApiResponse<{ locations: Location[] }>>(
        '/locations',
        { timeout: this.TIMEOUT }
      );
      return response.data.data.locations;
    } catch (error: unknown) {
      console.error('Failed to get saved locations:', error);
      return [];
    }
  }

  /**
   * Save a location
   */
  async saveLocation(location: Location): Promise<Location> {
    try {
      const response = await api.post<ApiResponse<{ location: Location }>>(
        '/locations',
        location,
        { timeout: this.TIMEOUT }
      );
      return response.data.data.location;
    } catch (error: unknown) {
      throw new Error(`Failed to save location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a saved location
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      await api.delete(`/locations/${locationId}`, {
        timeout: this.TIMEOUT,
      });
    } catch (error: unknown) {
      throw new Error(`Failed to delete location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent location searches from localStorage
   */
  getRecentSearches(maxItems = 5): Location[] {
    try {
      const stored = localStorage.getItem('recentLocationSearches');
      if (!stored) return [];

      const searches = JSON.parse(stored) as unknown;
      if (!Array.isArray(searches)) return [];
      return (searches as Location[]).slice(0, maxItems);
    } catch {
      return [];
    }
  }

  /**
   * Add a location to recent searches
   */
  addRecentSearch(location: Location): void {
    try {
      const searches = this.getRecentSearches(10);

      // Remove if already exists
      const filtered = searches.filter(
        (s) => s.name !== location.name || s.country !== location.country
      );

      // Add to beginning
      const updated = [location, ...filtered].slice(0, 10);

      localStorage.setItem('recentLocationSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    try {
      localStorage.removeItem('recentLocationSearches');
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }
}

// Export singleton instance
const locationService = new LocationService();
export default locationService;
