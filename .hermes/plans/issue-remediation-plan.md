# AstroVerse Issue Remediation Plan

**Generated**: 2026-06-04  
**Remaining Open Issues**: 19 (after closing 19 verified-fixed)  
**Repo**: xarlord/astrology-saas-platform (master)

---

## Triage Summary

| Category | Count | Issues |
|----------|-------|--------|
| 🔴 P0 — Fix Now (security + easy wins) | 5 | #139, #258, #241, #243, #246 |
| 🟡 P1 — Next Sprint (quality + perf) | 5 | #264, #244, #269, #266, #231 |
| 🟠 P2 — Technical Debt (hard refactors) | 6 | #136, #128, #163, #127, #131, #183 |
| 🔵 P3 — Backlog (enhancements) | 5 | #92, #77, #216, #199, #129 |
| ⚪ P4 — Long-term | 1 | #88 |

---

## 🔴 P0 — Fix Now (Easy wins + security gaps)

### #139 — Location/timezone routes lack rate limiting
- **Fix**: Add `publicRateLimiter` (100 req/15min) to location.routes.ts and timezone.routes.ts
- **Files**: `backend/src/api/v1/location.routes.ts`, `backend/src/api/v1/timezone.routes.ts`
- **Effort**: 30 min
- **Plan**:
  1. Create `publicApiRateLimiter` in `middleware/rateLimiter.ts` (100 req/15min per IP)
  2. Apply to all routes in both files
  3. No auth needed (these are legitimate public endpoints) — just rate limit

### #258 — AI controllers use `req.body` fallback bypassing Zod
- **Fix**: Replace `req.validated || req.body` with `req.validated!` in all AI controllers
- **Files**: `backend/src/modules/ai/controllers/ai.controller.ts`
- **Effort**: 15 min
- **Plan**:
  1. Replace 5 instances of `req.validated || req.body` → `req.validated!`
  2. Run `cd backend && npx tsc --noEmit` to verify types
  3. Run `cd backend && npx jest --testPathPattern=ai` to verify tests

### #241 — Push notification endpoint accepts arbitrary URL (SSRF risk)
- **Fix**: Add URL allowlist validation for known push service domains
- **Files**: `backend/src/modules/notifications/controllers/pushNotification.controller.ts`
- **Effort**: 30 min
- **Plan**:
  1. Create allowlist: `['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'push.apple.com']`
  2. Validate `endpoint` URL against allowlist before storing
  3. Add unit test for invalid URLs

### #243 — Register route skipped from global rate limiter
- **Fix**: Remove `/auth/register` from `skipSuffixes` in server.ts
- **Files**: `backend/src/server.ts`
- **Effort**: 10 min
- **Plan**:
  1. Remove `/auth/register` from `skipSuffixes` array (dedicated auth limiters already protect it)
  2. Verify register still works with combined rate limits

### #246 — Email service swallows errors too broadly
- **Fix**: Differentiate between anti-enumeration paths and transactional emails
- **Files**: `backend/src/shared/services/email.service.ts`
- **Effort**: 1 hour
- **Plan**:
  1. Add `silent: boolean` option to `sendEmail()` function
  2. `/forgot-password` path → `silent: true` (anti-enumeration)
  3. Welcome, subscription, report emails → `silent: false` (throw on failure, trigger retry)
  4. Add error metrics/logging for transactional failures

---

## 🟡 P1 — Next Sprint

### #264 — Blog module has zero test coverage
- **Fix**: Add unit tests for blog controllers and service
- **Files**: Create `backend/src/__tests__/modules/blog/`
- **Effort**: 4 hours
- **Plan**:
  1. `blog.controller.test.ts` — CRUD operations, auth checks, error handling
  2. `blog.service.test.ts` — sanitization, path validation, image handling
  3. Mock Knex queries, test validation edge cases
  4. Target: 80% coverage on blog module

### #244 — Refresh token O(n) bcrypt lookup
- **Fix**: Add SHA-256 lookup hash alongside bcrypt hash
- **Files**: `backend/src/modules/auth/models/refreshToken.model.ts`
- **Effort**: 3 hours
- **Plan**:
  1. Add migration: `token_lookup_hash` column (SHA-256 of raw token, indexed)
  2. On create: compute `SHA256(token)` → store in lookup_hash
  3. On find: `WHERE token_lookup_hash = SHA256(provided_token)` → O(1) lookup → then bcrypt.verify
  4. Update `findRefreshToken`, `createRefreshToken`, `revokeRefreshToken`
  5. Verify all auth tests pass

### #269 — DailyBriefingPage.tsx 558 lines
- **Fix**: Split into sub-components
- **Files**: `frontend/src/pages/DailyBriefingPage.tsx` → split into `components/daily-briefing/`
- **Effort**: 2 hours
- **Plan**:
  1. Extract `DailyBriefingHeader` (top section)
  2. Extract `DailyBriefingChart` (chart display)
  3. Extract `DailyBriefingInterpretation` (AI text)
  4. Extract `DailyBriefingActions` (share/save buttons)
  5. Main page orchestrates sub-components
  6. Remove blanket `/* eslint-disable */`

### #266 — BlogPage.tsx 464 lines
- **Fix**: Split into sub-components
- **Files**: `frontend/src/pages/BlogPage.tsx` → split into `components/blog/`
- **Effort**: 2 hours
- **Plan**:
  1. Extract `BlogPostList` (list/grid view)
  2. Extract `BlogPostEditor` (create/edit form)
  3. Extract `BlogPostDetail` (single post view)
  4. Extract `BlogImageUpload` (image handling)
  5. Add missing aria-labels on remaining 3 buttons

