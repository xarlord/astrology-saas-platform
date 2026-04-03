/**
 * Services Export
 *
 * Centralized exports for all API services
 */

// Core API
export { default as api } from './api';
export { apiRequest, handleApiError, isNetworkError, isAuthError } from './api';

// Services
export { authService } from './auth.service';
export { chartService } from './chart.service';
export { analysisService } from './analysis.service';
export { transitService } from './transit.service';
export { default as calendarService } from './calendar.service';
export { default as aiService } from './ai.service';
export { default as learningService } from './learning.service';
export { reportService } from './report.service';
export { default as locationService } from './location.service';
export { default as userService } from './user.service';
export { default as pdfService } from './pdf.service';
export { billingService } from './billing.service';

// Chart Calculator Service
export {
  ChartCalculator,
  chartCalculator,
  createChartCalculator,
} from './chartCalculator.service';

// Synastry service (has named exports)
export {
  compareCharts,
  getCompatibility,
  generateCompatibilityReport,
  getSynastryReports,
  getSynastryReport,
  updateSynastryReport,
  deleteSynastryReport,
  createSynastryController,
} from './synastry.api';

// Type exports — use api.types as the single source of truth
// Individual service files re-export from api.types, so just export api.types
export type * from './api.types';
