/**
 * Location Routes - Backend Proxy for Google Places API
 *
 * @requirement FINDING-008
 * @description Secure proxy for location autocomplete to protect API key
 * @security API key is stored server-side, not exposed to frontend
 */

import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { logger } from '../../../utils/logger';
import { asyncHandler } from '../../../middleware/errorHandler';
import { publicApiRateLimiter } from '../../../middleware/rateLimiter';
import { validateParams, validateQuery } from '../../../utils/validators';

/** Nominatim search API response item */
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    country?: string;
    country_code?: string;
    [key: string]: unknown;
  };
}

const placeIdParamSchema = z.object({
  placeId: z.string().min(1).max(512),
});

// Query schemas for autocomplete and details endpoints (#343)
const autocompleteQuerySchema = z.object({
  input: z.string().min(2).max(100),
  sessiontoken: z.string().optional(),
  language: z.string().optional(),
});

const detailsQuerySchema = z.object({
  sessiontoken: z.string().optional(),
  language: z.string().optional(),
});

const timezoneQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});



/**
 * Fetch with timeout - prevents hanging on external API calls
 * @param url - URL to fetch
 * @param options - fetch options
 * @param timeoutMs - timeout in milliseconds (default: 8000)
 */
async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 8000,
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
interface GooglePlacesResponse {
  status: string;
  error_message?: string;
  predictions?: Array<{
    place_id: string;
    description: string;
    structured_formatting?: { main_text?: string; secondary_text?: string };
    types?: string[];
  }>;
  result?: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry?: { location?: { lat: number; lng: number } };
    utc_offset?: number;
    address_components?: Array<{ long_name?: string; short_name?: string; types: string[] }>;
  };
}

const router = Router();

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Apply rate limiting to all location routes
router.use(publicApiRateLimiter);

/**
 * @openapi
 * /api/v1/location/autocomplete:
 *   get:
 *     tags: [Location]
 *     summary: Proxy for Google Places Autocomplete
 *     security: []
 *     parameters:
 *       - name: input
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *       - name: sessiontoken
 *         in: query
 *         schema:
 *           type: string
 *       - name: language
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location autocomplete predictions
 *       400:
 *         description: Invalid or missing input parameter
 *       500:
 *         description: Location search failed
 */

/**
 * @route   GET /api/location/autocomplete
 * @desc    Proxy for Google Places Autocomplete
 * @access  Public (rate limited)
 */
router.get('/autocomplete', validateQuery(autocompleteQuerySchema), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      // Fallback to Nominatim if no API key configured
      const { input } = req.query as { input: string };
      const nominatimResults = await fetchNominatim(input);
      res.json({ predictions: nominatimResults });
      return;
    }

    const { input, sessiontoken, language = 'en' } = req.query as {
      input: string; sessiontoken?: string; language: string;
    };

    const url = new URL(`${GOOGLE_PLACES_BASE_URL}/autocomplete/json`);
    url.searchParams.set('input', input);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
    url.searchParams.set('language', language);

    if (sessiontoken) {
      url.searchParams.set('sessiontoken', sessiontoken);
    }

    const response = await fetchWithTimeout(url.toString());
    const data = (await response.json()) as GooglePlacesResponse;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.error('Google Places API error:', data.status, data.error_message);
      res.status(500).json({ error: 'Location search failed' });
      return;
    }

    // Transform predictions to our format
    const predictions = (data.predictions || []).map((pred) => ({
      placeId: pred.place_id,
      description: pred.description,
      mainText: pred.structured_formatting?.main_text || pred.description,
      secondaryText: pred.structured_formatting?.secondary_text || '',
      types: pred.types || [],
    }));

    res.json({ predictions });
  } catch (error) {
    logger.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Location search failed' });
  }
}));

/**
 * @openapi
 * /api/v1/location/details/{placeId}:
 *   get:
 *     tags: [Location]
 *     summary: Get place details including coordinates
 *     security: []
 *     parameters:
 *       - name: placeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sessiontoken
 *         in: query
 *         schema:
 *           type: string
 *       - name: language
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place details with coordinates
 *       404:
 *         description: Place not found
 *       500:
 *         description: Failed to get place details
 *       501:
 *         description: Google Places API key not configured
 */

/**
 * @route   GET /api/location/details/:placeId
 * @desc    Get place details including coordinates
 * @access  Public (rate limited)
 */