### #231 — ShareableChartCard.tsx 958 lines
- **Fix**: Split into sub-components
- **Files**: `frontend/src/components/chart/ShareableChartCard.tsx` → `components/chart/shareable/`
- **Effort**: 3 hours
- **Plan**:
  1. Extract `ChartPreview` (chart rendering)
  2. Extract `ShareControls` (social sharing buttons)
  3. Extract `ChartSettings` (customization options)
  4. Extract `ChartExport` (PNG/PDF export logic)
  5. Main component orchestrates sub-components

---

## 🟠 P2 — Technical Debt

### #136 — Duplicate validation frameworks (Joi + Zod)
- **Fix**: Migrate all Joi schemas to Zod, remove Joi dependency
- **Effort**: 6 hours
- **Plan**:
  1. Audit all Joi usage: `grep -rn "Joi\." backend/src/` (10 files)
  2. Convert blog, card, share, synastry, solarReturn, lunarReturn, monthlyTransit, billing validators from Joi → Zod
  3. Update route files to use `validateRequest()` middleware
  4. Remove `joi` from package.json
  5. Run full test suite

### #128 — 185 explicit `any` types (worse than reported 98)
- **Fix**: Systematic type elimination
- **Effort**: 8 hours
- **Plan**:
  1. Start with backend (73 instances) — easier to type (Express req/res patterns)
  2. Frontend (112 instances) — focus on components first, then hooks
  3. Use `unknown` as intermediate for complex cases
  4. Add `@typescript-eslint/no-explicit-any` rule to eslint config
  5. Target: < 20 `any` types (only in truly unavoidable cases)

### #163 — 29 files with blanket `/* eslint-disable */`
- **Fix**: Replace blanket disables with specific rule disables
- **Effort**: 4 hours
- **Plan**:
  1. For each file: `npx eslint frontend/src/pages/X.tsx` to see which rules fire
  2. Replace `/* eslint-disable */` with specific `/* eslint-disable @typescript-eslint/no-explicit-any */` etc.
  3. Fix the fixable issues inline
  4. Leave only genuinely needed disables with comments explaining why

### #127 — Large files exceeding 300-line guideline (56 files)
- **Fix**: Phased component extraction
- **Effort**: 16 hours (ongoing)
- **Plan**:
  1. **Priority targets** (>500 lines): interpretations.ts (2316), UserProfile.tsx (985), ShareableChartCard.tsx (958), lunarReturnInterpretations.ts (1022), pdfGeneration.service.ts (858), TransitDashboard.tsx (706)
  2. Interpretation files → split by zodiac sign / house / aspect into separate modules
  3. Page components → extract hooks + sub-components
  4. Target: no file > 400 lines

### #131 — Low semantic HTML ratio (941 div vs 50 semantic)
- **Fix**: Systematic semantic HTML upgrade
- **Effort**: 8 hours
- **Plan**:
  1. Page-level: wrap in `<main>`, add `<header>`, `<nav>`, `<footer>`
  2. Content sections: `<section>` with `aria-labelledby`
  3. List content: `<article>` for blog posts, chart cards
  4. Navigation: `<nav>` with `aria-label`
  5. Target: semantic ratio > 30%

### #183 — 72 console.error/warn calls in frontend (up from 68)
- **Fix**: Replace with proper logger or remove
- **Effort**: 3 hours
- **Plan**:
  1. Create `utils/logger.ts` with `logger.warn()`, `logger.error()` that route to Sentry (see #77)
  2. Replace console.error/warn in production code (exclude test files)
  3. Add eslint rule `no-console` with logger exception
  4. Target: 0 console.* in production source

---

## 🔵 P3 — Backlog

### #92 — Profile timezone: auto-detect from location
- **Fix**: Replace manual UTC dropdown with auto-detection
- **Effort**: 3 hours
- **Plan**: Use existing `/api/v1/location/timezone` endpoint when user selects birth location

### #77 — Configure Sentry error tracking
- **Fix**: Wire up Sentry SDK (backend + frontend)
- **Effort**: 2 hours
- **Plan**: Enable `config/monitoring.ts`, add `@sentry/node` + `@sentry/react`, DSN from env var

### #216 — Frontend npm audit (15 vulns, devDeps only)
- **Fix**: `npm audit fix` in frontend workspace
- **Effort**: 30 min
- **Plan**: Run `cd frontend && npm audit fix`. All are devDependencies, safe to update.

### #199 — Backend npm audit (14 vulns, 11 high)
- **Fix**: `npm audit fix --force` or manual resolution
- **Effort**: 1 hour
- **Plan**: Update uuid to ^11.1.1. For node-tar chain, may need `--force` breaking fix.

### #129 — 37 hardcoded 'en-US' locale strings
- **Fix**: Introduce i18n framework (react-intl or i18next)
- **Effort**: 8 hours
- **Plan**: Deferred — no multi-language requirement yet. Tag strings for future extraction.

---

## ⚪ P4 — Long-term

### #88 — Personality interpretations need source grounding
- **Fix**: Add citations/references to interpretation data
- **Effort**: 40+ hours (content work, not code)
- **Plan**: Research task — review interpretation texts against established astrological sources, add footnotes/citations

---

## Implementation Priority Order

```
Week 1: P0 (#139, #258, #241, #243, #246) — all security + easy wins
Week 2: P1 (#264, #244) — test coverage + perf fix
Week 3: P1 (#269, #266, #231) — component splits
Week 4: P2 (#136, #163) — validation consolidation + eslint cleanup
Week 5: P2 (#128, #183) — type safety + console cleanup
Week 6: P3 (#92, #77, #216, #199) — features + dep updates
Ongoing: P2 (#127, #131) — file splits + semantic HTML (continuous)
Backlog: P3 (#129) + P4 (#88)
```
