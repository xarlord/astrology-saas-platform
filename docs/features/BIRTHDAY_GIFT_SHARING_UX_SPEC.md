# Birthday Gift Sharing — UX Design Specification

**Date:** 2026-04-04
**Designer:** UX Designer 2
**Parent Feature:** `docs/features/FEATURE_SPEC_BIRTHDAY_GIFT_SHARING.md`
**Status:** Ready for Frontend Engineer

---

## Overview

Three UI surfaces for the birthday gift sharing feature:

1. **Gift Purchase Wizard** — 4-step wizard for purchasing a solar return reading gift
2. **Gift Claim Page** — Public page for recipients to claim their gift
3. **Sent Gifts Management** — Settings section to manage sent gifts

All surfaces follow the AstroVerse cosmic dark theme and reuse patterns from `ChartCreationWizardPage`.

---

## Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| Card bg | `bg-[#141627]/70 backdrop-blur-md` | Wizard form card |
| Surface | `bg-surface-dark/50` | Input backgrounds |
| Border | `border-white/10` | Standard borders |
| Primary | `bg-primary` / `text-primary` | CTAs, active states |
| Gold | `#F5A623` / `text-gold` | Gift accent color |
| Success | `text-emerald-400` | Confirmed states |
| Warning | `text-amber-400` | Expiring states |
| Danger | `text-red-400` | Expired/error states |

**Gift accent:** Gold (`#F5A623`) is the primary gift brand color, used for gift cards, icons, and festive elements. It differentiates gift flows from standard app interactions.

---

## Surface 1: Gift Purchase Wizard

### Entry Point

From the **Solar Returns** page or **Dashboard**, add a "Gift a Reading" CTA:

```
+--------------------------------------------------+
|  Solar Returns            [Share] [Gift a Reading]|
+--------------------------------------------------+
```

Button style: `bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30`
Icon: `<span className="material-symbols-outlined">card_giftcard</span>`

### Wizard Layout

Reuse the `ChartCreationWizardPage` layout pattern: step indicator at top, form card left, preview panel right.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    ① Recipient    ② Message    ③ Product    ④ Confirm          │
│    ●──────────────●─────────────●─────────────○                 │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────┐        │
│  │                          │  │                      │        │
│  │  [FORM CARD]             │  │  [PREVIEW PANEL]     │        │
│  │  Step content here       │  │  Gift card preview   │        │
│  │                          │  │  Updates live        │        │
│  │                          │  │                      │        │
│  ├──────────────────────────┤  │                      │        │
│  │  [Cancel]    [Next →]    │  │                      │        │
│  └──────────────────────────┘  └──────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Page route:** `/gift/new`
**Step indicator:** Same component as ChartCreationWizardPage with Material Symbols icons.

### Step 1: Recipient Information

```
STEPS = [
  { number: 1, title: 'Recipient', icon: 'person' },
  { number: 2, title: 'Message', icon: 'mail' },
  { number: 3, title: 'Select Gift', icon: 'card_giftcard' },
  { number: 4, title: 'Confirm', icon: 'check_circle' },
]
```

**Form fields:**

| Field | Type | Required | Placeholder |
|-------|------|----------|-------------|
| Recipient name | text input | Yes | "e.g., Jane Smith" |
| Recipient email | email input | Yes | "jane@example.com" |
| Birth date | CustomDatePicker | Yes | "Select date of birth" |
| Birth time | time input | No | "--:--" |
| Time unknown | Checkbox | No | "Time unknown" |
| Birth location | location input | Yes | "Enter city, state/province, country" |

**Reuse:** Birth data fields reuse the same pattern from ChartCreationWizardPage Step 2 (CustomDatePicker, location input with icon, time unknown checkbox).

**Validation:** Name + email + date + location required to proceed.

**Preview panel right side:**
- Recipient name and email displayed
- Zodiac sign calculated from birth date (with element-colored badge)
- "Birth data needed" placeholder when incomplete

### Step 2: Personal Message & Delivery

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Delivery date | CustomDatePicker | Yes | Defaults to recipient's birthday, can be changed |
| Personal message | textarea | No | Max 500 chars, character count displayed |
| Send immediately | Checkbox | No | Overrides delivery date, sends on purchase |

**Delivery date section:**

