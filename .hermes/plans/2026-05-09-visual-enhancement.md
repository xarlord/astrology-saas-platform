# AstroVerse Visual Enhancement — Full Implementation Plan

> **For Hermes:** Execute each phase sequentially. Use Claude Code agents for implementation via `delegate_task`. Enforce TDD, local lint, and unit testing before every push. Send screenshots after each phase.

**Goal:** Transform AstroVerse from a functional astrology app into a visually stunning, share-worthy experience that drives retention and viral growth.

**Architecture:** Frontend-focused visual enhancements using framer-motion, Canvas API, D3.js, and Lottie. Each phase is self-contained — deployable independently with no broken intermediate states.

**Tech Stack:** React 19, TypeScript, Framer Motion, Recharts, Vitest, ESLint, Vite

**Enforced Standards:** Google TypeScript Style Guide, coding-guidelines skill, TDD (RED-GREEN-REFACTOR), local lint + type-check + unit test before every push.

---

## Pre-Requisite: Local Quality Gate Setup

**Objective:** Ensure every commit passes lint, type-check, and tests BEFORE pushing. No more CI surprises.

**Files:**
- Create: `scripts/pre-push-check.sh`
- Modify: `frontend/package.json` (add `check:all` script)

### Task 0.1: Create Pre-Push Quality Gate Script

```bash
#!/bin/bash
# scripts/pre-push-check.sh — Run before every git push
set -e

echo "🔍 Running local quality gate..."
echo ""

echo "1️⃣ Type checking..."
cd frontend && npx tsc --noEmit
echo "   ✅ Types clean"

echo "2️⃣ Linting..."
npm run lint
echo "   ✅ Lint clean"

echo "3️⃣ Unit tests..."
npm run test:run
echo "   ✅ Tests pass"

echo ""
echo "🎉 All checks passed — safe to push!"
```

**Verification:** Run `bash scripts/pre-push-check.sh` — all 3 steps pass with zero errors.

### Task 0.2: Add npm Script Shortcut

Add to `frontend/package.json` scripts:
```json
"check:all": "tsc --noEmit && eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 && vitest run"
```

**Verification:** `cd frontend && npm run check:all` passes.

### Task 0.3: Install New Dependencies

```bash
cd frontend
npm install d3 @types/d3 lottie-react @lottiefiles/react-lottie-player
```

**Verification:** `npm ls d3 lottie-react` shows installed. No peer dependency warnings.

---

## Phase 0: Close Feature Gaps

**Objective:** Fix known issues (Lunar Returns `userId` bug) and add missing baseline features before visual work begins.

### Task 0.4: Fix Lunar Returns userId Column Bug

**Objective:** The running backend uses `userId` (camelCase) but the DB column is `user_id`. PR #15 fixed this in the repo but the local backend hasn't been updated.

**Files:**
- Verify: `backend/src/modules/lunar-return/services/lunarReturn.service.ts`

**Steps:**
1. Pull master to get merged PR #15 fix
2. Restart backend
3. Verify lunar returns page loads without error

**Verification:** Navigate to `http://localhost:5173/lunar-returns` — no error, shows chart data.

### Task 0.5: Add Time-Zone/Geolocation Auto-Detection

**Objective:** Auto-detect user timezone and geolocation for chart creation.

**Files:**
- Create: `frontend/src/utils/geoDetection.ts`
- Create: `frontend/src/__tests__/utils/geoDetection.test.ts`

**TDD Cycle:**
1. Write test for `detectTimezone()` — returns IANA timezone string
2. Write test for `detectCoordinates()` — returns `{lat, lng}` or null
3. Write test for `reverseGeocode(lat, lng)` — returns city name
4. Implement using `Intl.DateTimeFormat().resolvedOptions().timeZone` and browser Geolocation API
5. Verify: `npm run test:run -- src/__tests__/utils/geoDetection.test.ts` passes

### Task 0.6: Add Contact Integration (Save Friends' Birth Data)

**Objective:** Allow users to save birth data of friends/family for quick compatibility checks.

