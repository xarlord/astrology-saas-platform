/**
 * Synastry Controller
 * Handles API endpoints for synastry and compatibility calculations
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../../utils/appError';
import {
  calculateSynastryChart,
  calculateCompositeChart,
  calculateCategoryScores,
  calculateElementalBalance,
  type Chart,
} from '../services/synastry.service';
import knex from '../../../config/database';

/**
 * Compare two charts and calculate synastry
 * POST /synastry/compare
 */
export const compareCharts = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { chart1Id, chart2Id } = req.body;

    if (!chart1Id || !chart2Id) {
      throw new BadRequestError('chart1Id and chart2Id are required');
    }

    if (chart1Id === chart2Id) {
      throw new BadRequestError('Cannot compare a chart with itself');
    }

    // Fetch both charts from database
    const [chart1Data, chart2Data] = await Promise.all([
      knex('charts').where({ id: chart1Id }).first(),
      knex('charts').where({ id: chart2Id }).first(),
    ]);

    if (!chart1Data || !chart2Data) {
      throw new NotFoundError('One or both charts not found');
    }

    // Build chart objects from calculated_data (JSON column with actual planet positions)
    const buildChartFromRow = (row: Record<string, unknown>): Chart => {
      const calc = row.calculated_data as Record<string, unknown> | null;
      const planets: Record<string, { name: string; degree: number; minute: number; second: number; sign: string }> = {};

      if (calc?.planets && typeof calc.planets === 'object') {
        // calculated_data.planets is either an array or object with planet entries
        const rawPlanets = calc.planets as Record<string, unknown>[] | Record<string, Record<string, unknown>>;
        if (Array.isArray(rawPlanets)) {
          for (const p of rawPlanets) {
            const name = (p.planet as string ?? p.name as string ?? '').toLowerCase().replace(/\s+/g, '');
            if (name) {
              planets[name] = {
                name,
                degree: (p.degree as number) ?? 0,
                minute: (p.minute as number) ?? 0,
                second: (p.second as number) ?? 0,
                sign: (p.sign as string) ?? '',
              };
            }
          }
        } else {
          for (const [name, p] of Object.entries(rawPlanets)) {
            const key = name.toLowerCase().replace(/\s+/g, '');
            planets[key] = {
              name: key,
              degree: (p as Record<string, unknown>).degree as number ?? 0,
              minute: (p as Record<string, unknown>).minute as number ?? 0,
              second: (p as Record<string, unknown>).second as number ?? 0,
              sign: ((p as Record<string, unknown>).sign as string) ?? '',
            };
          }
        }
      }

      return {
        id: row.id as string,
        userId: row.userId as string,
        planets,
      };
    };

    const chart1 = buildChartFromRow(chart1Data as unknown as Record<string, unknown>);
    const chart2 = buildChartFromRow(chart2Data as unknown as Record<string, unknown>);

    // Calculate synastry
    const synastryChart = calculateSynastryChart(chart1, chart2);

    // Check if already exists
    const existingSynastry = await knex('synastry_reports')
      .where({
        chart1_id: chart1Id,
        chart2_id: chart2Id,
        user_id: userId,
      })
      .first();

    let synastryId = existingSynastry?.id;

    // Save to database if new
    if (!synastryId) {
      const inserted = await knex('synastry_reports')
        .insert({
          chart1_id: chart1Id,
          chart2_id: chart2Id,
          user_id: userId,
          overall_score: synastryChart.overallCompatibility,
          synastry_aspects: JSON.stringify(synastryChart.synastryAspects),
          category_scores: JSON.stringify({
            relationshipTheme: synastryChart.relationshipTheme,
            strengths: synastryChart.strengths,
            challenges: synastryChart.challenges,
            advice: synastryChart.advice,
          }),
        })
        .returning('id');

      synastryId = inserted[0].id;
    }

    res.json({
      success: true,
      data: {
        ...synastryChart,
        id: synastryId,
      },
    });
  },
);

/**
 * Calculate compatibility score
 * POST /synastry/compatibility
 */
