# Sprint 8 — UX Polish, Accessibility & Production Readiness

> **Branch:** `sprint/8-ux-polish-deployment`
> **Duration:** Weeks 8–9 (following Sprint 7 production readiness)
> **Theme:** Close the UX gap, fix accessibility blockers, prepare for production deployment

---

## Sprint 7 Retrospective

### What was accomplished
- Fixed 5 lint errors (backend + frontend) blocking CI
- Fixed visual regression test pipeline — generated Linux baselines, auto-commit workflow
- Fixed ShareModal flaky test (AnimatePresence timing)
- CI/CD pipeline: **8/8 jobs green** (backend-test, frontend-test, live-tests, bdd-tests, visual-tests, e2e-tests, integration-tests, accessibility-tests)
- Mutation testing: **passing**
- PR #9 squash-merged to master (`7c65f5f`)

### Key learnings
- Visual tests had Windows-only baselines (`*-win32.png`) — CI runs Linux. Fixed via `workflow_dispatch` with `--update-snapshots`
- `inputs` context in GitHub Actions requires `${{ }}` syntax for proper evaluation
- `contents: write` permission needed for auto-committing baselines
- Git worktrees on WSL have path issues (`C:/` vs `/mnt/c/`) — use GitHub API directly for file operations

---

## Sprint 8 Goals

| Goal | Priority | Story Points |
|------|----------|-------------|
| US-8.1: Fix 40 UI review issues | P0 | 13 |
| US-8.2: Accessibility audit fixes (WCAG 2.1 AA) | P0 | 8 |
| US-8.3: Production deployment infrastructure | P0 | 8 |
| US-8.4: Onboarding flow optimization | P1 | 5 |
| US-8.5: Performance optimization | P2 | 3 |
| **Total** | | **37** |

---

## US-8.1: Fix 40 UI Review Issues

> As a user, I want the app to look polished and consistent, so that it feels professional.

**Priority:** P0 | **Assign:** Frontend Engineer | **Est:** 13pt

### Phase 1: Critical Fixes (PR 1–3)

**PR 1: Fix Duplicate React Crash [C1]**
- File: `frontend/vite.config.ts`
- Add `dedupe: ['react', 'react-dom']` to resolve config
- Verify: no `Invalid hook call` errors

**PR 2: HomePage Mobile Menu + Star Rating [C2, H5]**
- File: `frontend/src/pages/HomePage.tsx`
- Wire hamburger button to mobile slide-out menu
- Add `sr-only` span for star rating accessibility

**PR 3: ForgotPassword API Integration [C4]**
- File: `frontend/src/pages/ForgotPasswordPage.tsx`
- Wire to `POST /v1/auth/forgot-password` with loading/error states

### Phase 2: Auth Unification (PR 4)

**PR 4: Auth Form Unification [C5, C3, H8, H1, H2]**
- Create `AuthLayout.tsx` — split-screen wrapper for login/register
- Refactor LoginPage + RegisterPage to use shared `AuthenticationForms.tsx`
- Fixes: error handling, password toggle, mobile layout consistency

### Phase 3: Design Token Cleanup (PR 5–7)

**PR 5: CSS Component Classes → Cosmic Theme [Task 1]**
- Fix `.btn-primary`, `.btn-secondary`, `.card`, `.input` to use design tokens
- Replace hardcoded hex values with `var(--color-*)`

**PR 6: PublicPageLayout + Missing Exports [Tasks 3–4]**
- Create `PublicPageLayout.tsx` for Home/Login/Register pages
- Add missing barrel exports

**PR 7: AppLayout Cleanup [Task 5]**
- Remove dead code, fix footer dead links, add missing nav items

### Acceptance Criteria
- [ ] All 40 issues from UI review resolved
- [ ] Visual regression tests updated and passing
- [ ] No console errors on any page
- [ ] Mobile menu works on all viewports

---

## US-8.2: Accessibility Audit Fixes (WCAG 2.1 AA)

> As a user with disabilities, I want the app to be navigable by keyboard and screen reader.

**Priority:** P0 | **Assign:** UX Designer + Frontend | **Est:** 8pt

### Tasks
1. **Remove `outline: none`** from `index.css` — violates WCAG 2.4.7
2. **Add `aria-hidden` to 130+ decorative icons** — audit-based, not bulk
3. **Add missing `<h1>` to 18 pages** — proper heading hierarchy
4. **Focus trap on ShareManagement modal** — keyboard users can't escape
5. **ARIA labels on theme selector** — screen reader announces state
6. **Auth boundary on static pages** — prevent logged-in users from seeing public pages
7. **Skip-to-content links** on all standalone pages (Home, Login, Register)
8. **Form validation ARIA** — `aria-invalid`, `aria-describedby` on all inputs

### Acceptance Criteria
- [ ] `* { outline: none }` removed
- [ ] All interactive elements reachable via keyboard Tab
- [ ] Screen reader announces page purpose on all routes
- [ ] axe-core automated audit: 0 violations
- [ ] Focus visible on all interactive elements

---

## US-8.3: Production Deployment Infrastructure

> As the product team, we need the app deployed to production, so real users can access AstroVerse.

**Priority:** P0 | **Assign:** Backend Engineer / DevOps | **Est:** 8pt

### Tasks

