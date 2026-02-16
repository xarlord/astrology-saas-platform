# Findings & Decisions
<!--
  WHAT: Your knowledge base for the task. Stores everything you discover and decide.
  WHY: Context windows are limited. This file is your "external memory" - persistent and unlimited.
  WHEN: Update after ANY discovery, especially after 2 view/browser/search operations (2-Action Rule).
-->

## Requirements
<!--
  WHAT: What the user asked for, broken down into specific requirements.
  WHY: Keeps requirements visible so you don't forget what you're building.
  WHEN: Fill this in during Phase 1 (Requirements & Discovery).
-->
Based on PRD_Document.md, the following requirements have been identified:

### Functional Requirements
1. **Natal Chart Generation**
   - User input: Birth date, time, location
   - System calculates: Planetary positions, houses, aspects
   - Output: Visual chart wheel + tabular data

2. **Personality Analysis (Static)**
   - Map planetary positions to interpretations
   - Aspect analysis (geometric angles between planets)
   - Generate personality insights based on natal chart

3. **Forecasting (Dynamic)**
   - Transit tracking (real-time planetary positions)
   - Overlay transits onto natal chart houses
   - Identify transit-natal aspects
   - Generate predictions with mitigation advice

4. **User Management**
   - User registration/authentication
   - Profile management (birth data storage)
   - Chart history

### Technical Requirements
1. **Calculation Engine**
   - High-precision astronomical data (Swiss Ephemeris)
   - Planetary position calculations
   - House system calculations (Placidus, Koch, etc.)
   - Aspect detection (conjunction, opposition, trine, square, sextile)

2. **Backend Services**
   - REST/GraphQL API
   - Chart calculation service
   - Analysis generation service
   - Transit calculation service

3. **Frontend Requirements**
   - Responsive UI (web + mobile)
   - Chart visualization (D3.js/Canvas/SVG)
   - Data input forms
   - Results display components
   - Integration with Stitch MCP for UI components

4. **Data Storage**
   - User profiles and authentication
   - Calculated charts (cache to avoid re-calculation)
   - Interpretation content database
   - Ephemeris data

### Integration Requirements
1. **Stitch MCP API**
   - Use Stitch MCP for UI component generation
   - Create UI data definitions that Stitch can consume
   - Refactor existing UI patterns to Stitch-based components

2. **External Services**
   - Swiss Ephemeris library integration
   - Optional: OAuth providers (Google, Apple)
   - Analytics (Google Analytics/Firebase)

## Research Findings
<!--
  WHAT: Key discoveries from web searches, documentation reading, or exploration.
  WHY: Multimodal content (images, browser results) doesn't persist. Write it down immediately.
  WHEN: After EVERY 2 view/browser/search operations, update this section (2-Action Rule).
-->

### Technology Stack Decisions
- **Backend: Node.js** - High concurrency, excellent ecosystem, Swiss Ephemeris integration via node-swiss-ephemeris or WASM
- **Database: PostgreSQL** - Relational data with complex relationships (users, charts, interpretations)
- **Frontend: React** - Industry standard, great ecosystem, pairs well with Stitch MCP

### Swiss Ephemeris Integration
- Supports high-precision ephemeris data
- Available as C library with bindings for multiple languages
- For Node.js: can use `swisseph` npm package or WASM module
- Alternative: Moshier Ephemeris (lighter), Astronomia (JS)

### Calculation Requirements
- Need exact birth time for accurate house calculations
- Location data must include latitude/longitude coordinates
- Time zone handling is critical (historical time zone changes)
- Date range: ~6000 BCE to ~5400 CE (Swiss Ephemeris range)

---

# EXPANSION FEATURES RESEARCH (2026-02-05)

## 1. Astrological Calendar & Event Reminders

### Market Research
- **Competitors:** Cafe Astrology, Astro-Seek, Astro.com, Co-Star
- **User Behavior:** Daily app usage increases retention by 3-5x
- **Engagement:** Calendar features drive 40%+ of daily active users

### Technical Requirements
- **Global Events:**
  - Mercury retrograde: 3-4 times/year, ~3 weeks each
  - Venus retrograde: Every 18 months, ~6 weeks
  - Mars retrograde: Every 26 months, ~2-3 months
  - Jupiter/Saturn retrogrades: ~4-5 months annually
  - Eclipses: 4-7 per year (solar + lunar)
  - Solstices/Equinoxes: 4 per year
  - Moon phases: 29.5-day cycle

- **Personalized Transits:**
  - Major aspects to personal planets (Sun, Moon, Mercury, Venus, Mars)
  - Outer planet transits (Jupiter, Saturn, Uranus, Neptune, Pluto)
  - House transit tracking (current sign through natal houses)
  - Transit intensity scoring (1-10 scale)

- **Notification System:**
  - Firebase Cloud Messaging (free tier: 360K messages/day)
  - Email templates (SendGrid/Mailgun)
  - Timezone-aware scheduling
  - User preference controls

