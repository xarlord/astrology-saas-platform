     1|/**
     2| * Tests for Monthly Transit Report Service
     3| * CHI-123: Backend API endpoint for monthly transit reports
     4| */
     5|
     6|import { describe, it, expect, beforeEach, jest } from '@jest/globals';
     7|import { generateMonthlyTransitReport } from './monthlyTransit.service';
     8|import ChartModel from '../../charts/models/chart.model';
     9|import { AstronomyEngineService } from '../../shared/services/astronomyEngine.service';
    10|
    11|// Mock dependencies
    12|jest.mock('../../charts/models/chart.model');
    13|jest.mock('../../shared/services/astronomyEngine.service');
    14|
    15|describe('MonthlyTransitReport Service', () => {
    16|  const mockUserId = 'user-123';
    17|  const mockMonth = '2026-04';
    18|
    19|  // Mock chart data
    20|  const mockChart = {
    21|    id: 'chart-123',
    22|    user_id: mockUserId,
    23|    birth_date: new Date('1990-01-15'),
    24|    birth_time: '10:30:00',
    25|    birth_place_name: 'New York, NY',
    26|    birth_latitude: 40.7128,
    27|    birth_longitude: -74.006,
    28|    sunLongitude: 295.5,
    29|    moonLongitude: 45.2,
    30|  };
    31|
    32|  beforeEach(() => {
    33|    jest.clearAllMocks();
    34|
    35|    // Mock AstronomyEngineService instance
    36|    const mockPositions = new Map();
    37|    mockPositions.set('Sun', {
    38|      sign: 'Aries',
    39|      degree: 15.5,
    40|      longitude: 15.5,
    41|      isRetrograde: false,
    42|    });
    43|    mockPositions.set('Moon', {
    44|      sign: 'Taurus',
    45|      degree: 23.2,
    46|      longitude: 53.2,
    47|      isRetrograde: false,
    48|    });
    49|    mockPositions.set('Mercury', {
    50|      sign: 'Aries',
    51|      degree: 5.8,
    52|      longitude: 5.8,
    53|      isRetrograde: false,
    54|    });
    55|    mockPositions.set('Venus', {
    56|      sign: 'Pisces',
    57|      degree: 28.1,
    58|      longitude: 358.1,
    59|      isRetrograde: false,
    60|    });
    61|    mockPositions.set('Mars', {
    62|      sign: 'Gemini',
    63|      degree: 12.3,
    64|      longitude: 72.3,
    65|      isRetrograde: false,
    66|    });
    67|
    68|    (AstronomyEngineService as jest.MockedClass<typeof AstronomyEngineService>).mockImplementation(
    69|      () => {
    70|        return {
    71|          calculatePlanetaryPositions: jest.fn(() => mockPositions),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    72|        } as any;
    73|      },
    74|    );
    75|  });
    76|
    77|  // ===== Happy Path =====
    78|
    79|  describe('generateMonthlyTransitReport', () => {
    80|    it('should generate complete monthly report for valid user and month', async () => {
    81|      // Given
    82|      const charts = [mockChart];
    83|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
    84|
    85|      // When
    86|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
    87|
    88|      // Then
    89|      expect(result).toBeDefined();
    90|      expect(result.userId).toBe(mockUserId);
    91|      expect(result.month).toBe(mockMonth);
    92|      expect(result.natalChart.id).toBe(mockChart.id);
    93|      expect(result.natalChart.birthDate).toBe('1990-01-15');
    94|      expect(result.natalChart.birthTime).toBe('10:30:00');
    95|      expect(result.natalChart.birthPlace).toBe('New York, NY');
    96|      expect(result.dailyTransits).toBeDefined();
    97|      expect(Array.isArray(result.dailyTransits)).toBe(true);
    98|      expect(result.summary).toBeDefined();
    99|      expect(result.summary.keyThemes).toBeDefined();
   100|      expect(Array.isArray(result.summary.keyThemes)).toBe(true);
   101|      expect(result.summary.majorTransits).toBeDefined();
   102|      expect(Array.isArray(result.summary.majorTransits)).toBe(true);
   103|      expect(result.summary.retrogrades).toBeDefined();
   104|      expect(Array.isArray(result.summary.retrogrades)).toBe(true);
   105|      expect(result.generatedAt).toBeDefined();
   106|    });
   107|
   108|    it('should use current month when no month parameter provided', async () => {
   109|      // Given
   110|      const charts = [mockChart];
   111|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   112|      const currentMonth = new Date().toISOString().slice(0, 7);
   113|
   114|      // When
   115|      const result = await generateMonthlyTransitReport(mockUserId);
   116|
   117|      // Then
   118|      expect(result.month).toBe(currentMonth);
   119|    });
   120|
   121|    it('should generate daily transits for all days in the month', async () => {
   122|      // Given
   123|      const charts = [mockChart];
   124|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   125|
   126|      // When
   127|      const result = await generateMonthlyTransitReport(mockUserId, '2026-04');
   128|
   129|      // Then
   130|      expect(result.dailyTransits.length).toBe(30);
   131|    });
   132|  });
   133|
   134|  // ===== Error Cases =====
   135|
   136|  describe('generateMonthlyTransitReport - Error Cases', () => {
   137|    it('should throw error when user has no natal chart', async () => {
   138|      // Given
   139|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);
   140|
   141|      // When & Then
   142|      await expect(generateMonthlyTransitReport(mockUserId, mockMonth)).rejects.toThrow(
   143|        'No natal chart found. Please create a natal chart first.',
   144|      );
   145|    });
   146|
   147|    it('should throw error for invalid month format', async () => {
   148|      // Given
   149|      const charts = [mockChart];
   150|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   151|
   152|      // When & Then
   153|      await expect(generateMonthlyTransitReport(mockUserId, 'invalid')).rejects.toThrow(
   154|        'Invalid month format. Use YYYY-MM.',
   155|      );
   156|    });
   157|
   158|    it('should throw error for month out of range', async () => {
   159|      // Given
   160|      const charts = [mockChart];
   161|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   162|
   163|      // When & Then
   164|      await expect(generateMonthlyTransitReport(mockUserId, '2026-13')).rejects.toThrow(
   165|        'Invalid month format. Use YYYY-MM.',
   166|      );
   167|    });
   168|  });
   169|
   170|  // ===== Edge Cases =====
   171|
   172|  describe('generateMonthlyTransitReport - Edge Cases', () => {
   173|    it('should handle leap year February', async () => {
   174|      // Given
   175|      const charts = [mockChart];
   176|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   177|
   178|      // When
   179|      const result = await generateMonthlyTransitReport(mockUserId, '2024-02');
   180|
   181|      // Then
   182|      expect(result.dailyTransits.length).toBe(29);
   183|    });
   184|
   185|    it('should handle non-leap year February', async () => {
   186|      // Given
   187|      const charts = [mockChart];
   188|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   189|
   190|      // When
   191|      const result = await generateMonthlyTransitReport(mockUserId, '2025-02');
   192|
   193|      // Then
   194|      expect(result.dailyTransits.length).toBe(28);
   195|    });
   196|
   197|    it('should handle user with multiple charts', async () => {
   198|      // Given
   199|      const charts = [mockChart, { ...mockChart, id: 'chart-456' }];
   200|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   201|
   202|      // When
   203|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
   204|
   205|      // Then
   206|      expect(result.natalChart.id).toBe(mockChart.id);
   207|    });
   208|  });
   209|
   210|  // ===== Data Structure Validation =====
   211|
   212|  describe('generateMonthlyTransitReport - Data Structure', () => {
   213|    it('should return valid MonthlyTransitReport interface', async () => {
   214|      // Given
   215|      const charts = [mockChart];
   216|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   217|
   218|      // When
   219|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
   220|
   221|      // Then
   222|      expect(result).toHaveProperty('userId');
   223|      expect(result).toHaveProperty('month');
   224|      expect(result).toHaveProperty('natalChart');
   225|      expect(result).toHaveProperty('dailyTransits');
   226|      expect(result).toHaveProperty('summary');
   227|      expect(result).toHaveProperty('generatedAt');
   228|    });
   229|
   230|    it('should maintain consistent date formats', async () => {
   231|      // Given
   232|      const charts = [mockChart];
   233|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   234|
   235|      // When
   236|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
   237|
   238|      // Then
   239|      result.dailyTransits.forEach((day) => {
   240|        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
   241|      });
   242|    });
   243|
   244|    it('should ensure all planet degrees are numbers', async () => {
   245|      // Given
   246|      const charts = [mockChart];
   247|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   248|
   249|      // When
   250|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
   251|
   252|      // Then
   253|      result.dailyTransits.forEach((day) => {
   254|        expect(typeof day.sun.degree).toBe('number');
   255|        expect(typeof day.moon.degree).toBe('number');
   256|        expect(typeof day.mercury.degree).toBe('number');
   257|        expect(typeof day.venus.degree).toBe('number');
   258|        expect(typeof day.mars.degree).toBe('number');
   259|      });
   260|    });
   261|
   262|    it('should ensure all retrograde flags are booleans', async () => {
   263|      // Given
   264|      const charts = [mockChart];
   265|      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
   266|
   267|      // When
   268|      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);
   269|
   270|      // Then
   271|      result.dailyTransits.forEach((day) => {
   272|        expect(typeof day.mercury.retrograde).toBe('boolean');
   273|        expect(typeof day.venus.retrograde).toBe('boolean');
   274|        expect(typeof day.mars.retrograde).toBe('boolean');
   275|      });
   276|    });
   277|  });
   278|});
   279|