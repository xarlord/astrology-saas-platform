/**
 * Location Routes - Backend Proxy for Google Places API
 *
 * @requirement FINDING-008
 * @description Secure proxy for location autocomplete to protect API key
 * @security API key is stored server-side, not exposed to frontend
 */

import { Request, Response, Router } from 'express';
import { logger } from '../../../utils/logger';

// Manual validation helpers (replacing express-validator)
function validateQueryParams(req: Request, rules: Record<string, { optional?: boolean; isString?: boolean; minLen?: number; maxLen?: number }>): string | null {
  for (const [key, rule] of Object.entries(rules)) {
    const value = req.query[key];
    if (!rule.optional && value === undefined) return `Missing required parameter: ${key}`;
    if (value !== undefined && typeof value !== 'string') return `${key} must be a string`;
    if (rule.minLen && typeof value === 'string' && value.length < rule.minLen) return `${key} must be at least ${rule.minLen} characters`;
    if (rule.maxLen && typeof value === 'string' && value.length > rule.maxLen) return `${key} must be at most ${rule.maxLen} characters`;
  }
  return null;
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
router.get(
  '/autocomplete',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validationError = validateQueryParams(req, {
        input: { minLen: 2, maxLen: 100 },
        sessiontoken: { optional: true, isString: true },
        language: { optional: true, isString: true },
      });
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      if (!GOOGLE_PLACES_API_KEY) {
        // Fallback to Nominatim if no API key configured
        const nominatimResults = await fetchNominatim(req.query.input as string);
        res.json({ predictions: nominatimResults });
        return;
      }

      const { input, sessiontoken, language = 'en' } = req.query;

      const url = new URL(`${GOOGLE_PLACES_BASE_URL}/autocomplete/json`);
      url.searchParams.set('input', input as string);
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
      url.searchParams.set('language', language as string);

      if (sessiontoken) {
        url.searchParams.set('sessiontoken', sessiontoken as string);
      }

      const response = await fetch(url.toString());
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
  }
);

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
router.get(
  '/details/:placeId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validationError = validateQueryParams(req, {
        sessiontoken: { optional: true, isString: true },
        language: { optional: true, isString: true },
      });
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const { placeId } = req.params;

      if (!GOOGLE_PLACES_API_KEY) {
        // Cannot get details without API key
        res.status(501).json({ error: 'Place details require Google Places API key' });
        return;
      }

      const { sessiontoken, language = 'en' } = req.query;

      const url = new URL(`${GOOGLE_PLACES_BASE_URL}/details/json`);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
      url.searchParams.set('language', language as string);
      url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,utc_offset,address_components');

      if (sessiontoken) {
        url.searchParams.set('sessiontoken', sessiontoken as string);
      }

      const response = await fetch(url.toString());
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
        c.types.includes('administrative_area_level_1')
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const locality = addressComponents.find((c: any) =>
        c.types.includes('locality')
      );

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
  }
);

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

    // Respect Nominatim rate limit (1 req/sec)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'AstroVerse/1.0',
        'Accept-Language': 'en',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (await response.json()) as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((item: any, index: number) => ({
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

export { router as locationRoutes };
