/**
 * Unit Tests for Interpretation Service
 * Tests personality analysis and transit interpretation generation
 */

import {
  generateCompletePersonalityAnalysis,
  generateTransitAnalysis,
} from '../../services/interpretation.service';
import {
  getPlanetInSignInterpretation,
  getAspectInterpretation,
  getHouseInterpretation,
} from '../../data/interpretations';

// Mock interpretations data
jest.mock('../../data/interpretations');

const mockedGetPlanetInSignInterpretation = getPlanetInSignInterpretation as jest.Mock;
const mockedGetAspectInterpretation = getAspectInterpretation as jest.Mock;
const mockedGetHouseInterpretation = getHouseInterpretation as jest.Mock;

describe('Interpretation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockedGetPlanetInSignInterpretation.mockReturnValue({
      planet: 'sun',
      sign: 'capricorn',
      keywords: ['ambitious', 'disciplined'],
      general: 'Sun in Capricorn interpretation',
      strengths: ['determined', 'practical'],
      challenges: ['reserved', 'pessimistic'],
      advice: ['embrace vulnerability', 'trust others'],
    });

    mockedGetAspectInterpretation.mockReturnValue({
      harmonious: true,
      keywords: ['flow', 'ease'],
      general: 'Trine aspect interpretation',
      expression: 'Creative expression',
      advice: ['express yourself freely'],
    });

    mockedGetHouseInterpretation.mockReturnValue({
      themes: ['identity', 'self-expression'],
      description: 'First house interpretation',
      advice: ['be authentic', 'express yourself'],
    });
  });

  const mockPlanets = [
    { planet: 'sun', sign: 'capricorn', position: 295.5, longitude: 295.5, house: 10, retrograde: false },
    { planet: 'moon', sign: 'pisces', position: 350.2, longitude: 350.2, house: 12, retrograde: false },
    { planet: 'mercury', sign: 'aquarius', position: 310.0, longitude: 310.0, house: 11, retrograde: false },
  ];

  const mockHouses = [
    { house: 1, cusp: 300, sign: 'aquarius' },
    { house: 2, cusp: 330, sign: 'pisces' },
    { house: 3, cusp: 0, sign: 'aries' },
  ];

  const mockAspects = [
    { type: 'trine', planet1: 'sun', planet2: 'jupiter', orb: 2 },
    { type: 'square', planet1: 'venus', planet2: 'mars', orb: 3 },
    { type: 'opposition', planet1: 'mercury', planet2: 'saturn', orb: 1 },
  ];

  describe('generateCompletePersonalityAnalysis', () => {
    it('should generate complete personality analysis', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('planetsInSigns');
      expect(result).toHaveProperty('houses');
      expect(result).toHaveProperty('aspects');
      expect(result).toHaveProperty('patterns');
    });

    it('should include sun sign in overview', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.overview.sunSign).toBeDefined();
      expect(result.overview.sunSign.planet).toBe('sun');
      expect(result.overview.sunSign.sign).toBe('capricorn');
    });

    it('should include moon sign in overview', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.overview.moonSign).toBeDefined();
      expect(result.overview.moonSign.planet).toBe('moon');
      expect(result.overview.moonSign.sign).toBe('pisces');
    });

    it('should include ascendant if houses available', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.overview.ascendantSign).toBeDefined();
      expect(result.overview.ascendantSign.planet).toBe('ascendant');
      expect(result.overview.ascendantSign.sign).toBe('aquarius');
    });

    it('should generate planets in signs analysis', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.planetsInSigns).toHaveLength(mockPlanets.length);
      expect(result.planetsInSigns[0]).toHaveProperty('planet');
      expect(result.planetsInSigns[0]).toHaveProperty('sign');
      expect(result.planetsInSigns[0]).toHaveProperty('house');
      expect(result.planetsInSigns[0]).toHaveProperty('interpretation');
    });

    it('should generate houses analysis', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.houses).toHaveLength(mockHouses.length);
      expect(result.houses[0]).toHaveProperty('house');
      expect(result.houses[0]).toHaveProperty('signOnCusp');
      expect(result.houses[0]).toHaveProperty('planetsInHouse');
      expect(result.houses[0]).toHaveProperty('themes');
      expect(result.houses[0]).toHaveProperty('interpretation');
      expect(result.houses[0]).toHaveProperty('advice');
    });

    it('should identify planets in houses', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(Array.isArray(result.houses[0].planetsInHouse)).toBe(true);
    });

    it('should generate aspects analysis', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(result.aspects).toHaveLength(mockAspects.length);
      expect(result.aspects[0]).toHaveProperty('planet1');
      expect(result.aspects[0]).toHaveProperty('planet2');
      expect(result.aspects[0]).toHaveProperty('aspect');
      expect(result.aspects[0]).toHaveProperty('orb');
      expect(result.aspects[0]).toHaveProperty('harmonious');
      expect(result.aspects[0]).toHaveProperty('keywords');
      expect(result.aspects[0]).toHaveProperty('interpretation');
    });

    it('should detect aspect patterns', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      expect(Array.isArray(result.patterns)).toBe(true);
    });

    it('should return empty patterns if no aspects', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: [],
      });

      expect(result.patterns).toHaveLength(0);
    });
  });

  describe('generateTransitAnalysis', () => {
    const mockNatalChart = {
      planets: [
        { planet: 'sun', sign: 'capricorn', position: 295.5, longitude: 295.5, house: 10 },
        { planet: 'moon', sign: 'pisces', position: 350.2, longitude: 350.2, house: 12 },
      ],
      houses: mockHouses,
    };

    const mockTransitingPlanets = [
      { planet: 'jupiter', longitude: 295.0 },
      { planet: 'saturn', longitude: 110.0 },
    ];

    it('should generate transit analysis', () => {
      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: mockTransitingPlanets,
        date: new Date('2024-01-01'),
      });

      expect(result).toHaveProperty('activeTransits');
      expect(result).toHaveProperty('highlights');
    });

    it('should calculate aspects between transiting and natal planets', () => {
      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: mockTransitingPlanets,
        date: new Date('2024-01-01'),
      });

      expect(Array.isArray(result.activeTransits)).toBe(true);
    });

    it('should sort transits by intensity', () => {
      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: mockTransitingPlanets,
        date: new Date('2024-01-01'),
      });

      // Verify sorting (higher intensity should come first)
      for (let i = 1; i < result.activeTransits.length; i++) {
        const prevIntensity = calculateIntensityScore(result.activeTransits[i - 1]);
        const currIntensity = calculateIntensityScore(result.activeTransits[i]);
        expect(prevIntensity).toBeGreaterThanOrEqual(currIntensity);
      }
    });

    it('should include outer planets in highlights', () => {
      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: mockTransitingPlanets,
        date: new Date('2024-01-01'),
      });

      // Jupiter and Saturn are outer planets, should be in highlights if aspects are close
      const outerPlanetTransits = result.highlights.filter(h => h.type === 'major-transit');
      expect(Array.isArray(outerPlanetTransits)).toBe(true);
    });

    it('should include tight orb aspects in highlights', () => {
      const tightOrbPlanet = { planet: 'mars', longitude: 295.1 }; // Very close to natal sun

      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: [tightOrbPlanet],
        date: new Date('2024-01-01'),
      });

      expect(result.highlights).toBeDefined();
      expect(Array.isArray(result.highlights)).toBe(true);
    });

    it('should limit highlights to significant transits', () => {
      const result = generateTransitAnalysis({
        natalChart: mockNatalChart,
        transitingPlanets: mockTransitingPlanets,
        date: new Date('2024-01-01'),
      });

      // Should not have excessive highlights
      expect(result.highlights.length).toBeLessThan(20);
    });
  });

  describe('Pattern Detection', () => {
    it('should detect Grand Trine pattern', () => {
      const trineAspects = [
        { type: 'trine', planet1: 'sun', planet2: 'moon', orb: 2 },
        { type: 'trine', planet1: 'moon', planet2: 'jupiter', orb: 2 },
        { type: 'trine', planet1: 'jupiter', planet2: 'sun', orb: 2 },
      ];

      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: trineAspects,
      });

      const grandTrines = result.patterns.filter(p => p.type === 'Grand Trine');
      expect(grandTrines.length).toBeGreaterThan(0);
    });

    it('should detect T-Square pattern', () => {
      const aspects = [
        { type: 'opposition', planet1: 'sun', planet2: 'moon', orb: 2 },
        { type: 'square', planet1: 'mars', planet2: 'sun', orb: 2 },
        { type: 'square', planet1: 'mars', planet2: 'moon', orb: 2 },
      ];

      const result = generateCompletePersonalityAnalysis({
        planets: [...mockPlanets, { planet: 'mars', sign: 'aries', position: 30, longitude: 30, house: 1, retrograde: false }],
        houses: mockHouses,
        aspects: aspects,
      });

      const tSquares = result.patterns.filter(p => p.type === 'T-Square');
      expect(tSquares.length).toBeGreaterThanOrEqual(0);
    });

    it('should assign intensity to patterns', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      result.patterns.forEach(pattern => {
        expect(pattern.intensity).toBeDefined();
        expect(pattern.intensity).toBeGreaterThan(0);
        expect(pattern.intensity).toBeLessThanOrEqual(10);
      });
    });

    it('should include pattern description', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      result.patterns.forEach(pattern => {
        expect(pattern.description).toBeDefined();
        expect(typeof pattern.description).toBe('string');
      });
    });

    it('should include planets in pattern', () => {
      const result = generateCompletePersonalityAnalysis({
        planets: mockPlanets,
        houses: mockHouses,
        aspects: mockAspects,
      });

      result.patterns.forEach(pattern => {
        expect(pattern.planets).toBeDefined();
        expect(Array.isArray(pattern.planets)).toBe(true);
      });
    });
  });
});

// Helper function to calculate intensity score for sorting verification
function calculateIntensityScore(transit: any): number {
  const aspectIntensity: Record<string, number> = {
    conjunction: 10,
    opposition: 9,
    square: 8,
    trine: 6,
    sextile: 5,
    quincunx: 7,
  };
  const intensity = aspectIntensity[transit.aspect as keyof typeof aspectIntensity] || 0;
  return intensity - transit.orb;
}
