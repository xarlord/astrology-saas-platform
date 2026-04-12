/**
 * Services Barrel File Tests
 * Verify all service exports are available
 */

import { describe, it, expect } from 'vitest';
import * as services from './index';

describe('services barrel exports', () => {
  it('should export api instance', () => {
    expect(services.api).toBeDefined();
    // api is an axios instance, which is a function
    expect(typeof services.api).toMatch(/function|object/);
  });

  it('should export authService', () => {
    expect(services.authService).toBeDefined();
    expect(typeof services.authService).toBe('object');
  });

  it('should export chartService', () => {
    expect(services.chartService).toBeDefined();
    expect(typeof services.chartService).toBe('object');
  });

  it('should export analysisService', () => {
    expect(services.analysisService).toBeDefined();
    expect(typeof services.analysisService).toBe('object');
  });

  it('should export transitService', () => {
    expect(services.transitService).toBeDefined();
    expect(typeof services.transitService).toBe('object');
  });

  it('should export calendarService', () => {
    expect(services.calendarService).toBeDefined();
    expect(typeof services.calendarService).toBe('object');
  });

  it('should export aiService', () => {
    expect(services.aiService).toBeDefined();
    expect(typeof services.aiService).toBe('object');
  });

  it('should export learningService', () => {
    expect(services.learningService).toBeDefined();
    expect(typeof services.learningService).toBe('object');
  });

  it('should export reportService', () => {
    expect(services.reportService).toBeDefined();
    expect(typeof services.reportService).toBe('object');
  });

  it('should export locationService', () => {
    expect(services.locationService).toBeDefined();
    expect(typeof services.locationService).toBe('object');
  });

  it('should export userService', () => {
    expect(services.userService).toBeDefined();
    expect(typeof services.userService).toBe('object');
  });

  it('should export pdfService', () => {
    expect(services.pdfService).toBeDefined();
    expect(typeof services.pdfService).toBe('object');
  });

  it('should export billingService', () => {
    expect(services.billingService).toBeDefined();
    expect(typeof services.billingService).toBe('object');
  });

  it('should export ChartCalculator', () => {
    expect(services.ChartCalculator).toBeDefined();
    expect(typeof services.ChartCalculator).toBe('function');
  });

  it('should export chartCalculator instance', () => {
    expect(services.chartCalculator).toBeDefined();
    expect(typeof services.chartCalculator).toBe('object');
  });

  it('should export createChartCalculator', () => {
    expect(services.createChartCalculator).toBeDefined();
    expect(typeof services.createChartCalculator).toBe('function');
  });

  it('should export synastry functions', () => {
    expect(services.compareCharts).toBeDefined();
    expect(typeof services.compareCharts).toBe('function');

    expect(services.getCompatibility).toBeDefined();
    expect(typeof services.getCompatibility).toBe('function');

    expect(services.generateCompatibilityReport).toBeDefined();
    expect(typeof services.generateCompatibilityReport).toBe('function');

    expect(services.getSynastryReports).toBeDefined();
    expect(typeof services.getSynastryReports).toBe('function');

    expect(services.getSynastryReport).toBeDefined();
    expect(typeof services.getSynastryReport).toBe('function');

    expect(services.updateSynastryReport).toBeDefined();
    expect(typeof services.updateSynastryReport).toBe('function');

    expect(services.deleteSynastryReport).toBeDefined();
    expect(typeof services.deleteSynastryReport).toBe('function');

    expect(services.createSynastryController).toBeDefined();
    expect(typeof services.createSynastryController).toBe('function');
  });
});
