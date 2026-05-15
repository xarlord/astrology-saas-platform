/**
 * Modules Entry Point
 *
 * IMPORTANT: No file in this codebase imports from this barrel. Everything
 * imports directly from the specific module path (e.g. `modules/auth/controllers/auth.controller`).
 *
 * The following modules have their own barrel files but are NOT re-exported here
 * because their type names (e.g. Chart, Transit, Calendar) collide with each other
 * or with names in the active exports. Since nothing imports via this file anyway,
 * the commenting has no runtime effect — it exists purely for documentation:
 *
 *   charts, transits, calendar, lunar, synastry, solar
 *
 * Additional modules (billing, cards, reports, jobs) are also not re-exported here.
 * All consumers import directly from `modules/{name}/...` paths.
 */

export * from './auth';
// export * from './charts';    // Type conflicts (e.g. Chart type collides across modules)
export * from './analysis';
// export * from './transits';  // Type conflicts
// export * from './calendar';  // Type conflicts
// export * from './lunar';     // Type conflicts
// export * from './synastry';  // Type conflicts
export * from './users';
export * from './shared';
// export * from './solar';     // Type conflicts
export * from './notifications';
export * from './ai';