**Files:**
- Create: `backend/src/modules/saved-contacts/` (routes, controller, service, model)
- Create: `frontend/src/services/contacts.api.ts`
- Create: `frontend/src/components/ContactPicker.tsx`
- Create: `frontend/src/pages/ContactsPage.tsx`
- Tests: `backend/src/modules/saved-contacts/__tests__/`, `frontend/src/__tests__/components/ContactPicker.test.tsx`

**TDD Cycle:**
1. Backend: Write failing tests for CRUD contact endpoints
2. Implement contact model + service + routes
3. Frontend: Write failing test for ContactPicker component
4. Implement ContactPicker + ContactsPage
5. Integrate with SynastryPage (pick from saved contacts)
6. Run `npm run check:all` + backend tests

**Verification:** Create a contact, then use it in synastry chart.

---

## Phase 1: Visual Hook — Chart Animations & Interactions

**Objective:** Make the chart wheel feel alive — birth animation, interactive planets, glowing aspects.

### Task 1.1: Chart Birth Animation System

**Objective:** When a natal chart loads, animate planets spiraling outward from center, aspect lines drawing themselves with glowing pulses, zodiac wheel rotating into place.

**Files:**
- Create: `frontend/src/components/chart/ChartBirthAnimation.tsx`
- Create: `frontend/src/components/chart/__tests__/ChartBirthAnimation.test.tsx`
- Modify: `frontend/src/components/chart/ChartCard.tsx` — integrate birth animation trigger

**TDD Cycle:**
1. Write test: `ChartBirthAnimation` renders with `animationPhase="idle"` initially
2. Write test: After `triggerAnimation()` prop called, phases transition `idle → spiral → aspects → settle`
3. Write test: Each planet has staggered delay based on orbital distance
4. Write test: Animation completes in < 3 seconds
5. Implement using Framer Motion `AnimatePresence` + `motion.circle` with spring physics
6. Each planet: initial scale=0 at center → animate to calculated position with `type: "spring", damping: 12`
7. Aspect lines: `pathLength` animated from 0 to 1 with glow filter
8. Zodiac wheel: rotate from -90° to 0°
9. Add SVG glow filter (`<filter id="glow">`) for aspect lines
10. Run tests + lint + type-check

**Verification:** Load chart view → see planets spiral in with trails → aspect lines draw with glow → settle. Smooth 60fps.

### Task 1.2: Interactive Planet Deep-Dive Cards

**Objective:** Tap any planet on the chart wheel → it zooms up with a particle burst → full-screen card showing sign, house, aspects, AI interpretation.

**Files:**
- Create: `frontend/src/components/chart/PlanetDeepDiveCard.tsx`
- Create: `frontend/src/components/chart/__tests__/PlanetDeepDiveCard.test.tsx`
- Modify: `frontend/src/components/astrology/ChartWheel.tsx` — wire `onPlanetClick` to trigger deep dive

**TDD Cycle:**
1. Write test: Card renders with planet data (name, symbol, degree, sign, house)
2. Write test: Card shows aspect list for that planet
3. Write test: Card shows AI interpretation section (or loading state)
4. Write test: Close button dismisses card with exit animation
5. Write test: Background element color matches planet's element
6. Implement with Framer Motion `layoutId` for shared element transition from chart wheel → card
7. Particle burst using Canvas overlay (reuse Sparkles pattern)
8. Element-themed gradient background: fire=red-orange, earth=green-brown, air=blue-white, water=indigo-purple
9. Wire to existing AI interpretation API
10. Run tests + lint + type-check

**Verification:** Click "Venus" on chart → it zooms out with burst → full card shows "Venus in Gemini, 7th House" + aspects + AI text. Close → animates back.

### Task 1.3: Animated Aspect Web with Glow Intensity

**Objective:** Aspect lines between planets glow with intensity based on orb tightness. Tight orbs (0-1°) pulse brightly. Clickable for interpretation.

