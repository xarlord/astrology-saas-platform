# Lessons Learned - Astrology SaaS Platform

<!--
  WHAT: Knowledge captured from the development process to prevent repeating mistakes.
  WHY: Each lesson represents a resolved issue or insight that improves future development.
  WHEN: Update after resolving findings or making significant discoveries.
-->

## Summary
- **Total lessons:** 28
- **High priority:** 8
- **Medium priority:** 12
- **Low priority:** 8
- **Document size:** ~8,500 / 10,000 tokens

---

## Phase 1: Requirements & Architecture

### Lesson 1: Comprehensive PRD Analysis Prevents Rework

**Priority:** High
**Tags:** [planning, requirements, architecture]
**Date:** 2026-02-03

#### The Problem
Starting development without fully understanding requirements leads to incomplete implementations and rework.

#### Solution
- Read and analyze PRD document completely before writing any code
- Extract both functional and technical requirements
- Confirm technology stack with stakeholders before proceeding
- Create detailed task_plan.md with clear phases

#### Prevention
Always create `task_plan.md`, `findings.md`, and `progress.md` before starting development. These files serve as "working memory on disk" that persists beyond context limits.

---

### Lesson 2: Stitch MCP Requires Specific Workflow

**Priority:** Medium
**Tags:** [stitch-mcp, ui, workflow]
**Date:** 2026-02-03

#### The Problem
Stitch MCP integration requires understanding the 2-step Designer Flow before attempting to use it.

#### Solution
- Step 1: Use `extract_design_context` on existing screens to get "Design DNA"
- Step 2: Use `generate_screen_from_text` with the context to create consistent UI
- Create detailed UI definitions in YAML format before generating screens

#### Prevention
Document Stitch MCP tools and workflow in `findings.md` before starting UI development. Reference the UI definitions section when generating components.

---

## Phase 2: Infrastructure Setup

### Lesson 3: Monorepo Structure Enables Code Sharing

**Priority:** High
**Tags:** [architecture, monorepo, typescript]
**Date:** 2026-02-03

#### The Problem
Separate frontend and backend repositories make it difficult to share types and coordinate changes.

#### Solution
- Use npm workspaces for monorepo structure
- Place shared types in a package accessible by both backend and frontend
- Single root package.json with workspace configuration
- Simplified dependency management

#### Prevention
For full-stack TypeScript projects, always consider monorepo structure to enable type sharing between frontend and backend.

---

### Lesson 4: Database Migrations Should Be Created Early

**Priority:** High
**Tags:** [database, migrations, knex]
**Date:** 2026-02-03

#### The Problem
Creating database tables after writing application code leads to mismatches between models and schema.

#### Solution
- Create all Knex migrations before implementing models
- Use descriptive migration timestamps (YYYYMMDDHHMMSS_description)
- Include indexes, foreign keys, and constraints from the start
- Create seed files for test data

#### Prevention
Database-first development: Schema → Migrations → Models → Controllers → Routes.

---

### Lesson 5: Swiss Ephemeris Integration Requires Careful Date Handling

**Priority:** High
**Tags:** [swisseph, dates, timezone, calculations]
**Date:** 2026-02-03

#### The Problem
Astrological calculations require precise date/time handling including timezone conversions and historical calendar changes.

#### Solution
- Convert local time to UTC before astronomical calculations
- Use Julian Day format for all internal calculations
- Store both local time and UTC in database
- Implement timezone-aware utilities for user input

#### Prevention
Always use established astronomy libraries (swisseph) rather than building calculation logic from scratch. Test edge cases around timezone boundaries.

---

### Lesson 6: Winston Logger with File Output Prevents Debugging Issues

**Priority:** Medium
**Tags:** [logging, debugging, winston]
**Date:** 2026-02-03

#### The Problem
Console-only logging makes it impossible to debug issues in production environments.

#### Solution
- Use Winston logger with multiple transports (console + file)
- Separate log levels (error, warn, info, debug)
- Create log files with date-based naming
- Include request ID in logs for tracing

#### Prevention
Configure structured logging from day one. Include correlation IDs for distributed tracing.

---

## Phase 3: Core Calculation Engine

### Lesson 7: House System Algorithms Are Complex

**Priority:** High
**Tags:** [astrology, houses, algorithms, testing]
**Date:** 2026-02-03

#### The Problem
Different house systems (Placidus, Koch, Whole Sign, etc.) require significantly different calculation approaches.

#### Solution
- Implement house calculation as a service with strategy pattern
- Each house system has its own calculation function
- Default to Placidus but allow user selection
- Include all common systems: Placidus, Koch, Porphyry, Whole Sign, Equal, Topocentric

#### Prevention
Implement calculation engines as pure functions with clear inputs/outputs. This makes testing and debugging much easier.

---

### Lesson 8: Aspect Detection Requires Configurable Orbs

