/**
 * Google Places Autocomplete Service
 *
 * @requirement FINDING-008
 * @description Location autocomplete with coordinates and timezone detection
 * @security Uses backend proxy to protect API key (recommended for production)
 */

import api from './api';

// Types for Google Maps Places API (loaded at runtime)
interface AutocompletionRequest {
  input: string;
  types?: string[];
  sessionToken?: string;
  componentRestrictions?: { country: string | string[] };
  language?: string;
}

interface PlaceDetailsRequest {
  placeId: string;
  fields: string[];
  sessionToken?: string;
}

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
  types: string[];
}

interface PlaceResult {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: () => number; lng: () => number } };
  utc_offset?: number;
  address_components?: AddressComponent[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace GooglePlaces {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Places {
    export type AutocompleteCallback = (predictions: AutocompletePrediction[] | null, status: string) => void;
    export type DetailsCallback = (place: PlaceResult | null, status: string) => void;
  }
}

// Extend Window with google maps
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService?: new () => {
            getPlacePredictions(
              request: AutocompletionRequest,
              callback: GooglePlaces.Places.AutocompleteCallback
            ): void;
          };
          PlacesService?: new (container: HTMLDivElement) => {
            getDetails(
              request: PlaceDetailsRequest,
              callback: GooglePlaces.Places.DetailsCallback
            ): void;
          };
          PlacesServiceStatus?: {
            OK: string;
            ZERO_RESULTS: string;
          };
        };
      };
    };
  }
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
  lat?: number;
  lon?: number;
  country?: string;
  countryCode?: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  utcOffset?: number;
  country: string;
  countryCode?: string;
  administrativeArea?: string;
  locality?: string;
}

export interface LocationSearchOptions {
  types?: string[];
  componentRestrictions?: { country: string | string[] };
  language?: string;
  sessionToken?: string;
}

interface AutocompleteApiResponse {
  predictions?: PlacePrediction[];
}

interface DetailsApiResponse {
  details?: PlaceDetails;
}

interface NominatimResult {
  display_name: string;
  name?: string;
  type?: string;
  place_id: string;
  lat: string;
  lon: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

/**
 * Backend Proxy Location Service (RECOMMENDED for production)
 * Uses server-side proxy to protect API key
 */
class BackendProxyLocationService {

  /**
   * Search for places via backend proxy
   * API key is stored securely on the server
   */
  async searchPlaces(
    input: string,
    options: LocationSearchOptions = {}
  ): Promise<PlacePrediction[]> {
    if (!input || input.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        input,
        ...(options.language && { language: options.language }),
        ...(options.sessionToken && { sessiontoken: options.sessionToken }),
      });

      const response = await api.get<AutocompleteApiResponse>(`/location/autocomplete?${params.toString()}`);

      if (response.data?.predictions) {
        return response.data.predictions;
      }

