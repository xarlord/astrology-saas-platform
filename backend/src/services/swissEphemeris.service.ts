/**
 * Swiss Ephemeris Service - Alias Export
 * Exports Swiss Ephemeris functionality from shared module
 */

export { swissEphemeris } from '../modules/shared/services/swissEphemeris.service';

// Alias for backwards compatibility
import { swissEphemeris as _swissEphemeris } from '../modules/shared/services/swissEphemeris.service';
export const swissEphemerisService = _swissEphemeris;
