/**
 * Performance Tests for Calculation Engine
 * Tests calculation speed, memory usage, and throughput
 */

import { performance } from 'perf_hooks';
import { swissEphemerisService } from '../../services/swissEphemeris.service';
import { mockChartData } from '../utils';

/**
 * Performance test utility
 */
class PerformanceTest {
  name: string;
  iterations: number;
  maxDuration: number; // milliseconds

  constructor(name: string, iterations: number = 100, maxDuration: number = 1000) {
    this.name = name;
    this.iterations = iterations;
    this.maxDuration = maxDuration;
  }

  async run(fn: () => Promise<any> | any): Promise<PerformanceResult> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Run the function multiple times
    for (let i = 0; i < this.iterations; i++) {
      await fn();
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const totalTime = endTime - startTime;
    const avgTime = totalTime / this.iterations;
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB
    const opsPerSecond = (this.iterations / totalTime) * 1000;

    return {
      name: this.name,
      iterations: this.iterations,
      totalTime,
      avgTime,
      minTime: avgTime * 0.8, // Estimate
      maxTime: avgTime * 1.2, // Estimate
      memoryUsed,
      opsPerSecond,
      passed: totalTime < this.maxDuration,
    };
  }
}

interface PerformanceResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  memoryUsed: number;
  opsPerSecond: number;
  passed: boolean;
}

