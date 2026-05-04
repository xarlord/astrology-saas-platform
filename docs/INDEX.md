# AstroVerse Documentation Index

> Navigation hub for all project documentation. Last updated: 2026-04-05.

---

## Architecture & Product

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | CTO-authored technical architecture plan — system design, data flow, tech stack decisions | 2026-04-05 | **Current** |
| [PRD_Document.md](PRD_Document.md) | Product Requirements Document — full SaaS platform specification for AI-agent consumption | 2026-02-22 | **Current** |
| [DESIGN_SPECIFICATIONS.md](design/DESIGN_SPECIFICATIONS.md) | Visual design system — colors, typography, spacing, component patterns | 2026-02-22 | **Current** |

**Cross-references:** ARCHITECTURE.md drives [DEVELOPMENT_REFACTOR_PLAN.md](DEVELOPMENT_REFACTOR_PLAN.md); PRD aligns with all [feature specs](features/).

---

## Development Setup

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [DEV_SETUP.md](DEV_SETUP.md) | Node.js environment setup, dependency installation, workspace configuration | 2026-04-05 | **Current** |
| [AI_SETUP.md](AI_SETUP.md) | OpenAI GPT-4 integration for AI-powered chart interpretations | 2026-02-22 | **Current** |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | PostgreSQL Docker setup, migrations, seed data | 2026-02-22 | **Current** |
| [STITCH_MCP_SETUP.md](STITCH_MCP_SETUP.md) | Stitch MCP server setup for text-to-UI generation via Claude | 2026-02-16 | **Current** |
| [CLAUDE_DESKTOP_CONFIG.md](CLAUDE_DESKTOP_CONFIG.md) | Claude Desktop MCP configuration file locations and settings | 2026-02-16 | **Current** |
| [QUICK_START_STITCH.md](QUICK_START_STITCH.md) | Quick-start automation script for Stitch MCP setup | 2026-02-16 | **Current** |

