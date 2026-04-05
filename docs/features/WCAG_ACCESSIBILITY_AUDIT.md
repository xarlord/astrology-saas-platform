# WCAG 2.1 AA Accessibility Audit Report

**Date:** 2026-04-05
**Auditor:** UX Designer 2
**Standard:** WCAG 2.1 Level AA
**Scope:** 7 high-traffic pages/components
**Branch:** `feature/accessibility-fixes`
**Status:** 22 of 28 violations fixed (commit `3fdf04f`)

---

## Compliance Summary

| Category | Tests | Passed | Failed | Compliance |
|----------|-------|--------|--------|------------|
| Perceivable | 14 | 9 | 5 | 64% |
| Operable | 18 | 11 | 7 | 61% |
| Understandable | 10 | 7 | 3 | 70% |
| Robust | 8 | 7 | 1 | 88% |
| **Total** | **50** | **34** | **16** | **68%** |

### Severity Breakdown

| Severity | Count |
|----------|-------|
| Critical | 4 |
| Serious | 9 |
| Moderate | 12 |
| Low | 4 |

---

## Critical Violations (Block Release)

### C1. Dashboard Chart Cards — No Keyboard Accessible Click Handler

- **WCAG:** 2.1.1 Keyboard (Level A)
- **File:** `frontend/src/pages/DashboardPage.tsx:555`
- **Impact:** Keyboard-only users and screen reader users cannot select or navigate to chart cards.

```tsx
// Current: div with onClick — not keyboard accessible
<div
  key={chart.id}
  onClick={() => handleChartClick(chart.id)}
  className="... cursor-pointer ..."
>
```

**Fix:** Replace `<div onClick>` with a semantic `<button>` or add `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space:

```tsx
// Option A: Use button element
<button
  key={chart.id}
  onClick={() => handleChartClick(chart.id)}
  className="... text-left ..."
  aria-label={`View ${chart.name} chart`}
>

// Option B: Add ARIA to div
<div
  role="button"
  tabIndex={0}
  onClick={() => handleChartClick(chart.id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChartClick(chart.id);
    }
  }}
  aria-label={`View ${chart.name} chart`}
>
```

---

### C2. ProfileSettingsPage Tabs — Missing ARIA Tabs Pattern

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/pages/ProfileSettingsPage.tsx:209-227`
- **Impact:** Screen readers cannot identify tab navigation or communicate which tab is active.

The current implementation uses plain `<button>` elements in a `<nav>` with no ARIA tab roles.

```tsx
// Current: plain nav with buttons
<nav className="flex space-x-8" aria-label="Tabs">
  {tabs.map((tab) => (
    <button onClick={() => setActiveTab(tab.id)} ...>
```

**Fix:** Implement WAI-ARIA Tabs pattern:

```tsx
<div role="tablist" aria-label="Settings sections">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={activeTab === tab.id}
      aria-controls={`panel-${tab.id}`}
      onClick={() => setActiveTab(tab.id)}
      onKeyDown={(e) => {
        // Arrow key navigation between tabs
        const idx = tabs.findIndex(t => t.id === tab.id);
        if (e.key === 'ArrowRight') {
          const next = tabs[(idx + 1) % tabs.length];
          document.getElementById(`tab-${next.id}`)?.focus();
        } else if (e.key === 'ArrowLeft') {
          const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
          document.getElementById(`tab-${prev.id}`)?.focus();
        }
      }}
    >
      {tab.label}
    </button>
  ))}
</div>

{/* Tab panels */}
<div
  role="tabpanel"
  id={`panel-${activeTab}`}
  aria-labelledby={`tab-${activeTab}`}
  tabIndex={0}
>
  {/* panel content */}
</div>
```

---

### C3. ProfileSettingsPage Password Inputs — No Labels

- **WCAG:** 1.3.1 Info and Relationships (Level A), 3.3.2 Labels or Instructions (Level A)
- **File:** `frontend/src/pages/ProfileSettingsPage.tsx:341-354`
- **Impact:** Screen readers announce these as unlabeled password fields.

```tsx
// Current: no label, only placeholder
<input type="password" placeholder="Current password" ... />
<input type="password" placeholder="New password" ... />
<input type="password" placeholder="Confirm new password" ... />
```

**Fix:** Add visible `<label>` elements with `htmlFor`:

```tsx
<div className="space-y-2">
  <label htmlFor="current-password" className="text-sm font-medium text-slate-300">
    Current password
  </label>
  <input id="current-password" type="password" ... />
</div>
<div className="space-y-2">
  <label htmlFor="new-password" className="text-sm font-medium text-slate-300">
    New password
  </label>
  <input id="new-password" type="password" autoComplete="new-password" ... />
</div>
<div className="space-y-2">
  <label htmlFor="confirm-password" className="text-sm font-medium text-slate-300">
    Confirm new password
  </label>
  <input id="confirm-password" type="password" autoComplete="new-password" ... />
</div>
```

