# Changelog

All notable changes to AstroVerse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-05-29

### Added
- Professional SVG chart wheel with zodiac ring, planets, houses, and aspects
- True/Mean angle toggle (nutation-corrected obliquity) on chart view
- Auto-detect timezone from birth place coordinates
- ASC at LEFT (9 o'clock) with CCW house progression (traditional layout)
- Aspect lines connecting planets through zodiac signs
- Angle icons (ASC/DSC/MC/IC) with precise degree display
- Part of Fortune calculation with correct planet key casing
- Dashboard link in sidebar navigation
- App logo links to dashboard instead of hero page

### Fixed
- All 9 CI pipeline jobs passing (backend, frontend, live, e2e, visual, integration, BDD, accessibility, verify-build)
- 20 stale frontend test files updated to match current component structure
- 274 ESLint errors resolved across frontend codebase
- TypeScript strict mode compilation errors resolved
- Chart wheel house lines visibility and degree overlap issues
- Aspect sorting by orb (tightest/strongest first)
- UTF-8 BOM removal from source files
- Verify-build CI job fixed for npm workspace monorepo

### Changed
- CI lint command no longer uses `--report-unused-disable-directives`
- Frontend test suite: 4,493 tests passing (Vitest)
- Backend test suite: 1,375 tests passing (Jest)
- Mutation testing passing (Stryker)

## [1.4.0] - 2026-05-22

### Added
- Redesigned chart view with reference-quality data display
- Extended aspect lines with zodiac sign connections
- Precise degree display and house connections

## [0.1.0] - 2026-04-05

### Added
- Core natal chart calculation and display
- AI-powered chart interpretations (OpenAI GPT-4)
- Transit forecasting and daily transit tracking
- Synastry compatibility analysis with scoring
- Lunar return and solar return calculations
- Astrological calendar with event reminders
- Stripe billing integration (Free/Pro/Enterprise tiers)
- JWT authentication with refresh token rotation
- PWA support with offline mode and push notifications
- Shared chart cards for social media
- OpenAPI/Swagger documentation at /api/docs
- PDF chart report generation
- E2E test suite with Playwright
- Comprehensive backend test suite with Jest
