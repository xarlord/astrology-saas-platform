/**
 * Integration Tests for Authentication Routes
 * Tests user registration, login, logout, token refresh, and profile management
 */

import { build } from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { mockUser, mockRequest, mockResponse, cleanDatabase, createTestUser } from './utils';

// Import app
// We'll need to create the app first
import '../server'; // This will be the Express app

describe('Authentication Routes Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    // Initialize Express app for testing
    app = build();

    // Run migrations
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    await cleanDatabase(db);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');

      // Verify user was created in database
      const [user] = await db('users').where({ email: userData.email }).select('*');
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it('should return 400 for missing email', async () => {
      const userData = {
        password: 'SecurePass123!',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'weak',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      // Create first user
      await createTestUser(db, { email: userData.email });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'passwordtest@example.com',
        password: 'PlainTextPassword123!',
        name: 'Password Test',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const [user] = await db('users').where({ email: userData.email }).select('*');
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const password = 'LoginPass123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createTestUser(db, {
        email: 'login@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const user = await createTestUser(db);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return JWT token on successful login', async () => {
      const password = 'TokenTest123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createTestUser(db, {
        email: 'token@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password,
        })
        .expect(200);

      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');

      // Verify token structure (should be JWT)
      const tokenParts = response.body.data.token.split('.');
      expect(tokenParts).toHaveLength(3); // header.payload.signature
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const user = await createTestUser(db);

      const token = 'Bearer mock-token'; // In real test, would generate real JWT

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await createTestUser(db);

      // Create a refresh token
      const refreshToken = await db('refresh_tokens').insert({
        user_id: user.id,
        token: 'mock-refresh-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
      }).returning('token');

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user and invalidate refresh token', async () => {
      const user = await createTestUser(db);
      const refreshToken = await db('refresh_tokens').insert({
        user_id: user.id,
        token: 'mock-refresh-token',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
      }).returning('token');

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify refresh token was deleted
      const token = await db('refresh_tokens').where({ token: refreshToken }).first();
      expect(token).toBeUndefined();
    });
  });
});