---

### C4. ConfirmModal — No Focus Trap

- **WCAG:** 2.4.3 Focus Order (Level A)
- **File:** `frontend/src/components/ui/ConfirmModal.tsx`
- **Impact:** Tab key moves focus outside the modal to background content, trapping keyboard users.

The modal has `role="alertdialog"` and `aria-modal="true"` but does not implement a focus trap. The Escape handler exists, but Tab can escape the modal boundary.

**Fix:** Add focus trap (reuse the existing `useFocusTrap` hook from ShareModal):

```tsx
import { useFocusTrap } from '../../hooks/useFocusTrap';

// Inside component:
const trapRef = useFocusTrap<HTMLDivElement>({
  active: isOpen,
  onEscape: onClose,
  autoFocusDelay: 150,
});

// Apply to modal div:
<motion.div ref={trapRef} ... >
```

---

## Serious Violations (Fix Before Merge)

### S1. DailyBriefingPage Toggle Switches — Missing aria-label

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/pages/DailyBriefingPage.tsx:331-346`
- **Impact:** Screen readers announce "switch, not checked" with no name — user doesn't know what the toggle controls.

The toggle label text ("Daily briefing", "Transit alerts", "Full moon") is in a sibling `<span>`, not associated with the switch button.

**Fix:** Add `aria-label` to each toggle button:

```tsx
<button
  type="button"
  role="switch"
  aria-checked={notifications[item.key]}
  aria-label={item.label}
  onClick={() => toggleNotification(item.key)}
  ...
>
```

---

### S2. DailyBriefingPage Energy Bars — Missing progressbar Role

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/pages/DailyBriefingPage.tsx:366-380`
- **Impact:** Screen readers cannot announce energy level values.

```tsx
// Current: plain div with width animation
<div className="h-2 w-full rounded-full bg-[#0B0D17]">
  <motion.div className={`h-2 rounded-full ${bar.color}`}
    initial={{ width: 0 }}
    animate={{ width: `${bar.value}%` }} />
</div>
```

**Fix:** Add `role="progressbar"` with ARIA attributes:

```tsx
<div
  className="h-2 w-full rounded-full bg-[#0B0D17]"
  role="progressbar"
  aria-valuenow={bar.value}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${bar.label} energy: ${bar.value}%`}
>
  <motion.div ... />
</div>
```

---

### S3. DashboardPage Energy Levels — Color-Only Indicators

- **WCAG:** 1.4.1 Use of Color (Level A)
- **File:** `frontend/src/pages/DashboardPage.tsx:357-363`
- **Impact:** Energy status (High/Moderate/Low) is conveyed by color AND text, but the trending icon changes are color-only in some contexts.

The text labels ("High", "Moderate", "Low") are present alongside the color, which is good. However, the trend icons (`trending_up`, `remove`, `trending_down`) use the same color as the text, and the icon choice is redundant with text.

**Status:** Partially compliant — text labels exist. Ensure the trend icon is announced via `aria-hidden="true"` (decorative) since the text label conveys the meaning.

---

### S4. ProfileSettingsPage Theme/Density Selectors — No Radiogroup Pattern

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/pages/ProfileSettingsPage.tsx:440-520`
- **Impact:** Screen readers cannot identify these as mutually exclusive selection groups.

Three groups of buttons (Theme, Density, Sidebar Position) behave as radio groups but use plain `<button>` elements without `role="radiogroup"` / `role="radio"` / `aria-checked`.

**Fix:**

```tsx
<div role="radiogroup" aria-label="Theme">
  {(['light', 'dark', 'system'] as const).map((theme) => (
    <button
      key={theme}
      role="radio"
      aria-checked={appearance.theme === theme}
      onClick={() => setAppearance(prev => ({ ...prev, theme }))}
      ...
    >
      ...
    </button>
  ))}
</div>
```

Apply the same pattern to Density and Sidebar Position groups.

---

