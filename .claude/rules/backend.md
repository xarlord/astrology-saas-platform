---
paths:
  - "backend/src/**"
---

## Backend Architecture
- Express 4 with versioned API under /api/v1/ and /api/v2/
- Controllers: standalone async functions (req, res) => void, NOT class methods
- Throw AppError for errors - global errorHandler catches it
- Response format: { success: true, data } or { success: false, error }

## Module Pattern
- modules/{domain}/controllers|models|routes|services/
- Import directly from modules - NO proxy barrel layer in src/controllers/ or src/services/
- Route exports: export { router as XRoutes } - named exports only
- models/index.ts provides convenience barrel re-exporting from modules

## Key Middleware
- csrf.ts: Skipped in test env unless TEST_CSRF is set
- rateLimiter.ts: Specialized limiters (auth, pdf, share, chart, password-reset)
- auth.ts: JWT verification, attaches req.user; also exports generateToken, generateRefreshToken
- errorHandler.ts: Catches AppError instances; provides asyncHandler wrapper
- requestLogger.ts: HTTP request/response logging

## Database
- Knex with PostgreSQL on port 5434
- Migrations in backend/migrations/ (timestamp-prefixed)
- db/index.ts exports testConnection() for explicit DB health check
- Path aliases: @/* -> src/*, @tests/* -> src/__tests__/*

## Testing
- Test imports go directly to modules: ../../modules/{domain}/controllers/...
- Controllers take (req, res) only - no next parameter
- Swiss Ephemeris always mocked
- Live/integration/performance tests excluded from default run
