/**
 * AI-Enhanced Interpretation Service
 *
 * Hybrid service that combines:
 * - Rule-based interpretations (fast, deterministic, always available)
 * - AI-generated enhancements (insightful, personalized, requires OpenAI)
 *
 * Features:
 * - Automatic fallback to rule-based when AI unavailable
 * - Intelligent caching to reduce API costs
 * - Graceful error handling
 * - Batch processing support
 */

import openaiService from './openai.service';
import aiCacheService from './aiCache.service';
import { generateCompletePersonalityAnalysis } from '../../analysis/services/interpretation.service';
import logger from '../../../utils/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: boolean;
}

export interface ChartData {
  planets: PlanetPosition[];
  houses?: HouseCusp[];
  aspects?: Aspect[];
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface TransitEvent {
  planet: string;
  type: string;
  natalPlanet: string;
  orb: number;
  startDate: string;
  endDate: string;
  strength?: 'weak' | 'moderate' | 'strong';
}

export interface TransitData {
  currentTransits: TransitEvent[];
  forecastStartDate?: string;
  forecastEndDate?: string;
}

export interface SynastryData {
  chartA: ChartData;
  chartB: ChartData;
}

export interface InterpretationResult {
  // Common fields
  ai: boolean;
  source: 'ai-enhanced' | 'rule-based';
  generatedAt?: string;

  // Natal chart fields
  overview?: any;
  planetsInSigns?: any[];
  houses?: any[];
  aspects?: any[];
  patterns?: any[];

  // Enhancement fields
  enhanced?: any;
  interpretation?: any;
  forecast?: any;
  compatibility?: number;
  analysis?: string;
  insights?: string[];
  keyDates?: string[];
  opportunities?: string[];
  challenges?: string[];

  // Error handling
  error?: string;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class AIInterpretationService {
  // Cache TTL configuration (in seconds)
  private readonly CACHE_TTL = {
    NATAL: 86400, // 24 hours - birth data doesn't change
    TRANSIT: 3600, // 1 hour - transits update frequently
    COMPATIBILITY: 86400, // 24 hours - relationship analysis stable
    LUNAR_RETURN: 604800, // 7 days - monthly forecast
    SOLAR_RETURN: 2592000, // 30 days - yearly forecast
  };

  /**
   * Generate AI-enhanced natal chart interpretation
   *
   * Process:
   * 1. Check if AI is configured
   * 2. Try cache first
   * 3. Generate AI interpretation if cache miss
   * 4. Combine with rule-based interpretation
   * 5. Fallback to rule-based if AI fails
   */
  async generateNatal(chartData: ChartData): Promise<InterpretationResult> {
    // Check if AI is configured
    if (!openaiService.isConfigured()) {
      logger.info('AI not configured, using rule-based interpretation');
      return this.getRuleBasedNatal(chartData);
    }

    try {
      const cacheKey = aiCacheService.generateKey({ type: 'natal', chartData });

      // Generate with AI enhancement
      const result = await aiCacheService.getOrGenerate(
        cacheKey,
        async () => {
          logger.info('Generating AI-enhanced natal interpretation');

          const aiResult = await openaiService.generateNatalInterpretation(chartData);

          if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI generation failed');
          }

          // Combine with rule-based for comprehensive reading
          const ruleBased = generateCompletePersonalityAnalysis(chartData);

          return {
            ...ruleBased,
            enhanced: aiResult.interpretation,
            ai: true,
            source: 'ai-enhanced',
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: this.CACHE_TTL.NATAL }
      );

      return result;
    } catch (error: any) {
      logger.error('AI interpretation failed, falling back to rule-based:', error);

      // Fallback to rule-based
      return this.getRuleBasedNatal(chartData);
    }
  }

  /**
   * Generate AI-enhanced transit forecast
   */
  async generateTransit(transitData: TransitData): Promise<InterpretationResult> {
    if (!openaiService.isConfigured()) {
      return this.getRuleBasedTransit();
    }

    try {
      const cacheKey = aiCacheService.generateKey({ type: 'transit', transitData });

      const result = await aiCacheService.getOrGenerate(
        cacheKey,
        async () => {
          logger.info('Generating AI-enhanced transit forecast');

          const aiResult = await openaiService.generateTransitForecast(transitData);

          if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI generation failed');
          }

          return {
            forecast: aiResult.interpretation,
            ai: true,
            source: 'ai-enhanced',
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: this.CACHE_TTL.TRANSIT }
      );

      return result;
    } catch (error: any) {
      logger.error('AI transit forecast failed:', error);
      return this.getRuleBasedTransit();
    }
  }

  /**
   * Generate AI-enhanced compatibility analysis
   */
  async generateCompatibility(synastryData: SynastryData): Promise<InterpretationResult> {
    if (!openaiService.isConfigured()) {
      return this.getRuleBasedCompatibility();
    }

    try {
      const cacheKey = aiCacheService.generateKey({ type: 'synastry', synastryData });

      const result = await aiCacheService.getOrGenerate(
        cacheKey,
        async () => {
          logger.info('Generating AI-enhanced compatibility analysis');

          const aiResult = await openaiService.generateCompatibilityAnalysis(synastryData);

          if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI generation failed');
          }

          return {
            ...aiResult.interpretation,
            ai: true,
            source: 'ai-enhanced',
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: this.CACHE_TTL.COMPATIBILITY }
      );

      return result;
    } catch (error: any) {
      logger.error('AI compatibility analysis failed:', error);
      return this.getRuleBasedCompatibility();
    }
  }

  /**
   * Generate AI-enhanced lunar return interpretation
   */
  async generateLunarReturn(chartData: ChartData): Promise<InterpretationResult> {
    if (!openaiService.isConfigured()) {
      return {
        interpretation: 'Lunar return interpretation not available',
        ai: false,
        source: 'rule-based',
      };
    }

    try {
      const cacheKey = aiCacheService.generateKey({ type: 'lunar-return', chartData });

      const result = await aiCacheService.getOrGenerate(
        cacheKey,
        async () => {
          logger.info('Generating AI-enhanced lunar return interpretation');

          const aiResult = await openaiService.generateLunarReturnInterpretation(chartData);

          if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI generation failed');
          }

          return {
            interpretation: aiResult.interpretation,
            ai: true,
            source: 'ai-enhanced',
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: this.CACHE_TTL.LUNAR_RETURN }
      );

      return result;
    } catch (error: any) {
      logger.error('AI lunar return interpretation failed:', error);
      return {
        interpretation: 'Lunar return interpretation unavailable',
        ai: false,
        source: 'rule-based',
      };
    }
  }

  /**
   * Generate AI-enhanced solar return interpretation
   */
  async generateSolarReturn(chartData: ChartData): Promise<InterpretationResult> {
    if (!openaiService.isConfigured()) {
      return {
        interpretation: 'Solar return interpretation not available',
        ai: false,
        source: 'rule-based',
      };
    }

    try {
      const cacheKey = aiCacheService.generateKey({ type: 'solar-return', chartData });

      const result = await aiCacheService.getOrGenerate(
        cacheKey,
        async () => {
          logger.info('Generating AI-enhanced solar return interpretation');

          const aiResult = await openaiService.generateSolarReturnInterpretation(chartData);

          if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI generation failed');
          }

          return {
            interpretation: aiResult.interpretation,
            ai: true,
            source: 'ai-enhanced',
            generatedAt: new Date().toISOString(),
          };
        },
        { ttl: this.CACHE_TTL.SOLAR_RETURN }
      );

      return result;
    } catch (error: any) {
      logger.error('AI solar return interpretation failed:', error);
      return {
        interpretation: 'Solar return interpretation unavailable',
        ai: false,
        source: 'rule-based',
      };
    }
  }