**Files:**
- Create: `frontend/src/components/chart/AnimatedAspectLines.tsx`
- Create: `frontend/src/components/chart/__tests__/AnimatedAspectLines.test.tsx`
- Modify: `frontend/src/components/astrology/ChartWheel.tsx` — replace static aspect rendering

**TDD Cycle:**
1. Write test: Renders SVG lines for each aspect in chart data
2. Write test: Line color matches aspect type (harmonious=blue/green, challenging=red/orange)
3. Write test: Line opacity/glow intensity based on orb (tighter = brighter)
4. Write test: Lines with orb < 1° have pulsing animation class
5. Write test: Click on line fires `onAspectClick` callback
6. Implement with SVG `<line>` elements + CSS `filter: drop-shadow()` for glow
7. Framer Motion `animate={{ opacity: [0.5, 1, 0.5] }}` with `repeat: Infinity` for tight orbs
8. Color scheme: conjunction=gold, trine=blue, sextile=green, square=red, opposition=orange-red, quincunx=purple
9. Add SVG filter for glow effect: `<feGaussianBlur stdDeviation="2" />`
10. Run tests + lint + type-check

**Verification:** Load chart → see aspect lines with varying glow intensities → tight orbs pulse → click one → interpretation appears.

### Task 1.4: Cosmic Weather Dashboard Enhancement

**Objective:** Redesign the daily insight section as an animated "cosmic weather" with dynamic background, weather icons, and energy visualization.

**Files:**
- Create: `frontend/src/components/dashboard/CosmicWeatherWidget.tsx`
- Create: `frontend/src/components/dashboard/__tests__/CosmicWeatherWidget.test.tsx`
- Create: `frontend/src/components/dashboard/WeatherIconMap.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx` — replace static daily insight section

**TDD Cycle:**
1. Write test: Widget renders with energy score and transit data
2. Write test: Background gradient changes based on dominant transit type (harmonious=cool, challenging=warm)
3. Write test: Shows appropriate weather icon for transit nature
4. Write test: Animated counter for energy score (0 → actual value)
5. Implement with animated gradient background using CSS transitions
6. Weather icons: ☀️ harmonious, ⛈️ challenging, 🌧️ emotional/water, 💨 communicative/air, 🔥 energetic/fire
7. Energy score animates with Framer Motion `motion.div` + spring animation
8. Add subtle parallax effect on background (scroll-linked)
9. Run tests + lint + type-check

**Verification:** Dashboard loads → see animated cosmic weather section with dynamic colors, animated energy score, weather-themed icons.

---

## Phase 2: Wow Factor — Advanced Interactions

**Objective:** Add features that make users say "wow" and want to share — time travel, real-time transits, shareable cards, cinematic onboarding.

### Task 2.1: Time-Travel Transit Slider

**Objective:** Horizontal date slider that scrubs through time, showing planetary movements across the chart in real-time.

**Files:**
- Create: `frontend/src/components/transit/TimeTravelSlider.tsx`
- Create: `frontend/src/components/transit/__tests__/TimeTravelSlider.test.tsx`
- Create: `frontend/src/utils/transitCalculator.ts`
- Create: `frontend/src/__tests__/utils/transitCalculator.test.ts`
- Modify: `frontend/src/pages/TransitForecastPage.tsx` — add slider below chart

**TDD Cycle:**
1. Write test: `calculateTransitPositions(date, natalChart)` returns planet positions for any date
2. Write test: Slider renders with date range (past year → future year)
3. Write test: Dragging slider updates displayed transit positions
4. Write test: Shows mini "current date" vs "selected date" comparison
5. Write test: Aspect lines change color: applying=blue pulse, separating=orange fade
6. Implement using backend transit calculation API with date parameter
7. Slider with Framer Motion `useMotionValue` + `useTransform` for smooth scrubbing
8. Debounced API calls (300ms) to avoid flooding
9. Mini chart comparison: left=now, right=selected date, shared aspects highlighted
10. Run tests + lint + type-check

**Verification:** Open transit page → see slider → drag to future date → planets animate to new positions → aspects update.

### Task 2.2: Real-Time Planetary Transit Overlay