### S5. ShareModal Visibility Selector — No Radiogroup Pattern

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/components/ui/ShareModal.tsx:274-425`
- **Impact:** Screen readers cannot identify Public/Private/Password as a mutually exclusive selection.

The visibility options use custom-styled buttons with visual radio dots but no ARIA roles.

**Fix:** Add `role="radiogroup"` on the container and `role="radio"` + `aria-checked` on each option button.

---

### S6. ShareModal Expiry Dropdown — No Listbox Pattern

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **File:** `frontend/src/components/ui/ShareModal.tsx:544-568`
- **Impact:** Screen readers cannot navigate the expiry options as a list.

**Fix:** Add `role="listbox"` on the dropdown container and `role="option"` + `aria-selected` on each option button.

---

### S7. AppLayout — All Navigation Icons Use lucide-react

- **WCAG:** 1.1.1 Non-text Content (Level A) — icon consistency for accessibility
- **File:** `frontend/src/components/AppLayout.tsx`
- **Impact:** 14 lucide-react icon instances across sidebar, top nav, and mobile bottom nav. Tracked separately in `ICON_MIGRATION_SPEC.md`.

While lucide icons themselves are accessible (SVG-based), the migration to Material Symbols is a design system requirement. Some icons lack `aria-hidden="true"` on decorative SVG instances.

---

### S8. DashboardPage Loading States — No aria-live Region

- **WCAG:** 4.1.3 Status Messages (Level AA)
- **File:** `frontend/src/pages/DashboardPage.tsx:484-487`
- **Impact:** Screen readers are not notified when transit data finishes loading.

```tsx
// Current:
<div className="text-center py-8 text-slate-400">Loading transits...</div>
```

**Fix:** Add `aria-live="polite"` to the transit loading container:

```tsx
<div className="space-y-4" aria-live="polite" aria-busy={transitsLoading}>
  {transitsLoading ? (
    <div className="text-center py-8 text-slate-400" role="status">
      Loading transits...
    </div>
  ) : ...}
