# Staging Deployment Guide
<!--
  WHAT: Step-by-step guide for deploying the Astrology SaaS Platform to staging
  WHY: Staging environment provides a production-like environment for testing before production launch
  WHEN: Use this guide when deploying to staging for the first time
-->

## Deployment Options Overview

### Recommended Staging Options
1. **Railway** - Easiest, auto-detects Node.js, free tier available ⭐ RECOMMENDED
2. **Render** - Simple deployment, free tier available
3. **Docker Compose** - For local staging or VPS deployment

---

## Option 1: Railway Deployment (Recommended - Fastest)

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with code
- Railway CLI (optional): `npm install -g railway`

### Deployment Steps

#### 1. Prepare Your Repository
```bash
# Ensure your code is on GitHub
cd MVP_Projects
git init
git add .
git commit -m "Initial commit for staging deployment"
# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/astrology-saas.git
git branch -M main
git push -u origin main
```

#### 2. Deploy Backend on Railway

**Via Railway Dashboard:**
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

**Add Environment Variables:**
```bash
# Server
NODE_ENV=staging
PORT=3001
ALLOWED_ORIGINS=https://your-staging-frontend.railway.app,https://astrology-saas-staging.up.railway.app

# Database (Railway provides PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication
JWT_SECRET=your-staging-jwt-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Swiss Ephemeris
EPHEMERIS_PATH=./ephemeris
```

**Add PostgreSQL:**
1. In Railway project, click "New Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will add `Postgres.DATABASE_URL` to your backend service

**Run Migrations:**
1. Go to your backend service on Railway
2. Click "New Service" → "Plugin"
3. Add "Railway CLI" plugin
4. Or use the Railway CLI:
```bash
railway login
railway link
railway up
```

#### 3. Deploy Frontend on Railway

**Create Frontend Service:**
1. In same Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview`
   - **Or use Static Site:** Configure to serve `dist` folder

**Add Environment Variables:**
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

#### 4. Verify Deployment
```bash
# Backend health check
curl https://your-backend-url.railway.app/health

# Frontend
open https://your-frontend-url.railway.app
```

---

## Option 2: Render Deployment

### Prerequisites
- Render account (https://render.com)
- GitHub repository

### Deployment Steps

#### 1. Deploy Backend on Render

**Create Web Service:**
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free (for testing)

**Add Environment Variables:**
```bash
NODE_ENV=staging
PORT=3001
ALLOWED_ORIGINS=https://your-frontend.onrender.com
DATABASE_URL=your_render_postgres_url
JWT_SECRET=your-staging-jwt-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
EPHEMERIS_PATH=./ephemeris
```

#### 2. Add PostgreSQL Database
1. In Render dashboard, click "New" → "PostgreSQL"
2. Choose "Free" tier
3. Copy internal database URL
4. Add to backend service as `DATABASE_URL`

#### 3. Deploy Frontend on Render

**Create Static Site:**
1. Click "New" → "Static Site"
2. Connect repository
3. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Environment Variable:** `VITE_API_URL=https://your-backend.onrender.com`

#### 4. Run Migrations
Render doesn't auto-run migrations. You can:
1. SSH into the instance and run manually
2. Add a migration script that runs on deploy
3. Use Render's deploy hooks

---

## Option 3: Docker Deployment (VPS or Local Staging)

### Prerequisites
- Docker and Docker Compose installed
- Server with SSH access (for VPS)

### Deployment Steps

#### 1. Create Docker Compose File

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: astrology-staging-db
    environment:
      POSTGRES_DB: astrology_staging
      POSTGRES_USER: staging_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: astrology-staging-backend
    depends_on:
      - postgres
    environment:
      NODE_ENV: staging
      PORT: 3001
      DATABASE_URL: postgresql://staging_user:${POSTGRES_PASSWORD}@postgres:5432/astrology_staging
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 1h
      JWT_REFRESH_EXPIRES_IN: 7d
      EPHEMERIS_PATH: ./ephemeris
    ports:
      - "3001:3001"
    restart: unless-stopped
    command: sh -c "npm run db:migrate && npm run db:seed && npm start"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: astrology-staging-frontend
    depends_on:
      - backend
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
    restart: unless-stopped

volumes:
  postgres_staging_data:
