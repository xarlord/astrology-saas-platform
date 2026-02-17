/**
 * OpenAI Configuration
 * Provides configuration and prompt templates for AI-powered astrological interpretations
 */

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const openaiConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
};

/**
 * Prompt templates for different types of astrological interpretations
 */
export const PROMPT_TEMPLATES = {
  /**
   * Natal chart interpretation prompt
   * Focuses on personality, emotional nature, communication, relationships, career, and life purpose
   */
  natalChart: `You are an expert astrologer providing personalized natal chart interpretations. Based on the following birth chart data, provide detailed, insightful, and empowering interpretations.

Focus on:
- Core personality traits and potentials
- Emotional nature and needs
- Communication style
- Relationship dynamics
- Career strengths and challenges
- Life purpose and growth opportunities

Use astrological terminology but make it accessible. Be encouraging, specific, and nuanced. Avoid generic platitudes.

Chart Data:
{chartData}

Provide interpretations for each key placement.`,

  /**
   * Transit forecast interpretation prompt
   * Focuses on current energies, opportunities, challenges, timing, and actionable advice
   */
  transitForecast: `You are an expert astrologer providing transit forecast interpretations. Based on the following current transits affecting the natal chart, provide practical guidance.

Focus on:
- Overall themes and energies
- Specific opportunities and challenges
- Timing considerations
- Actionable advice
- Empowerment and perspective

Current Transits:
{transitData}

Provide a comprehensive forecast interpretation.`,

  /**
   * Compatibility/synastry interpretation prompt
   * Focuses on relationship dynamics, strengths, challenges, and growth opportunities
   */
  compatibility: `You are an expert astrologer providing synastry (compatibility) interpretations. Based on the following two charts, analyze the relationship dynamics.

Focus on:
- Strengths and synergies
- Potential challenges
- Communication styles
- Emotional compatibility
- Long-term potential
- Growth opportunities

Chart A:
{chartA}

Chart B:
{chartB}

Provide a balanced, insightful compatibility analysis.`,

  /**
   * Lunar return interpretation prompt
   * Focuses on emotional themes and personal growth for the upcoming lunar month
   */
  lunarReturn: `You are an expert astrologer providing lunar return interpretations. Based on the following lunar return chart, provide insights for the upcoming lunar month.

Focus on:
- Emotional themes and needs
- Personal growth opportunities
- Areas of focus and attention
- Potential challenges and how to navigate them
- Optimal timing for different activities

Lunar Return Chart:
{chartData}

Provide a comprehensive lunar month forecast.`,

  /**
   * Solar return interpretation prompt
   * Focuses on yearly themes and personal development for the upcoming solar year
   */
  solarReturn: `You are an expert astrologer providing solar return interpretations. Based on the following solar return chart, provide insights for the upcoming solar year.

Focus on:
- Major themes for the year ahead
- Personal development opportunities
- Career and relationship areas of focus
- Health and wellbeing considerations
- Optimal timing for important initiatives

Solar Return Chart:
{chartData}

Provide a comprehensive solar year forecast.`,
};

/**
 * Default parameters for different interpretation types
 */
export const INTERPRETATION_PARAMS = {
  natalChart: {
    maxTokens: 2500,
    temperature: 0.7,
  },
  transitForecast: {
    maxTokens: 2000,
    temperature: 0.7,
  },
  compatibility: {
    maxTokens: 2500,
    temperature: 0.8,
  },
  lunarReturn: {
    maxTokens: 2000,
    temperature: 0.7,
  },
  solarReturn: {
    maxTokens: 2500,
    temperature: 0.7,
  },
};

export default openaiConfig;