**Priority:** Medium
**Tags:** [aspects, orbs, configuration]
**Date:** 2026-02-03

#### The Problem
Fixed orb values don't work for all use cases. Different astrologers prefer different sensitivities.

#### Solution
- Implement aspect detection with configurable orbs per aspect type
- Default orbs: Conjunction (10°), Opposition (8°), Trine (8°), Square (8°), Sextile (6°)
- Allow users to customize orb sensitivity
- Include "applying" vs "separating" aspect detection

#### Prevention
Make astrological calculations configurable. Provide sensible defaults but allow customization.

---

## Phase 4: API Development

### Lesson 9: Joi Validation Schemas Prevent Invalid Data

**Priority:** High
**Tags:** [validation, joi, security, api]
**Date:** 2026-02-03

#### The Problem
Accepting unvalidated input leads to database errors and security vulnerabilities.

#### Solution
- Create Joi schemas for all API inputs
- Validate at controller level before business logic
- Provide clear validation error messages
- Use schema composition for reusable validation rules

#### Prevention
Always validate input at API boundaries. Never trust client-side data.

---

### Lesson 10: JWT Refresh Tokens Improve Security

**Priority:** High
**Tags:** [security, jwt, auth, tokens]
**Date:** 2026-02-03

#### The Problem
Long-lived access tokens create security risks if compromised.

#### Solution
- Use short-lived access tokens (15 minutes)
- Implement refresh tokens with longer life (7 days)
- Store refresh tokens in database with revocation capability
- Implement token rotation on refresh

#### Prevention
Follow OAuth 2.0 best practices for token lifetime and rotation.

---

### Lesson 11: Password Hashing with bcrypt Is Mandatory

**Priority:** High
**Tags:** [security, passwords, bcrypt, hashing]
**Date:** 2026-02-03

#### The Problem
Storing passwords in plain text or using weak hashing algorithms creates massive security vulnerabilities.

#### Solution
- Use bcrypt with salt rounds of 10-12
- Never log or return passwords in API responses
- Implement password strength requirements
- Use timing-safe comparison for password verification

#### Prevention
Never implement custom password hashing. Always use proven libraries like bcrypt.

---

### Lesson 12: Soft Deletion Preserves Data Integrity

**Priority:** Medium
**Tags:** [database, deletion, soft-delete, integrity]
**Date:** 2026-02-03

#### The Problem
Hard deletion of charts breaks historical data and makes recovery impossible.

#### Solution
- Implement soft deletion with `deleted_at` timestamp
- Filter out deleted records in queries
- Provide admin interface for restoring deleted data
- Implement hard deletion only after retention period

#### Prevention
Default to soft deletion for user-generated content. Implement hard deletion as a separate operation.

---

## Phase 5: UI Development

### Lesson 13: Zustand Simplifies State Management

**Priority:** Medium
**Tags:** [react, state, zustand, hooks]
**Date:** 2026-02-03

#### The Problem
Redux is overkill for many applications and requires significant boilerplate.

#### Solution
- Use Zustand for lightweight state management
- Create stores for auth and charts with minimal code
- Combine with React Query for server state
- Persist auth state to localStorage

#### Prevention
Choose state management based on complexity. Zustand for client state, React Query for server state.

---

### Lesson 14: Custom Hooks Encapsulate Business Logic

**Priority:** Medium
**Tags:** [react, hooks, encapsulation, reuse]
**Date:** 2026-02-03

#### The Problem
Component-level API calls lead to code duplication and difficult testing.

#### Solution
- Create custom hooks for each API operation
- Use React Query for caching and automatic refetching
- Encapsulate error handling and loading states
- Make hooks composable for complex operations

#### Prevention
Extract data fetching logic into custom hooks. Keep components focused on presentation.

---

### Lesson 15: SVG Chart Rendering Requires Math

**Priority:** Medium
**Tags:** [svg, charts, math, visualization]
**Date:** 2026-02-03

#### The Problem
Rendering natal chart wheels requires converting polar coordinates (degrees) to Cartesian coordinates (x, y).

#### Solution
- Implement coordinate conversion utilities
- Use trigonometry: x = r * cos(θ), y = r * sin(θ)
- Handle aspect line calculations with midpoint detection
- Optimize SVG rendering with proper grouping

#### Prevention
Create utility functions for geometric calculations. Test with edge cases (0°, 90°, 180°, 270°).

---

## Phase 6: Content & Interpretation Engine

### Lesson 16: Comprehensive Interpretation Database Is Essential

**Priority:** High
**Tags:** [content, interpretations, database]
**Date:** 2026-02-03

#### The Problem
Incomplete interpretation data leads to disappointing user experience.

