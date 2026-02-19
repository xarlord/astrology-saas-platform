/**
 * AI Cache Usage Example
 * Demonstrates how to use the cache service with OpenAI API calls
 *
 * NOTE: Console statements are intentional for demonstration purposes
 */

/* eslint-disable no-console */

import aiCacheService from '../services/aiCache.service';
import openaiService from '../services/openai.service';

/**
 * Example 1: Basic caching of natal chart interpretation
 */
export async function getCachedNatalInterpretation(chartData: any) {
  const cacheKey = aiCacheService.generateKey({
    type: 'natal',
    data: chartData,
  });

  const interpretation = await aiCacheService.getOrGenerate(
    cacheKey,
    async () => {
      // This function only runs on cache miss
      return await openaiService.generateNatalInterpretation(chartData);
    },
    { ttl: 3600 } // Cache for 1 hour
  );

  return interpretation;
}

/**
 * Example 2: Cache with custom TTL based on complexity
 */
export async function getCachedInterpretation(
  chartData: any,
  complexity: 'simple' | 'medium' | 'complex'
) {
  const cacheKey = aiCacheService.generateKey({
    type: 'interpretation',
    complexity,
    data: chartData,
  });

  // Simple charts cached longer, complex charts shorter
  const ttlMap = {
    simple: 7200,   // 2 hours
    medium: 3600,   // 1 hour
    complex: 1800,  // 30 minutes
  };

  return aiCacheService.getOrGenerate(
    cacheKey,
    () => openaiService.generateNatalInterpretation(chartData),
    { ttl: ttlMap[complexity] }
  );
}

/**
 * Example 3: Manual cache management
 */
export async function invalidateChartCache(chartId: string) {
  const cacheKey = aiCacheService.generateKey({
    type: 'chart',
    id: chartId,
  });

  await aiCacheService.delete(cacheKey);
}

/**
 * Example 4: Batch cache warming
 */
export async function warmCacheForPopularCharts(chartIds: string[]) {
  for (const chartId of chartIds) {
    const cacheKey = aiCacheService.generateKey({
      type: 'chart',
      id: chartId,
    });

    // Check if already cached
    const cached = await aiCacheService.get(cacheKey);
    if (!cached) {
      // Generate and cache
      const chartData = await getChartDataById(chartId);
      await aiCacheService.set(cacheKey, chartData, { ttl: 3600 });
    }
  }
}

/**
 * Example 5: Cache statistics and monitoring
 */
export async function logCacheStats() {
  const stats = await aiCacheService.getStats();
  console.log('Cache Statistics:', {
    totalEntries: stats.totalEntries,
    activeEntries: stats.activeEntries,
    expiredEntries: stats.expiredEntries,
    hitRate: stats.activeEntries / stats.totalEntries || 0,
  });
}

/**
 * Example 6: Periodic cleanup
 */
export async function scheduleCacheCleanup() {
  // Run every hour
  setInterval(async () => {
    const deletedCount = await aiCacheService.clearExpired();
    console.log(`Cleaned up ${deletedCount} expired cache entries`);
  }, 3600000); // 1 hour
}

/**
 * Example 7: Cache-aside with fallback
 */
export async function getInterpretationWithFallback(chartData: any) {
  const cacheKey = aiCacheService.generateKey(chartData);

  try {
    return await aiCacheService.getOrGenerate(
      cacheKey,
      async () => {
        try {
          // Try AI generation
          return await openaiService.generateNatalInterpretation(chartData);
        } catch (error) {
          // Fallback to rule-based interpretation
          console.warn('AI generation failed, using fallback:', error);
          return await getRuleBasedInterpretation(chartData);
        }
      },
      { ttl: 3600 }
    );
  } catch (error) {
    // Final fallback if cache fails
    return await getRuleBasedInterpretation(chartData);
  }
}

// Helper functions (stubs)
async function getChartDataById(_chartId: string) {
  // Implementation would fetch from database
  return {};
}

async function getRuleBasedInterpretation(_chartData: any) {
  // Implementation would use rule-based system
  return {};
}
