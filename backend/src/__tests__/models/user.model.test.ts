/**
 * Unit Tests for User Model
 * Tests user database operations
 */

import db from '../db';
import UserModel, { User, CreateUserData, UpdateUserData } from '../../models/user.model';

// Mock database
jest.mock('../db');

const mockDb = db as jest.MockedFunction<typeof db>;

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed',
        timezone: 'UTC',
        plan: 'free',
        subscription_status: 'active',
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.findById('123');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: '123' });
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.findById('999');

      expect(result).toBeNull();
    });

    it('should exclude deleted users', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      await UserModel.findById('123');

      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed',
        timezone: 'UTC',
        plan: 'free',
        subscription_status: 'active',
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.findByEmail('test@example.com');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if email not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user with defaults', async () => {
      const userData: CreateUserData = {
        name: 'New User',
        email: 'new@example.com',
        password_hash: 'hashedpassword',
      };

      const createdUser: User = {
        id: '456',
        ...userData,
        timezone: 'UTC',
        plan: 'free',
        subscription_status: 'active',
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockResolvedValue([createdUser]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.create(userData);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New User',
          email: 'new@example.com',
          password_hash: 'hashedpassword',
          preferences: {},
          plan: 'free',
          subscription_status: 'active',
          timezone: 'UTC',
        })
      );
      expect(result).toEqual(createdUser);
    });

    it('should use provided timezone', async () => {
      const userData: CreateUserData = {
        name: 'New User',
        email: 'new@example.com',
        password_hash: 'hashedpassword',
        timezone: 'America/New_York',
      };

      const createdUser: User = {
        id: '456',
        ...userData,
        plan: 'free',
        subscription_status: 'active',
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockResolvedValue([createdUser]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      await UserModel.create(userData);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: 'America/New_York',
        })
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData: UpdateUserData = {
        name: 'Updated Name',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const updatedUser: User = {
        id: '123',
        name: 'Updated Name',
        email: 'test@example.com',
        password_hash: 'hashed',
        avatar_url: 'https://example.com/avatar.jpg',
        timezone: 'UTC',
        plan: 'free',
        subscription_status: 'active',
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.update('123', updateData);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          avatar_url: 'https://example.com/avatar.jpg',
          updated_at: expect.any(Date),
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.update('999', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.softDelete('123');

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        deleted_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(0),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.softDelete('999');

      expect(result).toBe(false);
    });
  });

  describe('updatePlan', () => {
    it('should update user plan', async () => {
      const updatedUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed',
        timezone: 'UTC',
        plan: 'premium',
        subscription_status: 'active',
        subscription_renews_at: new Date(),
        preferences: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.updatePlan('123', 'premium', 'active', new Date());

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'premium',
          subscription_status: 'active',
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should use default status', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([{ id: '123' }]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      await UserModel.updatePlan('123', 'premium');

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_status: 'active',
        })
      );
    });
  });

  describe('getCharts', () => {
    it('should get user charts with pagination', async () => {
      const mockCharts = [
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockCharts),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.getCharts('123', 10, 0);

      expect(mockDb).toHaveBeenCalledWith('charts');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: '123' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockCharts);
    });

    it('should use default limit and offset', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      await UserModel.getCharts('123');

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
    });
  });

  describe('updatePreferences', () => {
    it('should merge preferences', async () => {
      const existingUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed',
        timezone: 'UTC',
        plan: 'free',
        subscription_status: 'active',
        preferences: { theme: 'light' },
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedUser: User = {
        ...existingUser,
        preferences: { theme: 'dark', houseSystem: 'whole_sign' },
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue([updatedUser]),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      // Mock findById to return existing user
      const findQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(existingUser),
      };

      mockDb.mockReturnValueOnce(findQueryBuilder as any);
      mockDb.mockReturnValueOnce(mockQueryBuilder as any);

      const result = await UserModel.updatePreferences('123', { houseSystem: 'whole_sign', theme: 'dark' });

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        preferences: { theme: 'dark', houseSystem: 'whole_sign' },
        updated_at: expect.any(Date),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockDb.mockReturnValue(mockQueryBuilder as any);

      const result = await UserModel.updatePreferences('999', { theme: 'dark' });

      expect(result).toBeNull();
    });
  });
});