#### Solution
- Create interpretations for all 10 planets × 12 signs = 120 entries
- Include keywords, strengths, challenges, and advice for each
- Add aspect interpretations for all major aspect types
- Include house meanings for all 12 houses
- Create helper functions for generating readings

#### Prevention
Content quality matters as much as functionality. Invest time in comprehensive interpretation database.

---

### Lesson 17: Aspect Pattern Detection Is Algorithmically Complex

**Priority:** Medium
**Tags:** [algorithms, aspects, patterns, detection]
**Date:** 2026-02-03

#### The Problem
Detecting aspect patterns (Grand Trine, T-Square, etc.) requires checking multiple relationships simultaneously.

#### Solution
- Implement pattern detection as graph traversal
- Check for Grand Trine: 3 planets in trine to each other
- Check for T-Square: 2 planets in opposition, both squaring a third
- Check for Grand Cross: 2 oppositions squaring each other
- Check for Yod: 2 planets sextile, both quincunx a third

#### Prevention
Break complex pattern detection into smaller, testable functions.

---

## Phase 7: Testing & Deployment

### Lesson 18: Unit Tests Should Cover Edge Cases

**Priority:** High
**Tags:** [testing, unit-tests, coverage]
**Date:** 2026-02-03

#### The Problem
Happy path tests don't catch edge cases that cause production issues.

#### Solution
- Test boundary conditions (0, max, min values)
- Test error conditions (invalid input, missing data)
- Test with real astronomical dates (known eclipses, retrogrades)
- Achieve 80%+ code coverage for critical services

#### Prevention
Write tests while writing code (TDD). Focus on edge cases, not just happy paths.

---

### Lesson 19: Integration Tests Should Cover API Contracts

**Priority:** High
**Tags:** [testing, integration, api, contracts]
**Date:** 2026-02-03

#### The Problem
Unit tests don't catch issues with API integration, authentication, or database operations.

#### Solution
- Create integration tests for all API endpoints
- Test authentication flow (register, login, refresh, logout)
- Test CRUD operations with database
- Test error responses and status codes
- Use test database with cleanup between tests

#### Prevention
Treat API contracts as important as business logic. Test all documented endpoints.

---

### Lesson 20: Performance Testing Reveals Bottlenecks

**Priority:** Medium
**Tags:** [performance, testing, benchmarks]
**Date:** 2026-02-03

#### The Problem
Without performance testing, you don't know if your application can handle real load.

#### Solution
- Benchmark single operations (planet position, house calculation)
- Benchmark complete operations (natal chart < 200ms, transits < 1500ms)
- Test concurrent load (100 simultaneous charts < 30s)
- Test memory efficiency (1000 iterations < 50MB growth)
- Document performance baselines and targets

#### Prevention
Set performance targets before implementing features. Test against targets regularly.

---

### Lesson 21: Security Audit Should Be Conducted Early

**Priority:** High
**Tags:** [security, audit, review]
**Date:** 2026-02-03

#### The Problem
Security issues are harder to fix after deployment.

#### Solution
- Review authentication and authorization implementation
- Validate all input at API boundaries
- Check for SQL injection vulnerabilities
- Verify XSS protection in frontend
- Review CORS and rate limiting configuration
- Audit secrets management
- Create security checklist

#### Prevention
Conduct security review during development, not after. Document security decisions.

---

### Lesson 22: Docker Simplifies Deployment

**Priority:** Medium
**Tags:** [docker, deployment, containers]
**Date:** 2026-02-03

#### The Problem
Manual deployment leads to environment differences and "it works on my machine" issues.

#### Solution
- Create multi-stage Dockerfiles for backend and frontend
- Use docker-compose for local development and staging
- Pin dependency versions in Dockerfiles
- Use nginx for frontend production serving
- Create deployment scripts for common platforms

#### Prevention
Containerize applications early. Use same containers in all environments.

---

## Phase 8-10: Expansion Features

### Lesson 23: Calendar Features Drive Daily Engagement

**Priority:** Medium
**Tags:** [engagement, calendar, features, product]
**Date:** 2026-02-17

#### The Problem
Static charts don't bring users back to the application regularly.

#### Solution
- Implement astrological calendar with global events
- Show moon phases, retrogrades, eclipses
- Display personalized transits
- Email reminders for major events
- Export to iCal format

#### Prevention
Plan engagement features from the start. Daily active users (DAU) depend on daily value.

---

### Lesson 24: Lunar Returns Create Monthly Touchpoints

**Priority:** Medium
**Tags:** [engagement, lunar-returns, subscriptions]
**Date:** 2026-02-17

#### The Problem
One-time natal chart readings don't justify recurring subscriptions.

#### Solution
- Calculate lunar returns (every 27.3 days)
- Generate monthly forecasts with themes
- Provide journal prompts for self-reflection
- Send email notifications when lunar return approaches
- Create premium tier for monthly insights

