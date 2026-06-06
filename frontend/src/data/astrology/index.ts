/**
 * Astrology data module — centralized meaning maps for reuse across features.
 *
 * Used by:
 *  - Natal Aspects (ChartViewPage via NatalAspectRow)
 *  - Transits (TransitPage, TodayTransitsPage)
 *  - Compatibility / Synastry (SynastryPageNew)
 *  - Forecast (ForecastPage)
 *  - Solar Returns (SolarReturnsPage)
 *  - Lunar Returns (LunarReturnsPage)
 */

export {
  synthesizeAspectInterpretation,
  ASPECT_SYMBOLS,
  ASPECT_NATURE_COLORS,
  type AspectInterpretation,
} from './aspectMeanings';

export {
  planetPointMeaningMap,
  getPlanetPointMeaning,
  getPlanetPointDisplayName,
  getPlanetPointSymbol,
  type PlanetPointMeaning,
} from './planetPointMeanings';
