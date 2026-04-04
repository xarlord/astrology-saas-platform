# CHI-66: Share Flow Interaction Specification

**Date:** 2026-04-04
**Designer:** UX Designer 2
**Companion to:** `CHI66_SHAREABLE_CARDS_REVIEW.md`

---

## User Flow

```
Chart Detail Page / Charts Gallery
  │
  ├─ User taps "Share" button (share icon)
  │
  ▼
Share Modal opens
  ├─ Header: "Share {chartName}"
  ├─ Tab bar: [Card] [Link]
  │
  ├─ [Card Tab - DEFAULT]
  │   ├─ Template preview grid (2x2 + compact)
  │   │   └─ Each card is tappable, selected card has primary border + glow
  │   ├─ Card preview (large, centered below grid)
  │   │   └─ Renders selected template at max 400px wide
  │   ├─ Action row: [Download PNG] [Share]
  │   │   ├─ Download: renders to PNG, triggers browser download
  │   │   └─ Share: renders to PNG blob, opens Web Share API
  │   └─ Optional: theme toggle (dark/light) top-right
  │
  └─ [Link Tab - EXISTING]
      ├─ URL input (read-only) + copy button
      └─ Social share buttons (Facebook, Twitter, etc.)
```

---

## Share Modal Component Spec

### Props

```ts
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartId: string;
  chartName: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  sunDegree?: number;
  moonDegree?: number;
  risingDegree?: number;
  birthDate?: string;
  chartData?: ChartData;           // For MiniChartWheel
  insightQuote?: string;           // AI-generated, optional
  elements?: ElementBalance;       // For Elemental Identity template
  additionalPlacements?: Placement[];
}
```

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Share "Jane's Chart"                          [X]  │
│─────────────────────────────────────────────────────│
│  [ Card ]  [ Link ]                                 │
│─────────────────────────────────────────────────────│
│                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │Story   │ │Twitter │ │Pin     │ │Square  │      │
│  │ 9:16   │ │ 16:9   │ │ 2:3    │ │ 1:1    │      │
│  │ *sel*  │ │        │ │        │ │        │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │           SELECTED CARD PREVIEW              │   │
│  │           (renders at ~400px wide)           │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [ 🌙 Dark / ☀️ Light ]                             │
│                                                     │
│  ┌──────────────┐  ┌──────────────────────────┐     │
│  │ Download PNG │  │ Share                    │     │
│  └──────────────┘  └──────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### States

| State | UI |
|-------|-----|
| **Loading** | Card preview shows skeleton shimmer. Buttons disabled. |
| **Ready** | Card renders with data. Buttons enabled. |
| **Rendering** | User clicked Download/Share. Spinner on button. Card renders to PNG. |
| **Success (download)** | Button shows checkmark + "Downloaded!" for 2s, then resets. |
| **Success (share)** | Modal closes after share completes. |
| **Error** | Toast: "Failed to generate image. Please try again." |
| **No chart data** | Card renders with zodiac badges only (no wheel). Quote shows generic fallback. |

### Responsive Behavior

| Viewport | Modal | Preview grid |
|----------|-------|-------------|
| Desktop (≥1024px) | Max-width 640px, centered | 4 cards in a row |
| Tablet (768-1023px) | Full-width with 24px margin | 2x2 grid |
| Mobile (<768px) | Full-screen bottom sheet | Horizontal scroll, snap to card |

### Mobile Bottom Sheet (default on touch devices)

On mobile, the share modal renders as a bottom sheet:
- Drag handle at top
- Template selector as horizontal scroll
- Large preview card
- Sticky action bar at bottom

```
┌──────────────────────────┐
│  ─── (drag handle)        │
│  Share "Jane's Chart" [X] │
│                           │
│  [Card] [Link]            │
│                           │
│  ← Story Twit Pin Sq →   │
│     (horizontal scroll)   │
│                           │
│  ┌────────────────────┐   │
│  │                    │   │
│  │  CARD PREVIEW      │   │
│  │  (scaled to fit)   │   │
│  │                    │   │
│  └────────────────────┘   │
│                           │
│  ┌─────────┐ ┌──────────┐ │
│  │Download │ │ Share    │ │
│  └─────────┘ └──────────┘ │
└──────────────────────────┘
```

---

## Image Export Flow

### Sequence

