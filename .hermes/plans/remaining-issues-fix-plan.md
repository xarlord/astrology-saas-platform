# AstroVerse Remaining Issues — Fix Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix all 9 remaining open issues across security, performance, code quality, documentation, and accessibility.

**Architecture:** Batch related fixes into 2 PRs:
- **PR1** (Quick Wins): Documentation fixes, dead test cleanup, alias config → 5 issues
- **PR2** (Code Quality): UserProfile split, transit forecast perf, large files audit → 4 issues

**Tech Stack:** TypeScript, React 18, Express 4, Zod, Vite, Vitest, Jest

---

## PR1: Quick Wins (Issues #307, #308, #305, #306, #277)

### Sprint A: Documentation Fixes (#307, #308)

#### Task 1: Fix store/ → stores/ in CLAUDE.md and README.md (#307)

**Objective:** Update documentation to match actual directory name (`stores/` not `store/`)

**Files:**
- Modify: `CLAUDE.md:54`
- Modify: `README.md:70`

**Step 1: Fix CLAUDE.md**
```
Old:   store/                 # Zustand state management
New:   stores/                # Zustand state management (useChartStore, etc.)
```

**Step 2: Fix README.md**
```
Old:   store/               # Zustand state (auth, charts)
New:   stores/              # Zustand state (auth, charts)
```

**Step 3: Commit**
```bash
git add CLAUDE.md README.md
git commit -m "docs(#307): fix store/ → stores/ to match actual directory"
```

#### Task 2: Add @stores alias to vite.config.ts and tsconfig.json (#308)

**Objective:** Add the missing `@stores` path alias that CLAUDE.md references

**Files:**
- Modify: `frontend/vite.config.ts` (add `@stores` alias)
- Modify: `frontend/tsconfig.json` (add `@stores` path)

**Step 1: Add alias to vite.config.ts**
In the `resolve.alias` block, add:
```typescript
'@stores': path.resolve(__dirname, './src/stores'),
```

**Step 2: Add path to tsconfig.json**
In the `paths` block, add:
```json
"@stores/*": ["src/stores/*"]
```

**Step 3: Verify existing imports still work**
```bash
grep -rn '@stores' frontend/src/ --include='*.tsx' --include='*.ts' | head -5
```
If any files already use `@stores`, they'll now resolve correctly.

**Step 4: Commit**
```bash
git add frontend/vite.config.ts frontend/tsconfig.json
git commit -m "fix(#308): add @stores path alias to vite and tsconfig"
```

---

### Sprint B: Dead Test Cleanup (#305, #306)

#### Task 3: Fix backend performance test mocks (#306)

**Objective:** Mock swissEphemerisService in performance tests so they pass

**Files:**
- Modify: `backend/src/__tests__/performance/calculation.performance.test.ts`
- Modify: `backend/src/__tests__/performance/api.performance.test.ts`
- Modify: `backend/src/__tests__/performance/database.performance.test.ts`

**Step 1: Read each test file** to understand current mock setup
**Step 2: Add swissEphemerisService mock** at the top of each file:
```typescript
vi.mock('../../modules/shared/services/swissEphemeris.service', () => ({
  default: {
    calculatePosition: vi.fn().mockReturnValue({ longitude: 0, latitude: 0, distance: 1 }),
    calculateHouseCusps: vi.fn().mockReturnValue(Array(12).fill(0)),
  },
}));
```
**Step 3: Run performance tests** to verify they pass
```bash
cd backend && npx jest --testPathPattern="performance" --no-coverage
```

**Step 4: Commit**
```bash
git add backend/src/__tests__/performance/
git commit -m "fix(#306): mock swissEphemerisService in performance tests"
```

#### Task 4: Remove skipped dead tests in api.test.ts (#305)

**Objective:** Remove 19 `it.skip`/`describe.skip` blocks that test unexported functions

**Files:**
- Modify: `frontend/src/__tests__/utils/api.test.ts`

**Step 1: Find the file**
```bash
find frontend/src -name "api.test.ts" -path "*utils*"
```

**Step 2: Read the file** and identify all skipped tests

**Step 3: Remove only the skipped blocks** — keep all active tests intact

