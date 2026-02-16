/**
 * Validators using Joi
 */

import Joi from 'joi';

// Auth validators
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Chart validators
export const createChartSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  type: Joi.string().valid('natal', 'synastry', 'composite', 'transit', 'progressed').optional(),
  birth_date: Joi.date().required(),
  birth_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).required(),
  birth_time_unknown: Joi.boolean().default(false),
  birth_place_name: Joi.string().min(1).max(200).required(),
  birth_latitude: Joi.number().min(-90).max(90).required(),
  birth_longitude: Joi.number().min(-180).max(180).required(),
  birth_timezone: Joi.string().required(),
  house_system: Joi.string().valid('placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric').optional(),
  zodiac: Joi.string().valid('tropical', 'sidereal').optional(),
  sidereal_mode: Joi.string().when('zodiac', { is: 'sidereal', then: Joi.optional(), otherwise: Joi.strip() }),
});

export const updateChartSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  house_system: Joi.string().valid('placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric').optional(),
  zodiac: Joi.string().valid('tropical', 'sidereal').optional(),
  sidereal_mode: Joi.string().optional(),
});

// Transit validators
export const calculateTransitsSchema = Joi.object({
  chartId: Joi.string().uuid().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
});

// Pagination
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

/**
 * Validate request body against schema
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
    }

    req.body = value;
    next();
  };
}

/**
 * Validate request query against schema
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
    }

    req.query = value;
    next();
  };
}