1. User selects template and clicks Download or Share
2. Component renders the `ShareableChartCard` at **2x resolution** (e.g., Instagram Story renders at 2160x3840) into an offscreen container
3. Wait for `document.fonts.ready` to ensure Space Grotesk is loaded
4. Call `toPng()` from `html-to-image` with `pixelRatio: 2`
5. For Download: Create Blob → `URL.createObjectURL` → trigger `<a download>`
6. For Share: Create Blob → pass to `navigator.share({ files: [new File([blob], 'chart.png', { type: 'image/png' })] })`

### Export Hook

```ts
function useShareableCard() {
  const [state, setState] = useState<'idle' | 'rendering' | 'success' | 'error'>('idle');

  const exportCard = async (
    cardRef: React.RefObject<HTMLDivElement>,
    filename: string,
  ): Promise<Blob | null> => { ... };

  const downloadCard = async (...) => { ... };
  const shareCard = async (...) => { ... };

  return { state, exportCard, downloadCard, shareCard };
}
```

### Render Container

The card must render at **export dimensions** (not display dimensions) for crisp output. Use an offscreen container with fixed pixel width/height:

```tsx
<div
  style={{
    position: 'fixed',
    left: '-9999px',
    top: 0,
    width: CARD_SIZES[size].width,    // e.g., 1080
    height: CARD_SIZES[size].height,  // e.g., 1920
    // No Tailwind — inline styles for html-to-image compatibility
  }}
>
  <ShareableChartCard {...props} size={size} />
</div>
```

**Critical:** `html-to-image` requires all styles to be inline or from loaded stylesheets. Tailwind utility classes work if the stylesheet is loaded. Custom fonts must be loaded before capture.

---

## Entry Points

### 1. NatalChartDetailPage — Share button

Current: Shares URL only via Web Share API
**Change:** Opens ShareModal with chart data pre-filled

```diff
- const handleShare = useCallback(async () => {
-   if (navigator.share && currentChart) {
-     await navigator.share({ ... });
-   }
- }, [currentChart]);

+ const [shareModalOpen, setShareModalOpen] = useState(false);
+ // Share button onClick: setShareModalOpen(true)
```

### 2. SavedChartsGalleryPage — Share modal enhancement

Current: ShareModal shows URL + social buttons
**Change:** Add Card tab as default, keep Link tab for URL sharing

### 3. DashboardPage — Quick share (optional, future)

Right-click or long-press on chart card → "Share as Image" → opens ShareModal

---

## Accessibility

- Modal has `role="dialog"` and `aria-modal="true"`
- Template grid items are `role="radiogroup"` with `aria-pressed` on each option
- Focus trap within modal when open
- Escape key closes modal
- Download button has `aria-label="Download chart as PNG image"`
- Share button has `aria-label="Share chart image"`
- Loading state announced via `aria-live="polite"` region

---

## Animation

| Element | Animation | Duration |
|---------|-----------|----------|
| Modal open | Fade in + slide up (mobile) / scale in (desktop) | 250ms |
| Template selection | Selected card scales to 1.02 + border glow | 150ms |
| Card preview swap | Crossfade | 200ms |
| Download success | Checkmark replaces icon, button briefly turns green | 2000ms |
| Modal close | Fade out + slide down | 200ms |

---

## Fallback Behavior

| Scenario | Handling |
|----------|----------|
| No Web Share API | Share button hidden, Download only |
| No chart wheel data | Renders placeholder circle |
| No insight quote | Shows generic "Written in the Stars" |
| No element data | ElementBalance section hidden |
| Font load timeout | Proceed with system font after 3s |
| Export fails | Show error toast, keep modal open |
| Very slow device | Show "Generating image..." with progress dots |

---

## Component Hierarchy

```
ShareModal
├── ModalShell (dialog, focus trap, close button)
├── TabBar (Card | Link)
├── CardTabContent
│   ├── TemplateSelector (horizontal scroll or 2x2 grid)
│   │   └── ShareableChartCard (mini previews)
│   ├── CardPreview (large render)
│   │   └── ShareableChartCard (full size)
│   ├── ThemeToggle (dark/light)
│   └── ActionRow
│       ├── DownloadButton
│       └── ShareButton
├── LinkTabContent (existing URL share UI)
└── HiddenRenderContainer (offscreen, for export)
    └── ShareableChartCard (at export resolution)
```
