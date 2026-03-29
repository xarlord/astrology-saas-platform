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

import { NATAL_CHART_PROMPTS } from './natalChart.prompts';
import { TRANSIT_PROMPTS } from './transit.prompts';
import { SYNASTRY_PROMPTS } from './synastry.prompts';

const promptTemplates: Record<string, Record<string, PromptTemplate>> = {
  natal: NATAL_CHART_PROMPTS,
  transit: TRANSIT_PROMPTS,
  synastry: SYNASTRY_PROMPTS,
};

// Prompt utility functions
export class PromptBuilder {
  /**
   * Build a prompt from template with parameters
   */
  static build(template: PromptTemplate, params: Record<string, string>): string {
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
    return promptTemplates[type]?.[name] || null;
  }
}
