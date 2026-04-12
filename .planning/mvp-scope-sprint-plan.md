# AstroVerse MVP Scope, User Stories & Sprint Plan

## Executive Summary

**Updated assessment:** The AstroVerse codebase is significantly more complete than previously documented. An audit of 80+ API endpoints, 22 frontend pages, 22 database tables, and all backend modules reveals that **the core product is ~85% complete**. Real astronomical calculations (via `astronomy-engine`) power all chart, transit, synastry, and return features. Stripe billing, OpenAI interpretations, email, PDF generation, and push notifications are all implemented.

The remaining 15% is deployment infrastructure, minor stub completion, test stabilization, and UX polish — not core feature development.

---

## 1. Competitive Analysis

### Market Size
- Global astrology app market: **$4.7B (2025) → $5.7B (2026)**, CAGR ~20%
- Key growth drivers: Gen Z wellness interest, AI personalization, smartphone penetration

### Competitor Comparison

| Feature | Co-Star | The Pattern | Sanctuary | **AstroVerse** |
|---------|---------|-------------|-----------|----------------|
| Graphical Chart Wheel | No (list only) | No (hidden) | Yes (interactive) | **Yes (SVG/D3)** |
| Daily Horoscopes | Yes (AI) | No (cycles) | Yes | **Transit-based** |
| Synastry/Compatibility | Yes (friends) | Yes (Bonds) | Limited | **Full (aspects, scores)** |
| AI Interpretations | Yes (primary) | Yes (primary) | Minimal | **Yes (OpenAI GPT-4)** |
| Live Human Astrologers | No | No | Yes (core) | No |
| Transit Tracking | Implicit | Implicit | Explicit | **Explicit + Forecasts** |
| Social/Friends | Strong (30M users) | Moderate | Weak | No (deferred) |
| Educational Content | Minimal | No | Strong | **Yes (Learning Center)** |
| Web/PWA | No | No | No | **Yes (PWA ready)** |
| Solar/Lunar Returns | No | No | No | **Yes (full feature)** |
| Calendar/Events | No | No | No | **Yes (astro calendar)** |
| PDF Reports | No | No | No | **Yes (Puppeteer)** |

### AstroVerse Competitive Advantages
1. **Full interactive chart wheel + transit overlay + AI interpretations** — no competitor offers all three
2. **Web/PWA** — all three competitors are mobile-only; AstroVerse serves desktop users
3. **Solar/Lunar returns** — no major competitor ships these features
4. **Astrological calendar** — unique transit-based event planning
5. **Educational learning center** — only Sanctuary competes here
6. **PDF report generation** — unique value for sharing and offline use

### AstroVerse Competitive Gaps (Post-MVP)
1. **Social graph / friend features** — Co-Star's growth engine; defer to v2
2. **Push notification engagement loop** — implemented but needs content strategy
3. **Brand recognition** — zero vs. Co-Star's cultural meme status
4. **Live human astrologers** — Sanctuary's moat; marketplace model possible in v2

---

## 2. MVP Scope Definition

### IN SCOPE (MVP Launch)

| Feature | Current Status | Gap to Close |
|---------|---------------|--------------|
| User Auth (register/login/logout/password reset) | COMPLETE | None — production-ready |
| Natal Chart Creation + Visualization | COMPLETE | None — real calculations via astronomy-engine |
| AI Chart Interpretation (GPT-4) | COMPLETE | Usage gating by tier needs verification |
| Subscription + Stripe Billing | COMPLETE | Verify Stripe live keys configured |
| Transit Forecasts | COMPLETE | Minor: `GET /transits/:id` stub returns null |
| Synastry/Compatibility | COMPLETE | None — full aspect-level comparison |
| Solar/Lunar Returns | COMPLETE | Minor: `GET /lunar-return/current` is 501 |
| Calendar + Moon Phases | COMPLETE | None |
| Learning Center | COMPLETE | Verify content quality |
| Profile Management | COMPLETE | None |
| Chart Sharing | COMPLETE | None |
| PDF Reports | COMPLETE | None |
| Push Notifications | COMPLETE | Needs engagement content strategy |
| Timezone + Location Services | COMPLETE | None |
| Production Deployment | NOT DONE | **Critical gap — must provision** |
| Test Suite Stabilization | PARTIAL | Some skipped/failing tests |
| Seed Data | MINIMAL | Only interpretations seeded — need demo data |

