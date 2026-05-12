# AstroVerse Production Deployment Plan — Free Hosting

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Deploy AstroVerse to production using 100% free hosting across 4 platforms.

**Architecture:** Hybrid deployment — Vercel (frontend SPA) + Fly.io (Express backend in Docker) + Neon (serverless PostgreSQL) + Upstash (Redis cache). All permanently free tiers.

**Tech Stack:** Express 4, React 18, PostgreSQL 15, Redis 7, Docker, GHCR

---

## Architecture Overview

```
User Browser
    ↓
  Vercel (React SPA + CDN)
    ↓ /api/* proxy
  Fly.io (Express backend Docker)
    ↓           ↓
  Neon (PostgreSQL)   Upstash (Redis)
```

| Component | Platform | Free Tier | Limits |
|-----------|----------|-----------|--------|
| React Frontend | **Vercel** Hobby | Permanent free | 100GB bandwidth/month |
| Express Backend | **Fly.io** | 3 free VMs (256MB each) | 3 shared-cpu-1x VMs |
| PostgreSQL | **Neon** | 0.5GB storage, 100 compute hrs | 1 project, 10 branches |
| Redis | **Upstash** | 10K commands/day, 256MB | Serverless/REST |
| Container Registry | **GHCR** | Free for public repos | Unlimited |

---

## Phase 1: External Database Setup (Neon + Upstash)

### Task 1.1: Create Neon PostgreSQL database

**Objective:** Provision a free serverless PostgreSQL database on Neon.

**Steps:**
1. Go to https://neon.tech → Sign up with GitHub
2. Create new project: `astroverse-prod`
3. Select region closest to Fly.io region (same region = lower latency)
4. Copy the connection string (format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/astroverse_prod?sslmode=require`)
5. Save connection string — needed for Fly.io backend env vars

**Verification:** `psql` or `pg_isready` against the Neon connection string

---

### Task 1.2: Create Upstash Redis instance

**Objective:** Provision free Redis on Upstash.

**Steps:**
1. Go to https://upstash.com → Sign up with GitHub
2. Create new Redis database: `astroverse-prod`
3. Select same region as Neon/Fly.io
4. Copy the Redis URL (format: `rediss://default:xxx@us1-xxx.upstash.io:6379`)
5. Note: Upstash also offers REST API — can use `@upstash/redis` package OR standard `ioredis` with the Redis URL

**Verification:** `redis-cli -u <rediss-url> ping` → should return `PONG`

**Code change needed:** Backend currently uses `ioredis` directly. Upstash Redis is compatible with `ioredis` — just use the `rediss://` URL. No code changes needed for basic usage. If we want the REST API for edge/serverless, add `@upstash/redis` as an alternative.

---

### Task 1.3: Run database migrations against Neon

**Objective:** Migrate the production schema to Neon PostgreSQL.

**Steps:**
1. Set env vars locally:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/astroverse_prod?sslmode=require
   NODE_ENV=production
   ```
2. Run migrations:
   ```bash
   cd backend && npx tsx scripts/migrate.ts
   ```
3. Run seeds (optional — for initial data):
   ```bash
   cd backend && npx knex seed:run --env production
   ```

**Verification:** Connect to Neon dashboard → check tables exist in the SQL editor

---

## Phase 2: Backend Deployment (Fly.io)

### Task 2.1: Install Fly.io CLI and authenticate

**Objective:** Set up `flyctl` for deployment.

**Steps:**
1. Install flyctl:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. Authenticate:
   ```bash
   flyctl auth login
   ```
3. Verify:
   ```bash
   flyctl auth whoami
   ```

**Verification:** `flyctl apps list` runs without error

---

### Task 2.2: Create combined backend+frontend Docker image for Fly.io

**Objective:** Create a single Docker image that serves both the React SPA (as static files) and the Express API, reducing the number of VMs needed from 2 to 1.

**Files:**
- Create: `Dockerfile.fly` (combined backend + frontend)

```dockerfile
# ---- Stage 1: Build frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY frontend/ ./frontend/
RUN npm ci --workspaces
RUN cd packages/shared-types && npm run build
RUN cd packages/shared-utils && npm run build
RUN cd packages/shared-constants && npm run build
RUN cd frontend && VITE_API_URL="" npm run build

# ---- Stage 2: Build backend ----
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY backend/ ./backend/
RUN npm ci --workspaces
RUN cd packages/shared-types && npm run build
RUN cd packages/shared-utils && npm run build
RUN cd packages/shared-constants && npm run build
RUN cd backend && npx tsc

# ---- Stage 3: Production runtime ----
FROM node:20-alpine
RUN apk add --no-cache tini
WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY packages/ ./packages/
COPY backend/package*.json ./backend/

# Install production deps only
RUN npm ci --omit=dev --workspaces

# Copy built artifacts
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend static files and migrations
COPY backend/migrations ./backend/migrations
COPY backend/seeds ./backend/seeds
COPY backend/scripts ./backend/scripts
COPY backend/knexfile.ts ./backend/knexfile.ts

# Serve frontend from Express
# We'll add a static file middleware in server.ts

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/dist/server.js"]
```

**Code change:** Add static file serving to `backend/src/server.ts`:
```typescript
// Serve React SPA in production
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}
```

**Verification:** `docker build -f Dockerfile.fly -t astroverse .` succeeds locally

---

### Task 2.3: Configure Fly.io app

**Objective:** Create and configure the Fly.io application.

**Steps:**
1. Create `fly.toml` at project root:
```toml
app = "astroverse"
primary_region = "iad"  # or closest to Neon region

