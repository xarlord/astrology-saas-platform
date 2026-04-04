# Staging Deployment Guide

## Architecture

Staging environment runs on **Railway** with:
- **Backend**: Express API deployed via Railway (Nixpacks builder)
- **Frontend**: React SPA deployed via Railway (static site)
- **Database**: Railway-managed PostgreSQL 15

## Prerequisites

1. [Railway](https://railway.app) account with team access
2. GitHub repository connected to Railway
3. `develop` branch exists in the repository

## One-Time Setup

### 1. Create Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init
# Select "Deploy from GitHub repo" -> select astrology-saas-platform
# Set environment: staging
# Set source branch: develop
```

### 2. Add PostgreSQL Service

```bash
# In Railway dashboard, add a PostgreSQL 15 database service
# Note the DATABASE_URL from the database service variables
```

### 3. Configure Backend Service

```bash
# Set root directory to backend/
# Set environment variables (see .env.staging.example)
railway variables set NODE_ENV=staging
railway variables set JWT_SECRET=<generate-a-64-byte-hex-secret>
railway variables set DATABASE_URL=<from-postgresql-service>
railway variables set ALLOWED_ORIGINS=https://your-staging-domain.up.railway.app
railway variables set EPHEMERIS_PATH=./ephemeris
```

### 4. Configure Frontend Service

```bash
# Set root directory to frontend/
# Set build-time variable
railway variables set VITE_API_URL=https://your-backend-staging.up.railway.app
```

### 5. Configure GitHub Secrets

In GitHub repo Settings -> Secrets and variables -> Actions:

| Secret | Description |
|--------|-------------|
| `RAILWAY_BACKEND_TOKEN` | Railway backend service deploy token |
| `RAILWAY_FRONTEND_TOKEN` | Railway frontend service deploy token |
| `STAGING_API_URL` | Backend staging URL for frontend build |

### 6. Generate Secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Auto-Deploy

The staging environment auto-deploys on every push to the `develop` branch via:
- **Railway GitHub integration**: Direct push-to-deploy
- **GitHub Actions**: `.github/workflows/staging-deploy.yml` runs tests, builds, then deploys

### Deploy Flow

```
Push to develop
  -> GitHub Actions: build + test
    -> Deploy backend to Railway
    -> Deploy frontend to Railway
      -> Run database migrations
```

## Local Staging Stack

For local testing with production-like Docker images:

```bash
# From project root
docker-compose -f docker-compose.staging.yml up --build

# Backend: http://localhost:3001
# Frontend: http://localhost:80
# PostgreSQL: localhost:5434
```

### Reset staging database

```bash
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up --build
```

## Environment Variables

See `.env.staging.example` for the complete list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | 64-byte hex secret for token signing |
| `VITE_API_URL` | Yes | Backend URL (frontend build-time) |
| `ALLOWED_ORIGINS` | Yes | CORS-allowed origins |
| `EPHEMERIS_PATH` | Yes | Swiss Ephemeris data path |

## Monitoring

- **Railway Dashboard**: Logs, metrics, deployments
- **Health Check**: `GET /health` on both backend (port 3001) and frontend (port 80)
- **GitHub Actions**: Build and deploy status in Actions tab

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct and database is running
- Check `JWT_SECRET` is set
- Check Railway logs for migration errors

### Frontend can't reach API
- Verify `VITE_API_URL` is set at build time (not runtime)
- Check `ALLOWED_ORIGINS` on backend includes the frontend URL
- Check CORS headers in browser DevTools

### Database migration failures
- Check Railway PostgreSQL service is healthy
- Run migrations manually: `railway run --service backend npx tsx scripts/migrate.ts`