### DEFERRED (Post-MVP v2)

| Feature | Reason |
|---------|--------|
| Social graph / friend system | Complex, requires critical mass — Co-Star's 30M user moat can't be challenged at launch |
| Live astrologer marketplace | Requires supply-side recruitment, trust/safety, payments to practitioners |
| Advanced pattern detection (Yod, T-square detection) | Nice-to-have; basic stelliums work |
| Mobile native apps (iOS/Android) | PWA serves mobile; native apps after product-market fit |
| V2 API expansion | V1 is complete; v2 is future scope |
| Chart comparison for >2 charts | Synastry is 2-chart only; multi-chart is niche |
| Community features (forums, comments) | Requires moderation infrastructure |
| Horoscope push notification content engine | Needs content strategy and copywriting |

---

## 3. User Stories — MVP Sprint Backlog

### Sprint 1: Deployment & Infrastructure (Weeks 1-2)

**US-1.1: Production Environment Provisioning**
> As the product team, we need the app deployed to production, so that real users can access AstroVerse.

- **Priority:** Critical (P0)
- **Assign to:** CTO / Backend Engineer
- **Acceptance Criteria:**
  - [ ] Backend deployed (Docker Compose) with PostgreSQL 15
  - [ ] Frontend deployed and connected to production API
  - [ ] All 22 migrations run successfully on production DB
  - [ ] Seed data loaded (zodiac interpretations)
  - [ ] Environment variables configured (Stripe live keys, OpenAI key, Resend key, JWT secret, CSRF secret)
  - [ ] SSL/HTTPS configured with custom domain
  - [ ] Health check endpoint returns 200 at production URL
  - [ ] CORS configured for production frontend origin

---

**US-1.2: Fix Remaining API Stubs**
> As a user, I want all API endpoints to return real data, so that no feature breaks mid-journey.

- **Priority:** High (P0)
- **Assign to:** Backend Engineer
- **Acceptance Criteria:**
  - [ ] `GET /api/v1/lunar-return/current` returns real current lunar return data (not 501)
  - [ ] `GET /api/v1/transits/:id` returns stored transit reading by ID (not null)
  - [ ] Both endpoints have unit tests
  - [ ] No other 501 stubs remain in the codebase

---

**US-1.3: Stripe Live Configuration & Billing Verification**
> As a user, I want to subscribe to a Pro plan via real Stripe, so that I can access premium features.

- **Priority:** High (P0)
- **Assign to:** Backend Engineer
- **Depends on:** US-1.1
- **Acceptance Criteria:**
  - [ ] Stripe live keys configured in production environment
  - [ ] Webhook endpoint publicly accessible and verifying signatures
  - [ ] Test checkout flow end-to-end: select plan → Stripe Checkout → success redirect → subscription activated
  - [ ] Customer Portal accessible for plan management
  - [ ] Free tier limits enforced: max 3 charts, limited AI interpretations
  - [ ] Pro tier unlocks: up to 25 charts, unlimited AI
  - [ ] Subscription confirmation email sent via Resend

---

**US-1.4: Seed Data & Demo Content**
> As a new user, I want the app to have a populated feel, so that I don't encounter empty states everywhere.

- **Priority:** Medium (P1)
- **Assign to:** Backend Engineer
- **Acceptance Criteria:**
  - [ ] Demo user account created (for testing, not public)
  - [ ] Sample chart data seeded for onboarding demonstration
  - [ ] Learning Center has at least 3 courses with lessons
  - [ ] Calendar has global moon phase events for current year
  - [ ] Empty-state components render gracefully when no user data exists

---

### Sprint 2: Quality & Testing (Weeks 3-4)

**US-2.1: Test Suite Stabilization**
> As the engineering team, we need all tests passing, so that we can ship with confidence.

