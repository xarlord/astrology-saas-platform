/**
 * AI Prompt Engineering System
 * Manages all prompts for AI interpretation generation
 */

export interface PromptTemplate {
  name: string;
  systemMessage: string;
  userPrompt: string;
  parameters: string[];
}

export * from './natalChart.prompts';
export * from './transit.prompts';
export * from './synastry.prompts';

// Prompt utility functions
export class PromptBuilder {
  /**
   * Build a prompt from template with parameters
   */
  static build(template: PromptTemplate, params: Record<string, any>): string {
    let prompt = template.userPrompt;

    // Replace parameters in the prompt
    template.parameters.forEach(param => {
      const placeholder = `{${param}}`;
      const value = params[param] || '';
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    });

    return prompt;
  }

  /**
   * Get prompt template by name
   */
  static getTemplate(type: string, name: string): PromptTemplate | null {
    const templates = {
      natal: require('./natalChart.prompts').NATAL_CHART_PROMPTS,
      transit: require('./transit.prompts').TRANSIT_PROMPTS,
      synastry: require('./synastry.prompts').SYNASTRY_PROMPTS,
    };

    return templates[type]?.[name] || null;
  }
}