describe('Calculation Engine Performance Tests', () => {
  describe('Julian Day Conversion', () => {
    it('should convert date to Julian Day in under 1ms', async () => {
      const test = new PerformanceTest(
        'Julian Day Conversion',
        1000,
        1000 // 1000 iterations in under 1 second = 1ms each
      );

      const result = await test.run(() => {
        swissEphemerisService.toJulianDay(new Date(1990, 0, 15, 12, 0, 0));
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);
      console.log(`  Memory: ${result.memoryUsed.toFixed(2)}MB`);

      expect(result.avgTime).toBeLessThan(1);
      expect(result.passed).toBe(true);
    });
  });

  describe('Planet Position Calculation', () => {
    it('should calculate Sun position in under 10ms', async () => {
      const jd = swissEphemerisService.toJulianDay(new Date(1990, 0, 15, 12, 0, 0));
      const test = new PerformanceTest('Sun Position', 100, 1000);

      const result = await test.run(() => {
        swissEphemerisService.calculatePlanetPosition(jd, 'sun');
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(10);
      expect(result.passed).toBe(true);
    });

    it('should calculate all 10 planets in under 100ms', async () => {
      const jd = swissEphemerisService.toJulianDay(new Date(1990, 0, 15, 12, 0, 0));
      const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
      const test = new PerformanceTest('All 10 Planets', 50, 5000);

      const result = await test.run(() => {
        planets.forEach(planet => {
          swissEphemerisService.calculatePlanetPosition(jd, planet);
        });
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('House Calculation', () => {
    it('should calculate Placidus houses in under 50ms', async () => {
      const jd = swissEphemerisService.toJulianDay(new Date(1990, 0, 15, 12, 0, 0));
      const test = new PerformanceTest('Placidus Houses', 100, 5000);

      const result = await test.run(() => {
        swissEphemerisService.calculateHouses(jd, 40.7128, -74.0060, 'placidus');
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(50);
      expect(result.passed).toBe(true);
    });

    it('should calculate Whole Sign houses in under 10ms', async () => {
      const jd = swissEphemerisService.toJulianDay(new Date(1990, 0, 15, 12, 0, 0));
      const test = new PerformanceTest('Whole Sign Houses', 100, 1000);

      const result = await test.run(() => {
        swissEphemerisService.calculateHouses(jd, 40.7128, -74.0060, 'whole_sign');
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(10);
      expect(result.passed).toBe(true);
    });
  });

  describe('Aspect Detection', () => {
    it('should detect aspects for 10 planets in under 20ms', async () => {
      const planets = [
        { name: 'sun', longitude: 90.5, latitude: 0, speed: 1 },
        { name: 'moon', longitude: 180.3, latitude: 5, speed: 13 },
        { name: 'mercury', longitude: 45.2, latitude: -2, speed: 2 },
        { name: 'venus', longitude: 270.8, latitude: 3, speed: 1.2 },
        { name: 'mars', longitude: 135.6, latitude: 1, speed: 0.8 },
        { name: 'jupiter', longitude: 225.4, latitude: -1, speed: 0.3 },
        { name: 'saturn', longitude: 315.1, latitude: 2, speed: 0.2 },
        { name: 'uranus', longitude: 0.5, latitude: -1, speed: 0.1 },
        { name: 'neptune', longitude: 330.2, latitude: -2, speed: 0.1 },
        { name: 'pluto', longitude: 270.1, latitude: 3, speed: 0.05 },
      ];
      const test = new PerformanceTest('Aspect Detection', 100, 2000);

      const result = await test.run(() => {
        swissEphemerisService.detectAspects(planets);
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(20);
      expect(result.passed).toBe(true);
    });
  });

  describe('Complete Natal Chart Calculation', () => {
    it('should calculate complete natal chart in under 200ms', async () => {
      const birthData = {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      };
      const test = new PerformanceTest('Complete Natal Chart', 50, 10000);

      const result = await test.run(() => {
        return swissEphemerisService.calculateNatalChart(birthData);
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);
      console.log(`  Memory: ${result.memoryUsed.toFixed(2)}MB`);

      expect(result.avgTime).toBeLessThan(200);
      expect(result.passed).toBe(true);
    });

    it('should handle 100 concurrent chart calculations', async () => {
      const birthData = {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      };

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      // Run 100 concurrent calculations
      const promises = Array(100).fill(null).map((_, i) => {
        const offsetDate = new Date(birthData.date.getTime() + i * 86400000);
        return swissEphemerisService.calculateNatalChart({
          ...birthData,
          date: offsetDate,
        });
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      const totalTime = endTime - startTime;
      const memoryUsed = (endMemory - startMemory) / 1024 / 1024;
      const avgTime = totalTime / 100;

      console.log(`\nConcurrent Chart Calculations (100):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${avgTime.toFixed(4)}ms`);
      console.log(`  Memory used: ${memoryUsed.toFixed(2)}MB`);
      console.log(`  Results: ${results.length} charts`);

      expect(results).toHaveLength(100);
      expect(avgTime).toBeLessThan(500);
      expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });
  });

  describe('Transit Calculation', () => {
    it('should calculate 7 days of transits in under 500ms', async () => {
      const natalChart = mockChartData();
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 7);
      const test = new PerformanceTest('7-Day Transit Calculation', 20, 10000);

      const result = await test.run(() => {
        return swissEphemerisService.calculateTransits(
          natalChart,
          startDate,
          endDate
        );
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(500);
      expect(result.passed).toBe(true);
    });

    it('should calculate 30 days of transits in under 2 seconds', async () => {
      const natalChart = mockChartData();
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);
      const test = new PerformanceTest('30-Day Transit Calculation', 10, 20000);

      const result = await test.run(() => {
        return swissEphemerisService.calculateTransits(
          natalChart,
          startDate,
          endDate
        );
      });

      console.log(`\n${result.name}:`);
      console.log(`  Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Average: ${result.avgTime.toFixed(4)}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

      expect(result.avgTime).toBeLessThan(2000);
      expect(result.passed).toBe(true);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory during repeated calculations', async () => {
      const birthData = {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      };

      const initialMemory = process.memoryUsage().heapUsed;

      // Run 1000 calculations
      for (let i = 0; i < 1000; i++) {
        await swissEphemerisService.calculateNatalChart(birthData);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`\nMemory Leak Test (1000 iterations):`);
      console.log(`  Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Memory growth: ${memoryGrowth.toFixed(2)}MB`);

      // Memory growth should be less than 50MB
      expect(memoryGrowth).toBeLessThan(50);
    });
  });

  describe('Calculation Accuracy vs Speed Trade-offs', () => {
    it('should produce consistent results across multiple calculations', async () => {
      const birthData = {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      };

      const results = [];
      for (let i = 0; i < 10; i++) {
        const chart = await swissEphemerisService.calculateNatalChart(birthData);
        results.push(chart);
      }

      // Check that all results are identical
      const firstResult = results[0];
      results.forEach((result, index) => {
        expect(result.planets).toEqual(firstResult.planets);
        expect(result.houses).toEqual(firstResult.houses);
        expect(result.aspects).toEqual(firstResult.aspects);
      });

      console.log(`\nConsistency Test: 10 calculations produced identical results ✅`);
    });
  });
});