- **Priority:** High (P0)
- **Assign to:** QA Engineer
- **Acceptance Criteria:**
  - [ ] All backend Jest tests pass (0 skipped, 0 failing)
  - [ ] All frontend Vitest tests pass
  - [ ] ESLint passes with 0 errors across both workspaces
  - [ ] TypeScript compilation clean (`tsc --noEmit`) on both workspaces
  - [ ] CI pipeline green on main branch

---

**US-2.2: End-to-End Test Coverage**
> As the QA team, we need E2E tests for the core user journey, so that regressions are caught before release.

- **Priority:** High (P1)
- **Assign to:** QA Engineer
- **Depends on:** US-1.1 (needs staging environment)
- **Acceptance Criteria:**
  - [ ] E2E test: User registers → creates chart → views chart detail
  - [ ] E2E test: User views AI interpretation of their chart
  - [ ] E2E test: User initiates subscription checkout
  - [ ] E2E test: User views transit forecast
  - [ ] E2E tests pass on staging environment
  - [ ] E2E tests run in CI pipeline

---

**US-2.3: Subscription Tier Enforcement Verification**
> As a Pro subscriber, I want the system to respect my plan limits, so that I get what I paid for.

- **Priority:** High (P1)
- **Assign to:** Backend Engineer
- **Acceptance Criteria:**
  - [ ] Free user blocked from creating 4th chart with clear upgrade CTA
  - [ ] AI interpretation requests counted and limited per tier
  - [ ] Premium features (solar/lunar returns, synastry reports) gated by plan
  - [ ] Subscription status refreshes within 5 minutes of Stripe webhook
  - [ ] Downgrade flow preserves existing data but blocks new premium actions

---

### Sprint 3: UX Polish & Onboarding (Weeks 5-6)

**US-3.1: Onboarding Flow Optimization**
> As a first-time visitor, I want a smooth path to my first chart, so that I experience value immediately.

- **Priority:** Medium (P2)
- **Assign to:** UX Designer / Frontend Engineer
- **Acceptance Criteria:**
  - [ ] Landing page clearly communicates value proposition (chart wheel + AI + transits)
  - [ ] Registration to first chart under 3 clicks/taps
  - [ ] Welcome modal guides new users after registration
  - [ ] Empty dashboard state shows CTAs (not blank page)
  - [ ] Chart creation wizard handles timezone and location smoothly

---

**US-3.2: Accessibility & Responsive Design Audit**
> As a user on mobile, I want the app to be usable on any device, so that I can check transits on the go.

- **Priority:** Medium (P2)
- **Assign to:** UX Designer
- **Acceptance Criteria:**
  - [ ] WCAG 2.1 AA compliance on core pages (home, chart creation, chart view, subscription)
  - [ ] Chart wheel renders correctly on mobile viewports (320px–768px)
  - [ ] Navigation accessible on mobile (hamburger menu tested)
  - [ ] Form inputs have proper labels, ARIA attributes, and error messages
  - [ ] Keyboard navigation works for chart creation wizard

---

**US-3.3: Performance Optimization**
> As a user on a slow connection, I want pages to load quickly, so that I don't abandon the app.

- **Priority:** Low (P3)
- **Assign to:** Frontend Engineer
- **Acceptance Criteria:**
  - [ ] Largest Contentful Paint < 2.5s on landing page
  - [ ] API response times < 500ms for non-AI endpoints
  - [ ] Chart rendering < 1s after data loaded
  - [ ] Bundle size analyzed and optimized (code splitting verified)
  - [ ] Image assets compressed (WebP where supported)

---

### Sprint 4: Launch (Week 7)

**US-4.1: Production Launch**
> As the product team, we want AstroVerse live for real users, so that we can start validating product-market fit.

- **Priority:** Critical (P0)
- **Assign to:** CTO
- **Depends on:** All Sprint 1–3 stories
- **Acceptance Criteria:**
  - [ ] All Sprint 1–3 user stories done
  - [ ] Production environment smoke tests pass
  - [ ] Stripe live mode processing real payments
  - [ ] Error monitoring active (Sentry or equivalent)
  - [ ] Analytics tracking configured (page views, events, conversion funnel)
  - [ ] Domain configured with SSL
  - [ ] Documentation updated (README, deployment guide)
  - [ ] Rollback plan documented and tested

