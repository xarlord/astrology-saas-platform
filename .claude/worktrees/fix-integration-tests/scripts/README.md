# Deployment Scripts

This directory contains scripts for deploying and testing the Astrology SaaS Platform.

## Staging Deployment Scripts

### Linux/Mac (.sh scripts)

```bash
# Deploy to staging (Docker Compose)
./scripts/deploy-staging.sh

# Run smoke tests after deployment
./scripts/smoke-test.sh
```

### Windows (PowerShell scripts)

```powershell
# Deploy to staging (Docker Compose)
.\scripts\deploy-staging.ps1

# Run smoke tests after deployment
.\scripts\smoke-test.ps1

# Skip smoke tests during deployment
.\scripts\deploy-staging.ps1 -SkipTests
```

## Environment Setup

Before running deployment scripts:

1. **Copy the environment template:**
   ```bash
   cp .env.staging.example .env.staging
   ```

2. **Edit .env.staging with your values:**
   - Change `POSTGRES_PASSWORD` to a secure password
   - Change `JWT_SECRET` to a secure random string (min 32 characters)
   - Update `ALLOWED_ORIGINS` with your frontend URL
   - Update `VITE_API_URL` with your backend URL

3. **Run the deployment script**

## Docker Compose Staging

The staging deployment uses Docker Compose to run:
- PostgreSQL database
- Backend API server
- Frontend static server (nginx)

All services are configured with health checks and automatic restarts.

## Smoke Tests

The smoke test script verifies:
- ✅ Backend health endpoint
- ✅ Database health endpoint
- ✅ Frontend health endpoint
- ✅ User registration
- ✅ User login
- ✅ Chart creation
- ✅ Chart retrieval
- ✅ Personality analysis
- ✅ Transit calculation
- ✅ Response time performance

## Useful Commands

```bash
# View all logs
docker-compose -f docker-compose.staging.yml logs -f

# View backend logs only
docker-compose -f docker-compose.staging.yml logs -f backend

# View frontend logs only
docker-compose -f docker-compose.staging.yml logs -f frontend

# Stop all services
docker-compose -f docker-compose.staging.yml down

# Restart a specific service
docker-compose -f docker-compose.staging.yml restart backend

# Rebuild and restart
docker-compose -f docker-compose.staging.yml up -d --build

# Remove all data and start fresh
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up -d
```

## Troubleshooting

### Services won't start
- Check Docker is running: `docker ps`
- Check logs: `docker-compose -f docker-compose.staging.yml logs`
- Verify .env.staging has correct values

### Health checks failing
- Backend needs database to be ready first
- Wait 30-60 seconds after `docker-compose up`
- Check individual service health: `docker-compose ps`

### Port conflicts
- Default ports: 80 (frontend), 3001 (backend), 5432 (database)
- Change ports in `docker-compose.staging.yml` if needed

### Migration errors
- Migrations run automatically on backend start
- To run manually: `docker-compose -f docker-compose.staging.yml exec backend npm run db:migrate`
- To reset database: `docker-compose -f docker-compose.staging.yml down -v` then `up -d`
