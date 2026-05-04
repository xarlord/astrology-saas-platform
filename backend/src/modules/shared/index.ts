/**
 * Shared Module
 * Contains shared services and utilities used across modules
 */

// Legacy calculation service (mock-based, used during migration)
// NOTE: ZODIAC_SIGNS, PLANET_SYMBOLS, and ZodiacSign are also exported by
// astronomyEngine.service.ts but with different values (Title Case vs lowercase keys).
// We re-export from swissEphemeris (the legacy mock version) for backward compatibility.
// The astronomyEngine versions use Title Case and additional bodies (Chiron, North/South Node).
export type { ZodiacSign, AspectType } from './services/swissEphemeris.service';
export {
  ZODIAC_SIGNS,
  PLANET_SYMBOLS,
  ASPECT_TYPES,
  calculateNatalChart,
  calculateTransits,
  calculateCompatibility,
  calculateLunarReturn,
  calculateCompositeChart,
  juldayToDate,
  calculateAspects,
  swissEphemeris,
} from './services/swissEphemeris.service';

// Real calculation engine
export { AstronomyEngineService } from './services/astronomyEngine.service';
export { NatalChartService } from './services/natalChart.service';
export { HouseCalculationService } from './services/houseCalculation.service';
export { TimezoneService, timezoneService } from './services/timezone.service';
export { TransitCacheService, getTransitCache } from './services/transitCache.service';
export { ChartSharingService, chartSharingService } from './services/chartSharing.service';
export { PDFGenerationService } from './services/pdfGeneration.service';
export { SecurityLoggingService } from './services/securityLogging.service';
export {
  getRedisClient,
  connectRedis,
  disconnectRedis,
  isRedisConnected,
  requireRedis,
  RedisCache,
} from './services/redis.service';