**Objective:** Natal chart with a translucent outer ring showing current planet positions. Cosmic flash animation when transit hits a natal planet.

**Files:**
- Create: `frontend/src/components/chart/TransitOverlay.tsx`
- Create: `frontend/src/components/chart/__tests__/TransitOverlay.test.tsx`
- Create: `frontend/src/components/chart/ConjunctionFlash.tsx`
- Modify: `frontend/src/components/chart/ChartCard.tsx` — layer overlay on chart

**TDD Cycle:**
1. Write test: Overlay renders outer ring with current planetary positions
2. Write test: Transit planets shown as smaller, translucent dots
3. Write test: When transit planet within 2° orb of natal planet, flash triggers
4. Write test: Flash animation plays once then settles to glow
5. Write test: Hovering transit planet shows tooltip with transit details
6. Implement as SVG layer on top of ChartWheel with `pointer-events: none` except on transit dots
7. Outer ring: translucent dashed circle, slightly larger than natal wheel
8. Transit dots: smaller, semi-transparent, with element color coding
9. ConjunctionFlash: expanding circle with opacity fade + particle burst at exact degree
10. Auto-refresh every 60 seconds using `setInterval` + API call
11. Run tests + lint + type-check

**Verification:** Load chart → see outer ring with current planet dots → a transit near natal planet triggers cosmic flash animation.

### Task 2.3: Shareable Cosmic Identity Card (Animated)

**Objective:** Beautiful animated card showing Big Three (Sun/Moon/Rising) designed for Instagram Stories. Auto-generates as shareable image/GIF.

**Files:**
- Create: `frontend/src/components/share/CosmicIdentityCard.tsx`
- Create: `frontend/src/components/share/__tests__/CosmicIdentityCard.test.tsx`
- Create: `frontend/src/components/share/CosmicIdentityAnimation.tsx`
- Modify: `frontend/src/pages/ShareCardPage.tsx` — add new card type

**TDD Cycle:**
1. Write test: Card renders with Sun/Moon/Rising data
2. Write test: Each sign shows correct zodiac symbol and constellation art
3. Write test: "Cosmic fingerprint" pattern is deterministic based on chart data
4. Write test: Share button generates image blob using html2canvas
5. Write test: Animation plays: reveal → symbol fade-in → fingerprint pattern draw
6. Implement with layered SVG: background gradient → fingerprint pattern → zodiac art → text
7. Fingerprint pattern: unique SVG path generated from hashing planet degrees (deterministic, same chart = same pattern)
8. Constellation art: SVG line art for each zodiac sign (simple geometric style)
9. Animation: Framer Motion stagger reveal — background → pattern → symbols → text
10. Share: html2canvas capture → download as PNG or share via Web Share API
11. Run tests + lint + type-check

**Verification:** Open share page → see beautiful animated Big Three card → tap share → saves as image.

### Task 2.4: Onboarding "Stargazer" Experience

**Objective:** Cinematic first-time flow: starfield → birthday → location → chart birth animation → AI welcome.

**Files:**
- Create: `frontend/src/components/onboarding/StarfieldBackground.tsx`
- Create: `frontend/src/components/onboarding/OnboardingFlow.tsx`
- Create: `frontend/src/components/onboarding/StepBirthday.tsx`
- Create: `frontend/src/components/onboarding/StepLocation.tsx`
- Create: `frontend/src/components/onboarding/StepReveal.tsx`
- Create: `frontend/src/components/onboarding/__tests__/OnboardingFlow.test.tsx`
- Create: `frontend/src/components/onboarding/__tests__/StarfieldBackground.test.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx` — trigger onboarding for new users

