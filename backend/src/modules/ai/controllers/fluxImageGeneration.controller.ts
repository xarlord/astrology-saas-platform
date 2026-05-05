/**
 * FLUX Image Generation Controller
 *
 * Handles HTTP requests for FLUX image generation with LoRA support
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response, Request } from 'express';
import fluxImageGenerationService, {
  type FluxImageOptions,
} from '../services/fluxImageGeneration.service';
import logger from '../../../utils/logger';
import aiUsageService from '../services/aiUsage.service';

/**
 * Check FLUX image generation service status
 */
export async function checkImageGenStatus(_req: Request, res: Response): Promise<void> {
  try {
    const status = fluxImageGenerationService.getStatus();

    res.json({
      success: true,
      data: {
        service: 'FLUX Image Generation',
        ...status,
        available: status.configured,
      },
    });
  } catch (error) {
    logger.error('Error checking image generation status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to check image generation status',
    });
  }
}

/**
 * Generate image with FLUX (standard)
 */
export async function generateImage(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const options: FluxImageOptions = {
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      aspectRatio: req.body.aspectRatio || '1:1',
      width: req.body.width,
      height: req.body.height,
      numOutputs: req.body.numOutputs || 1,
      guidanceScale: req.body.guidanceScale,
      numInferenceSteps: req.body.numInferenceSteps,
      seed: req.body.seed,
      disableSafetyChecker: req.body.disableSafetyChecker,
    };

    // Validate prompt
    if (
      !options.prompt ||
      typeof options.prompt !== 'string' ||
      options.prompt.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
      return;
    }

    if (options.prompt.length > 2000) {
      res.status(400).json({
        success: false,
        error: 'Prompt is too long (max 2000 characters)',
      });
      return;
    }

    // Check number of outputs
    if (options.numOutputs && (options.numOutputs < 1 || options.numOutputs > 4)) {
      res.status(400).json({
        success: false,
        error: 'Number of outputs must be between 1 and 4',
      });
      return;
    }

    // Select model
    const model = req.body.model || 'dev';
    if (!['dev', 'pro', 'schnell'].includes(model)) {
      res.status(400).json({
        success: false,
        error: 'Invalid model. Use: dev, pro, or schnell',
      });
      return;
    }

    logger.info('FLUX image generation request', {
      userId,
      prompt: options.prompt.substring(0, 100),
      model,
      numOutputs: options.numOutputs,
    });

    const result = await fluxImageGenerationService.generateImage(options, model as any);

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate image. Check service configuration.',
      });
      return;
    }

    // Track usage
    try {
      await aiUsageService.record({
        userId,
        type: 'image_generation_flux',
        inputTokens: 0,
        outputTokens: 0,
        metadata: {
          model: `flux-${model}`,
          imagesGenerated: result.imageUrls.length,
          estimatedCost:
            model === 'pro'
              ? 0.055 * result.imageUrls.length
              : model === 'dev'
                ? 0.03 * result.imageUrls.length
                : 0.003 * result.imageUrls.length,
        },
      });
    } catch (trackingError) {
      logger.warn('Failed to track image generation usage', { error: trackingError });
    }

    res.json({
      success: true,
      data: {
        images: result.imageUrls.map((url, index) => ({
          url,
          index,
          width: result.width,
          height: result.height,
        })),
        model: result.model,
        dimensions: {
          width: result.width,
          height: result.height,
        },
        count: result.imageUrls.length,
      },
    });
  } catch (error) {
    logger.error('Error in generateImage', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate image',
    });
  }
}

/**
 * Generate uncensored image using FLUX Uncensored LoRA v2
 */
export async function generateUncensoredImage(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const options: FluxImageOptions = {
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      aspectRatio: req.body.aspectRatio || '1:1',
      width: req.body.width,
      height: req.body.height,
      numOutputs: req.body.numOutputs || 1,
      guidanceScale: req.body.guidanceScale,
      numInferenceSteps: req.body.numInferenceSteps,
      seed: req.body.seed,
      loraScale: req.body.loraScale,
    };

    // Validate prompt
    if (
      !options.prompt ||
      typeof options.prompt !== 'string' ||
      options.prompt.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
      return;
    }

    if (options.prompt.length > 2000) {
      res.status(400).json({
        success: false,
        error: 'Prompt is too long (max 2000 characters)',
      });
      return;
    }

    // Check number of outputs
    if (options.numOutputs && (options.numOutputs < 1 || options.numOutputs > 4)) {
      res.status(400).json({
        success: false,
        error: 'Number of outputs must be between 1 and 4',
      });
      return;
    }

    logger.info('FLUX uncensored image generation request', {
      userId,
      prompt: options.prompt.substring(0, 100),
      numOutputs: options.numOutputs,
    });

    const result = await fluxImageGenerationService.generateUncensoredImage(options);

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate image. Check service configuration.',
      });
      return;
    }

    // Track usage
    try {
      await aiUsageService.record({
        userId,
        type: 'image_generation_flux_uncensored',
        inputTokens: 0,
        outputTokens: 0,
        metadata: {
          model: 'flux-dev-uncensored-v2',
          imagesGenerated: result.imageUrls.length,
          estimatedCost: 0.03 * result.imageUrls.length,
        },
      });
    } catch (trackingError) {
      logger.warn('Failed to track image generation usage', { error: trackingError });
    }

    res.json({
      success: true,
      data: {
        images: result.imageUrls.map((url, index) => ({
          url,
          index,
          width: result.width,
          height: result.height,
        })),
        model: result.model,
        loraAdapter: result.loraAdapter,
        dimensions: {
          width: result.width,
          height: result.height,
        },
        count: result.imageUrls.length,
      },
    });
  } catch (error) {
    logger.error('Error in generateUncensoredImage', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate uncensored image',
    });
  }
}

/**
 * Generate multiple image variations
 */
export async function generateVariations(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const options: FluxImageOptions = {
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      aspectRatio: req.body.aspectRatio || '1:1',
      width: req.body.width,
      height: req.body.height,
      guidanceScale: req.body.guidanceScale,
      numInferenceSteps: req.body.numInferenceSteps,
    };

    const count = req.body.count || 4;

    // Validate prompt
    if (
      !options.prompt ||
      typeof options.prompt !== 'string' ||
      options.prompt.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
      return;
    }

    if (count < 1 || count > 4) {
      res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 4',
      });
      return;
    }

    logger.info('FLUX variations generation request', {
      userId,
      prompt: options.prompt.substring(0, 100),
      count,
    });

    const result = await fluxImageGenerationService.generateVariations(options, count);

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate variations. Check service configuration.',
      });
      return;
    }

    // Track usage
    try {
      await aiUsageService.record({
        userId,
        type: 'image_generation_flux_variations',
        inputTokens: 0,
        outputTokens: 0,
        metadata: {
          model: 'flux-schnell',
          imagesGenerated: result.imageUrls.length,
          estimatedCost: 0.003 * result.imageUrls.length,
        },
      });
    } catch (trackingError) {
      logger.warn('Failed to track image generation usage', { error: trackingError });
    }

    res.json({
      success: true,
      data: {
        images: result.imageUrls.map((url, index) => ({
          url,
          index,
          width: result.width,
          height: result.height,
        })),
        model: result.model,
        dimensions: {
          width: result.width,
          height: result.height,
        },
        count: result.imageUrls.length,
      },
    });
  } catch (error) {
    logger.error('Error in generateVariations', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate variations',
    });
  }
}
