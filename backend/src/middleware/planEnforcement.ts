/**
 * Plan Enforcement Middleware
 * Enforces subscription tier limits for chart creation and AI interpretations
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { AppError } from '../utils/appError';
import UserModel from '../modules/users/models/user.model';
import { ChartModel } from '../modules/charts/models';
import aiUsageModel from '../modules/ai/models/aiUsage.model';

interface PlanLimits {
  maxCharts: number;    // -1 = unlimited
  maxAIMonthly: number; // -1 = unlimited
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { maxCharts: 3, maxAIMonthly: 5 },
  pro: { maxCharts: 25, maxAIMonthly: -1 },
  premium: { maxCharts: -1, maxAIMonthly: -1 },
};

/**
 * Enforce chart creation limit based on user's plan
 */
export async function enforceChartLimit(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const user = await UserModel.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;

    // Unlimited charts
    if (limits.maxCharts === -1) {
      next();
      return;
    }

    const chartCount = await ChartModel.countByUserId(req.user.id);
    if (chartCount >= limits.maxCharts) {
      throw new AppError(
        `Chart limit reached. Your ${user.plan} plan allows up to ${limits.maxCharts} charts. Upgrade to create more.`,
        403
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforce AI interpretation limit based on user's plan
 */
export async function enforceAILimit(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const user = await UserModel.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;

    // Unlimited AI
    if (limits.maxAIMonthly === -1) {
      next();
      return;
    }

    // Count AI usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await aiUsageModel.getByDateRange(
      req.user.id,
      startOfMonth,
      new Date()
    );

    if (monthlyUsage.length >= limits.maxAIMonthly) {
      throw new AppError(
        `AI interpretation limit reached. Your ${user.plan} plan allows ${limits.maxAIMonthly} AI interpretations per month. Upgrade for more.`,
        403
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Get plan limits for external consumption (e.g., frontend)
 */
export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
