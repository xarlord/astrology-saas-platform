# AstroVerse Design System

Complete design system foundation for the AstroVerse UI overhaul.

## Files Created

### 1. Tailwind Configuration
**File:** `tailwind.config.js`

Custom Tailwind configuration with:
- **Custom Colors:**
  - Primary: `#6b3de1`
  - Cosmic Blue: `#2563EB`
  - Accent Gold: `#F5A623`
  - Dark backgrounds and surfaces
  - Zodiac element colors (fire, earth, air, water)
  - Planet colors
  - Aspect colors

- **Custom Fonts:**
  - Space Grotesk (display)
  - Noto Sans (body)
  - Epilogue (special)

- **Custom Animations:**
  - float: Gentle floating animation
  - drift: Side-to-side movement
  - pulse-glow: Pulsing glow effect
  - spin-slow: Slow rotation
  - shimmer: Loading shimmer effect
  - twinkle: Star twinkling effect

- **Custom Shadows:**
  - Glass shadow for glassmorphism
  - Glow effects for emphasis
  - Inner glow for depth

### 2. Global Styles
**File:** `src/assets/styles/globals.css`

Comprehensive global CSS with:
- **CSS Variables (Design Tokens):**
  - All colors defined as custom properties
  - Typography scale
  - Spacing scale
  - Border radius values
  - Shadow definitions
  - Animation durations

- **Utility Classes:**
  - `.glass-card` - Glassmorphism card
  - `.glass-btn` - Glassmorphism button
  - `.glass-input` - Glassmorphism input
  - `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.btn-ghost`
  - `.card` - Base card component
  - `.input` - Base input component
  - `.badge-*` - Badge variants
  - `.spinner` - Loading spinner

- **Glassmorphism Styles:**
  - Background blur effects
  - Transparent backgrounds
  - Subtle borders
  - Layered shadows

- **Accessibility:**
  - WCAG 2.1 AA compliant focus indicators
  - Skip navigation link
  - Screen reader utilities
  - Proper contrast ratios

- **Custom Scrollbar:**
  - Styled for dark theme
  - Smooth hover effects

### 3. Constants File
**File:** `src/utils/constants.ts`

TypeScript constants for use in components:
- `colors` - Complete color palette
- `typography` - Font families, sizes, weights
- `spacing` - Spacing scale
- `borders` - Border radius and widths
- `effects` - Shadows, blurs, transitions
- `breakpoints` - Responsive breakpoints
- `zIndex` - Z-index scale
- `astrology` - Zodiac signs, planets, aspects
- `layout` - Container widths, header heights
- `forms` - Input heights, validation
- `animations` - Duration, easing, presets
- `api` - Base URL, endpoints
- `subscriptionTiers` - Subscription levels

### 4. Animation Variants
**File:** `src/assets/animations/framer-motion.ts`

Framer Motion animation presets:
- **Fade Variants:** fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
- **Slide Variants:** slideUp, slideDown, slideLeft, slideRight
- **Scale Variants:** scaleIn, scaleOut, scaleAndRotate
- **Stagger Variants:** staggerContainer, staggerFadeIn, staggerSlideIn
- **Component Variants:** modal, dropdown, accordion, tabs, list
- **Interactive Variants:** cardHover, buttonTap, buttonShine
- **Loading Variants:** spinner, pulse, shimmer, dotPulse
- **Astrology Variants:** planetOrbit, planetPulse, zodiacGlow, moonPhase, chartWheel
- **Utility Functions:** createStagger, createFadeInDirection, createScale

All animations optimized for 60fps performance.

## Usage Examples

### Using Tailwind Classes

```tsx
// Primary button
<button className="btn-primary">Click Me</button>

// Glass card
<div className="glass-card">
  <h2>Title</h2>
  <p>Content</p>
</div>

// Custom colors
<div className="bg-primary-600 text-white">Primary</div>
<div className="bg-cosmic-blue-600 text-white">Cosmic Blue</div>
<div className="bg-accent-gold-500 text-white">Gold</div>

// Typography
<h1 className="font-display text-4xl">Display Heading</h1>
<p className="font-body text-base">Body text</p>

// Animations
<div className="animate-float">Floating element</div>
<div className="animate-pulse-glow">Pulsing glow</div>
```