```
┌──────────────────────────────────────────────┐
│  📅 Deliver on their birthday               │
│  May 15, 2026 (suggested)                     │
│  ───────────────────── or ────────────────── │
│  [ ] Choose a different date                  │
│  [ ] Send immediately after purchase          │
└──────────────────────────────────────────────┘
```

The birthday suggestion is shown as a highlighted card with gold accent. Users can override with a different date or send immediately.

**Message textarea:**
```
<textarea
  placeholder="Happy Birthday! I thought you'd enjoy a personalized solar return reading..."
  maxLength={500}
  className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10
             text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1
             focus:ring-primary transition-all resize-none min-h-[120px]"
/>
<p className="text-xs text-slate-500 text-right">{count}/500</p>
```

### Step 3: Product Selection

Three gift products displayed as selection cards:

```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ ☀️ Solar Return      │ │ ⭐ SR + Transits     │ │ 👑 Premium Bundle    │
│                     │ │                     │ │                     │
│ Full year solar     │ │ Solar return +      │ │ Solar return +      │
│ return reading      │ │ 3 months transit    │ │ synastry + 6 months │
│                     │ │ updates             │ │ transit updates     │
│                     │ │                     │ │                     │
│     $19.99          │ │     $29.99          │ │     $49.99          │
│                     │ │                     │ │     BEST VALUE      │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

**Card styling (unselected):**
```
bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6
```

**Card styling (selected):**
```
bg-primary/10 border-2 border-primary rounded-2xl p-6 shadow-[0_0_20px_rgba(107,61,225,0.2)]
```

**"Best Value" badge** on Premium Bundle:
```
bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30
```

Each card includes:
- Material Symbol icon (light_mode, auto_awesome, workspace_premium)
- Product name (Space Grotesk, text-xl, white)
- Description (text-sm, text-slate-400)
- Price (text-2xl, font-bold, white)
- Feature bullets (text-sm, text-slate-300, with check_circle icons)

### Step 4: Confirmation & Payment

**Summary card:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Gift Summary                                    │
│                                                  │
│  🎁 Solar Return Reading                         │
│  For: Jane Smith (jane@example.com)              │
│  Born: May 15, 1990 · New York, NY              │
│  Deliver: May 15, 2026                           │
│                                                  │
│  "Happy Birthday! I thought you'd enjoy..."      │
│                                                  │
│  ────────────────────────────────────────        │
│                                                  │
│  Total: $19.99                                   │
│                                                  │
│  [Complete Purchase]                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Purchase button:**
```
bg-gold hover:bg-gold/90 text-background-dark font-bold shadow-[0_0_20px_rgba(245,166,35,0.3)]
```

Uses gold color (not primary) to visually distinguish gift purchase from standard actions. Clicking redirects to Stripe Checkout.

### Post-Purchase: Success State

After Stripe redirect back with `?status=success`:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│            🎉                                    │
│    <span material-symbols-outlined>check_circle</span>            │
│    Gift Sent Successfully!                       │
│                                                  │
│    Your gift to Jane Smith has been scheduled    │
│    for delivery on May 15, 2026.                 │
│                                                  │
│    Gift code: SUN2026-ABCD1234                   │
│                                                  │
│    [View My Gifts]  [Send Another]               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Surface 2: Gift Claim Page

### Route

`/gift/claim/:code` — Public page (no auth required). Layout uses AppLayout but with a simplified header.

### States

| State | UI |
|-------|-----|
| **Loading** | Skeleton shimmer over gift card |
| **Valid** | Gift card with claim form |
| **Expired** | Expired message with "Expired" badge |
| **Already claimed** | "Already claimed" message with link to reading |
| **Invalid code** | 404-style page |
| **Claiming** | Spinner on claim button |

### Valid Gift Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         ✨ ASTROVERSE                                    │
│         <span material-symbols-outlined>auto_awesome</span>            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │  🌟 You received a gift!                        │    │
│  │                                                 │    │
│  │  John sent you a Solar Return Reading           │    │
│  │  for 2026                                       │    │
│  │                                                 │    │
│  │  "Happy Birthday! I thought you'd enjoy a       │    │
│  │   personalized solar return reading."           │    │
│  │                                                 │    │
│  │  ☀️ Solar Return Reading                         │    │
│  │  • Complete year-ahead forecast                 │    │
│  │  • Key themes and focus areas                   │    │
│  │  • Important dates to watch                     │    │
│  │                                                 │    │
│  │  ────────────────────────────────────           │    │
│  │                                                 │    │
│  │  Email: jane@example.com                        │    │
│  │  Password: [___________]  (optional)            │    │
│  │                                                 │    │
│  │  [Claim Your Gift]                              │    │
│  │                                                 │    │
│  │  Expires in 87 days                             │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│              astroverse.app                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Gift card container:**
```
bg-[#141627]/70 backdrop-blur-md border border-gold/20 rounded-2xl p-8 max-w-lg mx-auto
```

The gold border (`border-gold/20`) differentiates this from standard app cards. The ambient glow uses gold:
```
<div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[100px]" />
```

**Claim button:**
```
bg-gold hover:bg-gold/90 text-background-dark font-bold w-full py-3
```

**Claim flow:**
1. User enters email (pre-filled from gift data) and optional password
2. If no account exists and password provided: creates account + claims
3. If account exists: logs in + claims
4. If no password: claims without account (guest access)
5. On success: redirect to reading with confetti animation

**Account creation note:**
```
<div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
  <span material-symbols-outlined>info</span>
  <p className="text-xs text-slate-300">
    Create a free account to save your reading and access it anytime.
    Or claim without an account — your reading link will be valid for 30 days.
  </p>
</div>
```

### Claim Success State

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ✅ Gift Claimed!                               │
│                                                 │
│  Your Solar Return Reading for 2026             │
│  is being generated...                          │
│                                                 │
│  [progress bar animation]                       │
│                                                 │
│  [View My Reading →]                            │
│                                                 │
│  Want to explore more? [Create Free Account]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Expired State

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⏰ This gift has expired                       │
│                                                 │
│  This Solar Return Reading gift from John       │
│  expired on Aug 13, 2026.                       │
│                                                 │
│  The sender has been notified and may be        │
│  eligible for a refund.                         │
│                                                 │
│  [Explore AstroVerse →]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Surface 3: Sent Gifts Management

### Location

Settings page > new tab "Gifts" (added alongside existing Profile/Account/Subscription/Appearance tabs).

```
tabs = [
  { id: 'profile', label: 'Personal Info', icon: 'person' },
  { id: 'account', label: 'Account', icon: 'lock' },
  { id: 'subscription', label: 'Subscription', icon: 'credit_card' },
  { id: 'gifts', label: 'Gifts', icon: 'card_giftcard' },        // NEW
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
];
```

### Gift List Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Your Gifts                                        [Gift a Reading]│
│  Share cosmic insights with friends and family                     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Jane Smith                    May 15, 2026                │   │
│  │  Solar Return Reading          $19.99                      │   │
│  │                                                            │   │
│  │  [🟢 Delivered]                            [Resend Email]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Bob Johnson                  Apr 1, 2026                  │   │
│  │  Premium Bundle               $49.99                      │   │
│  │                                                            │   │
│  │  [✅ Claimed]                              [View Reading]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Alice Williams               Mar 10, 2026                 │   │
│  │  Solar Return Reading          $19.99                      │   │
│  │                                                            │   │
│  │  [⏰ Expired]                              [Refund Info]   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Status Badges

| Status | Badge Style | Icon |
|--------|-----------|------|
| `scheduled` | `bg-primary/10 text-primary border-primary/20` | `schedule` |
| `delivered` | `bg-blue-500/10 text-blue-400 border-blue-500/20` | `mail` |
| `claimed` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` | `check_circle` |
| `completed` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` | `verified` |
| `expired` | `bg-red-500/10 text-red-400 border-red-500/20` | `schedule` |
| `refunded` | `bg-slate-500/10 text-slate-400 border-slate-500/20` | `money_off` |

### Actions Per Status

| Status | Actions |
|--------|---------|
| `scheduled` | Cancel Gift (danger) |
| `delivered` | Resend Email |
| `claimed` | View Reading |
| `completed` | View Reading |
| `expired` | Refund Info (links to support) |
| `refunded` | None |

### Empty State

```
<div className="text-center py-12">
  <span className="material-symbols-outlined text-5xl text-gold/30 mb-4">card_giftcard</span>
  <h3 className="text-lg font-bold text-white mb-2">No gifts sent yet</h3>
  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
    Share a personalized solar return reading with someone special.
  </p>
  <Button variant="primary" leftIcon={<span className="material-symbols-outlined text-[18px]">card_giftcard</span>}>
    Gift a Reading
  </Button>
</div>
```

---

## Interaction Specifications

### Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Step transitions | Slide left/right with crossfade | 250ms ease |
| Product card selection | Scale to 1.02 + border glow | 150ms |
| Gift card reveal (claim page) | Fade in + scale from 0.95 | 400ms ease-out |
| Claim success | Confetti burst (6 particles) | 1500ms |
| Status badge change | Fade swap | 200ms |

### Form Validation

- Inline validation on blur for required fields
- Error styling: `border-red-500/50 text-red-400` with `error` icon
- "Next" button disabled until step is valid
- Email validation: standard email regex

### Responsive Behavior

| Viewport | Wizard | Claim Page |
|----------|--------|------------|
| Desktop (≥1024px) | Two-column: form + preview panel | Centered card, max-w-lg |
| Tablet (768-1023px) | Full-width form, preview below | Centered card, max-w-lg |
| Mobile (<768px) | Full-width form, no preview panel | Full-width card with 16px padding |

### Error States

| Scenario | UI |
|----------|-----|
| Payment failed | Red error banner at top of Step 4: "Payment could not be processed. Please try again." |
| Network error | Toast: "Something went wrong. Please check your connection." |
| Invalid birth data | Inline error on birth fields: "Please enter a valid date." |
| Gift already claimed | Claim page shows "Already Claimed" state |
| Gift code invalid | Claim page shows "Gift Not Found" with search icon |

---

## Component Architecture

```
GiftPurchasePage (route: /gift/new)
├── AppLayout
├── WizardStepIndicator (reuse from ChartCreationWizard)
├── StepLayout (form card + preview panel)
│   ├── RecipientStep (Step 1)
│   │   ├── CustomDatePicker (reuse)
│   │   ├── Checkbox (reuse)
│   │   └── LocationInput (reuse pattern)
│   ├── MessageStep (Step 2)
│   │   └── DeliveryDatePicker
│   ├── ProductStep (Step 3)
│   │   └── GiftProductCard (3 instances)
│   └── ConfirmStep (Step 4)
│       └── GiftSummary
└── GiftPreviewPanel (right side, live preview)

GiftClaimPage (route: /gift/claim/:code)
├── AppLayout
├── GiftCardContainer (gold border, ambient glow)
│   ├── GiftHeader (sender info, icon)
│   ├── GiftMessage (personal message)
│   ├── GiftDetails (product features)
│   ├── ClaimForm (email + password)
│   └── GiftExpiry (countdown)
└── ClaimSuccess (post-claim state)

ProfileSettingsPage (updated: add Gifts tab)
├── GiftList (sent gifts)
│   └── GiftListItem (per gift)
├── EmptyGiftState
└── GiftActions (resend, view, cancel)
```

### Key Components to Create

| Component | File | Reuses |
|-----------|------|--------|
| `GiftPurchasePage` | `pages/GiftPurchasePage.tsx` | ChartCreationWizardPage layout |
| `GiftClaimPage` | `pages/GiftClaimPage.tsx` | AppLayout, Button |
| `GiftProductCard` | `components/gift/GiftProductCard.tsx` | Card pattern |
| `GiftPreviewPanel` | `components/gift/GiftPreviewPanel.tsx` | Preview panel pattern |
| `GiftListItem` | `components/gift/GiftListItem.tsx` | Status badge pattern |

---

## Entry Points Summary

| Entry Point | Location | Action |
|-------------|----------|--------|
| Solar Returns page | Header CTA button | Navigate to `/gift/new` |
| Dashboard | Quick action card | Navigate to `/gift/new` |
| Gift email | "Claim Your Gift" button | Navigate to `/gift/claim/:code` |
| Settings > Gifts | Tab | Show sent gifts list |
| Direct link | `/gift/new` | Open wizard |

---

## Email Template Visual Alignment

The existing email template in the feature spec uses generic gradient colors (`#667eea`, `#764ba2`) and generic green button. Update to use AstroVerse design tokens:

```
Gift header background: linear-gradient(135deg, #6b3de1 0%, #5a32c0 100%)
Gift header text: #ffffff
Gift body background: #f9f9f9 (keep light for email compatibility)
Claim button background: #F5A623 (gold)
Claim button text: #0B0D17
Gift code text: #6b3de1
Expiry text: #a0aec0
```

This ensures the email experience matches the app's visual identity.