---

## 4. Sprint Plan Summary

| Sprint | Theme | Stories | Priority | Duration |
|--------|-------|---------|----------|----------|
| Sprint 1 | Deployment & Infrastructure | US-1.1, US-1.2, US-1.3, US-1.4 | P0–P1 | Weeks 1–2 |
| Sprint 2 | Quality & Testing | US-2.1, US-2.2, US-2.3 | P0–P1 | Weeks 3–4 |
| Sprint 3 | UX Polish & Onboarding | US-3.1, US-3.2, US-3.3 | P2–P3 | Weeks 5–6 |
| Sprint 4 | Launch | US-4.1 | P0 | Week 7 |
| **Total** | | **11 stories** | | **7 weeks** |

### Dependency Chain
```
US-1.1 (Production Deploy)
  +-- US-1.3 (Stripe Live Config) — needs production env
  +-- US-1.4 (Seed Data) — needs production DB

US-1.2 (Fix Stubs) — independent

Sprint 1 complete --> Sprint 2 (tests need staging env)
Sprint 2 complete --> Sprint 3 (polish needs stable base)
Sprint 3 complete --> US-4.1 (Launch)
```

### Story Count by Priority
| Priority | Count |
|----------|-------|
| Critical (P0) | 4 stories |
| High (P1) | 4 stories |
| Medium (P2) | 2 stories |
| Low (P3) | 1 story |

---

## 5. MVP Success Metrics (KPIs)

### Acquisition
| KPI | Target | Measurement |
|-----|--------|-------------|
| Monthly Active Users (MAU) | 500 within 30 days | Analytics (unique visitors with auth) |
| Registration conversion rate | >15% of landing page visitors | Landing → Register funnel |
| Chart creation rate | >80% of registered users create ≥1 chart | Analytics event tracking |

### Activation
| KPI | Target | Measurement |
|-----|--------|-------------|
| Time to first chart | <3 minutes from registration | Event timestamp diff |
| AI interpretation usage | >60% of chart creators request interpretation | API usage tracking |
| Return visit rate | >30% within 7 days | Auth session tracking |

### Revenue
| KPI | Target | Measurement |
|-----|--------|-------------|
| Free-to-paid conversion | >5% within 30 days | Stripe subscription events |
| Average Revenue Per User (ARPU) | >$8/month | Stripe revenue / active subscribers |
| AI interpretation cost ratio | <30% of subscription revenue | OpenAI usage vs. Stripe revenue |

### Engagement
| KPI | Target | Measurement |
|-----|--------|-------------|
| Charts per user | >2 average | Database query |
| Transit forecast views | >40% of MAU check transits | API endpoint tracking |
| Session duration | >5 minutes average | Analytics session tracking |

### Technical
| KPI | Target | Measurement |
|-----|--------|-------------|
| API uptime | >99.5% | Health check monitoring |
| API response time (p95) | <500ms (non-AI), <5s (AI) | Server metrics |
| Error rate | <1% of requests | Error monitoring (Sentry) |
| Test pass rate | 100% | CI pipeline |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe webhook failures in production | Medium | High — users pay but don't get access | Implement retry logic + manual reconciliation dashboard |
| OpenAI API costs exceed revenue | Medium | High — unsustainable unit economics | Enforce strict per-tier limits; cache aggressively; monitor daily |
| Low registration conversion | Medium | Medium — slow growth | A/B test landing page; add social proof; simplify onboarding |
| Chart calculation accuracy complaints | Low | High — trust is core to astrology product | Validate against 5+ known birth dates; add disclaimer |
| Astrology app market saturation | Medium | Medium — user acquisition costly | Differentiate on web/PWA, transit depth, solar/lunar returns |

---

## 7. Recommended Next Steps

1. **CEO approval** of this MVP scope and sprint plan
2. **Assign Sprint 1 stories** to Backend Engineer / CTO
3. **Provision staging environment** as the first concrete action
4. **Set up error monitoring** (Sentry) before any deployment
5. **Configure analytics** (Mixpanel/PostHog) for KPI tracking from day one
