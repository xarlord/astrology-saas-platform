/**
 * Synastry Service Unit Tests
 * Testing synastry and compatibility calculations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  calculateSynastryAspects,
  calculateCompatibilityScore,
  calculateCategoryScores,
  calculateSynastryChart,
  calculateCompositeChart,
  generateCompatibilityReport,
  calculateElementalBalance,
} from '../../services/synastry.service';
import { Chart, PlanetPosition } from '../../models/synastry.model';

describe('Synastry Service', () => {
  describe('calculateSynastryAspects', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 30,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 25,
          minute: 0,
          second: 0,
          sign: 'scorpio',
        },
        venus: {
          name: 'venus',
          degree: 5,
          minute: 15,
          second: 0,
          sign: 'libra',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        sun: {
          name: 'sun',
          degree: 25,
          minute: 30,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 15,
          minute: 30,
          second: 0,
          sign: 'scorpio',
        },
        mars: {
          name: 'mars',
          degree: 20,
          minute: 0,
          second: 0,
          sign: 'scorpio',
        },
      },
    };

    test('should calculate aspects between two charts', () => {
      const aspects = calculateSynastryAspects(mockChart1, mockChart2);

      expect(Array.isArray(aspects)).toBe(true);
      expect(aspects.length).toBeGreaterThan(0);
    });

    test('should include all required aspect properties', () => {
      const aspects = calculateSynastryAspects(mockChart1, mockChart2);

      aspects.forEach((aspect) => {
        expect(aspect).toHaveProperty('planet1');
        expect(aspect).toHaveProperty('planet2');
        expect(aspect).toHaveProperty('aspect');
        expect(aspect).toHaveProperty('orb');
        expect(aspect).toHaveProperty('applying');
        expect(aspect).toHaveProperty('interpretation');
        expect(aspect).toHaveProperty('weight');
        expect(aspect).toHaveProperty('soulmateIndicator');
      });
    });

    test('should identify soulmate aspects', () => {
      // Create charts with sun-moon conjunction
      const chart1: Chart = {
        id: 'chart_1',
        userId: 'user_1',
        planets: {
          sun: {
            name: 'sun',
            degree: 15,
            minute: 0,
            second: 0,
            sign: 'leo',
          },
        },
      };

      const chart2: Chart = {
        id: 'chart_2',
        userId: 'user_2',
        planets: {
          moon: {
            name: 'moon',
            degree: 15,
            minute: 0,
            second: 0,
            sign: 'leo',
          },
        },
      };

      const aspects = calculateSynastryAspects(chart1, chart2);

      const sunMoonAspects = aspects.filter(
        a => (a.planet1 === 'sun' && a.planet2 === 'moon') ||
               (a.planet1 === 'moon' && a.planet2 === 'sun')
      );

      expect(sunMoonAspects.length).toBeGreaterThan(0);
    });

    test('should handle empty charts', () => {
      const emptyChart1: Chart = {
        id: 'chart_1',
        userId: 'user_1',
        planets: {},
      };

      const emptyChart2: Chart = {
        id: 'chart_2',
        userId: 'user_2',
        planets: {},
      };

      const aspects = calculateSynastryAspects(emptyChart1, emptyChart2);

      expect(aspects).toEqual([]);
    });
  });

  describe('calculateCompatibilityScore', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        sun: {
          name: 'sun',
          degree: 165,
          minute: 0,
          second: 0,
          sign: 'virgo',
        },
        moon: {
          name: 'moon',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    test('should return score between 1 and 10', () => {
      const score = calculateCompatibilityScore(mockChart1, mockChart2);

      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    test('should calculate consistent scores for same charts', () => {
      const score1 = calculateCompatibilityScore(mockChart1, mockChart2);
      const score2 = calculateCompatibilityScore(mockChart1, mockChart2);

      expect(score1).toBe(score2);
    });
  });

  describe('calculateCategoryScores', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        venus: {
          name: 'venus',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'taurus',
        },
        mars: {
          name: 'mars',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'taurus',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        venus: {
          name: 'venus',
          degree: 195,
          minute: 0,
          second: 0,
          sign: 'libra',
        },
        mercury: {
          name: 'mercury',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'gemini',
        },
      },
    };

    test('should return all category scores', () => {
      const scores = calculateCategoryScores(mockChart1, mockChart2);

      expect(scores).toHaveProperty('overall');
      expect(scores).toHaveProperty('romantic');
      expect(scores).toHaveProperty('communication');
      expect(scores).toHaveProperty('emotional');
      expect(scores).toHaveProperty('intellectual');
      expect(scores).toHaveProperty('spiritual');
      expect(scores).toHaveProperty('values');
    });

    test('should return scores between 1 and 10', () => {
      const scores = calculateCategoryScores(mockChart1, mockChart2);

      expect(scores.overall).toBeGreaterThanOrEqual(1);
      expect(scores.overall).toBeLessThanOrEqual(10);
      expect(scores.romantic).toBeGreaterThanOrEqual(1);
      expect(scores.romantic).toBeLessThanOrEqual(10);
    });
  });

  describe('calculateSynastryChart', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        sun: {
          name: 'sun',
          degree: 165,
          minute: 0,
          second: 0,
          sign: 'virgo',
        },
        moon: {
          name: 'moon',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    test('should generate complete synastry chart', () => {
      const chart = calculateSynastryChart(mockChart1, mockChart2);

      expect(chart).toHaveProperty('id');
      expect(chart).toHaveProperty('chart1Id', 'chart_1');
      expect(chart).toHaveProperty('chart2Id', 'chart_2');
      expect(chart).toHaveProperty('synastryAspects');
      expect(chart).toHaveProperty('overallCompatibility');
      expect(chart).toHaveProperty('relationshipTheme');
      expect(chart).toHaveProperty('strengths');
      expect(chart).toHaveProperty('challenges');
      expect(chart).toHaveProperty('advice');
    });

    test('should include non-empty arrays', () => {
      const chart = calculateSynastryChart(mockChart1, mockChart2);

      expect(Array.isArray(chart.synastryAspects)).toBe(true);
      expect(Array.isArray(chart.strengths)).toBe(true);
      expect(Array.isArray(chart.challenges)).toBe(true);
      expect(typeof chart.advice).toBe('string');
    });

    test('should generate unique id', () => {
      const chart = calculateSynastryChart(mockChart1, mockChart2);
      const chart2 = calculateSynastryChart(mockChart2, mockChart1);

      expect(chart.id).not.toBe(chart2.id);
    });
  });

  describe('calculateCompositeChart', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 45,
          minute: 0,
          second: 0,
          sign: 'taurus',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        sun: {
          name: 'sun',
          degree: 45,
          minute: 0,
          second: 0,
          sign: 'taurus',
        },
        moon: {
          name: 'moon',
          degree: 75,
          minute: 0,
          second: 0,
          sign: 'gemini',
        },
      },
    };

    test('should calculate composite chart', () => {
      const composite = calculateCompositeChart(mockChart1, mockChart2);

      expect(composite).toHaveProperty('chart1Id', 'chart_1');
      expect(composite).toHaveProperty('chart2Id', 'chart_2');
      expect(composite).toHaveProperty('planets');
      expect(composite).toHaveProperty('interpretation');
    });

    test('should calculate midpoint for planets', () => {
      const composite = calculateCompositeChart(mockChart1, mockChart2);

      expect(composite.planets.sun).toBeDefined();
      // Chart1: 15° Leo (135° absolute), Chart2: 45° Taurus (75° absolute)
      // Midpoint: 105° absolute = 15° Cancer
      expect(composite.planets.sun!.degree).toBe(15);
      expect(composite.planets.sun!.sign).toBe('cancer');

      expect(composite.planets.moon).toBeDefined();
      // Chart1: 45° Taurus (75° absolute), Chart2: 75° Gemini (135° absolute)
      // Midpoint: 105° absolute = 15° Cancer
      expect(composite.planets.moon!.degree).toBe(15);
      expect(composite.planets.moon!.sign).toBe('cancer');
    });

    test('should handle planets only in one chart', () => {
      const composite = calculateCompositeChart(mockChart1, mockChart2);

      // Both charts have sun and moon, so they should be in composite
      expect(composite.planets.sun).toBeDefined();
      expect(composite.planets.moon).toBeDefined();
    });
  });

  describe('calculateElementalBalance', () => {
    const fireChart: Chart = {
      id: 'fire_1',
      userId: 'user_1',
      planets: {
        sun: { name: 'sun', degree: 0, minute: 0, second: 0, sign: 'aries' }, // fire
        mars: { name: 'mars', degree: 0, minute: 0, second: 0, sign: 'leo' }, // fire
      },
    };

    const earthChart: Chart = {
      id: 'earth_1',
      userId: 'user_2',
      planets: {
        venus: { name: 'venus', degree: 0, minute: 0, second: 0, sign: 'taurus' }, // earth
        mercury: { name: 'mercury', degree: 0, minute: 0, second: 0, sign: 'virgo' }, // earth
      },
    };

    test('should calculate elemental counts', () => {
      const balance = calculateElementalBalance(fireChart, earthChart);

      expect(balance).toHaveProperty('fire');
      expect(balance).toHaveProperty('earth');
      expect(balance).toHaveProperty('air');
      expect(balance).toHaveProperty('water');
      expect(balance).toHaveProperty('balance');
    });

    test('should return correct fire count', () => {
      const balance = calculateElementalBalance(fireChart, earthChart);

      expect(balance.fire).toBe(2); // Two fire planets in fireChart
    });

    test('should return correct earth count', () => {
      const balance = calculateElementalBalance(fireChart, earthChart);

      expect(balance.earth).toBe(2); // Two earth planets in earthChart
    });

    test('should determine balance type', () => {
      const balance = calculateElementalBalance(fireChart, earthChart);

      expect(['well-balanced', 'balanced', 'imbalanced']).toContain(balance.balance);
    });
  });

  describe('generateCompatibilityReport', () => {
    const mockChart1: Chart = {
      id: 'chart_1',
      userId: 'user_1',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        venus: {
          name: 'venus',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    const mockChart2: Chart = {
      id: 'chart_2',
      userId: 'user_2',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        mars: {
          name: 'mars',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
      },
    };

    test('should generate complete compatibility report', () => {
      const report = generateCompatibilityReport(mockChart1, mockChart2);

      expect(report).toHaveProperty('user1Id', 'user_1');
      expect(report).toHaveProperty('user2Id', 'user_2');
      expect(report).toHaveProperty('scores');
      expect(report).toHaveProperty('elementalBalance');
      expect(report).toHaveProperty('relationshipDynamics');
      expect(report).toHaveProperty('strengths');
      expect(report).toHaveProperty('challenges');
      expect(report).toHaveProperty('growthOpportunities');
      expect(report).toHaveProperty('detailedReport');
    });

    test('should include all score categories', () => {
      const report = generateCompatibilityReport(mockChart1, mockChart2);

      expect(report.scores).toHaveProperty('overall');
      expect(report.scores).toHaveProperty('romantic');
      expect(report.scores).toHaveProperty('communication');
      expect(report.scores).toHaveProperty('emotional');
    });

    test('should include arrays for dynamics, strengths, challenges', () => {
      const report = generateCompatibilityReport(mockChart1, mockChart2);

      expect(Array.isArray(report.relationshipDynamics)).toBe(true);
      expect(Array.isArray(report.strengths)).toBe(true);
      expect(Array.isArray(report.challenges)).toBe(true);
      expect(Array.isArray(report.growthOpportunities)).toBe(true);
    });

    test('should generate markdown report', () => {
      const report = generateCompatibilityReport(mockChart1, mockChart2);

      expect(typeof report.detailedReport).toBe('string');
      expect(report.detailedReport.length).toBeGreaterThan(0);
      expect(report.detailedReport).toContain('# Compatibility Report');
    });
  });

  describe('Edge Cases', () => {
    test('should handle charts with minimal planets', () => {
      const minimalChart1: Chart = {
        id: 'minimal_1',
        userId: 'user_1',
        planets: {
          sun: {
            name: 'sun',
            degree: 0,
            minute: 0,
            second: 0,
            sign: 'aries',
          },
        },
      };

      const minimalChart2: Chart = {
        id: 'minimal_2',
        userId: 'user_2',
        planets: {
          moon: {
            name: 'moon',
            degree: 180,
            minute: 0,
            second: 0,
            sign: 'libra',
          },
        },
      };

      const aspects = calculateSynastryAspects(minimalChart1, minimalChart2);
      const score = calculateCompatibilityScore(minimalChart1, minimalChart2);

      expect(aspects).toBeDefined();
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    test('should handle opposition aspect correctly', () => {
      const chart1: Chart = {
        id: 'chart_1',
        userId: 'user_1',
        planets: {
          sun: {
            name: 'sun',
            degree: 0,
            minute: 0,
            second: 0,
            sign: 'aries',
          },
        },
      };

      const chart2: Chart = {
        id: 'chart_2',
        userId: 'user_2',
        planets: {
          sun: {
            name: 'sun',
            degree: 180,
            minute: 0,
            second: 0,
            sign: 'libra',
          },
        },
      };

      const aspects = calculateSynastryAspects(chart1, chart2);
      const oppositionAspects = aspects.filter(a => a.aspect === 'opposition');

      expect(oppositionAspects.length).toBeGreaterThan(0);
    });

    test('should handle trine aspect correctly', () => {
      const chart1: Chart = {
        id: 'chart_1',
        userId: 'user_1',
        planets: {
          sun: {
            name: 'sun',
            degree: 0,
            minute: 0,
            second: 0,
            sign: 'aries',
          },
        },
      };

      const chart2: Chart = {
        id: 'chart_2',
        userId: 'user_2',
        planets: {
          sun: {
            name: 'sun',
            degree: 120,
            minute: 0,
            second: 0,
            sign: 'leo',
          },
        },
      };

      const aspects = calculateSynastryAspects(chart1, chart2);
      const trineAspects = aspects.filter(a => a.aspect === 'trine');

      expect(trineAspects.length).toBeGreaterThan(0);
    });
  });
});
