# AstroVerse Dark Glass UI Overhaul — Design Specification

**Issue:** #536  
**Executor:** GPT-5.6 Luna, xhigh  
**Independent reviewer:** GPT-5.6 Sol, xhigh  
**Status:** Approved design direction

## Goal

Create a cohesive, premium dark-mode interface across every AstroVerse route and shared component using restrained Apple-inspired glassmorphism while preserving the existing cosmic identity, product behavior, accessibility, responsiveness, and performance.

## Non-negotiable constraints

- Dark mode only; no light-theme or theme-toggle work.
- Use semantic tokens rather than page-level visual literals.
- Use restrained cyan, violet, amber, and cosmic-neutral accents.
- Avoid excessive neon, nested blur, decorative clutter, and layout-shifting animation.
- Preserve routes, API contracts, chart calculations, workflows, analytics, and existing semantics.
- Respect `prefers-reduced-motion`.
- Integrate Issue #514 during the application-shell phase.
- Repair and resolve visual regression failures tracked by Issue #516; never bypass or weaken visual tests.
- Land foundations first, then migrate bounded page families through separate PRs.

## Design language

Use a strict elevation model:

1. Opaque cosmic canvas.
2. Transparent or minimally elevated page sections.
3. One restrained glass surface for meaningful content groups.
4. Elevated overlays for dialogs, menus, and tooltips.
5. Focus/active state expressed through tokenized borders or rings—not additional glow layers.

Glass surfaces use controlled opacity, blur, borders, and shadows. Dense text, forms, and chart labels must use sufficiently opaque surfaces for readability. Charts retain domain meaning and must not rely on color alone.

## Token architecture

- `frontend/src/assets/styles/globals.css` is the canonical imported global stylesheet. Coordinate with #526 to consolidate the currently competing `index.css` definitions into this loaded entry without duplicate Tailwind base emission.
- `frontend/src/index.css` may be retained only as a migration source until its tokens/utilities are moved and verified; it must not remain an untracked competing source of truth.
- `frontend/tailwind.config.js`: map Tailwind colors, radii, shadows, blur, and animations to semantic CSS variables.
- `frontend/src/utils/design-tokens.ts`: typed token names and runtime mappings for charts and JavaScript.
- `frontend/src/components/ui`: variant-based primitives consuming semantic tokens, with compatibility adapters for existing `Card`/`Modal` APIs during migration.

Token layers:

- Primitive palette and scales.
- Semantic canvas/surface/border/text/accent/feedback roles.
- Component tokens for cards, buttons, inputs, dialogs, navigation, and chart panels.

Motion tokens cover immediate feedback, controls/disclosure, and short page/section entrances. Reduced-motion mode removes non-essential transforms, parallax, and entrance effects.

## Shared component architecture

Normalize or introduce:

- `AppShell`, `PageContainer`, `PageHeader`, `Section`, `Surface`, `Divider`.
- Buttons, links, icon buttons, inputs, selects, fields, tabs, badges, dialogs, drawers, menus, tooltips, and toasts.
- Loading, skeleton, empty, error, and retry states.
- Domain components for chart summaries, planetary/aspect badges, interpretation sections, insight cards, transit items, chart frames, legends, and tooltips.

Each primitive provides explicit variants, stable focus behavior, disabled/loading/error/selected states, responsive behavior, reduced-motion behavior, and testable semantics.

## PR phases

1. Audit, token foundation, and deterministic visual harness.
2. Shared glass UI primitives.
3. Application shell and Issue #514 integration.
4. Authentication, onboarding, and account surfaces.
5. Chart creation and chart-results experience.
6. Transits, forecasts, synastry, and interpretation pages.
7. Secondary, informational, and exceptional routes.
8. Visual-regression convergence and cleanup for Issue #516.

## Verification gates

Every PR must run:

- TypeScript, lint, production build, and Vitest.
- Playwright functional flows at desktop, tablet, 390px, and 320px widths.
- Keyboard-only, focus, landmarks, headings, overlay, and reduced-motion checks.
- Accessibility scans with no new serious/critical violations.
- Visual regression with route-by-route diff review.
- Browser console and unexpected-network-error checks.
- Performance comparison for LCP, CLS, interaction responsiveness, bundle size, blur/filter cost, and scrolling.
- Independent AGY visual review after automated checks.
- Human desktop and mobile review before merge.

No skipped tests, blanket screenshot masks, weakened thresholds, or `continue-on-error` are acceptable.

## Acceptance criteria

- Every routed page is tracked in an audit matrix and migrated to the shared system.
- No unexplained hard-coded colors, shadows, radii, blur, or motion remain in page components.
- Shared surfaces, controls, typography, feedback, and overlays use documented variants.
- Existing workflows and chart readability are preserved.
- Responsive, accessibility, reduced-motion, performance, visual, AGY, and human-browser gates pass.
- Issue #514 is satisfied.
- All Issue #516 mismatches have an explicit disposition and no failure is bypassed.
- Temporary migration styles, duplicate components, dead tokens, and obsolete visual utilities are removed.