  /**
   * Batch generate interpretations for multiple charts
   * Uses Promise.allSettled for graceful handling of partial failures
   */
  async batchGenerateNatal(charts: ChartData[]): Promise<
    Array<{
      chartIndex: number;
      success: boolean;
      data: InterpretationResult | null;
      error: string | null;
    }>
  > {
    logger.info(`Batch generating ${charts.length} natal interpretations`);

    const results = await Promise.allSettled(
      charts.map((chart) => this.generateNatal(chart))
    );

    return results.map((result, index) => ({
      chartIndex: index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason?.message || 'Unknown error' : null,
    }));
  }

  /**
   * Batch generate transit forecasts
   */
  async batchGenerateTransit(transits: TransitData[]): Promise<
    Array<{
      transitIndex: number;
      success: boolean;
      data: InterpretationResult | null;
      error: string | null;
    }>
  > {
    logger.info(`Batch generating ${transits.length} transit forecasts`);

    const results = await Promise.allSettled(
      transits.map((transit) => this.generateTransit(transit))
    );

    return results.map((result, index) => ({
      transitIndex: index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason?.message || 'Unknown error' : null,
    }));
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get rule-based natal interpretation (fallback)
   */
  private getRuleBasedNatal(chartData: ChartData): InterpretationResult {
    try {
      const ruleBased = generateCompletePersonalityAnalysis(chartData);

      return {
        ...ruleBased,
        ai: false,
        source: 'rule-based',
      };
    } catch (error: any) {
      logger.error('Rule-based natal interpretation failed:', error);

      return {
        ai: false,
        source: 'rule-based',
        error: error.message,
        overview: null,
        planetsInSigns: [],
        houses: [],
        aspects: [],
        patterns: [],
      };
    }
  }

  /**
   * Get rule-based transit interpretation (fallback)
   */
  private getRuleBasedTransit(): InterpretationResult {
    return {
      forecast: 'Transit forecast not available',
      ai: false,
      source: 'rule-based',
    };
  }

  /**
   * Get rule-based compatibility interpretation (fallback)
   */
  private getRuleBasedCompatibility(): InterpretationResult {
    return {
      compatibility: 50,
      analysis: 'Compatibility analysis not available',
      ai: false,
      insights: [],
    };
  }

  /**
   * Check if AI is available and configured
   */
  isAIConfigured(): boolean {
    return openaiService.isConfigured();
  }

  /**
   * Get service status
   */
  getStatus(): {
    aiConfigured: boolean;
    cacheEnabled: boolean;
    fallbackAvailable: boolean;
  } {
    return {
      aiConfigured: openaiService.isConfigured(),
      cacheEnabled: true, // Always enabled
      fallbackAvailable: true, // Rule-based always available
    };
  }

  /**
   * Clear all AI interpretation caches
   */
  async clearCache(): Promise<void> {
    try {
      await aiCacheService.clear();
      logger.info('AI interpretation cache cleared');
    } catch (error) {
      logger.error('Failed to clear AI interpretation cache:', error);
    }
  }
}

export default new AIInterpretationService();