**Step 4: Run remaining tests**
```bash
cd frontend && npx vitest run src/__tests__/utils/api.test.ts
```

**Step 5: Commit**
```bash
git add frontend/src/__tests__/utils/api.test.ts
git commit -m "fix(#305): remove 19 skipped dead tests from api.test.ts"
```

---

### Sprint C: Hardcoded Hex Colors Phase 1 (#277)

#### Task 5: Create color token system in Tailwind config (#277)

**Objective:** Extract top-30 most-used hex colors to CSS variables/Tailwind tokens. Full 526-color migration is too large for one PR — do the framework + high-frequency colors.

**Files:**
- Modify: `frontend/tailwind.config.ts` — add semantic color tokens
- Modify: `frontend/src/index.css` — add CSS variable definitions
- Modify: `frontend/src/components/chart/ChartWheel.tsx` — pilot migration (~25 hex values)
- Modify: `frontend/src/components/TransitDashboard.tsx` — pilot migration (~10 hex values)

**Step 1: Inventory top hex colors**
```bash
cd frontend/src && grep -roh '#[0-9a-fA-F]\{3,8\}' --include='*.tsx' --include='*.ts' | sort | uniq -c | sort -rn | head -30
```

**Step 2: Define CSS variables** in `index.css` `:root` and `.dark`:
```css
:root {
  --color-cosmic-purple: #7c3aed;
  --color-nebula-blue: #1e1b4b;
  --color-stardust: #e2e8f0;
  /* ... top 20 colors */
}
```

**Step 3: Register in tailwind.config.ts**
```typescript
theme: {
  extend: {
    colors: {
      cosmic: 'var(--color-cosmic-purple)',
      nebula: 'var(--color-nebula-blue)',
      stardust: 'var(--color-stardust)',
    }
  }
}
```

**Step 4: Pilot migration** — replace hex in ChartWheel.tsx and TransitDashboard.tsx

**Step 5: Run tests**
```bash
cd frontend && npx vitest run
```

**Step 6: Commit**
```bash
git add frontend/tailwind.config.ts frontend/src/index.css frontend/src/components/chart/ChartWheel.tsx frontend/src/components/TransitDashboard.tsx
git commit -m "feat(#277): add color token system, migrate ChartWheel + TransitDashboard"
```

---

#### Task 6: Push PR1 and create pull request

```bash
git push -u origin fix/docs-tests-tokens
```

PR body references: Closes #307, Closes #308, Closes #305, Closes #306, Partial #277

---

## PR2: Code Quality (Issues #218, #127, #131, #274)

### Sprint D: UserProfile Split (#218)

#### Task 7: Split UserProfile.tsx into sub-components (#218)

**Objective:** Break 1084-line UserProfile into 5-6 focused components

**Files:**
- Modify: `frontend/src/components/UserProfile.tsx` (keep as orchestrator, ~200 lines)
- Create: `frontend/src/components/user-profile/ProfileHeader.tsx`
- Create: `frontend/src/components/user-profile/PersonalInfoSection.tsx`
- Create: `frontend/src/components/user-profile/SecuritySettings.tsx`
- Create: `frontend/src/components/user-profile/NotificationPreferences.tsx`
- Create: `frontend/src/components/user-profile/ThemeSettings.tsx`
- Create: `frontend/src/components/user-profile/index.ts` (barrel)

**Step 1: Read UserProfile.tsx** and identify logical sections
**Step 2: Extract each section** into its own component file
**Step 3: Update UserProfile.tsx** to import and compose sub-components
**Step 4: Run tests**
```bash
cd frontend && npx vitest run src/__tests__/components/UserProfile.test.tsx
```
**Step 5: Commit**
```bash
git add frontend/src/components/UserProfile.tsx frontend/src/components/user-profile/
git commit -m "refactor(#218): split UserProfile into sub-components"
```

---

### Sprint E: Transit Forecast Performance (#274)

#### Task 8: Add caching and pagination to transit forecast (#274)

**Objective:** Reduce 365 ephemeris calculations per request by implementing caching + day batching

**Files:**
- Modify: `backend/src/modules/transits/controllers/transit.controller.ts`
- Modify: `backend/src/modules/transits/services/transitForecast.service.ts` (if exists) or create
- Create: `backend/src/modules/shared/services/transitCache.service.ts` (may already exist)