**TDD Cycle:**
1. Write test: `StarfieldBackground` renders canvas with animated star particles
2. Write test: `OnboardingFlow` shows steps in sequence (birthday → location → reveal)
3. Write test: Birthday step shows date picker with constellation preview for selected date
4. Write test: Location step uses geoDetection utility for auto-fill
5. Write test: Reveal step triggers chart creation then plays birth animation
6. Write test: Completing onboarding sets `hasCompletedOnboarding` flag
7. Implement starfield using Canvas API with 200 particles, varying size/speed/opacity
8. Step transitions: slide left/right with Framer Motion `AnimatePresence`
9. Birthday step: show constellation map for selected date (SVG overlay)
10. Location step: auto-detect + manual search
11. Reveal step: chart birth animation (reuse Task 1.1) + AI welcome message
12. Save onboarding completion in user profile (backend API)
13. Run tests + lint + type-check

**Verification:** New user signs up → sees starfield → enters birthday (constellation shown) → enters location → chart generates with birth animation → AI welcome message.

---

## Phase 3: Retention Features — Advanced Visualizations

**Objective:** Features that keep users coming back — astro-cartography, synastry animations, moon phases, transit timeline.

### Task 3.1: Astro-Cartography World Map

**Objective:** Dark-themed world map with glowing planetary lines (ASC/DESC/MC/IC). Tap city to see planet influence.

**Files:**
- Create: `backend/src/modules/astrocartography/` (routes, controller, service)
- Create: `frontend/src/pages/AstroCartographyPage.tsx`
- Create: `frontend/src/components/astrocartography/WorldMap.tsx`
- Create: `frontend/src/components/astrocartography/PlanetLine.tsx`
- Create: `frontend/src/components/astrocartography/CityTooltip.tsx`
- Tests for all new files

**TDD Cycle:**
1. Write test: Backend calculates planetary lines for given birth data (ASC/DESC/MC/IC for each planet)
2. Write test: WorldMap renders SVG with continents outline
3. Write test: PlanetLine renders colored line on map for each planet angle
4. Write test: Clicking near a city shows tooltip with planet influences
5. Write test: Lines are color-coded by planet (Sun=gold, Moon=silver, Venus=pink, etc.)
6. Implement backend using Swiss Ephemeris azimuth calculations for locality
7. Frontend: D3.js geo projection (Natural Earth) with dark theme
8. Planet lines: SVG paths with CSS glow + Framer Motion draw animation
9. City tooltip: shows which planet lines pass through + interpretation
10. Run tests + lint + type-check

**Verification:** Open astro-cartography page → see world map with glowing planetary lines → tap Paris → "Your Venus line passes through Paris — great for love and creativity!"

### Task 3.2: Synastry Heartbeat Merge Animation

**Objective:** Two chart wheels merge with spinning animation. Inter-chart aspects fire as glowing arcs. Compatibility score animates like ECG.

**Files:**
- Create: `frontend/src/components/synastry/SynastryMergeAnimation.tsx`
- Create: `frontend/src/components/synastry/HeartbeatScore.tsx`
- Create: `frontend/src/components/synastry/__tests__/SynastryMergeAnimation.test.tsx`
- Create: `frontend/src/components/synastry/__tests__/HeartbeatScore.test.tsx`
- Modify: `frontend/src/pages/SynastryPageNew.tsx` — integrate merge animation

**TDD Cycle:**
1. Write test: MergeAnimation renders two chart wheels side by side
2. Write test: Triggering merge spins wheels together (rotate + scale animation)
3. Write test: After merge, shows overlay with inter-chart aspect arcs
4. Write test: HeartbeatScore renders SVG ECG line that pulses to compatibility score
5. Write test: Heartbeat line draws itself left-to-right then settles on score value
6. Implement with Framer Motion `layout` animation for wheel merge
7. Aspect arcs: SVG arcs connecting planets between the two merged wheels
8. ECG heartbeat: SVG polyline animated with `pathLength` from 0→1
9. Compatibility score "flatlines" briefly then spikes to actual score
10. Run tests + lint + type-check

**Verification:** Open synastry page → select two charts → click compare → wheels spin together → arcs fire → ECG line pulses → score reveals.

### Task 3.3: Moon Phase Morphing Animation

**Objective:** Smooth 3D-looking moon that morphs through phases as you scroll the calendar. Current phase with ambient glow.

