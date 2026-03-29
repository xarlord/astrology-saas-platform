/**
 * Shared Module
 * Contains shared services and utilities used across modules
 */

// Legacy calculation service (mock-based, used during migration)
export * from './services/swissEphemeris.service';

// Real calculation engine
export { AstronomyEngineService } from './services/astronomyEngine.service';
export { NatalChartService } from './services/natalChart.service';
export { HouseCalculationService } from './services/houseCalculation.service';
export { TimezoneService, timezoneService } from './services/timezone.service';
export { TransitCacheService, getTransitCache } from './services/transitCache.service';
export { ChartSharingService, chartSharingService } from './services/chartSharing.service';
export { PDFGenerationService } from './services/pdfGeneration.service';
export { SecurityLoggingService } from './services/securityLogging.service';