**Step 1: Read current implementation** in transit controller (lines 469-550)
**Step 2: Check if transitCache.service.ts already exists**
```bash
find backend/src -name "*transitCache*" -o -name "*transit*cache*"
```
**Step 3: Add day-batch limiting** — cap at 30-day windows with pagination:
```typescript
const BATCH_SIZE = 30;
const maxDays = Math.min(daysDiff, BATCH_SIZE);
```
**Step 4: Add response headers** for pagination:
```typescript
res.set('X-Forecast-Total-Days', String(daysDiff));
res.set('X-Forecast-Batch-Size', String(maxDays));
```
**Step 5: Run tests**
```bash
cd backend && npx jest --testPathPattern="transit"
```
**Step 6: Commit**
```bash
git add backend/src/modules/transits/
git commit -m "perf(#274): batch transit forecast to 30-day windows with pagination"
```

---

### Sprint F: Semantic HTML + Large Files (#131, #127)

#### Task 9: Improve semantic HTML in top-5 pages (#131)

**Objective:** Replace `<div>` with semantic elements (`<section>`, `<header>`, `<main>`, `<nav>`, `<article>`) in the largest pages

**Files:**
- Modify: `frontend/src/components/UserProfile.tsx`
- Modify: `frontend/src/pages/LearnPage.tsx`
- Modify: `frontend/src/components/chart/ShareableChartCard.tsx`
- Modify: `frontend/src/components/TransitDashboard.tsx`
- Modify: `frontend/src/components/AppLayout.tsx`

**Step 1: For each file**, identify `<div>` wrappers that should be semantic:
- Page wrappers → `<main>` or `<section>`
- Header areas → `<header>`
- Navigation → `<nav>`
- Content blocks → `<article>` or `<section>`
- Footer areas → `<footer>`

**Step 2: Replace mechanically** — only change tag name, keep all props/children

**Step 3: Run tests after each file**
```bash
cd frontend && npx vitest run
```

**Step 4: Commit**
```bash
git add frontend/src/
git commit -m "fix(#131): improve semantic HTML ratio in top-5 components"
```

#### Task 10: Document large file guidelines in CLAUDE.md (#127)

**Objective:** Add 300-line guideline enforcement note + list files that need future splitting

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add section** under Code Conventions:
```markdown
## Large File Guidelines
Files exceeding 300 lines should be split. Current exceptions:
- UserProfile.tsx (1084) — see #218 for split plan
- LearnPage.tsx (1036) — static content, low priority
- ShareableChartCard.tsx (958) — complex chart rendering
```

**Step 2: Commit**
```bash
git add CLAUDE.md
git commit -m "docs(#127): document large file guidelines and exceptions"
```

---

#### Task 11: Push PR2 and create pull request

```bash
git push -u origin fix/code-quality-refactor
```

PR body references: Closes #218, Closes #274, Closes #131, Partial #127

---

## Issue→PR Mapping

| Issue | PR | Sprint | Priority | Est. Complexity |
|-------|-----|--------|----------|-----------------|
| #307 | PR1 | A | P3 (docs) | Small (2 files, text only) |
| #308 | PR1 | A | P3 (docs) | Small (2 files, config) |
| #305 | PR1 | B | P3 (tests) | Small (remove dead code) |
| #306 | PR1 | B | P3 (tests) | Small (add mocks) |
| #277 | PR1 | C | P3 (tokens) | Medium (pilot only, not full 526) |
| #218 | PR2 | D | P2 (quality) | Large (split 1084-line file) |
| #274 | PR2 | E | P2 (perf) | Medium (caching + pagination) |
| #131 | PR2 | F | P3 (a11y) | Medium (5 files, mechanical) |
| #127 | PR2 | F | P3 (docs) | Small (add guidelines) |

## Notes
- #277 (526 hex colors) is too large for full fix — plan does pilot migration + token framework
- #274 already has `Math.min(daysDiff, 365)` and `.slice(0, 50)` — real fix is batching + caching
- #218 UserProfile is the biggest task — recommend delegate_task with subagent
- All changes maintain backward compatibility — no breaking API changes