**Files:**
- Create: `frontend/src/components/astrology/MoonPhaseMorph.tsx`
- Create: `frontend/src/components/astrology/__tests__/MoonPhaseMorph.test.tsx`
- Modify: `frontend/src/pages/MoonCalendarPage.tsx` — integrate morphing moon

**TDD Cycle:**
1. Write test: Renders moon with correct illumination for given phase (0-1)
2. Write test: Phase prop change triggers smooth morph animation
3. Write test: Shows phase name (New, Waxing Crescent, First Quarter, etc.)
4. Write test: Click shows ritual/intention guidance based on phase
5. Implement using CSS radial-gradient + box-shadow for 3D effect
6. Morph: animate `background: radial-gradient()` position with CSS transition
7. Ambient glow: `box-shadow` with phase-appropriate color (new=dark, full=bright silver)
8. Surface texture: SVG overlay with crater pattern (subtle, semi-transparent)
9. Phase names + guidance text from lunar return service
10. Run tests + lint + type-check

**Verification:** Open moon calendar → see beautiful 3D moon → scroll through dates → moon smoothly morphs → tap for guidance.

### Task 3.4: Transit Timeline with Animated Markers

**Objective:** Horizontal scrolling timeline with morphing aspect-type icons. Swipe to scrub months. Critical dates pulse.

**Files:**
- Create: `frontend/src/components/transit/TransitTimeline.tsx`
- Create: `frontend/src/components/transit/TimelineMarker.tsx`
- Create: `frontend/src/components/transit/__tests__/TransitTimeline.test.tsx`
- Modify: `frontend/src/pages/TransitForecastPage.tsx` — add timeline section

**TDD Cycle:**
1. Write test: Timeline renders horizontal scroll with month markers
2. Write test: Each transit event shows correct icon for aspect type
3. Write test: Icons morph between types using Framer Motion
4. Write test: Critical transits (orb < 1° or involving Sun/Moon) have pulse animation
5. Write test: Swiping scrolls to adjacent month with snap
6. Implement with CSS `scroll-snap-type: x mandatory` + Framer Motion for icons
7. Aspect icons: △ trine, □ square, ☌ conjunction, ☍ opposition, ⚹ sextile, ⚺ quincunx
8. Framer Motion `AnimatePresence` for icon morphing on filter change
9. Pulse: `animate={{ scale: [1, 1.2, 1] }}` with `repeat: Infinity`
10. Color coding: harmonious=cool gradient, challenging=warm gradient
11. Run tests + lint + type-check

**Verification:** Open transit page → see animated timeline → swipe → markers scroll smoothly → critical dates pulse → tap marker for details.

---

## Phase 4: Power User Features

**Objective:** Features for astrology enthusiasts — radar charts, frequency visualizer, heatmap.

### Task 4.1: Elemental Radar Chart

**Objective:** Animated radar/spider chart for Fire/Earth/Air/Water + Cardinal/Fixed/Mutable. Morphs when comparing synastry.

**Files:**
- Create: `frontend/src/components/astrology/ElementalRadarChart.tsx`
- Create: `frontend/src/components/astrology/__tests__/ElementalRadarChart.test.tsx`
- Modify: `frontend/src/components/astrology/ElementalBalance.tsx` — add radar view option