[build]
  dockerfile = "Dockerfile.fly"

[env]
  PORT = "8080"
  NODE_ENV = "production"
  SERVE_FRONTEND = "true"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

2. Create the app:
   ```bash
   flyctl apps create astroverse
   ```

3. Set secrets (env vars):
   ```bash
   flyctl secrets set \
     DATABASE_URL="postgresql://..." \
     REDIS_URL="rediss://..." \
     JWT_SECRET="[REDACTED]" \
     JWT_EXPIRES_IN="7d" \
     JWT_REFRESH_EXPIRES_IN="30d" \
     OPENAI_API_KEY="[REDACTED]" \
     STRIPE_SECRET_KEY="[REDACTED]" \
     STRIPE_WEBHOOK_SECRET="[REDACTED]" \
     FRONTEND_URL="https://astroverse.vercel.app" \
     ALLOWED_ORIGINS="https://astroverse.vercel.app"
   ```

**Verification:** `flyctl apps list` shows `astroverse`

---

### Task 2.4: Deploy backend to Fly.io

**Objective:** Push the Docker image and start the app.

**Steps:**
1. First deploy:
   ```bash
   flyctl deploy --remote-only
   ```
2. Check status:
   ```bash
   flyctl status
   ```
3. Check logs:
   ```bash
   flyctl logs
   ```
4. Verify health:
   ```bash
   curl https://astroverse.fly.dev/api/health
   ```

**Verification:** Health endpoint returns `{ "success": true }`

---

## Phase 3: Frontend Deployment (Vercel)

### Task 3.1: Create Vercel project

**Objective:** Deploy React SPA to Vercel.

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Login:
   ```bash
   vercel login
   ```
3. Deploy from `frontend/` directory:
   ```bash
   cd frontend && vercel --prod
   ```
   - Framework preset: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = `https://astroverse.fly.dev`

**Verification:** `https://astroverse.vercel.app` loads the React app

---

### Task 3.2: Configure API proxy in Vercel

**Objective:** Proxy `/api/*` requests from Vercel to Fly.io backend.

**Files:**
- Create: `frontend/vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://astroverse.fly.dev/api/:path*" }
  ]
}
```

**Note:** If we serve frontend from Fly.io (Task 2.2 approach), this step is optional — the frontend is already on the same origin. But having Vercel as CDN with proxy gives better global performance.

**Verification:** `curl https://astroverse.vercel.app/api/health` returns backend response

---

## Phase 4: Domain + SSL + DNS

### Task 4.1: Add custom domain (if available)

**Objective:** Point a custom domain to Vercel.

**Steps:**
1. In Vercel dashboard → Settings → Domains → Add domain
2. Add DNS records at your domain registrar:
   - `CNAME` → `cname.vercel-dns.com` (for apex or subdomain)
   - Or `A` record → `76.76.21.21` (for apex domain)
3. Vercel auto-provisions SSL via Let's Encrypt

