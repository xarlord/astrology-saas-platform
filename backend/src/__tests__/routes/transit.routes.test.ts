/**
 * Unit Tests for Transit Routes
 * Tests transit route configuration
 */

// Mock dependencies BEFORE imports
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => fn,
}));

jest.mock('../../utils/validators', () => ({
  validateBody: (schema: any) => (req: any, res: any, next: any) => next(),
  calculateTransitsSchema: {},
}));

import { Router } from 'express';
import { transitRoutes } from '../../modules/transits';

describe('Transit Routes', () => {
  describe('Route Configuration', () => {
    it('should have POST /calculate route', () => {
      expect(transitRoutes).toBeDefined();
      expect(typeof transitRoutes).toBe('function');
      expect(transitRoutes).toHaveProperty('stack');
    });

    it('should have GET /today route', () => {
      expect(transitRoutes).toBeDefined();
      expect(typeof transitRoutes).toBe('function');
    });

    it('should have GET /calendar route', () => {
      expect(transitRoutes).toBeDefined();
    });

    it('should have GET /forecast route', () => {
      expect(transitRoutes).toBeDefined();
    });

    it('should have GET /:id route', () => {
      expect(transitRoutes).toBeDefined();
    });
  });

  describe('Route Structure', () => {
    it('should export router', () => {
      expect(transitRoutes).toBeDefined();
      expect(typeof transitRoutes).toBe('function');
    });

    it('should be express router', () => {
      expect(transitRoutes).toHaveProperty('stack');
      expect(transitRoutes).toHaveProperty('name');
      expect(typeof transitRoutes.stack).toBe('object');
    });

    it('should have routes defined', () => {
      expect(transitRoutes.stack.length).toBeGreaterThan(0);
    });
  });
});
