# Bug Fixes v1 — Rectification & Verification Plan

**Branch:** `fix/comprehensive-bug-fixes-v1`
**GitHub Issues:** #85–#102
**Date:** 2026-05-30

## Priority Tiers

### Tier 1: Critical (blocks core functionality)
| # | Issue | GitHub | Status |
|---|-------|--------|--------|
| 1 | Synastry reports identical | #85 | Pending |
| 18 | Lunar Returns page crashes | #102 | Pending |
| 7 | Profile/Charts page empty | #91 | Pending |
| 6 | Header/footer transparent | #90 | Pending |
| 13 | Popups transparent — no blur | #97 | Pending |

### Tier 2: High (broken features)
| # | Issue | GitHub | Status |
|---|-------|--------|--------|
| 10 | Transit popup can't close + empty | #94 | Pending |
| 11 | Transit date change doesn't update | #95 | Pending |
| 3 | Chart true/mean toggle same result | #87 | Pending |
| 5 | Missing planet logos | #89 | Pending |

### Tier 3: Medium (UX improvements)
| # | Issue | GitHub | Status |
|---|-------|--------|--------|
| 12 | Transit month day click nothing | #96 | Pending |
| 14 | Transit cards same grading/icon | #98 | Pending |
| 15 | Moon Calendar ← text + no day info | #99 | Pending |
| 16 | Retrograde only current month | #100 | Pending |
| 17 | Retrograde day click popup | #101 | Pending |
| 8 | Profile timezone simplify | #92 | Pending |
| 2 | UI looks AI-generated | #86 | Pending |

### Tier 4: Low (polish)
| # | Issue | GitHub | Status |
|---|-------|--------|--------|
| 4 | Personality analysis grounding | #88 | Pending |
| 9 | Theme switcher / light theme | #93 | Pending |

---

## Detailed Rectification Plans

### #85 — Synastry reports identical
**Root Cause:** Controller builds Chart objects from individual DB columns (`chart1Data.sunSign`, `chart1Data.moonDegree` etc.) but actual planet data is stored in `calculated_data` JSON column. All planet fields resolve to `undefined`.

**Fix:**
1. Modify `synastry.controller.ts` compareCharts to extract planets from `chart1Data.calculated_data.planets` instead of individual columns
2. Same for `getCompatibility` endpoint
3. Map `calculated_data` planets to the Chart interface expected by `calculateSynastryChart`

**Verification:** Create two charts with different birth dates. Compare them — results should differ in aspects, scores, and interpretations.

**Files:**
- `backend/src/modules/synastry/controllers/synastry.controller.ts`

---

### #102 — Lunar Returns page crashes (React error #31)
**Root Cause:** Backend returns error `{ message, statusCode }` but frontend extracts `errorObj.response?.data?.error` which is `undefined`, falling through to the error object itself. React tries to render `{message, statusCode}` as text.

**Fix:**
1. In `LunarReturnDashboard.tsx` line 49-50: fix error extraction to `errorObj.response?.data?.message ?? 'Failed to load'`
2. Verify backend has `/lunar-return/next` and `/lunar-return/current` routes registered
3. Add try/catch with string coercion: `String(error)` fallback

**Verification:** Navigate to `/lunar-returns` — should show graceful error, not crash.

**Files:**
- `frontend/src/components/LunarReturnDashboard.tsx`

---

### #91 — Profile/Charts page empty
**Root Cause:** ProfilePage and SavedChartsGalleryPage don't fetch or display user's charts from the API.

**Fix:**
1. Wire up `useChartsStore` in ProfilePage to show chart count and recent charts
2. In SavedChartsGalleryPage, fetch charts via `chartService.getCharts()` and render chart cards
3. Add links to individual chart view pages

**Verification:** Login → Profile shows charts. Saved Charts Gallery displays all user charts.