For Fly.io backend:
4. `flyctl certs add api.yourdomain.com`
5. Add `CNAME` → `astroverse.fly.dev` at registrar

**Verification:** `https://yourdomain.com` loads the app with valid SSL

**Free domain options:**
- Freenom (.tk, .ml, .ga, .cf) — unreliable, not recommended
- GitHub Pages subdomain style — not applicable here
- **Use free subdomains:** `astroverse.vercel.app` (Vercel) + `astroverse.fly.dev` (Fly.io) — zero config needed

---

## Phase 5: Monitoring + Production Readiness

### Task 5.1: Configure Sentry error tracking

**Objective:** Add error monitoring to both frontend and backend.

**Steps:**
1. Create Sentry project at https://sentry.io (free tier: 5K errors/month)
2. Backend: `npm install @sentry/node` + init in `server.ts`
3. Frontend: `npm install @sentry/react` + init in `main.tsx`
4. Set `SENTRY_DSN` and `VITE_SENTRY_DSN` env vars on Fly.io and Vercel

**Verification:** Trigger a test error → appears in Sentry dashboard

---

### Task 5.2: Create CI/CD deployment workflow

**Objective:** Auto-deploy on push to master.

**Files:**
- Modify: `.github/workflows/deploy.yml`

Add jobs:
```yaml
  deploy-frontend:
    needs: [frontend-test]
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'

  deploy-backend:
    needs: [backend-test]
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Verification:** Push to master → both Vercel and Fly.io auto-deploy

---

### Task 5.3: Production smoke test

**Objective:** Verify all critical flows work in production.

**Steps:**
1. Health check: `curl https://astroverse.fly.dev/api/health`
2. Frontend loads: `curl -s https://astroverse.vercel.app | head -20`
3. API proxy works: `curl https://astroverse.vercel.app/api/health`
4. User registration: POST `/api/v1/auth/register`
5. User login: POST `/api/v1/auth/login`
6. Chart generation: POST `/api/v1/charts` (requires auth)

**Verification:** All smoke tests pass → production is live

---

## Sprint Issue Breakdown

| # | Issue | Priority | Est. |
|---|-------|----------|------|
| 1 | Set up Neon PostgreSQL (free) + run migrations | P1 | 1h |
| 2 | Set up Upstash Redis (free) | P1 | 30m |
| 3 | Create combined Dockerfile for Fly.io | P1 | 1h |
| 4 | Add static file serving to Express for production | P1 | 30m |
| 5 | Deploy backend to Fly.io (free VM) | P1 | 1h |
| 6 | Deploy frontend to Vercel (Hobby free) | P1 | 30m |
| 7 | Configure Vercel API proxy to Fly.io | P1 | 30m |
| 8 | Set up CI/CD auto-deploy (master → Vercel + Fly.io) | P2 | 1h |
| 9 | Configure Sentry error tracking | P2 | 1h |
| 10 | Configure custom domain + SSL (or use free subdomains) | P2 | 30m |
| 11 | Production smoke tests | P2 | 1h |

**Total estimated effort: ~8 hours**

---

## Cost Summary

| Service | Platform | Monthly Cost |
|---------|----------|-------------|
| Frontend hosting | Vercel Hobby | $0 |
| Backend hosting | Fly.io free VM | $0 |
| PostgreSQL | Neon free | $0 |
| Redis | Upstash free | $0 |
| Container registry | GHCR | $0 |
| Error tracking | Sentry free | $0 |
| CI/CD | GitHub Actions (free tier) | $0 |
| SSL | Let's Encrypt (auto) | $0 |
| **TOTAL** | | **$0/month** |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fly.io free VM sleeps after inactivity | 1-5s cold start on first request | Acceptable for MVP; upgrade later |
| Neon serverless scales to zero | ~100-300ms cold start | Acceptable; keeps costs at $0 |
| Upstash 10K commands/day limit | Redis commands throttled | Monitor usage; optimize Redis usage |
| Neon 0.5GB storage | May fill up with user data | Monitor; upgrade to $19/mo when needed |
| Vercel 100GB bandwidth | Heavy traffic could exceed | Monitor; upgrade to Pro ($20/mo) when needed |
| No Redis persistence on Upstash free | Cache-only, no critical data in Redis | Already the case — Redis is cache only |
