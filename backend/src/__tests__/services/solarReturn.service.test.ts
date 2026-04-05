/**
 * Solar Return Service Tests
 * Comprehensive tests for solar return calculations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock AstronomyEngineService - define mock fns inline to avoid hoisting TDZ
jest.mock('../../modules/shared/services/astronomyEngine.service', () => {
  const mockFn = jest.fn();
  return {
    __esModule: true,
    AstronomyEngineService: jest.fn().mockImplementation(() => ({
      calculatePlanetaryPositions: mockFn,
    })),
    // Expose mock for test access
    __mockCalcPositions: mockFn,
  };
});

// Mock NatalChartService
jest.mock('../../modules/shared/services/natalChart.service', () => {
  const mockFn = jest.fn();
  return {
    __esModule: true,
    NatalChartService: jest.fn().mockImplementation(() => ({
      calculateNatalChart: mockFn,
    })),
    __mockCalcNatal: mockFn,
  };
});

import { SolarReturnService } from '../../modules/solar/services/solarReturn.service';
import { SolarReturnChartData, Aspect } from '../../modules/solar/models/types';
import { __mockCalcPositions } from '../../modules/shared/services/astronomyEngine.service';
import { __mockCalcNatal } from '../../modules/shared/services/natalChart.service';

const mockCalculatePlanetaryPositions = __mockCalcPositions as jest.Mock;
const mockCalculateNatalChart = __mockCalcNatal as jest.Mock;

// Helper to build mock chart data
function buildMockChartData(overrides?: Partial<SolarReturnChartData>): SolarReturnChartData {
  return {
    planets: [
      { planet: 'sun', sign: 'capricorn', degree: 10, minute: 30, second: 0, house: 10, retrograde: false },
      { planet: 'moon', sign: 'pisces', degree: 15, minute: 0, second: 0, house: 12, retrograde: false },
      { planet: 'jupiter', sign: 'taurus', degree: 5, minute: 0, second: 0, house: 2, retrograde: false },
      { planet: 'venus', sign: 'aquarius', degree: 20, minute: 0, second: 0, house: 11, retrograde: false },
      { planet: 'mars', sign: 'gemini', degree: 8, minute: 0, second: 0, house: 3, retrograde: true },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      sign: 'aries',
      degree: 0,
      minute: 0,
      second: 0,
    })),
    aspects: [],
    ascendant: { sign: 'aries', degree: 0, minute: 0, second: 0 },
    mc: { sign: 'capricorn', degree: 0, minute: 0, second: 0 },
    moonPhase: { phase: 'full', illumination: 100 },
    ...overrides,
  };
}

function buildMockNatalChart(overrides?: Record<string, any>) {
  return {
    planets: new Map([
      ['Sun', { longitude: 280, sign: 'capricorn', degree: 10, minute: 0, second: 0, house: 10, isRetrograde: false }],
      ['Moon', { longitude: 100, sign: 'cancer', degree: 10, minute: 0, second: 0, house: 4, isRetrograde: false }],
    ]),
    houses: {
      cusps: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: 'aries',
        degree: 0,
        minute: 0,
        second: 0,
        longitude: i * 30,
      })),
    },
    aspects: [],
    ...overrides,
  };
}

function setupSunMock(longitude = 280.5) {
  mockCalculatePlanetaryPositions.mockImplementation(() => {
    const map = new Map();
    map.set('Sun', { longitude, sign: 'capricorn', degree: 10 });
    return map;
  });
}

describe('SolarReturnService', () => {
  let service: SolarReturnService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SolarReturnService();
  });

  // =====================
  // calculateLuckyDays
  // =====================
  describe('calculateLuckyDays', () => {
    it('should return empty array when no Jupiter or Venus favorable aspects', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'sun', planet2: 'moon', type: 'conjunction', orb: 5, applying: true },
          { planet1: 'mars', planet2: 'saturn', type: 'square', orb: 3, applying: false },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toEqual([]);
    });

    it('should find lucky days from Jupiter trine aspects', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'sun', type: 'trine', orb: 2, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain('Jupiter trine');
      expect(result[0].intensity).toBe(9); // orb < 3
      expect(result[0].date).toMatch(/^2026-/);
    });

    it('should find lucky days from Jupiter sextile aspects', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'mars', planet2: 'jupiter', type: 'sextile', orb: 5, applying: false },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      // Only Jupiter matches (mars is not Venus), so 1 result
      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain('Jupiter sextile');
      expect(result[0].intensity).toBe(7); // orb >= 3
    });

    it('should find lucky days from Venus trine aspects', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'venus', planet2: 'mars', type: 'trine', orb: 4, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain('Venus trine');
      expect(result[0].intensity).toBe(6);
    });

    it('should find lucky days from Venus sextile aspects', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'moon', planet2: 'venus', type: 'sextile', orb: 1, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain('Venus sextile');
    });

    it('should return multiple lucky days sorted by date', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'venus', type: 'trine', orb: 2, applying: true },
          { planet1: 'venus', planet2: 'mars', type: 'sextile', orb: 3, applying: false },
          { planet1: 'jupiter', planet2: 'sun', type: 'sextile', orb: 4, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result.length).toBeGreaterThanOrEqual(3);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].date.localeCompare(result[i - 1].date)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should not include non-favorable aspects (conjunction, square, opposition)', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'mars', type: 'conjunction', orb: 1, applying: true },
          { planet1: 'jupiter', planet2: 'saturn', type: 'square', orb: 2, applying: false },
          { planet1: 'venus', planet2: 'pluto', type: 'opposition', orb: 3, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toEqual([]);
    });

    it('should assign intensity 9 for Jupiter aspects with orb < 3', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'moon', type: 'trine', orb: 1.5, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result[0].intensity).toBe(9);
    });

    it('should assign intensity 7 for Jupiter aspects with orb >= 3', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'moon', type: 'trine', orb: 5.0, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result[0].intensity).toBe(7);
    });
  });

  // =====================
  // generateYearlyThemes
  // =====================
  describe('generateYearlyThemes', () => {
    it('should return themes for house 1 (self-discovery)', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'aries', degree: 10, minute: 0, second: 0, house: 1, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Self-discovery');
      expect(themes).toContain('New beginnings');
    });

    it('should return themes for house 10 (career)', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'capricorn', degree: 10, minute: 0, second: 0, house: 10, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Career');
      expect(themes).toContain('Ambition');
    });

    it('should return themes for house 7 (partnerships)', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'libra', degree: 5, minute: 0, second: 0, house: 7, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Partnerships');
      expect(themes).toContain('Relationships');
    });

    it('should default to house 1 themes when sun not found', () => {
      const chartData = buildMockChartData({ planets: [] });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Self-discovery');
    });

    it('should return themes for house 5 (creativity)', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'leo', degree: 15, minute: 0, second: 0, house: 5, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Creativity');
      expect(themes).toContain('Romance');
    });

    it('should return themes for house 12 (spirituality)', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'pisces', degree: 20, minute: 0, second: 0, house: 12, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toContain('Spirituality');
      expect(themes).toContain('Subconscious');
    });

    it('should return 4 themes for any house', () => {
      for (let house = 1; house <= 12; house++) {
        const chartData = buildMockChartData({
          planets: [
            { planet: 'sun', sign: 'aries', degree: 10, minute: 0, second: 0, house, retrograde: false },
          ],
        });

        const themes = service.generateYearlyThemes(chartData);
        expect(themes).toHaveLength(4);
      }
    });
  });

  // =====================
  // calculateSolarReturn
  // =====================
  describe('calculateSolarReturn', () => {
    it('should calculate solar return with default location', async () => {
      let callCount = 0;
      mockCalculatePlanetaryPositions.mockImplementation(() => {
        const map = new Map();
        const sunLong = callCount < 20 ? 280.5 - (0.5 / (callCount + 1)) : 280.5;
        map.set('Sun', { longitude: sunLong, sign: 'capricorn', degree: 10 });
        callCount++;
        return map;
      });

      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result).toBeDefined();
      expect(result.returnDate).toBeInstanceOf(Date);
      expect(result.chartData).toBeDefined();
      expect(result.chartData.planets).toBeDefined();
      expect(result.chartData.houses).toBeDefined();
    });

    it('should calculate solar return with custom location', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const customLocation = {
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      };

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        location: customLocation,
      });

      expect(result).toBeDefined();
      expect(result.chartData).toBeDefined();
    });

    it('should use placidus house system by default', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'Placidus' }),
      );
    });

    it('should throw when Sun position cannot be calculated', async () => {
      mockCalculatePlanetaryPositions.mockImplementation(() => {
        const map = new Map();
        map.set('Moon', { longitude: 100, sign: 'cancer', degree: 10 });
        return map;
      });

      await expect(
        service.calculateSolarReturn({
          natalChartId: 'chart-1',
          year: 2026,
        }),
      ).rejects.toThrow('Failed to calculate Sun position');
    });

    it('should extract planets from natal chart into array format', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      const sunPlanet = result.chartData.planets.find(p => p.planet === 'sun');
      expect(sunPlanet).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(sunPlanet!.sign).toBe('capricorn');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(sunPlanet!.retrograde).toBe(false);
    });

    it('should extract houses from natal chart', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.houses).toHaveLength(12);
      expect(result.chartData.houses[0].house).toBe(1);
    });

    it('should extract ascendant from first house cusp', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.ascendant).toBeDefined();
      expect(result.chartData.ascendant.sign).toBe('aries');
    });

    it('should extract MC from tenth house cusp', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.mc).toBeDefined();
      expect(result.chartData.mc.sign).toBe('aries');
    });
  });

  // =====================
  // Moon Phase Calculation (via calculateSolarReturn)
  // =====================
  describe('moon phase calculation', () => {
    it('should calculate full moon phase when Sun-Moon angle is ~180 degrees', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart({
        planets: new Map([
          ['Sun', { longitude: 0, sign: 'aries', degree: 0, minute: 0, second: 0, house: 1, isRetrograde: false }],
          ['Moon', { longitude: 180, sign: 'libra', degree: 0, minute: 0, second: 0, house: 7, isRetrograde: false }],
        ]),
      }));

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.moonPhase.phase).toBe('full');
      // Note: illumination formula is (1 + cos(phaseAngle)) / 2
      // For phaseAngle=180: cos(180)=-1 → illumination=0
      expect(result.chartData.moonPhase.illumination).toBe(0);
    });

    it('should calculate new moon when Sun and Moon are conjunct', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart({
        planets: new Map([
          ['Sun', { longitude: 100, sign: 'cancer', degree: 10, minute: 0, second: 0, house: 4, isRetrograde: false }],
          ['Moon', { longitude: 105, sign: 'cancer', degree: 15, minute: 0, second: 0, house: 4, isRetrograde: false }],
        ]),
      }));

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.moonPhase.phase).toBe('new');
      expect(result.chartData.moonPhase.illumination).toBeGreaterThanOrEqual(95);
    });

    it('should handle missing Sun or Moon positions', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart({
        planets: new Map([
          ['Sun', { longitude: 100, sign: 'cancer', degree: 10, minute: 0, second: 0, house: 4, isRetrograde: false }],
          // No Moon
        ]),
      }));

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.moonPhase.phase).toBe('unknown');
      expect(result.chartData.moonPhase.illumination).toBe(0);
    });

    it('should calculate first-quarter phase (100 degrees)', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart({
        planets: new Map([
          ['Sun', { longitude: 0, sign: 'aries', degree: 0, minute: 0, second: 0, house: 1, isRetrograde: false }],
          ['Moon', { longitude: 100, sign: 'cancer', degree: 10, minute: 0, second: 0, house: 4, isRetrograde: false }],
        ]),
      }));

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      // phaseAngle=100: 90 < 100 < 135 → 'first-quarter'
      expect(result.chartData.moonPhase.phase).toBe('first-quarter');
    });

    it('should calculate waning-crescent phase (330+ degrees)', async () => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart({
        planets: new Map([
          ['Sun', { longitude: 0, sign: 'aries', degree: 0, minute: 0, second: 0, house: 1, isRetrograde: false }],
          ['Moon', { longitude: 330, sign: 'pisces', degree: 0, minute: 0, second: 0, house: 12, isRetrograde: false }],
        ]),
      }));

      const result = await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
      });

      expect(result.chartData.moonPhase.phase).toBe('waning-crescent');
    });
  });

  // =====================
  // House System Mapping
  // =====================
  describe('house system mapping', () => {
    beforeEach(() => {
      setupSunMock();
      mockCalculateNatalChart.mockReturnValue(buildMockNatalChart());
    });

    it('should map koch house system', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'koch',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'Koch' }),
      );
    });

    it('should map equal house system', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'equal',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'Equal' }),
      );
    });

    it('should map whole_sign house system', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'whole_sign',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'WholeSign' }),
      );
    });

    it('should fallback unknown systems to Placidus', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'campanus',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'Placidus' }),
      );
    });

    it('should map equal_house to Equal', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'equal_house',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'Equal' }),
      );
    });

    it('should map whole to WholeSign', async () => {
      await service.calculateSolarReturn({
        natalChartId: 'chart-1',
        year: 2026,
        houseSystem: 'whole',
      });

      expect(mockCalculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({ houseSystem: 'WholeSign' }),
      );
    });
  });

  // =====================
  // Edge Cases
  // =====================
  describe('edge cases', () => {
    it('should handle chart data with many aspects', () => {
      const manyAspects: Aspect[] = Array.from({ length: 20 }, (_, i) => ({
        planet1: i % 2 === 0 ? 'jupiter' : 'venus',
        planet2: ['sun', 'moon', 'mars', 'saturn'][i % 4],
        type: i % 2 === 0 ? 'trine' : ('sextile' as 'trine' | 'sextile'),
        orb: i + 1,
        applying: i % 2 === 0,
      }));

      const chartData = buildMockChartData({ aspects: manyAspects });

      const luckyDays = service.calculateLuckyDays(chartData, 2026);

      expect(luckyDays.length).toBeGreaterThan(0);
      expect(luckyDays.length).toBeLessThanOrEqual(20);
    });

    it('should handle planets with zero degree', () => {
      const chartData = buildMockChartData({
        planets: [
          { planet: 'sun', sign: 'aries', degree: 0, minute: 0, second: 0, house: 1, retrograde: false },
        ],
      });

      const themes = service.generateYearlyThemes(chartData);

      expect(themes).toHaveLength(4);
      expect(themes).toContain('Self-discovery');
    });

    it('should calculate lucky days for different years', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'jupiter', planet2: 'sun', type: 'trine', orb: 2, applying: true },
        ],
      });

      const result2025 = service.calculateLuckyDays(chartData, 2025);
      const result2026 = service.calculateLuckyDays(chartData, 2026);

      expect(result2025[0].date).toMatch(/^2025-/);
      expect(result2026[0].date).toMatch(/^2026-/);
    });

    it('should handle aspects where planet is in planet2 position', () => {
      const chartData = buildMockChartData({
        aspects: [
          { planet1: 'mars', planet2: 'jupiter', type: 'trine', orb: 1, applying: true },
        ],
      });

      const result = service.calculateLuckyDays(chartData, 2026);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain('Jupiter trine');
    });
  });
});