**8.3.1: Server Provisioning**
- Provision VPS (Hetzner/DigitalOcean) or configure Docker Compose on existing host
- PostgreSQL 15 + Redis containers
- Nginx reverse proxy with SSL (Let's Encrypt)
- Environment variables: JWT secret, CSRF secret, Stripe keys, OpenAI key, Resend key

**8.3.2: CI/CD Pipeline for Deployment**
- Add `deploy.yml` workflow — deploy on merge to master
- Build Docker images, push to registry, pull on server
- Run migrations on deploy
- Health check verification post-deploy

**8.3.3: DNS & SSL**
- Configure domain DNS (A record → server IP)
- Let's Encrypt SSL certificate
- CORS configured for production origin

**8.3.4: Monitoring & Error Tracking**
- Sentry for error tracking (both frontend + backend)
- Health check endpoint (`GET /health`) monitored externally
- Structured logging to file + stdout

**8.3.5: Stripe Live Configuration**
- Switch from test to live Stripe keys
- Verify webhook endpoint publicly accessible
- Test end-to-end checkout flow
- Customer portal accessible

### Acceptance Criteria
- [ ] App accessible at production URL with HTTPS
- [ ] Health check returns 200
- [ ] All 22 migrations run on production DB
- [ ] Stripe webhook verifies signatures
- [ ] Sentry capturing errors from both frontend + backend
- [ ] Deploy pipeline: push to master → auto-deploy

---

## US-8.4: Onboarding Flow Optimization

> As a first-time visitor, I want a smooth path to my first chart.

**Priority:** P1 | **Assign:** Frontend Engineer + UX | **Est:** 5pt

### Tasks
1. Landing page value prop audit — ensure chart wheel + AI + transits clearly communicated
2. Registration → first chart in under 3 clicks
3. Welcome modal after registration with guided CTA
4. Empty dashboard state with clear CTAs (not blank)
5. Chart creation wizard — timezone and location UX improvements

### Acceptance Criteria
- [ ] New user can reach chart creation in ≤3 clicks from landing
- [ ] Empty states render with actionable CTAs
- [ ] Welcome modal appears after first registration

---

## US-8.5: Performance Optimization

> As a user on a slow connection, I want pages to load fast.

**Priority:** P2 | **Assign:** Frontend Engineer | **Est:** 3pt

### Tasks
1. Lighthouse audit — measure baseline LCP, FID, CLS
2. Bundle analysis — verify code splitting works (Vite manual chunks)
3. Image optimization — WebP where supported, lazy loading
4. API response time audit — non-AI endpoints < 500ms

### Acceptance Criteria
- [ ] LCP < 2.5s on landing page
- [ ] Bundle size analyzed, no chunk > 200KB (gzipped)
- [ ] Images use lazy loading + WebP where possible

---

## Dependency Graph

```
US-8.3.1 (Server Provisioning)
  +-- US-8.3.2 (Deploy Pipeline)
  +-- US-8.3.3 (DNS & SSL)
  +-- US-8.3.4 (Monitoring)
  +-- US-8.3.5 (Stripe Live)

US-8.1 (UI Fixes) — independent, parallel with 8.3
  +-- US-8.2 (Accessibility) — overlaps with 8.1

US-8.4 (Onboarding) — depends on 8.1 (polish first)
US-8.5 (Performance) — independent
```

---

## Kanban Board Update

| Task ID | Title | Priority | Assignee | Depends |
|---------|-------|----------|----------|---------|
| t_ui40_1 | Fix Duplicate React crash | P0 | frontend-eng | — |
| t_ui40_2 | HomePage mobile menu + star rating | P0 | frontend-eng | — |
| t_ui40_3 | ForgotPassword API integration | P0 | frontend-eng | — |
| t_ui40_4 | Auth form unification | P0 | frontend-eng | — |
| t_ui40_5 | CSS classes → design tokens | P1 | frontend-eng | — |
| t_ui40_6 | PublicPageLayout + exports | P1 | frontend-eng | t_ui40_4 |
| t_ui40_7 | AppLayout cleanup | P1 | frontend-eng | — |
| t_a11y_1 | Remove outline:none | P0 | frontend-eng | — |
| t_a11y_2 | aria-hidden on icons | P0 | frontend-eng | — |
| t_a11y_3 | Missing h1 on 18 pages | P0 | frontend-eng | — |
| t_a11y_4 | Focus trap + skip links | P0 | frontend-eng | — |
| t_deploy_1 | Server provisioning | P0 | devops | — |
| t_deploy_2 | CI/CD deploy pipeline | P0 | devops | t_deploy_1 |
| t_deploy_3 | DNS + SSL | P0 | devops | t_deploy_1 |
| t_deploy_4 | Sentry monitoring | P0 | devops | t_deploy_1 |
| t_deploy_5 | Stripe live config | P0 | backend-eng | t_deploy_1 |
| t_onboard_1 | Onboarding flow optimization | P1 | frontend-eng | t_ui40_4 |
| t_perf_1 | Performance audit + optimization | P2 | frontend-eng | — |

---

## Sprint 8 Progress Tracking

- [ ] US-8.1: UI Review Issues (0/40 fixed)
- [ ] US-8.2: Accessibility (0/8 tasks done)
- [ ] US-8.3: Production Deploy (0/5 tasks done)
- [ ] US-8.4: Onboarding (0/5 tasks done)
- [ ] US-8.5: Performance (0/4 tasks done)