**Files:**
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/SavedChartsGalleryPage.tsx`

---

### #90 — Header/footer transparent
**Root Cause:** AppLayout navbar and footer use transparent/semi-transparent backgrounds without solid fallback.

**Fix:**
1. Add solid dark background (`bg-[#0B0D17]` or `bg-cosmic-card-solid`) to navbar
2. Add `backdrop-blur-md` for glass effect
3. Same for footer/sidebar

**Verification:** Scroll page — navbar text remains readable over content.

**Files:**
- `frontend/src/components/AppLayout.tsx`

---

### #97 — Popups transparent
**Root Cause:** Modal/popup overlays lack backdrop styling.

**Fix:**
1. Create shared Modal wrapper with `bg-black/50 backdrop-blur-md` overlay
2. Apply to all popup components (transit, retrograde, moon calendar)
3. Modal content should have `bg-cosmic-card-solid` background

**Verification:** Open any popup — backdrop blurs content, popup is readable.

**Files:**
- `frontend/src/components/Modal.tsx` (new or existing)
- All popup-triggering components

---

### #94 — Transit popup can't close + empty content
**Root Cause:** Popup missing close handler and transit detail content.

**Fix:**
1. Add X button with `onClose` callback
2. Populate popup with transit interpretation (planet aspects, meaning)
3. Add Escape key handler

**Verification:** Click transit → popup shows content → can close via X or Escape.

**Files:**
- `frontend/src/pages/TodayTransitsPage.tsx`

---

### #95 — Transit date change doesn't update
**Root Cause:** Date selector state not wired to API refetch.

**Fix:**
1. Add `useEffect` watching selected date
2. Refetch transits API with new date param
3. Show loading state during refetch

**Verification:** Change date → transits update to selected date.

**Files:**
- `frontend/src/pages/TodayTransitsPage.tsx`

---

### #87 — Chart true/mean toggle same result
**Root Cause:** `useTrueAngles` affects obliquity calculation (house cusps) but difference may be <1°. Also need to switch true/mean lunar nodes.

**Fix:**
1. Verify true vs mean obliquity produces measurable difference in house cusps
2. Add true/mean node toggle (affects North/South Node positions significantly)
3. Rename toggle from "True/Median" to "True/Mean Obliquity + Nodes"
4. Show recalculated values in UI to prove change happened

**Verification:** Toggle between True/Mean — house cusps and node positions should visibly change.

**Files:**
- `backend/src/modules/shared/services/natalChart.service.ts`
- `backend/src/modules/shared/services/astronomyEngine.service.ts`
- `frontend/src/pages/ChartViewPage.tsx`

---

### #89 — Missing planet logos
**Root Cause:** AnalysisPage renders planet symbols but Chiron, North Node, South Node, Part of Fortune don't have glyph mappings in the symbol lookup.

**Fix:**
1. Add Unicode glyphs: Chiron ⚷, North Node ☊, South Node ☋, Part of Fortune ⊗
2. Ensure AnalysisPage symbol lookup includes these entries
3. Test rendering in all browsers

**Verification:** Analysis page shows symbols for all 4 special points.

**Files:**
- `frontend/src/pages/AnalysisPage.tsx`

---

### #96 — Transit month day click
**Fix:** Add day-click handler in monthly calendar view. Show popup with transit summary.

**Files:** `frontend/src/pages/TodayTransitsPage.tsx`

### #98 — Transit cards same grading/icon
**Fix:** Vary card color by aspect type (harmonious=green, challenging=red, neutral=blue). Add unique icons per transit type.

**Files:** `frontend/src/pages/TodayTransitsPage.tsx`

### #99 — Moon Calendar ← text + no day info
**Fix:** Replace literal `←`/`→` with arrow icon components. Add day-click popup with moon phase info.

**Files:** `frontend/src/components/CalendarPageShell.tsx`

### #100 — Retrograde only current month
**Fix:** Extend API to accept month/year params. Fetch retrogrades for any month.

**Files:** `frontend/src/pages/RetrogradePage.tsx`, backend retrograde service

### #101 — Retrograde day click popup
**Fix:** Add day-click handler showing which planets are retrograde with details.

**Files:** `frontend/src/pages/RetrogradePage.tsx`

### #92 — Profile timezone simplify
**Fix:** Replace timezone dropdown with: Auto (from location), UTC-12 to UTC+14 options.

**Files:** `frontend/src/pages/ProfileSettingsPage.tsx`

### #86 — UI looks AI-generated
**Fix:** Replace Material Symbols with Lucide React icons. Custom SVG for astrology-specific symbols. Professional color scheme.

**Files:** Multiple frontend components

### #88 — Personality analysis grounding
**Fix:** Review and rewrite interpretation entries with references to established astrology texts.

**Files:** `backend/src/data/interpretations.ts`

### #93 — Theme switcher / light theme
**Fix:** Either remove theme toggle or implement light theme CSS variables.

**Files:** `frontend/src/pages/SettingsPage.tsx`, Tailwind config

---

## Execution Order

1. **#97** Popups transparent → foundational, affects all popup fixes
2. **#90** Header/footer transparency → visual foundation
3. **#85** Synastry data → backend core fix
4. **#102** Lunar Returns crash → blocking page
5. **#91** Profile/Charts empty → core navigation
6. **#94** Transit popup close/content
7. **#95** Transit date update
8. **#87** Chart true/mean
9. **#89** Missing planet logos
10. **#96** Transit month day click
11. **#98** Transit cards styling
12. **#99** Moon calendar fixes
13. **#100** Retrograde full month
14. **#101** Retrograde day popup
15. **#92** Profile timezone
16. **#86** UI professional redesign
17. **#88** Personality grounding
18. **#93** Theme switcher

---

## CI & Deployment

1. Push fixes incrementally with clear commit messages
2. Run CI after each batch of related fixes
3. Final PR with all 18 fixes
4. Tag as v1.8.0
5. Deploy to fly.io