router.get('/details/:placeId', validateParams(placeIdParamSchema), validateQuery(detailsQuerySchema), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { placeId } = req.params;

    if (!GOOGLE_PLACES_API_KEY) {
      // Cannot get details without API key
      res.status(501).json({ error: 'Place details require Google Places API key' });
      return;
    }

    const { sessiontoken, language = 'en' } = req.query as {
      sessiontoken?: string; language: string;
    };

    const url = new URL(`${GOOGLE_PLACES_BASE_URL}/details/json`);
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
    url.searchParams.set('language', language as string);
    url.searchParams.set(
      'fields',
      'place_id,name,formatted_address,geometry,utc_offset,address_components',
    );

    if (sessiontoken) {
      url.searchParams.set('sessiontoken', sessiontoken as string);
    }

    const response = await fetchWithTimeout(url.toString());
    const data = (await response.json()) as GooglePlacesResponse;

    if (data.status !== 'OK') {
      logger.error('Google Places Details API error:', data.status);
      res.status(404).json({ error: 'Place not found' });
      return;
    }

    const result = data.result;
    if (!result) {
      res.status(404).json({ error: 'Place details not found' });
      return;
    }
    const addressComponents = result.address_components || [];

    // Extract country and admin area from address components
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const country = addressComponents.find((c: any) => c.types.includes('country'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminArea = addressComponents.find((c: any) =>
      c.types.includes('administrative_area_level_1'),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locality = addressComponents.find((c: any) => c.types.includes('locality'));

    const details = {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
      utcOffset: result.utc_offset,
      country: country?.long_name || '',
      countryCode: country?.short_name || '',
      administrativeArea: adminArea?.long_name || '',
      locality: locality?.long_name || '',
    };

    res.json({ details });
  } catch (error) {
    logger.error('Place details error:', error);
    res.status(500).json({ error: 'Failed to get place details' });
  }
}));

/**
 * Track the last Nominatim request timestamp to enforce the 1 req/sec rate limit
 * across ALL concurrent requests (not just per-request delay).
 */
let lastNominatimRequest = 0;

/**
 * Fallback: Nominatim (OpenStreetMap) autocomplete
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchNominatim(query: string): Promise<any[]> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '5');

    // Respect Nominatim rate limit (1 req/sec) — enforce minimum 1.1s between
    // requests globally (shared timestamp), so concurrent requests queue properly.
    const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimRequest));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    lastNominatimRequest = Date.now();

    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        'User-Agent': 'AstroVerse/1.0',
        'Accept-Language': 'en',
      },
    });

    const results = (await response.json()) as NominatimResult[];

    return results.map((item: NominatimResult, index: number) => ({
      placeId: `nominatim_${index}_${Date.now()}`,
      description: item.display_name,
      mainText: item.display_name.split(',')[0],
      secondaryText: item.display_name.split(',').slice(1).join(',').trim(),
      types: item.type ? [item.type] : [],
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country || '',
      countryCode: item.address?.country_code?.toUpperCase() || '',
    }));
  } catch (error) {
    logger.error('Nominatim error:', error);
    return [];
  }
}

/**
 * @route   GET /api/v1/location/timezone
 * @desc    Get IANA timezone from lat/lon coordinates
 * @access  Public
 */
router.get('/timezone', validateQuery(timezoneQuerySchema), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // validateQuery coerces and validates lat/lon as numbers
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    // Try using Google Timezone API if key available
    if (GOOGLE_PLACES_API_KEY) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/timezone/json');
        url.searchParams.set('location', `${lat},${lon}`);
        url.searchParams.set('timestamp', Math.floor(Date.now() / 1000).toString());
        url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
        const response = await fetchWithTimeout(url.toString());
        const data = await response.json() as { status: string; timeZoneId?: string };
        if (data.status === 'OK' && data.timeZoneId) {
          res.json({ data: { timezone: data.timeZoneId } });
          return;
        }
      } catch {
        // Fall through to estimation
      }
    }

    // Fallback: estimate timezone from longitude using Intl supported names
    // This covers major timezones with rough boundary estimation
    const offsetHours = Math.round(lon / 15);
    const timezoneMap: Record<number, string> = {
      '-12': 'Etc/GMT+12', '-11': 'Pacific/Midway', '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage', '-8': 'America/Los_Angeles', '-7': 'America/Denver',
      '-6': 'America/Chicago', '-5': 'America/New_York', '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo', '-2': 'Atlantic/South_Georgia', '-1': 'Atlantic/Azores',
      '0': 'Europe/London', '1': 'Europe/Paris', '2': 'Europe/Helsinki',
      '3': 'Europe/Istanbul', '4': 'Asia/Dubai', '5': 'Asia/Karachi',
      '5.5': 'Asia/Kolkata', '6': 'Asia/Dhaka', '7': 'Asia/Bangkok',
      '8': 'Asia/Shanghai', '9': 'Asia/Tokyo', '10': 'Australia/Sydney',
      '11': 'Pacific/Noumea', '12': 'Pacific/Auckland',
    };

    const tz = timezoneMap[offsetHours] || `Etc/GMT${offsetHours > 0 ? '-' : '+'}${Math.abs(offsetHours)}`;
    res.json({ data: { timezone: tz } });
  } catch (error) {
    logger.error('Timezone lookup error:', error);
    res.status(500).json({ error: 'Timezone lookup failed' });
  }
}));

export { router as locationRoutes };
