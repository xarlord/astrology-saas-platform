/**
 * Timezone Routes
 */

import { Router } from 'express';
import { asyncHandler } from '../../../middleware/errorHandler';
import { timezoneService } from '../services/timezone.service';

const router = Router();

/**
 * @route   GET /api/timezone/search
 * @desc    Search timezones by query
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/search:
 *   get:
 *     tags: [Timezone]
 *     summary: Search timezones by query
 *     security: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching timezones
 *       400:
 *         description: Missing query parameter
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Query parameter "q" is required',
    });
    return;
  }

  const results = timezoneService.searchTimezones(q);

  res.status(200).json({
    success: true,
    data: { timezones: results },
  });
}));

/**
 * @route   GET /api/timezone/common
 * @desc    Get common timezones by region
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/common:
 *   get:
 *     tags: [Timezone]
 *     summary: Get common timezones by region
 *     security: []
 *     parameters:
 *       - name: region
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of common timezones
 */
router.get('/common', asyncHandler(async (req, res) => {
  const { region } = req.query;

  const timezones = timezoneService.getCommonTimezones(region as string);

  res.status(200).json({
    success: true,
    data: { timezones },
  });
}));

/**
 * @route   GET /api/timezone/detect
 * @desc    Detect timezone from coordinates
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/detect:
 *   get:
 *     tags: [Timezone]
 *     summary: Detect timezone from coordinates
 *     security: []
 *     parameters:
 *       - name: lat
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: lng
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Detected timezone info
 *       400:
 *         description: Invalid coordinates
 *       404:
 *         description: Could not detect timezone
 */
router.get('/detect', asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({
      success: false,
      error: 'Valid latitude and longitude required',
    });
    return;
  }

  const timezone = timezoneService.detectTimezoneFromCoordinates(lat, lng);

  if (!timezone) {
    res.status(404).json({
      success: false,
      error: 'Could not detect timezone for coordinates',
    });
    return;
  }

  const info = timezoneService.getTimezoneInfo(timezone);

  res.status(200).json({
    success: true,
    data: {
      timezone,
      info,
    },
  });
}));

/**
 * @route   GET /api/timezone/:timezone
 * @desc    Get timezone info
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/{timezone}:
 *   get:
 *     tags: [Timezone]
 *     summary: Get timezone info
 *     security: []
 *     parameters:
 *       - name: timezone
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timezone information
 *       400:
 *         description: Invalid timezone
 */
router.get('/:timezone', asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  const { date } = req.query;

  const dateObj = date ? new Date(date as string) : undefined;

  if (!timezoneService.isValidTimezone(timezone)) {
    res.status(400).json({
      success: false,
      error: 'Invalid timezone',
    });
    return;
  }

  const info = timezoneService.getTimezoneInfo(timezone, dateObj);

  res.status(200).json({
    success: true,
    data: { info },
  });
}));

/**
 * @route   POST /api/timezone/convert
 * @desc    Convert birth time to UTC
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/convert:
 *   post:
 *     tags: [Timezone]
 *     summary: Convert birth time to UTC
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [year, month, day, hour, minute, timezone]
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               day:
 *                 type: integer
 *               hour:
 *                 type: integer
 *               minute:
 *                 type: integer
 *               timezone:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Converted UTC date and offset
 *       400:
 *         description: Invalid input or conversion failed
 */
router.post('/convert', asyncHandler(async (req, res) => {
  const { year, month, day, hour, minute, timezone, latitude, longitude } = req.body;

  // Validate required fields
  if (!year || !month || !day || hour === undefined || minute === undefined || !timezone) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: year, month, day, hour, minute, timezone',
    });
    return;
  }

  // Validate timezone
  if (!timezoneService.isValidTimezone(timezone)) {
    res.status(400).json({
      success: false,
      error: 'Invalid timezone',
    });
    return;
  }

  try {
    const conversion = timezoneService.convertBirthTimeToUTC({
      year,
      month,
      day,
      hour,
      minute,
      timezone,
      latitude,
      longitude,
    });

    res.status(200).json({
      success: true,
      data: {
        utcDate: conversion.utcDate.toISOString(),
        offset: conversion.offset,
        offsetStr: timezoneService.getTimezoneInfo(timezone, conversion.utcDate).offsetStr,
        isDST: conversion.isDST,
        julianDay: conversion.julianDay,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    });
  }
}));

/**
 * @route   GET /api/timezone/:timezone/dst
 * @desc    Get DST transitions for a year
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/timezone/{timezone}/dst:
 *   get:
 *     tags: [Timezone]
 *     summary: Get DST transitions for a year
 *     security: []
 *     parameters:
 *       - name: timezone
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: year
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: DST transition dates
 *       400:
 *         description: Invalid timezone
 */
router.get('/:timezone/dst', asyncHandler(async (req, res) => {
  const { timezone } = req.params;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  if (!timezoneService.isValidTimezone(timezone)) {
    res.status(400).json({
      success: false,
      error: 'Invalid timezone',
    });
    return;
  }

  const transitions = timezoneService.getDSTTransitions(year, timezone);

  res.status(200).json({
    success: true,
    data: {
      timezone,
      year,
      dstStart: transitions.start?.toISOString() || null,
      dstEnd: transitions.end?.toISOString() || null,
    },
  });
}));

export { router };