      return [];
    } catch (error) {
      console.error('Backend location search failed:', error);
      return [];
    }
  }

  /**
   * Alias for searchPlaces (for consistency with other services)
   */
  async search(query: string): Promise<PlacePrediction[]> {
    return this.searchPlaces(query);
  }

  /**
   * Get place details via backend proxy
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await api.get<DetailsApiResponse>(`/location/details/${placeId}`);

      if (response.data?.details) {
        return response.data.details;
      }

      return null;
    } catch (error) {
      console.error('Backend place details failed:', error);
      return null;
    }
  }

  /**
   * Get coordinates from input
   */
  async getCoordinates(input: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
    try {
      const predictions = await this.searchPlaces(input);
      if (predictions.length === 0) return null;

      // Check if prediction already has coordinates (Nominatim results)
      const first = predictions[0];
      if ('lat' in first && 'lon' in first) {
        return {
          latitude: first.lat!,
          longitude: first.lon!,
          name: first.description,
        };
      }

      const details = await this.getPlaceDetails(first.placeId);
      if (!details) return null;

      return {
        latitude: details.latitude,
        longitude: details.longitude,
        name: details.name ?? details.formattedAddress,
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  /**
   * Check if service is available
   */
  isInitialized(): boolean {
    return true; // Always available via backend
  }
}

interface AutocompleteService {
  getPlacePredictions(
    request: AutocompletionRequest,
    callback: (predictions: AutocompletePrediction[] | null, status: string) => void
  ): void;
}

interface PlacesServiceApi {
  getDetails(
    request: PlaceDetailsRequest,
    callback: (place: PlaceResult | null, status: string) => void
  ): void;
}

class GooglePlacesService {
  private apiKey: string | null = null;
  // loaded dynamically at runtime
  private autocompleteService: AutocompleteService | null = null;
  private placesService: PlacesServiceApi | null = null;
  private sessionToken: string | null = null;

  /**
   * Initialize the service with API key
   */
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    void this.loadGoogleMapsScript();
  }

  /**
   * Load Google Maps JavaScript API
   */
  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        this.initializeServices();
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeServices();
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Maps services
   */
  private initializeServices(): void {
    if (!window.google?.maps?.places) return;

    const { AutocompleteService, PlacesService } = window.google.maps.places;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.autocompleteService = new AutocompleteService!() as AutocompleteService;
    // Create a dummy div for PlacesService
    const dummyDiv = document.createElement('div');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.placesService = new PlacesService!(dummyDiv) as PlacesServiceApi;
    this.sessionToken = this._generateSessionToken();
  }

  /**
   * Search for places matching input
   */
  async searchPlaces(
    input: string,
    options: LocationSearchOptions = {}
  ): Promise<PlacePrediction[]> {
    if (!this.autocompleteService) {
      await this.loadGoogleMapsScript();
    }

    if (!input || input.length < 2) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const request: AutocompletionRequest = {
        input,
        types: options.types ?? ['(cities)'],
        sessionToken: options.sessionToken ?? this.sessionToken ?? undefined,
      };

      if (options.componentRestrictions) {
        request.componentRestrictions = options.componentRestrictions;
      }

      if (options.language) {
        request.language = options.language;
      }

      const statusOk = window.google?.maps?.places?.PlacesServiceStatus?.OK ?? 'OK';
      const statusZero = window.google?.maps?.places?.PlacesServiceStatus?.ZERO_RESULTS ?? 'ZERO_RESULTS';

      this.autocompleteService!.getPlacePredictions(
        request,
        (predictions: AutocompletePrediction[] | null, status: string) => {
          if (status !== statusOk && status !== statusZero) {
            reject(new Error(`Places API error: ${status}`));
            return;
          }

          if (!predictions) {
            resolve([]);
            return;
          }

          resolve(
            predictions.map((prediction) => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text,
              types: prediction.types,
            }))
          );
        }
      );
    });
  }

  /**
   * Get place details including coordinates
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.placesService) {
      await this.loadGoogleMapsScript();
    }

    return new Promise((resolve, reject) => {
      const request: PlaceDetailsRequest = {
        placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'utc_offset',
          'address_component',
        ],
        sessionToken: this.sessionToken ?? undefined,
      };

      const statusOk = window.google?.maps?.places?.PlacesServiceStatus?.OK ?? 'OK';

      this.placesService!.getDetails(request, (place: PlaceResult | null, status: string) => {
        if (status !== statusOk) {
          reject(new Error(`Place Details API error: ${status}`));
          return;
        }

        if (!place) {
          reject(new Error('No place details found'));
          return;
        }

        // Extract address components
        const addressComponents: AddressComponent[] = place.address_components ?? [];
        let country = '';
        let countryCode = '';
        let administrativeArea = '';
        let locality = '';

        for (const component of addressComponents) {
          if (component.types.includes('country')) {
            country = component.long_name;
            countryCode = component.short_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            administrativeArea = component.long_name;
          }
          if (component.types.includes('locality')) {
            locality = component.long_name;
          }
        }

        // Generate a new session token for next request
        this.sessionToken = this._generateSessionToken();

        resolve({
          placeId: place.place_id ?? placeId,
          name: place.name ?? '',
          formattedAddress: place.formatted_address ?? '',
          latitude: place.geometry?.location?.lat() ?? 0,
          longitude: place.geometry?.location?.lng() ?? 0,
          utcOffset: place.utc_offset,
          country,
          countryCode,
          administrativeArea,
          locality,
        });
      });
    });
  }

  /**
   * Get coordinates from place prediction
   */
  async getCoordinates(input: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
    try {
      const predictions = await this.searchPlaces(input);
      if (predictions.length === 0) return null;

      const details = await this.getPlaceDetails(predictions[0].placeId);
      return {
        latitude: details.latitude,
        longitude: details.longitude,
        name: details.name ?? details.formattedAddress,
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  /**
   * Generate session token for billing optimization
   */
  private _generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.autocompleteService !== null;
  }
}

// Singleton instance
export const googlePlacesService = new GooglePlacesService();

// Fallback: Simple geocoding using Nominatim (OpenStreetMap) - FREE
class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  /**
   * Search for locations
   */
  async search(query: string, limit = 5): Promise<PlacePrediction[]> {
    const response = await fetch(
      `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json() as NominatimResult[];

    return results.map((result, index) => ({
      placeId: `nominatim_${index}_${Date.now()}`,
      description: result.display_name,
      mainText: result.name ?? result.display_name.split(',')[0],
      secondaryText: result.display_name.split(',').slice(1).join(',').trim(),
      types: result.type ? [result.type] : [],
    }));
  }

  /**
   * Get details from Nominatim result
   */
  async getDetails(query: string): Promise<PlaceDetails | null> {
    const results = await this.search(query, 1);
    if (results.length === 0) return null;

    const response = await fetch(
      `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
    );

    if (!response.ok) return null;

    const data = await response.json() as NominatimResult[];
    if (data.length === 0) return null;

    const result = data[0];

    return {
      placeId: `nominatim_${result.place_id}`,
      name: result.name ?? '',
      formattedAddress: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      country: result.address?.country ?? '',
      countryCode: result.address?.country_code?.toUpperCase() ?? '',
      administrativeArea: result.address?.state ?? '',
      locality: result.address?.city ?? result.address?.town ?? result.address?.village ?? '',
    };
  }
}

