/**
 * Type-safe chart input mapping utilities
 *
 * Maps validation schema values to model enum values without using 'any'.
 */

/**
 * Valid house system values from validation schema
 *
 * NOTE: Must match the z.enum() in shared/schemas/chart.validation.ts:
 *   z.enum(['placidus', 'koch', 'porphyry', 'equal', 'whole-sign', 'whole', 'topocentric'])
 *
 * The validation schema accepts BOTH 'whole-sign' and 'whole' as separate values.
 * The model (chart.model.ts) only stores 'whole'.
 */
export type ValidationHouseSystem =
  | 'placidus'
  | 'koch'
  | 'porphyry'
  | 'whole-sign'
  | 'whole'
  | 'equal'
  | 'topocentric';

/**
 * House system values in the database model
 * Matches the type in chart.model.ts: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric'
 */
export type ModelHouseSystem =
  | 'placidus'
  | 'koch'
  | 'porphyry'
  | 'whole'
  | 'equal'
  | 'topocentric';

/**
 * Map validation house system to model house system
 * Both 'whole-sign' and 'whole' from validation map to model's 'whole'.
 */
export const mapHouseSystem = (
  houseSystem: ValidationHouseSystem
): ModelHouseSystem => {
  const mapping: Record<ValidationHouseSystem, ModelHouseSystem> = {
    'placidus': 'placidus',
    'koch': 'koch',
    'porphyry': 'porphyry',
    'whole-sign': 'whole',
    'whole': 'whole',
    'equal': 'equal',
    'topocentric': 'topocentric',
  };
  return mapping[houseSystem];
};

/**
 * Valid chart type values from validation schema
 */
export type ValidationChartType =
  | 'natal'
  | 'transit'
  | 'progressed'
  | 'solar-return'
  | 'lunar-return'
  | 'synastry'
  | 'composite';

/**
 * Chart type values in the database model
 */
export type ModelChartType =
  | 'natal'
  | 'transit'
  | 'progressed'
  | 'synastry'
  | 'composite';

/**
 * Map validation chart type to model chart type
 * Note: solar-return maps to progressed, lunar-return maps to transit
 */
export const mapChartType = (
  chartType: ValidationChartType
): ModelChartType => {
  const mapping: Partial<Record<ValidationChartType, ModelChartType>> = {
    'natal': 'natal',
    'transit': 'transit',
    'progressed': 'progressed',
    'synastry': 'synastry',
    'composite': 'composite',
    'solar-return': 'progressed',  // Solar return is stored as progressed
    'lunar-return': 'transit',     // Lunar return is stored as transit
  };

  const mapped = mapping[chartType];
  if (!mapped) {
    // Default to transit if unknown (shouldn't happen with proper validation)
    return 'transit';
  }
  return mapped;
};
