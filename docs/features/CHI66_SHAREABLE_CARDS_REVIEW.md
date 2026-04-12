# CHI-66: Shareable Chart Cards — Implementation Gap Analysis

**Date:** 2026-04-04
**Designer:** UX Designer 2
**Parent Issue:** CHI-57
**Status:** Code review complete — significant gaps found

---

## Current State

**File:** `frontend/src/components/chart/ShareableChartCard.tsx`

The component exists with basic structure but has substantial gaps against the CHI-66 design spec. It renders 4 card layouts (instagram-story, twitter, pinterest, square) as portrait/landscape variants with zodiac badges, star decorations, and branding. However, it is **not imported or rendered on any page**.

**Current share functionality in the app:**
- `NatalChartDetailPage` shares a URL link via Web Share API
- `SavedChartsGalleryPage` has a share modal that copies chart URL
- Neither uses the ShareableChartCard component

---

## Gap Summary

| Area | Spec | Current | Status |
|------|------|---------|--------|
| Template count | 5 templates | 4 templates | MISSING Template 5 (Daily Insight) |
| Chart wheel | MiniChartWheel (simplified SVG) | Placeholder circle | NOT IMPLEMENTED |
| AI insight quote | InsightQuote on all templates | Not present | NOT IMPLEMENTED |
| Element balance | Horizontal bars (Template 4) | Not present | NOT IMPLEMENTED |
| Additional placements | 2-col grid (Template 3) | Not present | NOT IMPLEMENTED |
| Degree display | "23deg" on each placement | Not shown | MISSING |
| Template differentiation | Unique layouts per template | Generic portrait/landscape | NEEDS REWORK |
| Page integration | Accessible from chart pages | Not integrated | NOT STARTED |
| Image export | PNG/WebP via html-to-image | No export logic | NOT STARTED |
| Share flow | Template picker + download/share | No flow | NOT STARTED |
| URL watermark | "astroverse.app" in footer | Not shown | MISSING |
| Fonts | Space Grotesk + Noto Sans | Uses system fonts | NEEDS VERIFICATION |

---

## Detailed Findings

### GAP-1: Missing Template 5 — Daily Insight (800x418)

The compact "link preview" card format is not implemented. This is the card used for:
- Open Graph / Twitter Card meta images
- Newsletter embeds
- Link preview thumbnails

**Card sizes constant needs update:**
```ts
// ADD:
'daily-insight': { width: 800, height: 418, aspectRatio: '800/418', label: 'Daily Insight' }
```

**Layout:** Unique compact layout with left sign block + right Big 3 stack + single-line quote. Different from both portrait and landscape layouts. Needs a new `CompactLayout` sub-component.

### GAP-2: MiniChartWheel — Placeholder Only

The current implementation shows an empty circle when no `chartWheelSvg` prop is passed. The spec requires a simplified SVG chart wheel with:
- Outer zodiac ring with element-colored segments
- Planet dots positioned by degree
- No house lines, no aspect lines (simplified variant)
- A "detailed" variant for Pinterest with houses + aspects

**Recommendation:** Create a `MiniChartWheel` component that reuses the data types from `ChartWheel.tsx` (`ChartData`, `Planet`, etc.) but renders a stripped-down SVG. The existing `ChartWheel` at `components/astrology/ChartWheel.tsx` has the zodiac ring logic already — extract the ring rendering into a shared utility.

### GAP-3: InsightQuote — Missing

All 5 templates include an AI-generated insight quote (e.g., "Your fire burns bright and your waters run deep"). This is a key viral design element — it gives personality to the card and drives sharing.

**Required:** Add `insightQuote?: string` prop to `ShareableChartCardProps`. Render as italic gold text with configurable max length (varies by template).

### GAP-4: ElementBalance — Missing

Template 4 (Elemental Identity) requires proportional horizontal bars showing the user's element distribution (Fire/Air/Water/Earth).

**Required:** Add `elements?: { fire: number; earth: number; air: number; water: number }` prop. Render as stacked horizontal bars with element colors and percentage labels.

### GAP-5: AdditionalPlacements — Missing

Template 3 (Birth Chart Deep Dive) requires a 2-column grid showing Venus, Mars, Jupiter, Saturn placements beyond the Big 3.

