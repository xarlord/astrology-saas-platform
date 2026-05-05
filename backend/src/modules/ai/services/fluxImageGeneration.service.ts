/**
 * FLUX Image Generation Service with LoRA Support
 *
 * Integrates with Replicate API to generate images using FLUX models
 * with optional LoRA adapter support for fine-tuned styles.
 *
 * Supports:
 * - FLUX.1-dev and FLUX.1-pro models
 * - Custom LoRA adapters (including FLUX Uncensored LoRA v2)
 * - Various aspect ratios and image sizes
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Replicate from 'replicate';
import logger from '../../../utils/logger';

// FLUX Uncensored LoRA v2 - Pre-trained LoRA for unrestricted content generation
const FLUX_UNCENSORED_LORA_V2 = 'praeceptor/flora-uncensored-v2';

// FLUX model versions on Replicate
const FLUX_MODELS = {
  dev: 'black-forest-labs/flux-1-dev',
  pro: 'black-forest-labs/flux-pro',
  schnell: 'black-forest-labs/flux-schnell',
} as const;

export interface FluxImageOptions {
  /** Text prompt for image generation */
  prompt: string;
  /** Negative prompt to exclude from generation */
  negativePrompt?: string;
  /** Aspect ratio of the output image */
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';
  /** Width in pixels (overrides aspectRatio) */
  width?: number;
  /** Height in pixels (overrides aspectRatio) */
  height?: number;
  /** Number of images to generate (1-4) */
  numOutputs?: number;
  /** Guidance scale for prompt adherence (1.5-5) */
  guidanceScale?: number;
  /** Number of inference steps (10-50) */
  numInferenceSteps?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Disable safety checker (use with caution) */
  disableSafetyChecker?: boolean;
  /** LoRA adapter to apply */
  loraAdapter?: string;
  /** LoRA scale/strength (0-1) */
  loraScale?: number;
}

export interface FluxImageResult {
  /** URL of generated image(s) */
  imageUrls: string[];
  /** Width of generated image */
  width: number;
  /** Height of generated image */
  height: number;
  /** Model used for generation */
  model: string;
  /** LoRA adapter used (if any) */
  loraAdapter?: string;
}

const DEFAULT_OPTIONS: Partial<FluxImageOptions> = {
  aspectRatio: '1:1',
  numOutputs: 1,
  guidanceScale: 3.5,
  numInferenceSteps: 28,
  disableSafetyChecker: false,
  loraScale: 1.0,
};

/**
 * Convert aspect ratio to dimensions
 */
function aspectRatioToDims(ratio: string): { width: number; height: number } {
  const base = 1024;
  const ratios: Record<string, { width: number; height: number }> = {
    '1:1': { width: base, height: base },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1024, height: 768 },
    '3:4': { width: 768, height: 1024 },
    '21:9': { width: 1536, height: 640 },
    '9:21': { width: 640, height: 1536 },
  };
  return ratios[ratio] || ratios['1:1'];
}

class FluxImageGenerationService {
  private replicate: Replicate | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.apiKey = process.env.REPLICATE_API_KEY || null;

    if (!this.apiKey) {
      logger.warn(
        'FluxImageGenerationService: REPLICATE_API_KEY not set. Image generation will not work.',
      );
      return;
    }

    this.replicate = new Replicate({
      auth: this.apiKey,
    });
  }

  /**
   * Generate image using FLUX with optional LoRA adapter
   */
  async generateImage(
    options: FluxImageOptions,
    model: keyof typeof FLUX_MODELS = 'dev',
  ): Promise<FluxImageResult | null> {
    if (!this.replicate) {
      logger.error(
        'FluxImageGenerationService: Replicate client not initialized. Check REPLICATE_API_KEY.',
      );
      return null;
    }

    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const modelVersion = FLUX_MODELS[model];

      // Determine dimensions
      let width = opts.width;
      let height = opts.height;
      if (!width || !height) {
        const dims = aspectRatioToDims(opts.aspectRatio || '1:1');
        width = dims.width;
        height = dims.height;
      }

      // Build input for Replicate
      const input: Record<string, any> = {
        prompt: opts.prompt,
        aspect_ratio: opts.aspectRatio || '1:1',
        num_outputs: opts.numOutputs || 1,
        guidance: opts.guidanceScale,
        num_inference_steps: opts.numInferenceSteps,
        disable_safety_checker: opts.disableSafetyChecker,
      };

      if (opts.negativePrompt) {
        input.negative_prompt = opts.negativePrompt;
      }

      if (opts.seed) {
        input.seed = opts.seed;
      }

      // Add LoRA adapter if specified
      const loraAdapter = opts.loraAdapter;
      if (loraAdapter) {
        input.lora_adapter = loraAdapter;
        input.lora_scale = opts.loraScale ?? 1.0;
        logger.info('Using LoRA adapter', { adapter: loraAdapter, scale: opts.loraScale });
      }

      logger.info('Generating FLUX image', {
        prompt: opts.prompt.substring(0, 100) + '...',
        model,
        width,
        height,
        loraAdapter,
      });

      // Run prediction
      const output = await this.replicate.run(modelVersion, {
        input,
      });

      // Handle different output formats
      const imageUrls: string[] = [];
      if (Array.isArray(output)) {
        imageUrls.push(...output);
      } else if (typeof output === 'string') {
        imageUrls.push(output);
      } else if (output && typeof output === 'object') {
        // Some models return { output: [...] }
        if (Array.isArray((output as any).output)) {
          imageUrls.push(...(output as any).output);
        } else if (typeof (output as any).output === 'string') {
          imageUrls.push((output as any).output);
        }
      }

      logger.info('FLUX image generated', {
        count: imageUrls.length,
        width,
        height,
        model,
        loraAdapter,
      });

      return {
        imageUrls,
        width,
        height,
        model,
        loraAdapter,
      };
    } catch (error) {
      logger.error('Failed to generate FLUX image', {
        error: error instanceof Error ? error.message : String(error),
        prompt: options.prompt.substring(0, 100),
      });
      return null;
    }
  }

  /**
   * Generate image using FLUX Uncensored LoRA v2
   * This is the main method for uncensored image generation
   */
  async generateUncensoredImage(options: FluxImageOptions): Promise<FluxImageResult | null> {
    return this.generateImage(
      {
        ...options,
        loraAdapter: FLUX_UNCENSORED_LORA_V2,
        disableSafetyChecker: true,
      },
      'dev',
    );
  }

  /**
   * Generate multiple image variations with different seeds
   */
  async generateVariations(
    options: FluxImageOptions,
    count: number = 4,
  ): Promise<FluxImageResult | null> {
    const seeds = Array.from({ length: count }, () => Math.floor(Math.random() * 2147483647));

    return this.generateImage(
      {
        ...options,
        numOutputs: count,
        seed: seeds[0],
      },
      'schnell', // Use schnell for faster generation
    );
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.replicate !== null && this.apiKey !== null;
  }

  /**
   * Get status of the service
   */
  getStatus(): {
    configured: boolean;
    hasApiKey: boolean;
    modelsAvailable: string[];
    defaultLora: string;
  } {
    return {
      configured: this.isConfigured(),
      hasApiKey: this.apiKey !== null,
      modelsAvailable: Object.keys(FLUX_MODELS),
      defaultLora: FLUX_UNCENSORED_LORA_V2,
    };
  }
}

// Export singleton instance
const fluxImageGenerationService = new FluxImageGenerationService();
export default fluxImageGenerationService;

// Also export the class for testing
export { FluxImageGenerationService };