export const getCompatibility = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { chart1Id, chart2Id, includeComposite = false } = req.body;

    if (!chart1Id || !chart2Id) {
      throw new BadRequestError('chart1Id and chart2Id are required');
    }

    // Fetch both charts
    const [chart1Data, chart2Data] = await Promise.all([
      knex('charts').where({ id: chart1Id }).first() as Promise<
        Record<string, unknown> | undefined
      >,
      knex('charts').where({ id: chart2Id }).first() as Promise<
        Record<string, unknown> | undefined
      >,
    ]);

    if (!chart1Data || !chart2Data) {
      throw new NotFoundError('One or both charts not found');
    }

    // Build chart objects from calculated_data (same as compareCharts)
    const chart1 = buildChartFromRow(chart1Data as unknown as Record<string, unknown>);
    const chart2 = buildChartFromRow(chart2Data as unknown as Record<string, unknown>);

    // Calculate scores
    const scores = calculateCategoryScores(chart1, chart2);
    const elementalBalance = calculateElementalBalance(chart1, chart2);

    const result: Record<string, unknown> = {
      chart1Id,
      chart2Id,
      scores,
      elementalBalance,
    };

    // Add composite chart if requested
    if (includeComposite) {
      result.compositeChart = calculateCompositeChart(chart1, chart2);
    }

    res.json({
      success: true,
      data: result,
    });
  },
);

/**
 * Get all synastry comparisons for user
 * GET /synastry/reports
 */
export const getSynastryReports = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const reports = await knex('synastry_reports')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await knex('synastry_reports')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    const totalCount = Number(total?.count ?? 0);

    res.json({
      success: true,
      data: {
        reports: reports.map((r: Record<string, unknown>) => {
          const categoryScores = typeof r.category_scores === 'string'
            ? JSON.parse(r.category_scores)
            : r.category_scores || {};
          return {
            id: r.id,
            chart1Id: r.chart1_id,
            chart2Id: r.chart2_id,
            synastryAspects: typeof r.synastry_aspects === 'string'
              ? JSON.parse(r.synastry_aspects)
              : r.synastry_aspects || [],
            overallCompatibility: r.overall_score,
            relationshipTheme: categoryScores.relationshipTheme,
            strengths: categoryScores.strengths || [],
            challenges: categoryScores.challenges || [],
            advice: categoryScores.advice,
            isFavorite: r.is_favorite,
            createdAt: r.created_at,
          };
        }),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  },
);

/**
 * Get specific synastry report
 * GET /synastry/reports/:id
 */
export const getSynastryReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const report = await knex('synastry_reports').where({ id, user_id: userId }).first();

    if (!report) {
      throw new NotFoundError('Synastry report not found');
    }

    const categoryScores = typeof report.category_scores === 'string'
      ? JSON.parse(report.category_scores)
      : report.category_scores || {};

    res.json({
      success: true,
      data: {
        ...report,
        synastryAspects: typeof report.synastry_aspects === 'string'
          ? JSON.parse(report.synastry_aspects)
          : report.synastry_aspects || [],
        overallCompatibility: report.overall_score,
        relationshipTheme: categoryScores.relationshipTheme,
        strengths: categoryScores.strengths || [],
        challenges: categoryScores.challenges || [],
        advice: categoryScores.advice,
      },
    });
  },
);

/**
 * Delete synastry report
 * DELETE /synastry/reports/:id
 */
export const deleteSynastryReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    // Check if report exists and belongs to user
    const report = await knex('synastry_reports').where({ id, user_id: userId }).first();

    if (!report) {
      throw new NotFoundError('Synastry report not found');
    }

    await knex('synastry_reports').where({ id, user_id: userId }).del();

    res.json({
      success: true,
      message: 'Synastry report deleted successfully',
    });
  },
);

/**
 * Update synastry report (notes, favorite status)
 * PATCH /synastry/reports/:id
 */
export const updateSynastryReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { isFavorite, notes } = req.body;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    // Check if report exists and belongs to user
    const report = await knex('synastry_reports').where({ id, user_id: userId }).first();

    if (!report) {
      throw new NotFoundError('Synastry report not found');
    }

    // Update
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof isFavorite === 'boolean') {
      updateData.is_favorite = isFavorite;
    }

    if (notes !== undefined) {
      updateData.relationship_name = notes;
    }

    await knex('synastry_reports').where({ id, user_id: userId }).update(updateData);

    res.json({
      success: true,
      message: 'Synastry report updated successfully',
    });
  },
);

export default {
  compareCharts,
  getCompatibility,
  getSynastryReports,
  getSynastryReport,
  deleteSynastryReport,
  updateSynastryReport,
};