</div>
```

---

### S9. AppLayout Dropdown Menu — Missing Keyboard Navigation

- **WCAG:** 2.1.1 Keyboard (Level A)
- **File:** `frontend/src/components/AppLayout.tsx:186-221`
- **Impact:** Dropdown menu items cannot be navigated with arrow keys per the ARIA menu pattern.

The dropdown uses `role="menu"` and `role="menuitem"` but doesn't implement arrow key focus management between items.

**Fix:** Add `onKeyDown` handler on the menu container for ArrowDown/ArrowUp/Home/End navigation between menu items.

---

## Moderate Violations

### M1. DashboardPage — No h1 Heading

- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **File:** `frontend/src/pages/DashboardPage.tsx:281`
- **Current:** `<h2>` used for "Welcome back" heading.
- **Fix:** Change to `<h1>` since this is the page's primary heading.

### M2. DailyBriefingPage — No h1 Heading

- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **File:** `frontend/src/pages/DailyBriefingPage.tsx:203`
- **Current:** `<h1>` used — this is correct. No fix needed.

### M3. LoginPageNew — Undefined CSS Class `text-accent-gold`

- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **File:** `frontend/src/pages/LoginPageNew.tsx:83`
- **Impact:** Icon may render with default/invisible color on dark background.
- **Fix:** Replace `text-accent-gold` with `text-amber-400`.

### M4. ProfileSettingsPage — Undefined CSS Class `text-gold`

- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **File:** `frontend/src/pages/ProfileSettingsPage.tsx:145`
- **Fix:** Replace `text-gold` with `text-amber-400`.

### M5. ProfileSettingsPage Save Status — No aria-live

- **WCAG:** 4.1.3 Status Messages (Level AA)
- **File:** `frontend/src/pages/ProfileSettingsPage.tsx:313-321`
- **Impact:** Screen readers are not notified when save completes or fails.
- **Fix:** Wrap save status feedback in a `role="status"` or `aria-live="polite"` region.

### M6. AppLayout Notification Button — Badge Color-Only

- **WCAG:** 1.4.1 Use of Color (Level A)
- **File:** `frontend/src/components/AppLayout.tsx:160`
- **Impact:** Red notification dot is color-only — no accessible name or text alternative.
- **Fix:** Add `aria-label` indicating notification count: `aria-label="1 unread notification"`.

### M7. ConfirmModal — lucide-react Icons

- **File:** `frontend/src/components/ui/ConfirmModal.tsx`
- **Impact:** 3 lucide-react instances (AlertTriangle, X, Trash2). Tracked in ICON_MIGRATION_SPEC.

### M8. ShareModal — lucide-react Icons

- **File:** `frontend/src/components/ui/ShareModal.tsx`
- **Impact:** 9 lucide-react instances. Tracked in ICON_MIGRATION_SPEC.

### M9. LoginPageNew — Social Login Buttons Lack Focus Ring

- **WCAG:** 2.4.7 Focus Visible (Level AA)
- **File:** `frontend/src/pages/LoginPageNew.tsx:334-364`
- **Impact:** Social login buttons use `ring-white/10` which may not have sufficient contrast against the dark background.
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

### M10. DailyBriefingPage — 9 lucide-react Icons

- **File:** `frontend/src/pages/DailyBriefingPage.tsx`
- **Impact:** Already tracked in ICON_MIGRATION_SPEC.md.

### M11. DashboardPage Quick Actions — Theme Drift

- **File:** `frontend/src/pages/DashboardPage.tsx:639`
- **Impact:** Uses `bg-indigo-500/20 text-indigo-400` for Calendar quick action — should use design-system accent color.

### M12. AppLayout `<main tabIndex={-1}>`

- **File:** `frontend/src/components/AppLayout.tsx:67`
- **Impact:** Adding `tabIndex={-1}` to main allows focus via skip link but can cause unexpected behavior for screen readers.
- **Recommendation:** Keep it — this is a valid pattern for skip-link targets per WAI-ARIA best practices.

---

## Low Violations

### L1. LoginPageNew — `text-primary-200` Undefined Class

- **File:** `frontend/src/pages/LoginPageNew.tsx:141,170`
- **Impact:** Text may render as default white instead of intended muted violet.
- **Fix:** Replace with `text-violet-300`.

### L2. DashboardPage — Decorative Emoji in Heading

- **File:** `frontend/src/pages/DashboardPage.tsx:282`
- **Impact:** The "✨" emoji in "Welcome back, {name} ✨" may be announced oddly by screen readers.
- **Fix:** Wrap in `<span aria-hidden="true">✨</span>`.

### L3. ShareModal — QR Code Lacks Accessible Description

- **File:** `frontend/src/components/ui/ShareModal.tsx:515-518`
- **Impact:** QR code placeholder has no alt text or accessible name.
- **Fix:** Add `role="img"` and `aria-label="QR code for sharing"` to the QR container.

### L4. ConfirmModal — Disabled State Not Announced

- **File:** `frontend/src/components/ui/ConfirmModal.tsx:329`
- **Impact:** The confirm button stays disabled until user types "DELETE". The disabled state change is not announced.
- **Fix:** Add `aria-live="polite"` to a status region that announces when the button becomes enabled.

---

## Files to Modify

| File | Critical | Serious | Moderate | Low | Total |
|------|----------|---------|----------|-----|-------|
| `pages/DashboardPage.tsx` | 1 | 2 | 2 | 1 | 6 |
| `pages/ProfileSettingsPage.tsx` | 2 | 1 | 2 | 0 | 5 |
| `pages/DailyBriefingPage.tsx` | 0 | 2 | 1 | 0 | 3 |
| `pages/LoginPageNew.tsx` | 0 | 0 | 2 | 1 | 3 |
| `components/ui/ConfirmModal.tsx` | 1 | 0 | 1 | 1 | 3 |
| `components/ui/ShareModal.tsx` | 0 | 2 | 1 | 1 | 4 |
| `components/AppLayout.tsx` | 0 | 2 | 2 | 0 | 4 |
| **Total** | **4** | **9** | **11** | **4** | **28** |

---

## Remediation Priority

### Immediate (Critical — Block Release)
1. **C1:** Add keyboard support to Dashboard chart card `<div onClick>` elements
2. **C2:** Implement ARIA tabs pattern on ProfileSettingsPage
3. **C3:** Add labels to ProfileSettingsPage password inputs
4. **C4:** Add focus trap to ConfirmModal (reuse `useFocusTrap` hook)

### Short-term (Serious — Fix Before Merge)
1. **S1:** Add `aria-label` to DailyBriefingPage toggle switches
2. **S2:** Add `role="progressbar"` to DailyBriefingPage energy bars
3. **S4:** Add radiogroup pattern to ProfileSettingsPage selectors
4. **S5-S6:** Add radiogroup/listbox pattern to ShareModal controls
5. **S8:** Add `aria-live` to Dashboard loading states
6. **S9:** Add keyboard arrow navigation to AppLayout dropdown menu

### Medium-term (Moderate)
1. Fix undefined CSS classes (`text-accent-gold`, `text-gold`, `text-primary-200`)
2. Add `aria-live` for save status feedback
3. Fix notification badge accessibility
4. Consolidate lucide-react icons per ICON_MIGRATION_SPEC

---

## Related Documents

- `docs/features/ICON_MIGRATION_SPEC.md` — Full lucide/heroicon → Material Symbols migration plan
- `docs/features/CHART_CARD_AUDIT.md` — 17 undefined CSS classes in chart card components
- `docs/features/DAILY_BRIEFING_GAP_ANALYSIS.md` — Design fidelity audit (3/5 score)
- `docs/archive/ACCESSIBILITY_AUDIT_REPORT.md` — Previous audit from 2026-02-19 (73% compliance)
