/**
 * OpenAI Service
 * Handles AI-powered interpretation generation for astrological readings
 */

import OpenAI from 'openai';
import { openaiConfig, PROMPT_TEMPLATES, INTERPRETATION_PARAMS } from '../config/openai.config';
import logger from '../../../utils/logger';
import aiUsageService from './aiUsage.service';

/**
 * Get or create OpenAI client instance
 */
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: openaiConfig.apiKey,
  });
};

/**
 * Input types for different interpretation requests
 */
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

export interface NatalChartInput {
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

export interface TransitInput {
  currentTransits: TransitEvent[];
  forecastStartDate?: string;
  forecastEndDate?: string;
}

export interface SynastryInput {
  chartA: NatalChartInput;
  chartB: NatalChartInput;
}

export interface InterpretationResult {
  success: boolean;
  interpretation: any;
  generatedAt: string;
  model: string;
  cached?: boolean;
  error?: string;
}

/**
 * Simple in-memory cache for AI interpretations
 * In production, this should be replaced with Redis or database caching
 */
const interpretationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class OpenAIService {
  /**
   * Generate AI-powered natal chart interpretation
   */
  async generateNatalInterpretation(chartData: NatalChartInput, userId?: string): Promise<InterpretationResult> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('natal', chartData);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          success: true,
          interpretation: cached,
          generatedAt: new Date().toISOString(),
          model: openaiConfig.model,
          cached: true,
        };
      }

      // Validate input
      this.validateChartInput(chartData);

      const prompt = this.formatPrompt(PROMPT_TEMPLATES.natalChart, {
        chartData: this.formatChartData(chartData),
      });

      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert astrologer providing accurate, insightful, and empowering interpretations. Your responses should be specific, nuanced, and encouraging.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: INTERPRETATION_PARAMS.natalChart.maxTokens,
        temperature: INTERPRETATION_PARAMS.natalChart.temperature,
      });

      const interpretation = this.parseInterpretation(completion.choices[0].message.content || '');

      // Cache the result
      this.setCachedResult(cacheKey, interpretation);

      // Track usage if userId provided
      if (userId && completion.usage) {
        await aiUsageService.record({
          userId,
          type: 'natal',
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          metadata: { interpretationType: 'natal' },
        });
      }

      return {
        success: true,
        interpretation,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        cached: false,
      };
    } catch (error: any) {
      logger.error('OpenAI natal interpretation error:', error);
      return {
        success: false,
        interpretation: null,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Generate AI-powered transit forecast
   */
  async generateTransitForecast(transitData: TransitInput, userId?: string): Promise<InterpretationResult> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('transit', transitData);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          success: true,
          interpretation: cached,
          generatedAt: new Date().toISOString(),
          model: openaiConfig.model,
          cached: true,
        };
      }

      // Validate input
      this.validateTransitInput(transitData);

      const prompt = this.formatPrompt(PROMPT_TEMPLATES.transitForecast, {
        transitData: this.formatTransitData(transitData),
      });

      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert astrologer providing accurate transit forecasts. Your guidance should be practical, empowering, and actionable.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: INTERPRETATION_PARAMS.transitForecast.maxTokens,
        temperature: INTERPRETATION_PARAMS.transitForecast.temperature,
      });

      const interpretation = this.parseInterpretation(completion.choices[0].message.content || '');

      // Cache the result
      this.setCachedResult(cacheKey, interpretation);

      // Track usage if userId provided
      if (userId && completion.usage) {
        await aiUsageService.record({
          userId,
          type: 'transit',
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          metadata: { interpretationType: 'transit' },
        });
      }

      return {
        success: true,
        interpretation,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        cached: false,
      };
    } catch (error: any) {
      logger.error('OpenAI transit forecast error:', error);
      return {
        success: false,
        interpretation: null,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Generate AI-powered compatibility analysis
   */
  async generateCompatibilityAnalysis(synastryData: SynastryInput, userId?: string): Promise<InterpretationResult> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey('compatibility', synastryData);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          success: true,
          interpretation: cached,
          generatedAt: new Date().toISOString(),
          model: openaiConfig.model,
          cached: true,
        };
      }

      // Validate input
      this.validateSynastryInput(synastryData);

      const prompt = this.formatPrompt(PROMPT_TEMPLATES.compatibility, {
        chartA: this.formatChartData(synastryData.chartA),
        chartB: this.formatChartData(synastryData.chartB),
      });

      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert astrologer providing insightful synastry analyses. Be balanced, honest, and constructive.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: INTERPRETATION_PARAMS.compatibility.maxTokens,
        temperature: INTERPRETATION_PARAMS.compatibility.temperature,
      });

      const interpretation = this.parseInterpretation(completion.choices[0].message.content || '');

      // Cache the result
      this.setCachedResult(cacheKey, interpretation);

      // Track usage if userId provided
      if (userId && completion.usage) {
        await aiUsageService.record({
          userId,
          type: 'compatibility',
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          metadata: { interpretationType: 'compatibility' },
        });
      }

      return {
        success: true,
        interpretation,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        cached: false,
      };
    } catch (error: any) {
      logger.error('OpenAI compatibility analysis error:', error);
      return {
        success: false,
        interpretation: null,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Generate AI-powered lunar return interpretation
   */
  async generateLunarReturnInterpretation(chartData: NatalChartInput, userId?: string): Promise<InterpretationResult> {
    try {
      const cacheKey = this.getCacheKey('lunar-return', chartData);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          success: true,
          interpretation: cached,
          generatedAt: new Date().toISOString(),
          model: openaiConfig.model,
          cached: true,
        };
      }

      this.validateChartInput(chartData);

      const prompt = this.formatPrompt(PROMPT_TEMPLATES.lunarReturn, {
        chartData: this.formatChartData(chartData),
      });

      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert astrologer providing insightful lunar return interpretations for the month ahead.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: INTERPRETATION_PARAMS.lunarReturn.maxTokens,
        temperature: INTERPRETATION_PARAMS.lunarReturn.temperature,
      });

      const interpretation = this.parseInterpretation(completion.choices[0].message.content || '');
      this.setCachedResult(cacheKey, interpretation);

      // Track usage if userId provided
      if (userId && completion.usage) {
        await aiUsageService.record({
          userId,
          type: 'lunar-return',
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          metadata: { interpretationType: 'lunar-return' },
        });
      }

      return {
        success: true,
        interpretation,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        cached: false,
      };
    } catch (error: any) {
      logger.error('OpenAI lunar return interpretation error:', error);
      return {
        success: false,
        interpretation: null,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Generate AI-powered solar return interpretation
   */
  async generateSolarReturnInterpretation(chartData: NatalChartInput, userId?: string): Promise<InterpretationResult> {
    try {
      const cacheKey = this.getCacheKey('solar-return', chartData);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          success: true,
          interpretation: cached,
          generatedAt: new Date().toISOString(),
          model: openaiConfig.model,
          cached: true,
        };
      }

      this.validateChartInput(chartData);

      const prompt = this.formatPrompt(PROMPT_TEMPLATES.solarReturn, {
        chartData: this.formatChartData(chartData),
      });

      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert astrologer providing comprehensive solar return interpretations for the year ahead.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: INTERPRETATION_PARAMS.solarReturn.maxTokens,
        temperature: INTERPRETATION_PARAMS.solarReturn.temperature,
      });

      const interpretation = this.parseInterpretation(completion.choices[0].message.content || '');
      this.setCachedResult(cacheKey, interpretation);

      // Track usage if userId provided
      if (userId && completion.usage) {
        await aiUsageService.record({
          userId,
          type: 'solar-return',
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          metadata: { interpretationType: 'solar-return' },
        });
      }

      return {
        success: true,
        interpretation,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        cached: false,
      };
    } catch (error: any) {
      logger.error('OpenAI solar return interpretation error:', error);
      return {
        success: false,
        interpretation: null,
        generatedAt: new Date().toISOString(),
        model: openaiConfig.model,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Format prompt template with data
   */
  private formatPrompt(template: string, data: Record<string, string>): string {
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
      prompt = prompt.replace(`{${key}}`, value);
    }
    return prompt;
  }

  /**
   * Format chart data for prompt
   */
  private formatChartData(data: NatalChartInput): string {
    const sections: string[] = [];

    // Planets
    if (data.planets && data.planets.length > 0) {
      sections.push('Planetary Positions:');
      data.planets.forEach((planet) => {
        const retro = planet.retrograde ? ' (Retrograde)' : '';
        sections.push(`  ${planet.planet}: ${planet.sign} at ${planet.degree}° in House ${planet.house}${retro}`);
      });
    }

    // Houses
    if (data.houses && data.houses.length > 0) {
      sections.push('\nHouse Cusps:');
      data.houses.forEach((house) => {
        sections.push(`  House ${house.house}: ${house.sign} at ${house.degree}°`);
      });
    }

    // Aspects
    if (data.aspects && data.aspects.length > 0) {
      sections.push('\nMajor Aspects:');
      data.aspects.forEach((aspect) => {
        const applying = aspect.applying ? ' (Applying)' : '';
        sections.push(
          `  ${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.orb}°)${applying}`
        );
      });
    }

    // Birth info
    if (data.birthDate || data.birthTime || data.birthPlace) {
      sections.push('\nBirth Information:');
      if (data.birthDate) sections.push(`  Date: ${data.birthDate}`);
      if (data.birthTime) sections.push(`  Time: ${data.birthTime}`);
      if (data.birthPlace) sections.push(`  Place: ${data.birthPlace}`);
    }

    return sections.join('\n');
  }

  /**
   * Format transit data for prompt
   */
  private formatTransitData(data: TransitInput): string {
    const sections: string[] = [];

    if (data.forecastStartDate && data.forecastEndDate) {
      sections.push(`Forecast Period: ${data.forecastStartDate} to ${data.forecastEndDate}`);
    }

    sections.push('\nCurrent Transits:');
    data.currentTransits.forEach((transit, index) => {
      const strength = transit.strength ? ` [${transit.strength}]` : '';
      sections.push(
        `${index + 1}. ${transit.planet} ${transit.type} ${transit.natalPlanet} (${transit.orb}°)${strength}`
      );
      sections.push(`   Active: ${transit.startDate} to ${transit.endDate}`);
    });

    return sections.join('\n');
  }

  /**
   * Parse AI response into structured format
   */
  private parseInterpretation(response: string): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(response);
    } catch {
      // If not JSON, return as text with metadata
      return {
        text: response,
        generated: true,
        format: 'markdown',
      };
    }
  }

  /**
   * Validate chart input data
   */
  private validateChartInput(data: NatalChartInput): void {
    if (!data || !data.planets || data.planets.length === 0) {
      throw new Error('Chart data must include at least one planet position');
    }

    // Validate planet structure
    for (const planet of data.planets) {
      if (!planet.planet || !planet.sign || typeof planet.degree !== 'number' || typeof planet.house !== 'number') {
        throw new Error('Invalid planet data structure');
      }
    }
  }

  /**
   * Validate transit input data
   */
  private validateTransitInput(data: TransitInput): void {
    if (!data || !data.currentTransits || data.currentTransits.length === 0) {
      throw new Error('Transit data must include at least one transit event');
    }

    for (const transit of data.currentTransits) {
      if (
        !transit.planet ||
        !transit.type ||
        !transit.natalPlanet ||
        !transit.startDate ||
        !transit.endDate
      ) {
        throw new Error('Invalid transit data structure');
      }
    }
  }

  /**
   * Validate synastry input data
   */
  private validateSynastryInput(data: SynastryInput): void {
    if (!data || !data.chartA || !data.chartB) {
      throw new Error('Synastry data must include both charts');
    }

    this.validateChartInput(data.chartA);
    this.validateChartInput(data.chartB);
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): string {
    if (error.response) {
      // OpenAI API error
      return `API Error: ${error.response.data?.error?.message || 'Unknown API error'}`;
    }

    if (error.code === 'ENOTFOUND') {
      return 'Network Error: Unable to reach OpenAI API';
    }

    if (error.message?.includes('API key')) {
      return 'Configuration Error: Invalid or missing API key';
    }

    if (error.message?.includes('quota')) {
      return 'Quota Exceeded: API rate limit or quota exceeded';
    }

    return error.message || 'Unknown error occurred';
  }

  /**
   * Generate cache key from data
   */
  private getCacheKey(type: string, data: any): string {
    const hash = JSON.stringify(data);
    return `${type}:${hash}`;
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(key: string): any | null {
    const cached = interpretationCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      interpretationCache.delete(key);
    }
    return null;
  }

  /**
   * Cache result with timestamp
   */
  private setCachedResult(key: string, data: any): void {
    interpretationCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache entries
   */
  clearCache(): void {
    interpretationCache.clear();
  }

  /**
   * Check if OpenAI is configured
   */
  isConfigured(): boolean {
    return !!openaiConfig.apiKey && openaiConfig.apiKey.length > 0;
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
  } {
    return {
      configured: this.isConfigured(),
      model: openaiConfig.model,
      maxTokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
    };
  }

  /**
   * Get usage statistics (placeholder for future implementation)
   */
  async getUsageStats(): Promise<any> {
    // This would call OpenAI API to get usage/billing info
    return {
      available: true,
      usage: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
      },
    };
  }
}

export default new OpenAIService();