```

#### 2. Create Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

#### 3. Create Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4. Create Environment File

```bash
# .env.staging
POSTGRES_PASSWORD=secure_staging_password
ALLOWED_ORIGINS=https://staging.yourdomain.com
JWT_SECRET=your-staging-jwt-secret-min-32-characters
VITE_API_URL=https://staging-api.yourdomain.com
```

#### 5. Deploy

**Local Staging:**
```bash
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
```

**VPS Deployment:**
```bash
# Copy files to server
scp -r . user@your-server:/var/www/astrology-staging

# SSH into server
ssh user@your-server

# Navigate to project
cd /var/www/astrology-staging

# Start containers
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
```

---

## Staging Smoke Tests

After deployment, run these tests to verify:

### 1. Health Check
```bash
# Backend health
curl https://staging-api.yourdomain.com/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":...}
```

### 2. Database Health
```bash
curl https://staging-api.yourdomain.com/health/db

# Expected response:
# {"status":"healthy","database":"connected","latency":...}
```

### 3. Test User Registration
```bash
curl -X POST https://staging-api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"staging-test@example.com","password":"TestPass123!","name":"Staging User"}'

# Expected response:
# {"success":true,"data":{"user":{...},"token":"..."}}
```

### 4. Test Chart Calculation
```bash
# Get auth token from previous response, then:
curl -X POST https://staging-api.yourdomain.com/api/charts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"Staging Test Chart",
    "birth_date":"1990-01-15",
    "birth_time":"14:30",
    "birth_place":"New York, NY",
    "latitude":40.7128,
    "longitude":-74.0060,
    "timezone":"America/New_York"
  }'

# Expected response:
# {"success":true,"data":{"chart":{...},"calculated":{...}}}
```

---

## Staging Configuration Checklist

### Pre-Deployment
- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] Database service provisioned
- [ ] DNS configured (if using custom domain)

### Post-Deployment
- [ ] Health check responding
- [ ] Database connected and migrations run
- [ ] Frontend loads correctly
- [ ] API endpoints functional
- [ ] Chart calculation test successful
- [ ] Test user can register and login
- [ ] Logs are being collected

---

## Monitoring Staging

### Logs

**Railway:**
- View logs in Railway dashboard
- Railway CLI: `railway logs`

**Render:**
- View logs in Render dashboard
- Tail logs: `render logs -f`

**Docker:**
```bash
docker-compose -f docker-compose.staging.yml logs -f
```

### Performance Monitoring

Check staging performance:
- Response times (should be < production targets)
- Error rates
- Database query performance
- Memory usage

---

## Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify DATABASE_URL is correct
- Check database is running
- Verify network connectivity

**Build Fails:**
- Check build logs for errors
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors

**Frontend Can't Reach API:**
- Verify VITE_API_URL is correct
- Check CORS settings (ALLOWED_ORIGINS)
- Verify backend is running and accessible

**Migrations Don't Run:**
- Manually run: `npm run db:migrate`
- Check database connection
- Verify Knex configuration

---

## Staging vs Production Differences

| Setting | Staging | Production |
|---------|---------|------------|
| Domain | staging.yourdomain.com | yourdomain.com |
| Database | Smaller instance | Scaled for traffic |
| Logging | Verbose | Error-level only |
| Rate Limiting | Relaxed | Strict |
| Caching | Disabled/reduced | Full caching |
| Monitoring | Basic | Full APM |

---

## Next Steps After Staging

1. **User Acceptance Testing (UAT)**
   - Test all critical user flows
   - Verify calculations accuracy
   - Test mobile responsiveness

2. **Performance Validation**
   - Run load tests against staging
   - Verify benchmarks are met
   - Check for bottlenecks

3. **Security Validation**
   - Test authentication flows
   - Verify rate limiting works
   - Test data encryption

4. **Production Deployment**
   - Use staging as template
   - Follow PRODUCTION_DEPLOYMENT.md
   - Run final smoke tests

---

## Rollback Plan

If staging deployment has issues:

**Railway:**
```bash
railway rollback
```

**Render:**
- Render auto-rolls back on failed deploy
- Or manually revert to previous commit

**Docker:**
```bash
docker-compose -f docker-compose.staging.yml down
git checkout PREVIOUS_COMMIT
docker-compose -f docker-compose.staging.yml up -d
```