### Data Sources
- **Swiss Ephemeris:** Calculate exact event dates/times
- **Eclipse data:** NASA eclipse catalog API
- **Retrograde periods:** Calculate from planetary positions

### MVP Scope
- Month view calendar with event badges
- Daily "astrological weather" summary
- Upcoming events list (next 7 days)
- Email notifications for major transits
- Export to iCal format

## 2. Lunar Return & Monthly Forecasts

### Market Research
- **Competitors:** AstroStyle, Chani Nicholas, Sanctuary Astrology
- **User Behavior:** Monthly rituals create recurring engagement
- **Monetization:** Premium feature ($9.99/month tier)

### Technical Requirements
- **Lunar Return Calculation:**
  - Find when transiting Moon returns to natal Moon position (exact degree/minute)
  - Occurs every 27.3 days
  - Time varies by location (can calculate for different locations)
  - Chart wheel for lunar return moment

- **Interpretation Components:**
  - Lunar return Moon house placement (monthly focus area)
  - Lunar return Moon sign (emotional theme)
  - Aspects to lunar return Moon
  - Lunar return phase (new moon return vs full moon return)
  - House ruler placements

- **Monthly Forecast Elements:**
  - Theme statement (e.g., "This month focuses on relationships and partnerships")
  - Key dates (new/full moons, major aspects)
  - Emotional landscape description
  - Actionable advice (3-5 specific recommendations)
  - Journal prompts for self-reflection

### MVP Scope
- Current lunar month countdown
- Lunar return chart calculation
- House-based interpretation
- Key dates timeline
- Email notification when lunar return approaches
- Journal prompts (3-5 per month)

### Content Requirements
- 12 house interpretations for lunar return Moon
- Moon phase meanings (8 phases)
- Monthly ritual templates
- Journal prompt database (144 prompts: 12 houses × 12 months)

## 3. Synastry/Compatibility Calculator

### Market Research
- **Competitors:** Cafe Astrology, Astro.com, Synastry.net
- **Viral Potential:** High (users share with partners/friends)
- **Monetization:** Premium feature or pay-per-report ($4.99-$9.99)