**Cross-references:** DEV_SETUP.md complements [TESTING_GUIDE.md](TESTING_GUIDE.md); DATABASE_SETUP.md pairs with [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Deployment & Operations

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment configuration, environment variables, hosting | 2026-04-04 | **Current** |
| [LOCAL_DEPLOYMENT.md](LOCAL_DEPLOYMENT.md) | Local development server startup guide (both backend + frontend) | 2026-04-04 | **Current** |
| [PWA_GUIDE.md](PWA_GUIDE.md) | Progressive Web App features — offline, push notifications, installability | 2026-04-04 | **Current** |
| [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md) | Manual browser-based testing walkthrough with test account | 2026-04-04 | **Current** |

**Cross-references:** PWA_GUIDE.md links to [plans/2026-02-16-pwa-enhancement.md](plans/2026-02-16-pwa-enhancement.md); DEPLOYMENT.md references [SECURITY_AUDIT.md](SECURITY_AUDIT.md).

---

## Testing & Quality Assurance

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Full-stack testing guide — Jest (backend), Vitest (frontend), Playwright (E2E) | 2026-02-22 | **Current** |
| [SECURITY_AUDIT.md](SECURITY_AUDIT.md) | Security review — user data protection, auth flows, OWASP coverage | 2026-02-22 | **Current** |
| [CODE_REVIEW_CHECKLIST.md](CODE_REVIEW_CHECKLIST.md) | PR review checklist — security, performance, accessibility, conventions | 2026-04-05 | **Current** |
| [KEYBOARD_ACCESSIBILITY_IMPLEMENTATION.md](KEYBOARD_ACCESSIBILITY_IMPLEMENTATION.md) | WCAG 2.1 AA keyboard navigation features — focus management, shortcuts | 2026-02-22 | **Current** |

**Cross-references:** CODE_REVIEW_CHECKLIST.md enforces rules from [GIT_STRATEGY.md](GIT_STRATEGY.md); SECURITY_AUDIT.md ties to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Git & Process

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [GIT_STRATEGY.md](GIT_STRATEGY.md) | Trunk-based development workflow — branch naming, merge strategy | 2026-04-04 | **Current** |
| [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md) | GitHub branch protection rules for master/develop | 2026-04-05 | **Current** |
| [DEVELOPMENT_REFACTOR_PLAN.md](DEVELOPMENT_REFACTOR_PLAN.md) | Refactoring roadmap — monorepo restructuring, dependency cleanup | 2026-04-04 | **Current** |

**Cross-references:** GIT_STRATEGY.md and BRANCH_PROTECTION.md are companion docs.

---

## Sprint UX Reports

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [SPRINT3_UX_AUDIT_REPORT.md](SPRINT3_UX_AUDIT_REPORT.md) | Sprint 3 UX audit — onboarding, accessibility, responsive layout findings | 2026-04-05 | **Current** |
| [SPRINT3_LAYOUT_DESIGN_SPEC.md](SPRINT3_LAYOUT_DESIGN_SPEC.md) | Sprint 3 layout & navigation design spec — unified auth layout, onboarding | 2026-04-05 | **Current** |
| [SPRINT3_REMAINING_UX_SPEC.md](SPRINT3_REMAINING_UX_SPEC.md) | Remaining Sprint 3 UX items not yet implemented | 2026-04-05 | **Current** |
| [SPRINT4_UX_DESIGN_SYSTEM_AUDIT.md](SPRINT4_UX_DESIGN_SYSTEM_AUDIT.md) | Sprint 4 design system audit — post-Sprint-3 pages, component consistency | 2026-04-04 | **Current** |
| [SPRINT4_THEME_FIX_SPEC.md](SPRINT4_THEME_FIX_SPEC.md) | Sprint 4 theme fix specification — dark/light mode corrections | 2026-04-04 | **Current** |
| [SPRINT4_THEME_FIX_REPORT.md](SPRINT4_THEME_FIX_REPORT.md) | Sprint 4 theme fix implementation report — completed fixes | 2026-04-05 | **Current** |

**Cross-references:** SPRINT3 audit → SPRINT3 design spec → SPRINT4 audit → SPRINT4 theme fix (sequential flow).

---

## Feature Specifications

> Directory: `features/`

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [FEATURE_SPEC_CALENDAR.md](FEATURE_SPEC_CALENDAR.md) | Astrological calendar with event reminders — P1 priority | 2026-02-22 | **Current** |
| [FEATURE_SPEC_GOOGLE_CALENDAR_EXPORT.md](features/FEATURE_SPEC_GOOGLE_CALENDAR_EXPORT.md) | Google Calendar integration for astrological events — P1 | 2026-03-29 | **Current** |
| [FEATURE_SPEC_SYNASTRY_COMPARISON_TYPES.md](features/FEATURE_SPEC_SYNASTRY_COMPARISON_TYPES.md) | Expanded synastry comparison types — P2 | 2026-03-29 | **Current** |
| [FEATURE_SPEC_BIRTHDAY_GIFT_SHARING.md](features/FEATURE_SPEC_BIRTHDAY_GIFT_SHARING.md) | Birthday gift sharing via solar returns — P3 | 2026-03-29 | **Current** |
| [FEATURE_SPEC_BIOMETRIC_AUTH.md](features/FEATURE_SPEC_BIOMETRIC_AUTH.md) | Biometric authentication for PWA — P3 | 2026-03-29 | **Current** |
| [BIRTHDAY_GIFT_SHARING_UX_SPEC.md](features/BIRTHDAY_GIFT_SHARING_UX_SPEC.md) | UX design for birthday gift sharing flow | 2026-04-04 | **Current** |
| [CHI66_SHAREABLE_CARDS_REVIEW.md](features/CHI66_SHAREABLE_CARDS_REVIEW.md) | Shareable chart cards — implementation gap analysis | 2026-04-04 | **Current** |
| [CHI66_SHARE_FLOW_SPEC.md](features/CHI66_SHARE_FLOW_SPEC.md) | Share flow interaction specification | 2026-04-04 | **Current** |
| [DAILY_COSMIC_BRIEFING_DESIGN_SPEC.md](features/DAILY_COSMIC_BRIEFING_DESIGN_SPEC.md) | Daily cosmic briefing UI design specification | 2026-04-05 | **Current** |
| [ICON_MIGRATION_SPEC.md](features/ICON_MIGRATION_SPEC.md) | Icon library migration — Sprint 5 tech debt | 2026-04-04 | **Current** |

**Cross-references:** FEATURE_SPEC_BIRTHDAY_GIFT_SHARING → BIRTHDAY_GIFT_SHARING_UX_SPEC; CHI66_SHAREABLE_CARDS_REVIEW → CHI66_SHARE_FLOW_SPEC; FEATURE_SPEC_CALENDAR → [plans/2026-02-16-calendar-feature.md](plans/2026-02-16-calendar-feature.md).

---

## Implementation Plans

> Directory: `plans/`

| Document | Description | Updated | Status |
|----------|-------------|---------|--------|
| [2026-02-16-ai-interpretations.md](plans/2026-02-16-ai-interpretations.md) | AI-powered interpretations — OpenAI GPT-4 integration plan | 2026-02-18 | **Current** |
| [2026-02-16-calendar-feature.md](plans/2026-02-16-calendar-feature.md) | Astrological calendar & event reminders implementation | 2026-02-18 | **Current** |
| [2026-02-16-lunar-return.md](plans/2026-02-16-lunar-return.md) | Lunar return calculation & monthly forecasts | 2026-02-18 | **Current** |
| [2026-02-16-pwa-enhancement.md](plans/2026-02-16-pwa-enhancement.md) | PWA offline, push notifications, caching strategies | 2026-04-04 | **Current** |
| [2026-02-16-synastry-compatibility.md](plans/2026-02-16-synastry-compatibility.md) | Synastry & compatibility calculator with scoring | 2026-02-18 | **Current** |
| [2026-03-29-code-review-remediation.md](plans/2026-03-29-code-review-remediation.md) | Code review remediation — 45 findings (43/45 resolved) | 2026-03-29 | **Current** |
| [2026-03-29-comprehensive-remediation.md](plans/2026-03-29-comprehensive-remediation.md) | Combined code review + UI overhaul remediation — 67 items | 2026-03-29 | **Current** |

**Cross-references:** Each plan maps to a feature spec (calendar plan → FEATURE_SPEC_CALENDAR, synastry plan → FEATURE_SPEC_SYNASTRY_COMPARISON_TYPES, etc.).

---

## Archive

> Directory: `archive/` — Historical session reports and completed task records. Not actively maintained.
> 80 documents covering: E2E testing sessions, QA reviews, test fix progress, UI overhaul implementation, code quality reviews, and project completion reports.
> Key dates range from 2026-02-22 to 2026-04-04. All items are **archived**.

Notable archived docs still referenced in current work:

| Document | Description | Updated |
|----------|-------------|---------|
| [UI_OVERHAUL_ARCHITECTURE.md](archive/UI_OVERHAUL_ARCHITECTURE.md) | UI overhaul architecture decisions | 2026-04-04 |
| [UI_OVERHAUL_IMPLEMENTATION_SUMMARY.md](archive/UI_OVERHAUL_IMPLEMENTATION_SUMMARY.md) | UI overhaul implementation summary | 2026-04-04 |
| [FINAL_PROJECT_SUMMARY.md](archive/FINAL_PROJECT_SUMMARY.md) | Overall project completion summary | 2026-04-04 |
| [PROJECT_COMPLETION_REPORT.md](archive/PROJECT_COMPLETION_REPORT.md) | Final project completion metrics | 2026-04-04 |
| [AI_CACHE_IMPLEMENTATION_SUMMARY.md](archive/AI_CACHE_IMPLEMENTATION_SUMMARY.md) | AI interpretation caching implementation | 2026-03-29 |
| [UNIT_TESTS_SUMMARY.md](archive/UNIT_TESTS_SUMMARY.md) | Unit test coverage summary | 2026-03-29 |

---

## Statistics

| Category | Count |
|----------|-------|
| Top-level docs | 27 |
| Feature specs | 10 |
| Implementation plans | 7 |
| Archived docs | 80 |
| **Total** | **124** |