export const nominatimService = new NominatimService();

// Backend proxy instance (RECOMMENDED for production)
export const backendProxyLocationService = new BackendProxyLocationService();

/**
 * Unified location service
 *
 * Priority order:
 * 1. Backend proxy (recommended - API key protected server-side)
 * 2. Direct Google Places (only if explicitly enabled via USE_CLIENT_SIDE_PLACES=true)
 * 3. Nominatim fallback (free, no API key needed)
 *
 * @security By default uses backend proxy to protect API key
 */
export class LocationService {
  private useClientSideGoogle = false;
  private useBackendProxy = true;

  /**
   * Initialize location service
   * @param apiKey - Google Places API key (optional, backend proxy is preferred)
   * @param options - Configuration options
   */
  initialize(apiKey: string, options?: { useClientSide?: boolean }): void {
    // Prefer backend proxy for security
    this.useBackendProxy = true;

    // Only use client-side Google if explicitly enabled (not recommended for production)
    if (options?.useClientSide && apiKey) {
      googlePlacesService.initialize(apiKey);
      this.useClientSideGoogle = true;
      console.warn(
        'Using client-side Google Places API. ' +
        'For better security, use backend proxy (default) instead.'
      );
    }
  }

  async search(query: string): Promise<PlacePrediction[]> {
    // Priority 1: Backend proxy (recommended)
    if (this.useBackendProxy) {
      try {
        const results = await backendProxyLocationService.searchPlaces(query);
        if (results.length > 0) return results;
      } catch (error) {
        console.warn('Backend proxy failed, trying fallback:', error);
      }
    }

    // Priority 2: Direct Google Places (if enabled)
    if (this.useClientSideGoogle && googlePlacesService.isInitialized()) {
      try {
        return await googlePlacesService.searchPlaces(query);
      } catch (error) {
        console.warn('Google Places failed, falling back to Nominatim:', error);
      }
    }

    // Priority 3: Nominatim fallback
    return nominatimService.search(query);
  }

  async getDetails(placeIdOrQuery: string): Promise<PlaceDetails | null> {
    // Priority 1: Backend proxy (recommended)
    if (this.useBackendProxy) {
      try {
        const details = await backendProxyLocationService.getPlaceDetails(placeIdOrQuery);
        if (details) return details;
      } catch (error) {
        console.warn('Backend proxy failed, trying fallback:', error);
      }
    }

    // Priority 2: Direct Google Places (if enabled and placeId looks like Google's)
    if (this.useClientSideGoogle && placeIdOrQuery.startsWith('ChI') && googlePlacesService.isInitialized()) {
      try {
        return await googlePlacesService.getPlaceDetails(placeIdOrQuery);
      } catch (error) {
        console.warn('Google Places failed, falling back to Nominatim:', error);
      }
    }

    // Priority 3: Nominatim fallback
    return nominatimService.getDetails(placeIdOrQuery);
  }
}

export const locationService = new LocationService();

export default LocationService;
