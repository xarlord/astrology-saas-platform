/**
 * Unit Tests for Chart Model
 * Tests chart database operations
 */

import knex from '../../config/database';
import { ChartModel, Chart, CreateChartData, UpdateChartData } from '../../models/chart.model';

// Mock database
jest.mock('../../config/database');

const mockKnex = knex as jest.MockedFunction<typeof knex>;

describe('Chart Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find chart by ID', async () => {
      const mockChart: Chart = {
        id: '456',
        user_id: '123',
        name: 'My Chart',
        type: 'natal',
        birth_date: new Date('1990-01-15'),
        birth_time: '14:30:00',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockChart),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.findById('456');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: '456' });
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
      expect(result).toEqual(mockChart);
    });

    it('should return null if chart not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByIdAndUserId', () => {
    it('should find chart by ID and user ID', async () => {
      const mockChart: Chart = {
        id: '456',
        user_id: '123',
        name: 'My Chart',
        type: 'natal',
        birth_date: new Date('1990-01-15'),
        birth_time: '14:30:00',
        birth_time_unknown: false,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockChart),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.findByIdAndUserId('456', '123');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: '456', user_id: '123' });
      expect(result).toEqual(mockChart);
    });

    it('should return null if chart not found or does not belong to user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.findByIdAndUserId('456', '999');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should get charts for user with pagination', async () => {
      const mockCharts: Chart[] = [
        {
          id: '1',
          user_id: '123',
          name: 'Chart 1',
          type: 'natal',
          birth_date: new Date(),
          birth_time: '12:00:00',
          birth_time_unknown: false,
          birth_place_name: 'Place',
          birth_latitude: 0,
          birth_longitude: 0,
          birth_timezone: 'UTC',
          house_system: 'placidus',
          zodiac: 'tropical',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: '123',
          name: 'Chart 2',
          type: 'natal',
          birth_date: new Date(),
          birth_time: '12:00:00',
          birth_time_unknown: false,
          birth_place_name: 'Place',
          birth_latitude: 0,
          birth_longitude: 0,
          birth_timezone: 'UTC',
          house_system: 'placidus',
          zodiac: 'tropical',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockCharts),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.findByUserId('123', 10, 0);

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

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      await ChartModel.findByUserId('123');

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(0);
    });
  });

  describe('create', () => {
    it('should create new chart with defaults', async () => {
      const chartData: CreateChartData = {
        user_id: '123',
        name: 'My Chart',
        birth_date: new Date('1990-01-15'),
        birth_time: '14:30:00',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
      };

      const createdChart: Chart = {
        id: '456',
        ...chartData,
        type: 'natal',
        house_system: 'placidus',
        zodiac: 'tropical',
        birth_time_unknown: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([createdChart]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.create(chartData);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'natal',
          house_system: 'placidus',
          zodiac: 'tropical',
          birth_time_unknown: false,
        })
      );
      expect(result).toEqual(createdChart);
    });

    it('should use provided chart type', async () => {
      const chartData: CreateChartData = {
        user_id: '123',
        name: 'Synastry Chart',
        type: 'synastry',
        birth_date: new Date(),
        birth_time: '12:00:00',
        birth_place_name: 'Place',
        birth_latitude: 0,
        birth_longitude: 0,
        birth_timezone: 'UTC',
      };

      const createdChart: Chart = {
        id: '456',
        ...chartData,
        house_system: 'placidus',
        zodiac: 'tropical',
        birth_time_unknown: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([createdChart]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      await ChartModel.create(chartData);

      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'synastry',
        })
      );
    });
  });

  describe('update', () => {
    it('should update chart', async () => {
      const updateData: UpdateChartData = {
        name: 'Updated Chart Name',
        house_system: 'whole_sign',
      };

      const updatedChart: Chart = {
        id: '456',
        user_id: '123',
        name: 'Updated Chart Name',
        type: 'natal',
        birth_date: new Date(),
        birth_time: '12:00:00',
        birth_time_unknown: false,
        birth_place_name: 'Place',
        birth_latitude: 0,
        birth_longitude: 0,
        birth_timezone: 'UTC',
        house_system: 'whole_sign',
        zodiac: 'tropical',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedChart]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.update('456', '123', updateData);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Chart Name',
          house_system: 'whole_sign',
          updated_at: expect.any(Date),
        })
      );
      expect(result).toEqual(updatedChart);
    });

    it('should return null if chart not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.update('999', '123', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('updateCalculatedData', () => {
    it('should update calculated data', async () => {
      const calculatedData = {
        jd: 2451545.0,
        planets: { sun: { longitude: 280 } },
        houses: { houses: [] },
        aspects: [],
      };

      const updatedChart: Chart = {
        id: '456',
        user_id: '123',
        name: 'Chart',
        type: 'natal',
        birth_date: new Date(),
        birth_time: '12:00:00',
        birth_time_unknown: false,
        birth_place_name: 'Place',
        birth_latitude: 0,
        birth_longitude: 0,
        birth_timezone: 'UTC',
        house_system: 'placidus',
        zodiac: 'tropical',
        calculated_data: calculatedData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedChart]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.updateCalculatedData('456', '123', calculatedData);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        calculated_data: calculatedData,
        updated_at: expect.any(Date),
      });
      expect(result).toEqual(updatedChart);
    });
  });

  describe('softDelete', () => {
    it('should soft delete chart', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.softDelete('456', '123');

      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        deleted_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(result).toBe(true);
    });

    it('should return false if chart not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(0),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.softDelete('999', '123');

      expect(result).toBe(false);
    });
  });

  describe('countByUserId', () => {
    it('should count charts for user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue([{ count: '5' }]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.countByUserId('123');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: '123' });
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
      expect(mockQueryBuilder.count).toHaveBeenCalledWith('* as count');
      expect(result).toBe(5);
    });

    it('should return 0 if no charts', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue([{ count: '0' }]),
      };

      mockKnex.mockReturnValue(mockQueryBuilder as any);

      const result = await ChartModel.countByUserId('999');

      expect(result).toBe(0);
    });
  });
});
