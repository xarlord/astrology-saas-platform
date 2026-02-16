/**
 * Synastry Controller
 * Handles API endpoints for synastry and compatibility calculations
 */

import { Request, Response, NextFunction } from 'express';
import {
  calculateSynastryChart,
  calculateCompositeChart,
  generateCompatibilityReport,
  calculateCategoryScores,
  calculateElementalBalance,
} from '../services/synastry.service';
import { Chart, CompatibilityReport, SynastryChart, CompositeChart } from '../models/synastry.model';
import { db } from '../db';

/**
 * Compare two charts and calculate synastry
 * POST /synastry/compare
 */
export async function compareCharts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { chart1Id, chart2Id } = req.body;

    if (!chart1Id || !chart2Id) {
      return res.status(400).json({
        success: false,
        error: 'chart1Id and chart2Id are required',
      });
    }

    if (chart1Id === chart2Id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot compare a chart with itself',
      });
    }

    // Fetch both charts from database
    const [chart1Data, chart2Data] = await Promise.all([
      db('charts').where({ id: chart1Id }).first(),
      db('charts').where({ id: chart2Id }).first(),
    ]);

    if (!chart1Data || !chart2Data) {
      return res.status(404).json({
        success: false,
        error: 'One or both charts not found',
      });
    }

    // Build chart objects
    const chart1: Chart = {
      id: chart1Data.id,
      userId: chart1Data.userId,
      planets: {
        sun: chart1Data.sunSign ? {
          name: 'sun',
          degree: chart1Data.sunDegree || 0,
          minute: chart1Data.sunMinute || 0,
          second: chart1Data.sunSecond || 0,
          sign: chart1Data.sunSign,
        } : undefined,
        moon: chart1Data.moonSign ? {
          name: 'moon',
          degree: chart1Data.moonDegree || 0,
          minute: chart1Data.moonMinute || 0,
          second: chart1Data.moonSecond || 0,
          sign: chart1Data.moonSign,
        } : undefined,
        mercury: chart1Data.mercurySign ? {
          name: 'mercury',
          degree: chart1Data.mercuryDegree || 0,
          minute: chart1Data.mercuryMinute || 0,
          second: chart1Data.mercurySecond || 0,
          sign: chart1Data.mercurySign,
        } : undefined,
        venus: chart1Data.venusSign ? {
          name: 'venus',
          degree: chart1Data.venusDegree || 0,
          minute: chart1Data.venusMinute || 0,
          second: chart1Data.venusSecond || 0,
          sign: chart1Data.venusSign,
        } : undefined,
        mars: chart1Data.marsSign ? {
          name: 'mars',
          degree: chart1Data.marsDegree || 0,
          minute: chart1Data.marsMinute || 0,
          second: chart1Data.marsSecond || 0,
          sign: chart1Data.marsSign,
        } : undefined,
        jupiter: chart1Data.jupiterSign ? {
          name: 'jupiter',
          degree: chart1Data.jupiterDegree || 0,
          minute: chart1Data.jupiterMinute || 0,
          second: chart1Data.jupiterSecond || 0,
          sign: chart1Data.jupiterSign,
        } : undefined,
        saturn: chart1Data.saturnSign ? {
          name: 'saturn',
          degree: chart1Data.saturnDegree || 0,
          minute: chart1Data.saturnMinute || 0,
          second: chart1Data.saturnSecond || 0,
          sign: chart1Data.saturnSign,
        } : undefined,
        uranus: chart1Data.uranusSign ? {
          name: 'uranus',
          degree: chart1Data.uranusDegree || 0,
          minute: chart1Data.uranusMinute || 0,
          second: chart1Data.uranusSecond || 0,
          sign: chart1Data.uranusSign,
        } : undefined,
        neptune: chart1Data.neptuneSign ? {
          name: 'neptune',
          degree: chart1Data.neptuneDegree || 0,
          minute: chart1Data.neptuneMinute || 0,
          second: chart1Data.neptuneSecond || 0,
          sign: chart1Data.neptuneSign,
        } : undefined,
        pluto: chart1Data.plutoSign ? {
          name: 'pluto',
          degree: chart1Data.plutoDegree || 0,
          minute: chart1Data.plutoMinute || 0,
          second: chart1Data.plutoSecond || 0,
          sign: chart1Data.plutoSign,
        } : undefined,
      },
    };

    const chart2: Chart = {
      id: chart2Data.id,
      userId: chart2Data.userId,
      planets: {
        sun: chart2Data.sunSign ? {
          name: 'sun',
          degree: chart2Data.sunDegree || 0,
          minute: chart2Data.sunMinute || 0,
          second: chart2Data.sunSecond || 0,
          sign: chart2Data.sunSign,
        } : undefined,
        moon: chart2Data.moonSign ? {
          name: 'moon',
          degree: chart2Data.moonDegree || 0,
          minute: chart2Data.moonMinute || 0,
          second: chart2Data.moonSecond || 0,
          sign: chart2Data.moonSign,
        } : undefined,
        mercury: chart2Data.mercurySign ? {
          name: 'mercury',
          degree: chart2Data.mercuryDegree || 0,
          minute: chart2Data.mercuryMinute || 0,
          second: chart2Data.mercurySecond || 0,
          sign: chart2Data.mercurySign,
        } : undefined,
        venus: chart2Data.venusSign ? {
          name: 'venus',
          degree: chart2Data.venusDegree || 0,
          minute: chart2Data.venusMinute || 0,
          second: chart2Data.venusSecond || 0,
          sign: chart2Data.venusSign,
        } : undefined,
        mars: chart2Data.marsSign ? {
          name: 'mars',
          degree: chart2Data.marsDegree || 0,
          minute: chart2Data.marsMinute || 0,
          second: chart2Data.marsSecond || 0,
          sign: chart2Data.marsSign,
        } : undefined,
        jupiter: chart2Data.jupiterSign ? {
          name: 'jupiter',
          degree: chart2Data.jupiterDegree || 0,
          minute: chart2Data.jupiterMinute || 0,
          second: chart2Data.jupiterSecond || 0,
          sign: chart2Data.jupiterSign,
        } : undefined,
        saturn: chart2Data.saturnSign ? {
          name: 'saturn',
          degree: chart2Data.saturnDegree || 0,
          minute: chart2Data.saturnMinute || 0,
          second: chart2Data.saturnSecond || 0,
          sign: chart2Data.saturnSign,
        } : undefined,
        uranus: chart2Data.uranusSign ? {
          name: 'uranus',
          degree: chart2Data.uranusDegree || 0,
          minute: chart2Data.uranusMinute || 0,
          second: chart2Data.uranusSecond || 0,
          sign: chart2Data.uranusSign,
        } : undefined,
        neptune: chart2Data.neptuneSign ? {
          name: 'neptune',
          degree: chart2Data.neptuneDegree || 0,
          minute: chart2Data.neptuneMinute || 0,
          second: chart2Data.neptuneSecond || 0,
          sign: chart2Data.neptuneSign,
        } : undefined,
        pluto: chart2Data.plutoSign ? {
          name: 'pluto',
          degree: chart2Data.plutoDegree || 0,
          minute: chart2Data.plutoMinute || 0,
          second: chart2Data.plutoSecond || 0,
          sign: chart2Data.plutoSign,
        } : undefined,
      },
    };

    // Calculate synastry
    const synastryChart = calculateSynastryChart(chart1, chart2);

    // Check if already exists
    const existingSynastry = await db('synastry_charts')
      .where({
        chart1_id: chart1Id,
        chart2_id: chart2Id,
        user_id: userId,
      })
      .first();

    let synastryId = existingSynastry?.id;

    // Save to database if new
    if (!synastryId) {
      const [inserted] = await db('synastry_charts')
        .insert({
          chart1_id: chart1Id,
          chart2_id: chart2Id,
          user_id: userId,
          synastry_aspects: JSON.stringify(synastryChart.synastryAspects),
          compatibility_score: synastryChart.overallCompatibility,
          relationship_theme: synastryChart.relationshipTheme,
          strengths: synastryChart.strengths,
          challenges: synastryChart.challenges,
          advice: synastryChart.advice,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning('id');

      synastryId = inserted[0].id;

      // Insert aspects
      for (const aspect of synastryChart.synastryAspects) {
        await db('synastry_aspects').insert({
          synastry_chart_id: synastryId,
          planet1: aspect.planet1,
          planet2: aspect.planet2,
          aspect: aspect.aspect,
          orb: aspect.orb,
          applying: aspect.applying,
          interpretation: aspect.interpretation,
          weight: aspect.weight,
          soulmate_indicator: aspect.soulmateIndicator,
          created_at: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...synastryChart,
        id: synastryId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate compatibility score
 * POST /synastry/compatibility
 */
export async function getCompatibility(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { chart1Id, chart2Id, includeComposite = false } = req.body;

    if (!chart1Id || !chart2Id) {
      return res.status(400).json({
        success: false,
        error: 'chart1Id and chart2Id are required',
      });
    }

    // Fetch both charts
    const [chart1Data, chart2Data] = await Promise.all([
      db('charts').where({ id: chart1Id }).first(),
      db('charts').where({ id: chart2Id }).first(),
    ]);

    if (!chart1Data || !chart2Data) {
      return res.status(404).json({
        success: false,
        error: 'One or both charts not found',
      });
    }

    // Build simplified chart objects for calculation
    const chart1: Chart = {
      id: chart1Data.id,
      userId: chart1Data.userId,
      planets: {},
    };

    const chart2: Chart = {
      id: chart2Data.id,
      userId: chart2Data.userId,
      planets: {},
    };

    // Populate planets for both charts
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;
    planets.forEach((planet) => {
      const signField = `${planet}Sign` as any;
      const degreeField = `${planet}Degree` as any;
      const minuteField = `${planet}Minute` as any;
      const secondField = `${planet}Second` as any;

      if (chart1Data[signField]) {
        chart1.planets[planet] = {
          name: planet,
          degree: chart1Data[degreeField] || 0,
          minute: chart1Data[minuteField] || 0,
          second: chart1Data[secondField] || 0,
          sign: chart1Data[signField],
        };
      }

      if (chart2Data[signField]) {
        chart2.planets[planet] = {
          name: planet,
          degree: chart2Data[degreeField] || 0,
          minute: chart2Data[minuteField] || 0,
          second: chart2Data[secondField] || 0,
          sign: chart2Data[signField],
        };
      }
    });

    // Calculate scores
    const scores = calculateCategoryScores(chart1, chart2);
    const elementalBalance = calculateElementalBalance(chart1, chart2);

    const result: any = {
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
  } catch (error) {
    next(error);
  }
}

/**
 * Get all synastry comparisons for user
 * GET /synastry/reports
 */
export async function getSynastryReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const reports = await db('synastry_charts')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('synastry_charts')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        reports: reports.map((r: any) => ({
          id: r.id,
          chart1Id: r.chart1_id,
          chart2Id: r.chart2_id,
          synastryAspects: JSON.parse(r.synastry_aspects || '[]'),
          overallCompatibility: r.compatibility_score,
          relationshipTheme: r.relationship_theme,
          strengths: r.strengths || [],
          challenges: r.challenges || [],
          advice: r.advice,
          isFavorite: r.is_favorite,
          notes: r.notes,
          createdAt: r.created_at,
        })),
        pagination: {
          page,
          limit,
          total: (total as any).count,
          totalPages: Math.ceil((total as any).count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific synastry report
 * GET /synastry/reports/:id
 */
export async function getSynastryReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const report = await db('synastry_charts')
      .where({ id, user_id: userId })
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Synastry report not found',
      });
    }

    // Fetch aspects
    const aspects = await db('synastry_aspects')
      .where({ synastry_chart_id: id });

    res.json({
      success: true,
      data: {
        ...report,
        synastryAspects: JSON.parse(report.synastry_aspects || '[]'),
        aspects,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete synastry report
 * DELETE /synastry/reports/:id
 */
export async function deleteSynastryReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Check if report exists and belongs to user
    const report = await db('synastry_charts')
      .where({ id, user_id: userId })
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Synastry report not found',
      });
    }

    await db('synastry_charts')
      .where({ id, user_id: userId })
      .del();

    res.json({
      success: true,
      message: 'Synastry report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update synastry report (notes, favorite status)
 * PATCH /synastry/reports/:id
 */
export async function updateSynastryReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { isFavorite, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Check if report exists and belongs to user
    const report = await db('synastry_charts')
      .where({ id, user_id: userId })
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Synastry report not found',
      });
    }

    // Update
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (typeof isFavorite === 'boolean') {
      updateData.is_favorite = isFavorite;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await db('synastry_charts')
      .where({ id, user_id: userId })
      .update(updateData);

    res.json({
      success: true,
      message: 'Synastry report updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  compareCharts,
  getCompatibility,
  getSynastryReports,
  getSynastryReport,
  deleteSynastryReport,
  updateSynastryReport,
};