**TDD Cycle:**
1. Write test: Renders 6-axis radar chart (Fire, Earth, Air, Water, Cardinal, Fixed, Mutable — wait, that's 7, use 6: 4 elements + 2 modalities or separate)
2. Write test: Values animate from 0 to actual on mount
3. Write test: In comparison mode, two overlapping polygons with different colors
4. Write test: Hovering an axis shows tooltip with planet details for that element
5. Implement using Recharts `RadarChart` with custom styling
6. Framer Motion for polygon morphing when values change
7. Comparison mode: Person A = solid fill, Person B = dashed outline
8. Dark theme: translucent fills with bright borders
9. Run tests + lint + type-check

**Verification:** View natal chart details → see radar chart → toggle to synastry comparison → second polygon morphs in.

### Task 4.2: Planetary Frequency Visualizer

**Objective:** Visual equalizer that pulses based on which planets are most active. Optional ambient sound for meditation.

**Files:**
- Create: `frontend/src/components/astrology/PlanetaryVisualizer.tsx`
- Create: `frontend/src/components/astrology/__tests__/PlanetaryVisualizer.test.tsx`

**TDD Cycle:**
1. Write test: Renders frequency bars for each planet
2. Write test: Bar heights reflect planet activity (transit count × intensity)
3. Write test: Bars animate with wave motion
4. Write test: Toggle button for sound on/off (sound uses Web Audio API oscillator)
5. Write test: Each planet mapped to its frequency (Sun=126.22Hz, Moon=210.42Hz, etc.)
6. Implement using SVG bars + Framer Motion for wave animation
7. Frequencies based on Hans Cousto's "Cosmic Octave" calculations
8. Web Audio API for optional ambient drone
9. Dark theme with element-colored bars
10. Run tests + lint + type-check

**Verification:** View chart → see frequency visualizer → bars pulse based on active planets → toggle sound → hear ambient planetary frequencies.

### Task 4.3: Astrological Event Heatmap

**Objective:** GitHub-style calendar heatmap colored by daily cosmic intensity. Tap day for breakdown.

**Files:**
- Create: `frontend/src/components/calendar/CosmicHeatmap.tsx`
- Create: `frontend/src/components/calendar/__tests__/CosmicHeatmap.test.tsx`
- Modify: `frontend/src/pages/CalendarPage.tsx` — add heatmap view

**TDD Cycle:**
1. Write test: Renders 12-month grid of day cells
2. Write test: Cell color intensity reflects transit count × intensity for that day
3. Write test: Hovering shows tooltip with date + transit count
4. Write test: Clicking cell opens daily transit breakdown
5. Write test: Color scale: empty=dark gray, low=cool blue, medium=warm yellow, high=hot red
6. Implement using CSS Grid with colored cells
7. Framer Motion for cell hover scale effect
8. Pre-calculate 365 days of intensity from transit API
9. Responsive: stacks months on mobile
10. Run tests + lint + type-check

**Verification:** Open calendar → see heatmap → tap a "hot" day → see transit breakdown.

---

## Phase 5: Top 3 Visual Picks (Most Attractive)

**Objective:** The 3 most visually impressive, share-worthy features based on viral potential.

### Task 5.1: Premium Chart Birth Animation (Enhanced)

**Objective:** Enhanced version of Phase 1's birth animation with particle trails, constellation connections, and sound design.

**Files:**
- Create: `frontend/src/components/chart/ParticleTrail.tsx`
- Create: `frontend/src/components/chart/ConstellationLines.tsx`
- Create: `frontend/src/components/chart/__tests__/ParticleTrail.test.tsx`
- Modify: `frontend/src/components/chart/ChartBirthAnimation.tsx` — add particles + sound

**TDD Cycle:**
1. Write test: ParticleTrail generates particles at given position with configurable count
2. Write test: Particles fade out over configurable duration
3. Write test: ConstellationLines draws lines between planets in same sign
4. Write test: Animation sequence: wheel → constellations → planets → aspects → particles → settle
5. Write test: Optional ambient chime plays on completion (Web Audio API)
6. Implement particle system using Canvas overlay with requestAnimationFrame
7. Particles: small circles with element color, physics-based drift (gravity → outward)
8. Constellation lines: thin SVG lines connecting planets in same zodiac sign
9. Sound: gentle crystalline chime using Web Audio API oscillator + envelope
10. Total animation: 2.5 seconds
11. Run tests + lint + type-check

**Verification:** Load chart → see enhanced birth animation with particles, constellation lines, and optional chime → smooth and cinematic.

### Task 5.2: Live Transit Tracker with Cosmic Flash

**Objective:** Enhanced real-time overlay with live planet positions (updating every minute), cosmic flash effects, and transit alerts.

**Files:**
- Create: `frontend/src/components/chart/LiveTransitTracker.tsx`
- Create: `frontend/src/components/chart/TransitAlert.tsx`
- Create: `frontend/src/components/chart/__tests__/LiveTransitTracker.test.tsx`
- Modify: `frontend/src/components/chart/ChartCard.tsx` — integrate live tracker

**TDD Cycle:**
1. Write test: Tracker auto-updates planet positions every 60 seconds
2. Write test: Transit planets smoothly animate to new positions (no jumps)
3. Write test: When a transit enters exact orb (< 0.5°) of natal planet, flash triggers
4. Write test: Flash includes: expanding ring + particle burst + screen edge glow
5. Write test: TransitAlert shows push notification-style banner for exact transits
6. Write test: "Active transits" count badge shows on chart icon
7. Implement using `useInterval` hook for periodic updates
8. Smooth position transition: Framer Motion `animate={{ cx, cy }}` with `transition: { duration: 1 }`
9. Flash: SVG expanding circle + CSS `box-shadow` edge glow + particle burst (reuse ParticleTrail)
10. Alert: toast notification sliding in from top with planet symbols
11. Run tests + lint + type-check

**Verification:** Open chart → see live outer ring → wait for transit to hit natal planet → see cosmic flash + alert banner.

### Task 5.3: Viral Cosmic Identity Card (Enhanced)

**Objective:** Enhanced shareable card with animated constellation background, "cosmic fingerprint" mandala, and one-click social sharing.

**Files:**
- Create: `frontend/src/components/share/CosmicFingerprint.tsx`
- Create: `frontend/src/components/share/ConstellationBackground.tsx`
- Create: `frontend/src/components/share/__tests__/CosmicFingerprint.test.tsx`
- Modify: `frontend/src/components/share/CosmicIdentityCard.tsx` — add fingerprint + background

**TDD Cycle:**
1. Write test: CosmicFingerprint generates unique SVG mandala from planet degrees
2. Write test: Same chart data always produces identical fingerprint
3. Write test: Different chart data produces visibly different fingerprint
4. Write test: ConstellationBackground renders animated star field behind card
5. Write test: Card exports at 1080×1920 (Instagram Story size)
6. Write test: Share buttons for Instagram, Twitter, WhatsApp, Copy Link
7. Implement mandala using polar coordinates: 12 segments (houses), planet positions create pattern
8. Each segment: petal/curve shape determined by planet degree, color by element
9. Background: subtle animated star particles (CSS only, no canvas for screenshot)
10. Export: html2canvas with scale=2 for retina quality
11. Web Share API for mobile sharing, fallback to download
12. Run tests + lint + type-check

**Verification:** Generate cosmic identity card → see unique mandala pattern + constellation background → share to Instagram Stories → looks premium.

---

## Quality Gate Checklist (Before Every Push)

```bash
# Run this before EVERY git push:
cd ~/tmp/astrology-saas-platform/frontend
npm run type-check          # tsc --noEmit — zero errors
npm run lint                # eslint — zero errors, zero warnings
npm run test:run            # vitest run — all tests pass
```

## Post-Phase Screenshot Protocol

After each phase completes:
1. Start backend: `cd backend && npm run dev` (port 3001)
2. Start frontend: `cd frontend && npm run dev` (port 5173)
3. Login as `testuser@astroverse.com` / `TestPass123!`
4. Navigate to each new feature page
5. Capture screenshots using browser tools
6. Send screenshots to Sefa via Telegram with feature description

## Phase Dependencies

```
Phase 0 (Gaps) → Phase 1 (Visual Hook) → Phase 2 (Wow Factor) → Phase 3 (Retention) → Phase 4 (Power User) → Phase 5 (Top Picks)
```

Each phase is independently deployable but sequential for best results.

## Estimated Timeline

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Pre-req + Phase 0 | 6 tasks | 2-3 days |
| Phase 1 | 4 tasks | 3-4 days |
| Phase 2 | 4 tasks | 4-5 days |
| Phase 3 | 4 tasks | 5-6 days |
| Phase 4 | 3 tasks | 3-4 days |
| Phase 5 | 3 tasks | 3-4 days |
| **Total** | **24 tasks** | **20-26 days** |