**Required:** Add `additionalPlacements?: Array<{ planet: string; sign: string }>` prop. Render as 2-column grid below Big 3 section, only in Pinterest template.

### GAP-6: Template Differentiation

Currently all portrait cards (instagram-story, pinterest, square) use the identical `PortraitLayout`. The spec defines distinct layouts:
- **Instagram Story:** Chart wheel centered above Big 3 cards (glass bg), quote below, "Written in the Stars" tagline
- **Pinterest:** Full detailed chart wheel, Big 3 with keyword lines, additional placements grid, dashed dividers
- **Square:** Chart wheel left, sun sign hero right, element balance bars, compact moon+rising

Each needs its own layout component or conditional rendering within PortraitLayout.

### GAP-7: Degree Display

Zodiac badges show sign name but not degree. The spec shows "Sun in Leo 23deg" for each placement.

**Required:** Add `sunDegree?`, `moonDegree?`, `risingDegree?` props. Display as small secondary text on each badge.

### GAP-8: No Page Integration

The component is not used anywhere. It needs to be integrated into:
1. **NatalChartDetailPage** — "Share" button should open a share modal with template picker
2. **SavedChartsGalleryPage** — Replace current URL-only share modal with visual card sharing
3. **DashboardPage** — Optional quick share from chart cards

### GAP-9: No Image Export

No PNG/WebP export functionality. The spec calls for `html-to-image` (already in package.json per `pdf.service.ts`) to render the card to an image file.

**Required:** Create a `useShareableCard` hook that:
1. Renders the card to a hidden container
2. Uses `toPng()` from `html-to-image` at 2x scale
3. Returns a Blob for Web Share API or download trigger
4. Handles font loading wait (`document.fonts.ready`)

### GAP-10: Share Flow — No UI

No share flow exists. The spec envisions:
1. User clicks "Share" on a chart
2. Modal opens with template preview grid (exists as `ShareableChartCardPreview`)
3. User selects template size
4. User taps "Download Image" or "Share" (native share sheet)
5. Card renders to PNG and shares/downloads

This is the primary interaction that needs to be designed.

---

## Design Token Alignment

| Spec Token | Code Implementation | Match? |
|-----------|-------------------|--------|
| Primary `#6b3de1` | `text-primary` / `bg-primary` | YES |
| Dark BG `#0B0D17` | `from-[#0B0D17]` gradient | YES |
| Surface `#151725` | `via-[#111127]` | CLOSE |
| Gold `#F5A623` | Not used in current badges | NEEDS ADDITION |
| Secondary `#a0aec0` | `text-slate-400` / `text-slate-500` | CLOSE ENOUGH |
| Fire `#EF4444` | `text-orange-400` for fire signs | DIFFERENT — spec says red, code uses orange |
| Water `#6366F1` | `text-indigo-400` | CLOSE |
| Font Display | Space Grotesk | NOT LOADED |
| Font Body | Noto Sans | NOT LOADED |

**Fire sign color discrepancy:** Spec uses `#EF4444` (red-500) but code uses `text-orange-400`. The code choice (orange) better differentiates fire from Mars (also red). Recommend keeping orange but noting in spec.

---

## Priority Fix Order

1. **P0 — Template differentiation:** Give each template its own layout (Instagram, Pinterest, Square, Twitter, Compact)
2. **P0 — MiniChartWheel:** Create simplified SVG wheel component
3. **P1 — InsightQuote:** Add quote prop and rendering
4. **P1 — ElementBalance:** Add element bars for Square template
5. **P1 — AdditionalPlacements:** Add grid for Pinterest template
6. **P2 — Share flow:** Design and implement share modal + export
7. **P2 — Page integration:** Connect to NatalChartDetailPage and SavedChartsGalleryPage
8. **P3 — Font loading:** Ensure Space Grotesk and Noto Sans are loaded before render
9. **P3 — Degree display:** Add degree props and rendering

---

## Files Reference

- Design spec: `card-design-spec.json` (workspace)
- Current component: `frontend/src/components/chart/ShareableChartCard.tsx`
- ChartWheel (reference for wheel logic): `frontend/src/components/astrology/ChartWheel.tsx`
- Share modal (existing): `frontend/src/pages/SavedChartsGalleryPage.tsx` (lines 397-449)
- Image export lib: `frontend/src/services/pdf.service.ts` (uses html-to-image)