### Using CSS Variables

```tsx
// In styled components or inline styles
const style = {
  color: 'var(--color-primary)',
  background: 'var(--color-glass-bg)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--border-radius-lg)',
};
```

### Using Constants

```tsx
import { colors, spacing, typography } from '@/utils/constants';

// TypeScript constants
const theme = {
  primary: colors.primary.DEFAULT,
  padding: spacing.lg,
  fontSize: typography.fontSize.xl,
};
```

### Using Framer Motion

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/assets/animations/framer-motion';

// Fade in animation
<motion.div
  variants={fadeInUp}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>;

// Stagger children
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerFadeInUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>;
```

## Dark Mode

Dark mode is enabled via class strategy:

```tsx
// Add dark class to html element
document.documentElement.classList.add('dark');

// Remove dark class
document.documentElement.classList.remove('dark');

// Or use Tailwind's dark mode modifier
<div className="dark:bg-background-dark dark:text-white">
  Dark mode content
</div>
```

## Color Palette

### Primary Colors
- **Primary:** `#6b3de1` - Main brand color
- **Cosmic Blue:** `#2563EB` - Secondary accent
- **Accent Gold:** `#F5A623` - Highlight color

### Zodiac Elements
- **Fire:** `#EF4444` - Aries, Leo, Sagittarius
- **Earth:** `#10B981` - Taurus, Virgo, Capricorn
- **Air:** `#3B82F6` - Gemini, Libra, Aquarius
- **Water:** `#6366F1` - Cancer, Scorpio, Pisces

### Semantic Colors
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`
- **Info:** `#3B82F6`

## Typography

### Font Families
- **Display:** Space Grotesk - Headings and titles
- **Body:** Noto Sans - Body text and UI
- **Special:** Epilogue - Special occasions

### Font Scale
- **XS:** 12px - Captions, labels
- **SM:** 14px - Small text
- **Base:** 16px - Body text
- **LG:** 18px - Emphasized text
- **XL:** 20px - Subheadings
- **2XL:** 24px - Section headings
- **3XL:** 30px - Page headings
- **4XL:** 36px - Large titles
- **5XL:** 48px - Hero titles

## Spacing Scale

- **XS:** 4px - Tight spacing
- **SM:** 8px - Small spacing
- **MD:** 16px - Default spacing
- **LG:** 24px - Comfortable spacing
- **XL:** 32px - Large spacing
- **2XL:** 48px - Extra large spacing
- **3XL:** 64px - Section spacing

## Accessibility

The design system follows WCAG 2.1 AA guidelines:

- **Contrast Ratio:** Minimum 4.5:1 for normal text
- **Focus Indicators:** Visible 2px outline on all interactive elements
- **Skip Links:** Keyboard navigation support
- **Screen Readers:** ARIA labels and semantic HTML
- **Keyboard Navigation:** All elements accessible via keyboard

## Performance

All animations are optimized for 60fps:
- CSS transforms for position and scale
- Opacity for fade effects
- Will-change hints for animated elements
- Hardware acceleration via transform3d

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome for Android

## Next Steps

With the design system in place, you can now:

1. Build base UI components (Button, Input, Select, etc.)
2. Create astrology-specific components (ChartWheel, MoonPhaseCard, etc.)
3. Implement page layouts using the design tokens
4. Add animations using Framer Motion variants
5. Apply glassmorphism effects for premium look

## Build Status

✅ All files created successfully
✅ Build passes without errors
✅ Dark mode configured
✅ Google Fonts integrated
✅ Design tokens exported
✅ Animation variants ready

---

**Created:** 2026-02-21
**Version:** 1.0.0
**Status:** Production Ready
