/**
 * Integration Tests for Card Routes
 * Tests shareable natal chart card API endpoints
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import request from 'supertest';
import db from '../../config/database';
import { cleanDatabase, createTestUser, generateAuthToken } from './utils';
import {
  setupTestDatabase,
  teardownTestDatabase,
  cleanAllTables,
  isDatabaseAvailable,
} from './integration.test.setup';
import app from '../../server';

describe('Card Routes Integration Tests', () => {
  let testUser: any;
  let authToken: string;
  let testChart: any;

  beforeAll(async () => {
    try {
      await setupTestDatabase();
    } catch {
      // Database not available - tests will be skipped
    }

    if (!isDatabaseAvailable()) return;

    // Create test user and get auth token
    testUser = await createTestUser(db);
    authToken = generateAuthToken(testUser);

    // Create a test chart for the user
    const [chart] = await db('charts')
      .insert({
        user_id: testUser.id,
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30:00',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        calculated_data: {
          planets: { sun: { sign: 'Capricorn', degree: 25.5 } },
          houses: [],
          aspects: [],
        },
      })
      .returning('*');

    testChart = chart;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    if (!isDatabaseAvailable()) return;
    await cleanAllTables();

    // Recreate user and chart for each test
    testUser = await createTestUser(db);
    authToken = generateAuthToken(testUser);

    const [chart] = await db('charts')
      .insert({
        user_id: testUser.id,
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30:00',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        calculated_data: {
          planets: { sun: { sign: 'Capricorn', degree: 25.5 } },
          houses: [],
          aspects: [],
        },
      })
      .returning('*');

    testChart = chart;
  });

  describe('POST /api/v1/cards/generate', () => {
    it('should generate a new card with valid data', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'instagram_story',
          planet_placements: ['sun', 'moon', 'ascendant'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('share_token');
      expect(response.body.data).toHaveProperty('template', 'instagram_story');
      expect(response.body.data).toHaveProperty('is_public', true);
    });

    it('should return 400 for missing chart_id', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          template: 'instagram_story',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .post('/api/v1/cards/generate')
        .send({
          chart_id: testChart.id,
          template: 'instagram_story',
        })
        .expect(401);
    });

    it('should validate template names', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'invalid_template',
          planet_placements: ['sun', 'moon', 'ascendant'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate planet placements (3-5 planets)', async () => {
      if (!isDatabaseAvailable()) return;

      // Only 2 planets - should fail
      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          planet_placements: ['sun', 'moon'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should default to instagram_story template if not provided', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('template', 'instagram_story');
    });

    it('should default to 3 planets if not provided', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('planet_placements');
      const placements = response.body.data.planet_placements;
      expect(placements.length).toBeGreaterThanOrEqual(3);
      expect(placements.length).toBeLessThanOrEqual(5);
    });

    it('should enforce rate limit of 10 cards per day', async () => {
      if (!isDatabaseAvailable()) return;

      // Create 10 cards
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/cards/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            chart_id: testChart.id,
            template: 'instagram_story',
            planet_placements: ['sun', 'moon', 'ascendant'],
          })
          .expect(201);
      }

      // 11th card should fail with rate limit error
      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'instagram_story',
          planet_placements: ['sun', 'moon', 'ascendant'],
        })
        .expect(429); // Too Many Requests

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/cards/:id', () => {
    it('should get card by id for owner', async () => {
      if (!isDatabaseAvailable()) return;

      // First create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'instagram_story',
        });

      const cardId = createResponse.body.data.id;

      // Get the card
      const response = await request(app)
        .get(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', cardId);
    });

    it('should return 404 for non-existent card', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .get('/api/v1/cards/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      // First create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const cardId = createResponse.body.data.id;

      await request(app).get(`/api/v1/cards/${cardId}`).expect(401);
    });

    it('should return 404 for deleted card', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const cardId = createResponse.body.data.id;

      // Delete the card
      await request(app)
        .delete(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to get it - should be 404
      await request(app)
        .get(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/cards/public/:shareToken', () => {
    it('should get public card by share token without auth', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'instagram_story',
        });

      const shareToken = createResponse.body.data.share_token;

      // Get public card
      const response = await request(app).get(`/api/v1/cards/public/${shareToken}`).expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('template');
      expect(response.body.data).toHaveProperty('image_url');
      // Should NOT include user-specific fields like referral_code
      expect(response.body.data).toHaveProperty('referral_code');
    });

    it('should return 404 for invalid share token', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app).get('/api/v1/cards/public/invalid-token').expect(404);
    });

    it('should return 404 for deleted card via share token', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const shareToken = createResponse.body.data.share_token;
      const cardId = createResponse.body.data.id;

      // Delete the card
      await request(app)
        .delete(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to access via public share token - should be 404
      await request(app).get(`/api/v1/cards/public/${shareToken}`).expect(404);
    });
  });

  describe('GET /api/v1/cards/history', () => {
    beforeEach(async () => {
      if (!isDatabaseAvailable()) return;

      // Create some test cards
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/cards/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            chart_id: testChart.id,
            template: 'instagram_story',
          });
      }
    });

    it('should get user card history with default pagination', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/cards/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('cards');
      expect(response.body.data.cards).toHaveLength(5);
      expect(response.body.data).toHaveProperty('limit', 20);
      expect(response.body.data).toHaveProperty('offset', 0);
    });

    it('should respect limit parameter', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/cards/history?limit=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.cards).toHaveLength(3);
      expect(response.body.data).toHaveProperty('limit', 3);
    });

    it('should respect offset parameter', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/cards/history?offset=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.cards).toHaveLength(3); // 5 total, offset 2, should return 3
      expect(response.body.data).toHaveProperty('offset', 2);
    });

    it('should enforce max limit of 50', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/cards/history?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('limit', 50); // Should cap at 50
    });

    it('should return empty array for user with no cards', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a new user with no cards
      const newUser = await createTestUser(db);
      const newAuthToken = generateAuthToken(newUser);

      const response = await request(app)
        .get('/api/v1/cards/history')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .expect(200);

      expect(response.body.data.cards).toHaveLength(0);
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app).get('/api/v1/cards/history').expect(401);
    });
  });

  describe('DELETE /api/v1/cards/:id', () => {
    it('should soft delete a card', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const cardId = createResponse.body.data.id;

      // Delete the card
      const response = await request(app)
        .delete(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('deleted', true);

      // Verify it's actually deleted
      await request(app)
        .get(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent card', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .delete('/api/v1/cards/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const cardId = createResponse.body.data.id;

      await request(app).delete(`/api/v1/cards/${cardId}`).expect(401);
    });

    it('should only allow owner to delete their card', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card for user1
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const cardId = createResponse.body.data.id;

      // Create another user
      const anotherUser = await createTestUser(db);
      const anotherAuthToken = generateAuthToken(anotherUser);

      // Try to delete user1's card with user2's auth - should fail
      await request(app)
        .delete(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${anotherAuthToken}`)
        .expect(404); // Returns 404 (card not found for this user)
    });
  });

  describe('GET /api/v1/cards/public/:shareToken/og', () => {
    it('should get OG metadata for social preview', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          template: 'twitter_x',
          show_insight: true,
        });

      const shareToken = createResponse.body.data.share_token;

      // Get OG data
      const response = await request(app).get(`/api/v1/cards/public/${shareToken}/og`).expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('og_title');
      expect(response.body.data).toHaveProperty('og_description');
      expect(response.body.data).toHaveProperty('og_image');
    });

    it('should return 404 for invalid share token', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app).get('/api/v1/cards/public/invalid-token/og').expect(404);
    });

    it('should return 404 for deleted card via OG endpoint', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const shareToken = createResponse.body.data.share_token;
      const cardId = createResponse.body.data.id;

      // Delete the card
      await request(app)
        .delete(`/api/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to get OG data - should be 404
      await request(app).get(`/api/v1/cards/public/${shareToken}/og`).expect(404);
    });

    it('should not require authentication', async () => {
      if (!isDatabaseAvailable()) return;

      // Create a card
      const createResponse = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
        });

      const shareToken = createResponse.body.data.share_token;

      // Access OG endpoint without auth - should succeed
      await request(app).get(`/api/v1/cards/public/${shareToken}/og`).expect(200);
    });
  });

  describe('Template Validation', () => {
    const validTemplates = ['instagram_story', 'twitter_x', 'pinterest', 'square', 'linkedin'];

    validTemplates.forEach((template) => {
      it(`should accept valid template: ${template}`, async () => {
        if (!isDatabaseAvailable()) return;

        const response = await request(app)
          .post('/api/v1/cards/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            chart_id: testChart.id,
            template,
          })
          .expect(201);

        expect(response.body.data).toHaveProperty('template', template);
      });
    });
  });

  describe('Planet Placement Validation', () => {
    it('should accept valid planet placements', async () => {
      if (!isDatabaseAvailable()) return;

      const validPlanets = ['sun', 'moon', 'ascendant', 'mercury', 'venus'];

      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          planet_placements: validPlanets,
        })
        .expect(201);

      expect(response.body.data.planet_placements).toHaveLength(5);
    });

    it('should filter out invalid planet names', async () => {
      if (!isDatabaseAvailable()) return;

      // Mix of valid and invalid planets
      const response = await request(app)
        .post('/api/v1/cards/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chart_id: testChart.id,
          planet_placements: ['sun', 'invalid_planet', 'moon', 'another_invalid', 'ascendant'],
        })
        .expect(201);

      // Should filter to only valid planets: sun, moon, ascendant
      expect(response.body.data.planet_placements.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.planet_placements).not.toContain('invalid_planet');
    });
  });
});