### Technical Requirements
- **Synastry Calculations:**
  - Two-chart overlay (Chart A + Chart B)
  - Synastry aspects (Planet A → Planet B)
  - House overlays (Planet A → Chart B's houses)
  - Composite chart (midpoint method: (Planet A + Planet B) / 2)

- **Compatibility Scoring Algorithm:**
  ```
  Base Score: 50
  +2 per harmonious aspect (trine, sextile)
  -1 per challenging aspect (square, opposition)
  +3 per conjunction (weight by planet importance)
  Element match bonus: +5 if compatible elements
  House overlay bonus: +5 to +15
  Final score: 0-100 scale
  ```

- **Interpretation Requirements:**
  - Planet-to-planet synastry (10×10 = 100 combinations)
  - Planet-in-house synastry (10 planets × 12 houses = 120)
  - Composite chart interpretations
  - Relationship type variations (romantic, friendship, business)

- **Privacy & Sharing:**
  - Anonymized chart sharing (remove birth data)
  - Shareable links with expiration
  - Consent management (both parties must agree)
  - GDPR compliance (right to delete)

### MVP Scope
- Two-chart comparison
- Synastry aspect table (major aspects only)
- Overall compatibility score
- Top 5 strengths and challenges
- Basic composite chart wheel
- Shareable link generation
- PDF export

### Content Requirements
- 100 planet-to-planet interpretations (Sun-Sun through Pluto-Pluto)
- 120 planet-in-house interpretations
- Composite chart meanings for 10 planets in 12 signs
- Relationship type specific advice (romantic, friendship, business)

## Prioritization Rationale

### Quick Wins (Low Effort, High Impact)
1. **Astrological Calendar** - Leverages existing transit calculation
2. **Lunar Returns** - Simple calculation, monthly recurring value
3. **Synastry** - Medium effort, high viral/sharing potential

### Revenue Impact Estimates
- **Calendar:** 40% increase in DAU (daily active users)
- **Lunar Returns:** 20% increase in premium subscriptions
- **Synastry:** 15% increase in sharing/virality, 10% conversion boost

---

### Stitch MCP Integration

#### Available Tools
| Tool | Purpose |
|------|---------|
| `extract_design_context` | Scans screen to extract "Design DNA" (Fonts, Colors, Layouts) |
| `fetch_screen_code` | Downloads raw HTML/Frontend code |
| `fetch_screen_image` | Downloads high-res screenshot |
| `generate_screen_from_text` | Generates NEW screen based on prompt + context |
| `create_project` | Creates new workspace/project folder |
| `list_projects` | Lists all Stitch projects |
| `list_screens` | Lists screens within a project |
| `get_project` | Retrieves project details |
| `get_screen` | Gets screen metadata |

#### Designer Flow (2-Step Process)
1. **Extract**: Use `extract_design_context` on an existing screen to get design system
2. **Generate**: Use `generate_screen_from_text` with the context to create consistent UI

#### Prompt Format
```
Context: [Design context extracted]
Target: [User goal for this screen]
Features: [List of features/components]
Style: [Design style preferences]
```

#### Example Stitch Prompt for Birth Data Form:
```
Context: [Extracted design context with colors, fonts, spacing]
Target: Collect user's birth information for natal chart calculation
Features:
  - Date picker for birth date
  - Time picker for birth time (with "unknown" checkbox)
  - Place autocomplete with lat/long detection
  - Chart name input
  - House system selector
  - Zodiac type selector (tropical/sidereal)
Style: Clean, mystical, with purple/gold accent colors, clear form hierarchy
```

## Technical Decisions
<!--
  WHAT: Architecture and implementation choices you've made, with reasoning.
  WHY: You'll forget why you chose a technology or approach. This table preserves that knowledge.
  WHEN: Update whenever you make a significant technical choice.
-->
| Decision | Rationale |
|----------|-----------|
| **Backend: Node.js** | High concurrency, excellent ecosystem, Swiss Ephemeris integration available |
| **Database: PostgreSQL** | Relational data with complex relationships (users, charts, interpretations) |
| **Frontend: React** | Industry standard, great ecosystem, pairs well with Stitch MCP |
| **Stitch MCP Workflow** | Extract context → Generate screens with consistent design system |
| **Monorepo Structure** | Frontend/backend can share types, easier to manage dependencies |
| **Layered Architecture** | Separation of concerns: calculation → business logic → API → UI |
| **Swiss Ephemeris** | Industry standard, highest accuracy for astronomical calculations |
| **REST API** | Simpler than GraphQL for MVP, easier to cache |

## Issues Encountered
<!--
  WHAT: Problems you ran into and how you solved them.
  WHY: Similar to errors in task_plan.md, but focused on broader issues (not just code errors).
  WHEN: Document when you encounter blockers or unexpected challenges.
-->
| Issue | Resolution |
|-------|------------|
| Stitch MCP API documentation not yet reviewed | Need to explore Stitch MCP capabilities and API structure |

## Resources
<!--
  WHAT: URLs, file paths, API references, documentation links you've found useful.
  WHY: Easy reference for later. Don't lose important links in context.
  WHEN: Add as you discover useful resources.
-->
- **PRD Document**: `C:\Users\plner\MVP_Projects\PRD_Document.md`
- **Project Root**: `C:\Users\plner\MVP_Projects\`
- **Swiss Ephemeris**: https://www.astro.com/swisseph/
- **Astro-Seek (Reference)**: https://www.astro-Seek.com (for feature reference)
- **Cafe Astrology (Reference)**: https://cafeastrology.com (for interpretation style reference)

## Visual/Browser Findings
<!--
  WHAT: Information you learned from viewing images, PDFs, or browser results.
  WHY: CRITICAL - Visual/multimodal content doesn't persist in context. Must be captured as text.
  WHEN: IMMEDIATELY after viewing images or browser results. Don't wait!
-->
- N/A - No visual content reviewed yet

---

# UI DEFINITIONS FOR STITCH MCP
<!--
  WHAT: Detailed UI component data definitions for Stitch MCP integration.
  WHY: These definitions will be used by Stitch MCP to generate UI components.
  WHEN: Create during Phase 1, refine during Phase 5.
-->

## UI Component Hierarchy

### 1. Authentication Components

#### 1.1 Login Form
```yaml
loginForm:
  type: form
  title: "Sign In"
  fields:
    - name: email
      type: email
      label: "Email Address"
      placeholder: "you@example.com"
      required: true
      validation: email
    - name: password
      type: password
      label: "Password"
      placeholder: "Enter your password"
      required: true
      validation: minLength(8)
  actions:
    - type: submit
      label: "Sign In"
      variant: primary
    - type: link
      label: "Forgot Password?"
      to: /forgot-password
  footer:
    - type: text
      content: "Don't have an account?"
    - type: link
      label: "Sign Up"
      to: /register
```

#### 1.2 Registration Form
```yaml
registerForm:
  type: form
  title: "Create Account"
  fields:
    - name: name
      type: text
      label: "Full Name"
      placeholder: "Your full name"
      required: true
    - name: email
      type: email
      label: "Email Address"
      placeholder: "you@example.com"
      required: true
      validation: email
    - name: password
      type: password
      label: "Password"
      placeholder: "Create a password"
      required: true
      validation: minLength(8)
    - name: confirmPassword
      type: password
      label: "Confirm Password"
      placeholder: "Confirm your password"
      required: true
      validation: match(password)
  actions:
    - type: submit
      label: "Create Account"
      variant: primary
  social:
    - provider: google
      label: "Continue with Google"
      icon: google
    - provider: apple
      label: "Continue with Apple"
      icon: apple
```

### 2. Birth Data Input Components

#### 2.1 Birth Data Form
```yaml
birthDataForm:
  type: form
  title: "Birth Information"
  description: "Enter your birth details for an accurate natal chart"
  sections:
    - title: "Date & Time"
      fields:
        - name: birthDate
          type: date
          label: "Birth Date"
          placeholder: "Select date"
          required: true
          maxDate: today
        - name: birthTime
          type: time
          label: "Birth Time"
          placeholder: "Select time"
          required: true
          hint: "Exact time is needed for accurate house calculations"
        - name: timeUnknown
          type: checkbox
          label: "I don't know my exact birth time"
          description: "Charts will be calculated without house divisions"

    - title: "Location"
      fields:
        - name: birthPlace
          type: placeAutocomplete
          label: "Birth Place"
          placeholder: "Search city or enter coordinates"
          required: true
          dataType:
            - name
            - latitude
            - longitude
            - timezone
        - name: latitude
          type: number
          label: "Latitude"
          placeholder: "00.0000"
          readOnly: true
          hidden: true
        - name: longitude
          type: number
          label: "Longitude"
          placeholder: "00.0000"
          readOnly: true
          hidden: true

    - title: "Chart Details"
      fields:
        - name: chartName
          type: text
          label: "Chart Name"
          placeholder: "My Natal Chart"
          defaultValue: "Natal Chart"
        - name: houseSystem
          type: select
          label: "House System"
          options:
            - value: placidus
              label: "Placidus"
              default: true
            - value: koch
              label: "Koch"
            - value: porphyry
              label: "Porphyry"
            - value: whole
              label: "Whole Sign"
        - name: zodiac
          type: select
          label: "Zodiac Type"
          options:
            - value: tropical
              label: "Tropical"
              default: true
            - value: sidereal
              label: "Sidereal"
              suboptions:
                - value: fagan-bradley
                  label: "Fagan-Bradley"
                - value: lahiri
                  label: "Lahiri"

  actions:
    - type: submit
      label: "Generate Chart"
      variant: primary
      size: large
    - type: button
      label: "Save for Later"
      variant: secondary
```

### 3. Chart Visualization Components

#### 3.1 Natal Chart Display
```yaml
natalChartDisplay:
  type: composite
  layout: grid
  columns: 2
  sections:
    - type: chartWheel
      title: "Natal Chart Wheel"
      props:
        width: 100%
        aspectRatio: 1
        interactive: true
        data:
          planets:
            - name: sun
              symbol: "☉"
              color: "#FFD700"
            - name: moon
              symbol: "☽"
              color: "#C0C0C0"
            - name: mercury
              symbol: "☿"
              color: "#8B4513"
            - name: venus
              symbol: "♀"
              color: "#FF69B4"
            - name: mars
              symbol: "♂"
              color: "#FF0000"
            - name: jupiter
              symbol: "♃"
              color: "#FFA500"
            - name: saturn
              symbol: "♄"
              color: "#696969"
            - name: uranus
              symbol: "♅"
              color: "#40E0D0"
            - name: neptune
              symbol: "♆"
              color: "#4169E1"
            - name: pluto
              symbol: "♇"
              color: "#8B0000"
          houses:
            count: 12
            showCusps: true
            showNumbers: true
          aspects:
            - type: conjunction
              symbol: "☌"
              color: "#FF0000"
              defaultOrb: 10
            - type: opposition
              symbol: "☍"
              color: "#FF0000"
              defaultOrb: 8
            - type: trine
              symbol: "△"
              color: "#00FF00"
              defaultOrb: 8
            - type: square
              symbol: "□"
              color: "#FF6600"
              defaultOrb: 8
            - type: sextile
              symbol: "⚹"
              color: "#00BFFF"
              defaultOrb: 6

    - type: panel
      title: "Chart Details"
      collapsible: true
      content:
        - type:dataTable
          title: "Planetary Positions"
          columns:
            - key: planet
              label: "Planet"
            - key: sign
              label: "Sign"
            - key: degree
              label: "Position"
            - key: house
              label: "House"
            - key: retrograde
              label: "Retrograde"
          dataSource: chartData.planets

        - type: dataTable
          title: "House Cusps"
          columns:
            - key: house
              label: "House"
            - key: sign
              label: "Sign"
            - key: degree
              label: "Position"
          dataSource: chartData.houses

        - type: dataTable
          title: "Major Aspects"
          columns:
            - key: planet1
              label: "Planet"
            - key: aspect
              label: "Aspect"
            - key: planet2
              label: "To"
            - key: orb
              label: "Orb"
            - key: applying
              label: "Applying"
          dataSource: chartData.aspects

  toolbar:
    - type: button
      label: "Download PDF"
      icon: download
      action: exportChart
    - type: button
      label: "Share"
      icon: share
      action: shareChart
    - type: button
      label: "Full Screen"
      icon: expand
      action: toggleFullscreen
```

### 4. Analysis Display Components

#### 4.1 Personality Analysis Panel
```yaml
personalityAnalysis:
  type: tabbedPanel
  title: "Personality Analysis"
  tabs:
    - id: overview
      label: "Overview"
      content:
        - type: summaryCard
          title: "Core Identity"
          icon: sun
          content:
            - type: textBlock
              source: analysis.sunSign
              headingLevel: 4

        - type: summaryCard
          title: "Emotional Nature"
          icon: moon
          content:
            - type: textBlock
              source: analysis.moonSign
              headingLevel: 4

        - type: summaryCard
          title: "Communication Style"
          icon: mercury
          content:
            - type: textBlock
              source: analysis.mercurySign
              headingLevel: 4

    - id: planets
      label: "Planets in Signs"
      layout: accordion
      items:
        - title: "Sun in {sign}"
          content:
            - type: interpretationBlock
              source: analysis.sun
              sections:
                - type: keywords
                  label: "Keywords"
                  dataSource: analysis.sun.keywords
                - type: description
                  label: "Interpretation"
                  dataSource: analysis.sun.description
        - title: "Moon in {sign}"
          content:
            - type: interpretationBlock
              source: analysis.moon
              sections:
                - type: keywords
                  label: "Keywords"
                  dataSource: analysis.moon.keywords
                - type: description
                  label: "Interpretation"
                  dataSource: analysis.moon.description
        # ... repeat for all planets

    - id: houses
      label: "Planets in Houses"
      layout: grid
      columns: 2
      content:
        - type: houseCard
          title: "House {number}"
          subtitle: "{sign} on cusp"
          content:
            - type: planetList
              dataSource: analysis.houses[number].planets
            - type: interpretation
              dataSource: analysis.houses[number].meaning

    - id: aspects
      label: "Aspect Patterns"
      content:
        - type: aspectGrid
          dataSource: analysis.aspects
          layout: matrix
          highlightMajor: true
        - type: aspectInterpretation
          dataSource: analysis.majorAspects
          showDetails: true

#### 4.2 Aspect Analysis Component
```yaml
aspectAnalysis:
  type: composite
  title: "Aspect Analysis"
  sections:
    - type: aspectList
      groupBy: type
      content:
        - group: "Major Aspects"
          aspects:
            - type: conjunction
              title: "Conjunctions"
              icon: "☌"
              description: "Fusion of energies"
              color: "#FF0000"
              orb: 10
            - type: opposition
              title: "Oppositions"
              icon: "☍"
              description: "Tension and balance"
              color: "#FF0000"
              orb: 8
            - type: trine
              title: "Trines"
              icon: "△"
              description: "Harmonious flow"
              color: "#00FF00"
              orb: 8
            - type: square
              title: "Squares"
              icon: "□"
              description: "Dynamic tension"
              color: "#FF6600"
              orb: 8
            - type: sextile
              title: "Sextiles"
              icon: "⚹"
              description: "Opportunities"
              color: "#00BFFF"
              orb: 6

    - type: aspectTable
      columns:
        - planet1
        - aspect
        - planet2
        - orb
        - applying
        - interpretation
      sortable: true
      filterable: true

    - type: aspectPatterns
      title: "Aspect Patterns"
      patterns:
        - type: grandTrine
          title: "Grand Trine"
          description: "Three planets in trine to each other"
          color: "#00FF00"
        - type: tSquare
          title: "T-Square"
          description: "Two planets in opposition, both squaring a third"
          color: "#FF6600"
        - type: grandCross
          title: "Grand Cross"
          description: "Two oppositions squaring each other"
          color: "#FF0000"
        - type: yod
          title: "Yod"
          description: "Two planets sextile, both quincunx a third"
          color: "#9932CC"
```

### 5. Transit/Forecasting Components

#### 5.1 Transit Dashboard
```yaml
transitDashboard:
  type: dashboard
  title: "Transit Forecast"
  layout: responsive
  sections:
    - type: dateSelector
      title: "Select Date Range"
      options:
        - type: preset
          label: "Today"
          range: day
        - type: preset
          label: "This Week"
          range: week
        - type: preset
          label: "This Month"
          range: month
        - type: preset
          label: "This Year"
          range: year
        - type: custom
          label: "Custom Range"
          showDatePickers: true

    - type: transitCalendar
      title: "Transit Calendar"
      view: month
      highlightDates:
        - type: majorTransit
          color: "#FF6600"
          label: "Major Transit"
        - type: moonPhase
          color: "#C0C0C0"
          label: "Moon Phase"
        - type: eclipse
          color: "#FF0000"
          label: "Eclipse"
      dataSource: transitData.dates
      onDateSelect: showDayTransits

    - type: activeTransits
      title: "Active Transits"
      sortBy: strength
      content:
        - type: transitCard
          title: "{transitingPlanet} {aspect} {natalPlanet}"
          subtitle: "{dateRange}"
          strength: strength
          content:
            - type: interpretation
              dataSource: interpretation
            - type: advice
              title: "Guidance"
              dataSource: advice
          badge:
            - type: intensity
              value: intensity
              variant: strength
        - type: transitCard
          title: "{transitingPlanet} in House {house}"
          subtitle: "{dateRange}"
          content:
            - type: interpretation
              dataSource: interpretation
          badge:
            - type: duration
              value: duration

    - type: transitTimeline
      title: "Transit Timeline"
      view: scrollable
      dataSource: transitData.timeline
      markers:
        - type: newMoon
          icon: "🌑"
        - type: fullMoon
          icon: "🌕"
        - type: eclipse
          icon: "🌑🌕"
        - type: retrograde
          icon: "⇄"
          label: "{planet} Retrograde"

    - type: upcomingHighlights
      title: "Upcoming Highlights"
      layout: cards
      columns: 3
      content:
        - type: highlightCard
          title: "{title}"
          date: "{date}"
          icon: "{icon}"
          color: "{color}"
          description: "{description}"
          clickable: true
          action: showDetails

#### 5.2 Transit Detail View
```yaml
transitDetail:
  type: modal
  title: "{transitTitle}"
  size: large
  sections:
    - type: transitHeader
      content:
        - type: badge
          label: "{transitType}"
          variant: type
        - type: dateRange
          start: startDate
          end: endDate
        - type: intensity
          value: intensity
          max: 10

    - type: transitVisualization
      type: chart
      showNatal: true
      showTransits: true
      highlightCurrentTransit: true

    - type: interpretationSection
      title: "Interpretation"
      content:
        - type: description
          source: interpretation.general
        - type: theme
          title: "Key Themes"
          source: interpretation.themes
          layout: chips

    - type: adviceSection
      title: "Guidance & Recommendations"
      content:
        - type: adviceCard
          title: "Best Practices"
          icon: check
          source: advice.positive
        - type: adviceCard
          title: "Challenges to Navigate"
          icon: alert
          source: advice.challenges
        - type: adviceCard
          title: "Suggestions"
          icon: lightbulb
          source: advice.suggestions

### 6. User Profile Components

#### 6.1 Profile Management
```yaml
profileManagement:
  type: tabbedPanel
  title: "My Profile"
  tabs:
    - id: account
      label: "Account"
      content:
        - type: profileHeader
          showAvatar: true
          showMemberSince: true

        - type: form
          title: "Account Details"
          fields:
            - name: name
              type: text
              label: "Display Name"
            - name: email
              type: email
              label: "Email"
              readOnly: true
            - name: timezone
              type: select
              label: "Timezone"
              options: timezoneList
          actions:
            - type: submit
              label: "Save Changes"

    - id: charts
      label: "My Charts"
      content:
        - type: chartList
          dataSource: user.charts
          item:
            type: chartCard
            title: chartName
            subtitle: "{birthDate} - {birthPlace}"
            thumbnail: chartWheel
            actions:
              - label: "View"
                action: openChart
              - label: "Edit"
                action: editChart
              - label: "Delete"
                action: deleteChart
                variant: danger

        - type: actionButton
          label: "Add New Chart"
          icon: plus
          variant: primary
          action: createChart

    - id: preferences
      label: "Preferences"
      content:
        - type: form
          title: "Chart Preferences"
          fields:
            - name: defaultHouseSystem
              type: select
              label: "Default House System"
              options: houseSystems
            - name: defaultZodiac
              type: select
              label: "Default Zodiac Type"
              options: zodiacTypes
            - name: defaultOrbs
              type: slider
              label: "Aspect Orb Sensitivity"
              min: 1
              max: 12
              unit: "degrees"
            - name: theme
              type: select
              label: "Theme"
              options:
                - value: light
                  label: "Light"
                - value: dark
                  label: "Dark"
                - value: auto
                  label: "System"

    - id: subscription
      label: "Subscription"
      content:
        - type: subscriptionCard
          title: currentPlan
          status: active
          features: planFeatures
          renewalDate: renewalDate

        - type: upgradeOptions
          title: "Available Plans"
          layout: cards
          columns: 3
          content:
            - type: planCard
              name: "Free"
              price: "$0/month"
              features: freeFeatures
              cta: "Current Plan"
              disabled: true
            - type: planCard
              name: "Premium"
              price: "$9.99/month"
              features: premiumFeatures
              highlight: true
              cta: "Upgrade"
            - type: planCard
              name: "Professional"
              price: "$29.99/month"
              features: proFeatures
              cta: "Upgrade"

### 7. Navigation & Layout Components

#### 7.1 App Layout
```yaml
appLayout:
  type: appShell
  structure:
    - type: header
      position: top
      content:
        - type: logo
          src: "/logo.svg"
          alt: "AstroSaaS"
          link: "/"
        - type: navigation
          orientation: horizontal
          items:
            - label: "Charts"
              link: "/charts"
            - label: "Forecast"
              link: "/forecast"
            - label: "Learn"
              link: "/learn"
        - type: userMenu
          position: right
          items:
            - label: "Profile"
              link: "/profile"
            - label: "Settings"
              link: "/settings"
            - label: "Logout"
              action: logout

    - type: sidebar
      position: left
      collapsible: true
      width: 280
      content:
        - type: navigationSection
          title: "Quick Actions"
          items:
            - label: "New Chart"
              icon: plus
              action: createChart
              variant: primary
            - label: "Today's Transits"
              icon: calendar
              action: todayTransits

        - type: navigationSection
          title: "My Charts"
          items:
            - label: "Natal Chart"
              icon: star
              link: "/chart/natal"
            - label: "Compatibility"
              icon: heart
              link: "/compatibility"
            - label: "Transits"
              icon: clock
              link: "/transits"

        - type: navigationSection
          title: "Tools"
          items:
            - label: "Ephemeris"
              icon: table
              link: "/ephemeris"
            - label: "Moon Calendar"
              icon: moon
              link: "/moon-calendar"
            - label: "Retrograde Calendar"
              icon: refresh
              link: "/retrograde"

    - type: main
      content: pageContent
      maxWidth: 1400

    - type: footer
      content:
        - type: link
          label: "Privacy Policy"
          link: "/privacy"
        - type: link
          label: "Terms of Service"
          link: "/terms"
        - type: link
          label: "Contact"
          link: "/contact"
        - type: text
          content: "© 2026 AstroSaaS. All rights reserved."

#### 7.2 Responsive Behavior
```yaml
responsiveBreakpoints:
  mobile:
    maxWidth: 768
    adjustments:
      - hideSidebar: true
      - showBottomNav: true
      - stackColumns: true
      - reduceChartSize: true

  tablet:
    minWidth: 769
    maxWidth: 1024
    adjustments:
      - sidebarWidth: 220
      - gridColumns: 2

  desktop:
    minWidth: 1025
    adjustments:
      - sidebarWidth: 280
      - gridColumns: 3
      - showAllColumns: true

### 8. Data Models

#### 8.1 User Data Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  createdAt: Date;
  subscription: {
    plan: 'free' | 'premium' | 'professional';
    status: 'active' | 'canceled' | 'expired';
    renewalDate?: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    defaultHouseSystem: HouseSystem;
    defaultZodiac: 'tropical' | 'sidereal';
    aspectOrbs: {
      conjunction: number;
      opposition: number;
      trine: number;
      square: number;
      sextile: number;
    };
  };
  charts: Chart[];
}
```

#### 8.2 Chart Data Model
```typescript
interface Chart {
  id: string;
  userId: string;
  name: string;
  type: 'natal' | 'synastry' | 'composite' | 'transit';
  birthData: {
    date: Date;
    time: string;
    place: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    timeUnknown: boolean;
  };
  settings: {
    houseSystem: HouseSystem;
    zodiac: 'tropical' | 'sidereal';
    sideralMode?: 'fagan-bradley' | 'lahiri';
  };
  calculatedData: {
    planets: PlanetPosition[];
    houses: HouseCusp[];
    aspects: Aspect[];
    midpoints?: Midpoint[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PlanetPosition {
  planet: Planet;
  sign: Sign;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
  latitude: number;
  longitude: number;
  speed: number;
}

interface HouseCusp {
  house: number;
  sign: Sign;
  degree: number;
  minute: number;
  second: number;
}

interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  degree: number;
  minute: number;
  orb: number;
  applying: boolean;
  separating: boolean;
}

type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
type Sign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal';
type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile';
```

#### 8.3 Transit Data Model
```typescript
interface TransitReading {
  id: string;
  userId: string;
  chartId: string;
  date: Date;
  transits: Transit[];
  moonPhase: {
    phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
    degree: number;
    sign: Sign;
  };
  highlights: TransitHighlight[];
}

interface Transit {
  transitingPlanet: Planet;
  natalPlanet: Planet;
  type: AspectType | 'house-transit';
  orb: number;
  applying: boolean;
  startDate: Date;
  endDate: Date;
  peakDate: Date;
  intensity: number; // 1-10
  interpretation: {
    general: string;
    themes: string[];
    advice: {
      positive: string[];
      challenges: string[];
      suggestions: string[];
    };
  };
}

interface TransitHighlight {
  type: 'major-transit' | 'moon-phase' | 'eclipse' | 'retrograde';
  title: string;
  date: Date;
  description: string;
  icon?: string;
  color?: string;
}
```

#### 8.4 Interpretation Data Model
```typescript
interface InterpretationDatabase {
  planets: {
    [key in Planet]: {
      signs: {
        [key in Sign]: SignInterpretation;
      };
      houses: {
        [key: number]: HouseInterpretation;
      };
    };
  };
  aspects: {
    [key in AspectType]: AspectInterpretation;
  };
  houses: {
    [key: number]: HouseMeaning;
  };
}

interface SignInterpretation {
  keywords: string[];
  general: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

interface HouseInterpretation {
  themes: string[];
  interpretation: string;
  advice: string[];
}

interface AspectInterpretation {
  keywords: string[];
  general: string;
  harmonious: boolean;
  expression: string;
  advice: string[];
}
```

### 9. API Endpoint Definitions

#### 9.1 Authentication Endpoints
```yaml
POST /api/auth/register:
  description: Create new user account
  requestBody:
    email: string
    password: string
    name: string
  response:
    user: User
    token: string

POST /api/auth/login:
  description: Authenticate user
  requestBody:
    email: string
    password: string
  response:
    user: User
    token: string

POST /api/auth/logout:
  description: Logout user
  auth: required
  response:
    success: boolean

POST /api/auth/refresh:
  description: Refresh access token
  requestBody:
    refreshToken: string
  response:
    token: string
```

#### 9.2 Chart Endpoints
```yaml
POST /api/charts:
  description: Create new chart
  auth: required
  requestBody:
    name: string
    birthData: BirthData
    settings: ChartSettings
  response:
    chart: Chart

GET /api/charts:
  description: Get all user charts
  auth: required
  response:
    charts: Chart[]

GET /api/charts/:id:
  description: Get specific chart
  auth: required
  response:
    chart: Chart

PUT /api/charts/:id:
  description: Update chart
  auth: required
  requestBody:
    name?: string
    settings?: ChartSettings
  response:
    chart: Chart

DELETE /api/charts/:id:
  description: Delete chart
  auth: required
  response:
    success: boolean

POST /api/charts/:id/calculate:
  description: Calculate chart (if not cached)
  auth: required
  response:
    chart: Chart
```

#### 9.3 Analysis Endpoints
```yaml
GET /api/analysis/:chartId:
  description: Get personality analysis
  auth: required
  response:
    analysis: PersonalityAnalysis

GET /api/analysis/:chartId/aspects:
  description: Get aspect analysis
  auth: required
  response:
    aspects: AspectAnalysis

GET /api/analysis/:chartId/patterns:
  description: Get aspect patterns
  auth: required
  response:
    patterns: Pattern[]
```

#### 9.4 Transit Endpoints
```yaml
POST /api/transits/calculate:
  description: Get transits for date range
  auth: required
  requestBody:
    chartId: string
    startDate: Date
    endDate: Date
  response:
    transits: TransitReading[]

GET /api/transits/today:
  description: Get today's transits
  auth: required
  response:
    transits: TransitReading

GET /api/transits/calendar:
  description: Get transit calendar data
  auth: required
  query:
    month: number
    year: number
  response:
    calendar: TransitCalendar

GET /api/transits/:id:
  description: Get specific transit details
  auth: required
  response:
    transit: Transit
```

### 10. Color Palette & Theme System

```yaml
theme:
  light:
    primary: "#6366F1"      # Indigo 500
    secondary: "#8B5CF6"    # Violet 500
    accent: "#F59E0B"       # Amber 500
    success: "#10B981"      # Emerald 500
    warning: "#F59E0B"      # Amber 500
    danger: "#EF4444"       # Red 500
    background: "#FFFFFF"   # White
    surface: "#F9FAFB"      # Gray 50
    text: "#111827"         # Gray 900
    textSecondary: "#6B7280" # Gray 500
    border: "#E5E7EB"       # Gray 200

  dark:
    primary: "#818CF8"      # Indigo 400
    secondary: "#A78BFA"    # Violet 400
    accent: "#FBBF24"       # Amber 400
    success: "#34D399"      # Emerald 400
    warning: "#FBBF24"      # Amber 400
    danger: "#F87171"       # Red 400
    background: "#111827"   # Gray 900
    surface: "#1F2937"      # Gray 800
    text: "#F9FAFB"         # Gray 50
    textSecondary: "#9CA3AF" # Gray 400
    border: "#374151"       # Gray 700

  zodiac:
    fire: "#EF4444"         # Aries, Leo, Sagittarius
    earth: "#10B981"        # Taurus, Virgo, Capricorn
    air: "#3B82F6"          # Gemini, Libra, Aquarius
    water: "#6366F1"        # Cancer, Scorpio, Pisces

  planets:
    sun: "#FFD700"          # Gold
    moon: "#C0C0C0"         # Silver
    mercury: "#8B4513"      # SaddleBrown
    venus: "#FF69B4"        # HotPink
    mars: "#FF0000"         # Red
    jupiter: "#FFA500"      # Orange
    saturn: "#696969"       # DimGray
    uranus: "#40E0D0"       # Turquoise
    neptune: "#4169E1"      # RoyalBlue
    pluto: "#8B0000"        # DarkRed

  aspects:
    conjunction: "#FF0000"  # Red
    opposition: "#FF0000"   # Red
    trine: "#00FF00"        # Green
    square: "#FF6600"       # Orange
    sextile: "#00BFFF"      # DeepSkyBlue
    quincunx: "#9932CC"     # DarkOrchid
```

---
<!--
  REMINDER: The 2-Action Rule
  After every 2 view/browser/search operations, you MUST update this file.
  This prevents visual information from being lost when context resets.
-->
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
