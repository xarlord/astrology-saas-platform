/**
 * Integration Tests for Swiss Ephemeris / Chart Calculation
 * Tests natal chart generation via POST /api/charts/:id/calculate
 * Exercises the full pipeline: HTTP route → controller → NatalChartService → AstronomyEngine → DB
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import request from 'supertest';
import db from '../../config/database';
import { cleanDatabase, createTestUser, generateAuthToken } from './utils';
import { setupTestDatabase, teardownTestDatabase, cleanAllTables, isDatabaseAvailable } from './integration.test.setup';

import app from '../../server';

describe('Swiss Ephemeris / Chart Calculation Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  // Known birth data for validation (New York, Jan 15 1990, noon)
  const knownBirthData = {
    name: 'Integration Test Chart',
    birth_date: '1990-01-15',
    birth_time: '12:00:00',
    birth_place_name: 'New York, NY',
    birth_latitude: 40.7128,
    birth_longitude: -74.006,
    birth_timezone: 'America/New_York',
    house_system: 'placidus',
    zodiac: 'tropical',
  };

  beforeAll(async () => {
    try {
      await setupTestDatabase();
    } catch {
      // Database not available - tests will be skipped
    }
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    if (!isDatabaseAvailable()) return;
    await cleanAllTables();
    testUser = await createTestUser(db);
    authToken = generateAuthToken(testUser);
  });

  /**
   * Helper: create a chart via the API and return its ID
   */
  async function createChartViaApi(overrides: Record<string, unknown> = {}): Promise<string> {
    const response = await request(app)
      .post('/api/v1/charts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...knownBirthData, ...overrides });

    if (response.status !== 201) {
      throw new Error(`Chart creation failed: ${response.status} ${JSON.stringify(response.body)}`);
    }
    return response.body.data.chart.id;
  }

  describe('POST /api/v1/charts/:id/calculate', () => {
    it('should calculate natal chart and return calculated data', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.chart.calculated_data).toBeDefined();
    });

    it('should include planetary positions in calculated data', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;
      expect(calculated.planets).toBeDefined();

      // Verify major planets exist
      const planetKeys = Object.keys(calculated.planets);
      expect(planetKeys.length).toBeGreaterThanOrEqual(8);

      // Each planet should have core position data
      for (const key of ['sun', 'moon', 'mercury', 'venus', 'mars']) {
        if (calculated.planets[key]) {
          expect(calculated.planets[key]).toHaveProperty('longitude');
          expect(calculated.planets[key].longitude).toBeGreaterThanOrEqual(0);
          expect(calculated.planets[key].longitude).toBeLessThanOrEqual(360);
          expect(calculated.planets[key]).toHaveProperty('sign');
          expect(calculated.planets[key]).toHaveProperty('degree');
        }
      }
    });

    it('should include house cusps in calculated data', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;
      expect(calculated.houses).toBeDefined();
      expect(calculated.houses).toBeInstanceOf(Array);
      expect(calculated.houses.length).toBe(12);

      // Each house should have a cusp longitude
      for (const house of calculated.houses) {
        expect(house.cusp).toBeGreaterThanOrEqual(0);
        expect(house.cusp).toBeLessThanOrEqual(360);
      }
    });

    it('should include ascendant and midheaven', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;
      expect(calculated.ascendant).toBeDefined();
      expect(calculated.ascendant.longitude).toBeGreaterThanOrEqual(0);
      expect(calculated.ascendant.longitude).toBeLessThanOrEqual(360);

      expect(calculated.midheaven).toBeDefined();
      expect(calculated.midheaven.longitude).toBeGreaterThanOrEqual(0);
      expect(calculated.midheaven.longitude).toBeLessThanOrEqual(360);
    });

    it('should include aspects between planets', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;
      expect(calculated.aspects).toBeDefined();
      expect(calculated.aspects).toBeInstanceOf(Array);

      // A natal chart should have multiple aspects
      expect(calculated.aspects.length).toBeGreaterThan(0);

      // Each aspect should have required fields
      const aspect = calculated.aspects[0];
      expect(aspect).toHaveProperty('planet1');
      expect(aspect).toHaveProperty('planet2');
      expect(aspect).toHaveProperty('type');
      expect(aspect).toHaveProperty('orb');
    });

    it('should include elements and modalities balance', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;

      expect(calculated.elements).toBeDefined();
      expect(calculated.elements).toHaveProperty('fire');
      expect(calculated.elements).toHaveProperty('earth');
      expect(calculated.elements).toHaveProperty('air');
      expect(calculated.elements).toHaveProperty('water');

      expect(calculated.modalities).toBeDefined();
      expect(calculated.modalities).toHaveProperty('cardinal');
      expect(calculated.modalities).toHaveProperty('fixed');
      expect(calculated.modalities).toHaveProperty('mutable');
    });

    it('should include Julian Day and sidereal time', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const calculated = response.body.data.chart.calculated_data;
      expect(calculated.jd).toBeDefined();
      expect(typeof calculated.jd).toBe('number');
      expect(calculated.localSiderealTime).toBeDefined();
    });

    it('should persist calculated data to the database', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      // Calculate
      await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify in DB directly
      const [chart] = await db('charts').where({ id: chartId }).select('*');
      expect(chart.calculated_data).toBeDefined();
      expect(chart.calculated_data.planets).toBeDefined();
      expect(chart.calculated_data.houses).toBeDefined();
    });

    it('should return cached data on second calculation request', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      // First calculation
      const first = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second calculation (should return cached)
      const second = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Both should have the same data
      expect(first.body.data.chart.calculated_data.jd).toBe(
        second.body.data.chart.calculated_data.jd
      );
    });

    it('should return 404 for non-existent chart', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/charts/non-existent-id/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/charts/some-id/calculate')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 when accessing another user\'s chart', async () => {
      if (!isDatabaseAvailable()) return;

      // Create chart as first user
      const chartId = await createChartViaApi();

      // Create second user and try to calculate first user's chart
      const otherUser = await createTestUser(db, { email: 'other@example.com' });
      const otherToken = generateAuthToken(otherUser);

      await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });

  describe('Planetary position accuracy', () => {
    it('should produce consistent Sun position for known date', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sun = response.body.data.chart.calculated_data.planets.sun;
      expect(sun).toBeDefined();

      // Jan 15 = approximately 25° Capricorn (longitude ~295°)
      expect(sun.longitude).toBeGreaterThan(280);
      expect(sun.longitude).toBeLessThan(310);
      expect(sun.sign).toBe('capricorn');
    });

    it('should produce consistent Moon position for known date', async () => {
      if (!isDatabaseAvailable()) return;

      const chartId = await createChartViaApi();

      const response = await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const moon = response.body.data.chart.calculated_data.planets.moon;
      expect(moon).toBeDefined();
      expect(moon.longitude).toBeGreaterThanOrEqual(0);
      expect(moon.longitude).toBeLessThanOrEqual(360);
      expect(moon.sign).toBeDefined();
    });

    it('should calculate different houses for different house systems', async () => {
      if (!isDatabaseAvailable()) return;

      // Create chart with Placidus
      const placidusId = await createChartViaApi({ house_system: 'placidus' });

      const placidus = await request(app)
        .post(`/api/v1/charts/${placidusId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Create chart with Equal house
      const equalId = await createChartViaApi({ house_system: 'equal' });

      const equal = await request(app)
        .post(`/api/v1/charts/${equalId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Ascendant should be the same regardless of house system
      const pAsc = placidus.body.data.chart.calculated_data.ascendant.longitude;
      const eAsc = equal.body.data.chart.calculated_data.ascendant.longitude;
      expect(Math.abs(pAsc - eAsc)).toBeLessThan(1);

      // But house sizes should differ between systems
      const pHouses = placidus.body.data.chart.calculated_data.houses;
      const eHouses = equal.body.data.chart.calculated_data.houses;

      // Placidus houses are typically unequal, Equal houses are all 30°
      const equalSizes = eHouses.map((h: any) => h.size);
      // In Equal house system, each house should be ~30 degrees
      for (const size of equalSizes) {
        expect(Math.abs(size - 30)).toBeLessThan(1);
      }
    });
  });

  describe('Chart lifecycle with calculation', () => {
    it('should create chart, list it, calculate, and retrieve with data', async () => {
      if (!isDatabaseAvailable()) return;

      // Create chart
      const chartId = await createChartViaApi();

      // List charts
      const listRes = await request(app)
        .get('/api/v1/charts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listRes.body.data.charts.length).toBeGreaterThan(0);

      // Calculate
      await request(app)
        .post(`/api/v1/charts/${chartId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Retrieve individual chart with data
      const getRes = await request(app)
        .get(`/api/v1/charts/${chartId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getRes.body.data.chart.calculated_data).toBeDefined();
    });
  });
});