#### Prevention
Design for recurring value from the start. Monthly features support monthly subscriptions.

---

### Lesson 25: Synastry Has High Viral Potential

**Priority:** Medium
**Tags:** [viral, synastry, sharing, growth]
**Date:** 2026-02-17

#### The Problem
Individual features don't drive word-of-mouth growth.

#### Solution
- Implement relationship compatibility calculator
- Create shareable report links
- Show compatibility score (0-100)
- Display synastry aspects and house overlays
- Generate composite charts
- Make sharing easy with anonymized data

#### Prevention
Include social/viral features in product planning. Compatibility tools drive sharing.

---

### Lesson 26: Compatibility Scoring Requires Weighted Algorithm

**Priority:** Low
**Tags:** [algorithm, scoring, compatibility]
**Date:** 2026-02-17

#### The Problem
Simple planet counting doesn't provide meaningful compatibility scores.

#### Solution
- Start with base score of 50
- Add/subtract points based on aspect types
- Weight conjunctions by planet importance
- Add element match bonuses
- Include house overlay bonuses
- Normalize to 0-100 scale

#### Prevention
Scoring algorithms should be transparent and customizable. Document the formula.

---

## General Development

### Lesson 27: TypeScript Type Safety Prevents Runtime Errors

**Priority:** High
**Tags:** [typescript, types, safety]
**Date:** 2026-02-03

#### The Problem
JavaScript's dynamic typing leads to runtime errors that should be caught at compile time.

#### Solution
- Use TypeScript for all backend and frontend code
- Enable strict mode in tsconfig.json
- Create interface definitions for all data models
- Use type guards for runtime validation
- Leverage generics for reusable components

#### Prevention
TypeScript catches bugs before runtime. Always use types over `any`.

---

### Lesson 28: Progress Tracking Prevents Context Loss

**Priority:** Medium
**Tags:** [documentation, progress, planning]
**Date:** 2026-02-03

#### The Problem
After context resets or long breaks, it's difficult to remember what was done and what's next.

#### Solution
- Maintain task_plan.md with current phase status
- Update progress.md after each phase completion
- Log all errors encountered and resolutions
- Document decisions made with rationale
- Create 5-question reboot check for context verification

#### Prevention
Document as you go. These files are your "external memory" that persists beyond context limits.

---

## Tags Index

- **planning** (2): Lessons 1, 28
- **architecture** (2): Lessons 1, 3
- **stitch-mcp** (1): Lesson 2
- **database** (3): Lessons 4, 12, 19
- **swisseph** (1): Lesson 5
- **dates** (1): Lesson 5
- **logging** (1): Lesson 6
- **astrology** (1): Lesson 7
- **validation** (1): Lesson 9
- **security** (4): Lessons 10, 11, 21, 27
- **testing** (3): Lessons 18, 19, 20
- **performance** (1): Lesson 20
- **docker** (1): Lesson 22
- **engagement** (3): Lessons 23, 24, 25
- **typescript** (1): Lesson 27

---

## Priority Breakdown

### High Priority (8) - Critical for project success
1. Lesson 1: Comprehensive PRD Analysis
2. Lesson 3: Monorepo Structure
3. Lesson 4: Database Migrations Early
5. Lesson 5: Swiss Ephemeris Date Handling
7. Lesson 7: House System Algorithms
9. Lesson 9: Joi Validation
10. Lesson 10: JWT Refresh Tokens
11. Lesson 11: Password Hashing
16. Lesson 16: Interpretation Database
18. Lesson 18: Unit Test Edge Cases
19. Lesson 19: Integration Test API Contracts
21. Lesson 21: Security Audit Early
27. Lesson 27: TypeScript Type Safety

### Medium Priority (12) - Important for quality
2. Lesson 2: Stitch MCP Workflow
6. Lesson 6: Winston Logger
8. Lesson 8: Aspect Orbs
12. Lesson 12: Soft Deletion
13. Lesson 13: Zustand State Management
14. Lesson 14: Custom Hooks
15. Lesson 15: SVG Chart Rendering
17. Lesson 17: Aspect Patterns
20. Lesson 20: Performance Testing
22. Lesson 22: Docker Deployment
23. Lesson 23: Calendar Features
24. Lesson 24: Lunar Returns
25. Lesson 25: Synastry Viral Potential
28. Lesson 28: Progress Tracking

### Low Priority (8) - Nice to know
26. Lesson 26: Compatibility Scoring

---

## Document Stats
- **Created:** 2026-02-18
- **Last Updated:** 2026-02-18
- **Contributors:** Claude (DevFlow Enforcer)
- **Version:** 1.0

<!--
  REMINDER:
  - Update this document after resolving each finding
  - Use /devflow-enforcer:capture-lesson to add new lessons
  - Review lessons before starting new features
  - Share lessons with team to prevent repeated mistakes
-->
