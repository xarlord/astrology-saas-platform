/**
 * Synastry Module
 * Handles compatibility and relationship analysis
 */

export * from './controllers/synastry.controller';
export { router as synastryRoutes } from './routes/synastry.routes';
export * from './models/synastry.model';
export {
  calculateCompatibilityScore as calculateCompatibility,
  calculateCompositeChart,
} from './services/synastry.service';
