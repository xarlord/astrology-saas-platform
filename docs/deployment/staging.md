# Staging Deployment

## Architecture

Staging runs on **Railway** with auto-deploy from the `develop` branch.

| Component | Platform | Notes |
|-----------|----------|-------|
| Backend | Railway (Nixpacks) | Express API |
| Frontend | Railway (static) | React SPA |
| Database | Railway PostgreSQL 15 | Managed |

## Prerequisites

1. [Railway](https://railway.app) account with team access
2. GitHub repository connected to Railway
3. `develop` branch exists in the repository

## One-Time Setup

### 1. Create Railway Project

```bash
npm i -g @railway/cli          # Install CLI
railway login
railway init                    # Select "Deploy from GitHub repo"
                                # Set source branch: develop
```

### 2. Add PostgreSQL Service

In Railway dashboard, add a PostgreSQL 15 database service. Note the `DATABASE_URL` from the service variables.

### 3. Configure Backend Service

Set root directory to `backend/`. Set environment variables:

```bash
railway variables set NODE_ENV=staging
railway variables set JWT_SECRET=<64-byte-hex-secret>   # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
railway variables set DATABASE_URL=<from-postgresql-service>
railway variables set ALLOWED_ORIGINS=https://your-staging-frontend.up.railway.app
railway variables set EPHEMERIS_PATH=./ephemeris
```

### 4. Configure Frontend Service

Set root directory to `frontend/`. Set build-time variable:

```bash
railway variables set VITE_API_URL=https://your-backend-staging.up.railway.app
```

### 5. GitHub Secrets

In repo Settings > Secrets > Actions, add:

| Secret | Description |
|--------|-------------|
| `RAILWAY_BACKEND_TOKEN` | Backend service deploy token |
| `RAILWAY_FRONTEND_TOKEN` | Frontend service deploy token |
| `STAGING_API_URL` | Backend staging URL |

## Auto-Deploy

Push to `develop` triggers:

```
Push to develop -> GitHub Actions: build + test -> Deploy backend + frontend -> Run migrations
```

## Local Staging Stack

```bash
docker-compose -f docker-compose.staging.yml up --build
# Backend: http://localhost:3001 | Frontend: http://localhost:80 | PostgreSQL: :5434

# Reset staging database
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up --build
```

## Smoke Tests

```bash
curl https://staging-api.yourdomain.com/health          # Backend health
curl https://staging-api.yourdomain.com/health/db       # DB connectivity
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend won't start | Check `DATABASE_URL`, `JWT_SECRET`, Railway logs for migration errors |
| Frontend can't reach API | `VITE_API_URL` is build-time only; check `ALLOWED_ORIGINS` on backend |
| Migration failures | Run manually: `railway run --service backend npx tsx scripts/migrate.ts` |
| Build fails | Check build logs; verify all deps in package.json; TypeScript compiles clean |

*Last updated: 2026-04-05*
