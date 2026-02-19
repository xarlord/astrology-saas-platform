# Production Deployment Guide - Astrology SaaS Platform
<!--
  WHAT: Step-by-step production deployment guide for Railway
  WHY: Deploy the platform to production for live users
  WHEN: Use when deploying to production for the first time
-->

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Railway account (https://railway.app)
- [ ] GitHub repository with code pushed
- [ ] Railway CLI installed (optional): `npm install -g railway`
- [ ] Domain name configured (optional, for custom domain)
- [ ] Generated secure JWT_SECRET: `openssl rand -base64 32`

---

## Quick Start Deployment (Railway - Recommended)

### Step 1: Prepare Your Repository

```bash
# Ensure you're in the project root
cd /path/to/MVP_Projects

# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "chore: prepare for production deployment"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/astrology-saas.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Project

**Via Railway Dashboard:**

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `astrology-saas` repository
4. Railway will create a new project

**Via Railway CLI:**

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Link to GitHub repo
railway link
```

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will provision a database

**Copy the Database URL:**
- Click on the PostgreSQL service
- Go to "Variables" tab
- Copy `DATABASE_URL` (you'll need this for backend)

### Step 4: Deploy Backend Service

**Create Backend Service:**

1. In Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Select the same repository
4. Configure:

   **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

**Add Environment Variables:**

Go to backend service → "Variables" tab → "New Variable":

```bash
# Application
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app,https://your-custom-domain.com

# Database (from PostgreSQL service)
DATABASE_URL={{Postgres.DATABASE_URL}}
DB_POOL_MIN=2
DB_POOL_MAX=10

# Authentication - USE A STRONG SECRET!
JWT_SECRET=your-generated-secure-secret-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Swiss Ephemeris
EPHEMERIS_PATH=./ephemeris

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Run Database Migrations:**

Railway doesn't auto-run migrations. Add a deployment script:

1. Go to backend service → "Settings"
2. Click "Add Deployment Script"
3. Add:

```bash
npm run db:migrate
npm run db:seed
```

**Deploy:**
- Click "Deploy" button
- Railway will build and deploy
- Wait for deployment to complete (check "Deployments" tab)

**Get Backend URL:**
- Go to backend service
- Click "Generate Domain" or copy the generated URL
- It will look like: `https://your-backend.up.railway.app`

### Step 5: Deploy Frontend Service

**Create Frontend Service:**

1. In same Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Configure:

   **Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview`

**Add Environment Variables:**

```bash
# API URL - use your backend URL from Step 4
VITE_API_URL=https://your-backend.up.railway.app
```

**Deploy:**
- Click "Deploy" button
- Wait for deployment to complete

**Get Frontend URL:**
- Go to frontend service
- Copy the generated URL
- It will look like: `https://your-frontend.up.railway.app`

### Step 6: Configure Custom Domain (Optional)

**For Frontend:**
1. Go to frontend service → "Settings"
2. Click "Custom Domain"
3. Enter your domain: `astrology.yourdomain.com`
4. Update DNS records as instructed by Railway

**For Backend API:**
1. Go to backend service → "Settings"
2. Click "Custom Domain"
3. Enter your domain: `api.yourdomain.com`
4. Update DNS records as instructed by Railway

**Update Environment Variables:**
- Update `ALLOWED_ORIGINS` in backend to include custom domains
- Update `VITE_API_URL` in frontend to use custom backend domain
- Redeploy both services

---

## Verification

### Health Checks

```bash
# Check backend health
curl https://your-backend.up.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"2024-...","uptime":...}

# Check database connectivity
curl https://your-backend.up.railway.app/health/db

# Expected response:
# {"status":"healthy","database":"connected","latency":...}

# Check frontend
open https://your-frontend.up.railway.app
```

### Smoke Tests

Run the production smoke tests:

```bash
# From project root
npm run test:smoke

# Or manually test endpoints
curl https://your-backend.up.railway.app/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}'
```

---

## Production Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] JWT_SECRET generated securely
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Backup strategy in place

### Post-Deployment
- [ ] Backend health check passing
- [ ] Database connected and seeded
- [ ] Frontend loading correctly
- [ ] API endpoints functional
- [ ] User registration working
- [ ] Chart calculation working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Monitoring configured
- [ ] Error tracking setup (Sentry, etc.)

---

## Monitoring

### Railway Dashboard

Monitor your services in the Railway dashboard:

- **Metrics:** CPU, Memory, Disk usage
- **Logs:** View real-time logs
- **Deployments:** Track deployment history
- **Errors:** View error logs

### Logging

**View logs via dashboard:**
1. Go to service → "Metrics" tab
2. Click "View Logs"

**View logs via CLI:**
```bash
# Backend logs
railway logs --service backend

# Frontend logs
railway logs --service frontend

# Follow logs (tail)
railway logs --service backend -f
```

### Error Tracking

Consider adding error tracking:

**Sentry:**
```bash
# Add to backend
npm install @sentry/node

# Initialize in src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## Scaling

### Vertical Scaling

Upgrade resources in Railway:

1. Go to service → "Settings"
2. Click "Change Plan"
3. Select appropriate tier:
   - **Free:** 512MB RAM, 0.5 vCPU
   - **Starter:** 1GB RAM, 1 vCPU ($5/month)
   - **Pro:** 2GB RAM, 2 vCPUs ($20/month)

### Horizontal Scaling

For higher traffic:

1. Go to backend service → "Settings"
2. Enable "Scale to Zero" (for cost savings)
3. Set minimum/maximum replicas
4. Railway will auto-scale based on traffic

---

## Backup Strategy

### Database Backups

Railway provides automated backups:

1. Go to PostgreSQL service
2. Click "Backups" tab
3. Backups are created daily
4. Manual backups can be created

**Manual Backup:**
```bash
# Via Railway CLI
railway pg:dump > backup.sql

# Restore from backup
railway pg:restore < backup.sql
```

### Code Backups

- Code is stored in GitHub (version control)
- Railway maintains deployment history
- Can rollback to previous deployments

---

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
railway logs --service backend

# Common causes:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Build errors
# 4. Port conflicts
```

**Database connection failed:**
```bash
# Verify DATABASE_URL is correct
# Check PostgreSQL service is running
# Test connection:
psql $DATABASE_URL
```

**Frontend can't reach API:**
```bash
# Check VITE_API_URL is correct
# Verify ALLOWED_ORIGINS includes frontend domain
# Check CORS configuration
```

**Migration failed:**
```bash
# SSH into container and run manually
railway shell

# Inside container
npm run db:migrate
npm run db:seed
```

### Rollback

If deployment fails:

**Automatic Rollback:**
- Railway auto-rolls back on health check failure

**Manual Rollback:**
1. Go to "Deployments" tab
2. Click on previous successful deployment
3. Click "Redeploy"

**Git Rollback:**
```bash
# Revert commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor response times
- Verify health checks

**Weekly:**
- Review database performance
- Check for security vulnerabilities
- Review and optimize slow queries

**Monthly:**
- Update dependencies
- Review and update documentation
- Test disaster recovery

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test updates
npm test

# Commit and push
git add .
git commit -m "chore: update dependencies"
git push origin main
```

---

## Cost Management

### Railway Pricing

**Free Tier (per service):**
- $5 free credit monthly
- 512MB RAM
- 0.5 vCPU
- 1GB storage
- Sleeps after 15min inactivity

**Paid Plans:**
- **Starter:** $5/month (1GB RAM, 1 vCPU)
- **Pro:** $20/month (2GB RAM, 2 vCPUs)
- **Business:** Custom pricing

**Estimated Monthly Cost:**
- Backend (Starter): $5
- Frontend (Free): $0
- PostgreSQL (Starter): $5
- **Total:** $10/month

### Cost Optimization

1. **Enable Sleep Mode:** For development/staging
2. **Scale to Zero:** For low-traffic apps
3. **Monitor Usage:** Check metrics regularly
4. **Use Free Tiers:** Frontend can stay on free tier

---

## Security Best Practices

### Production Security

✅ **Implemented:**
- Strong JWT_SECRET
- CORS configured
- Rate limiting enabled
- Helmet.js security headers
- Environment variables for secrets

⚠️ **Before Launch:**
- [ ] Enable HTTPS (automatic on Railway)
- [ ] Configure custom domain
- [ ] Set up error tracking (Sentry)
- [ ] Configure backup strategy
- [ ] Review rate limiting limits
- [ ] Enable database encryption
- [ ] Set up monitoring alerts
- [ ] Review logging sensitivity

### Secrets Management

**Never commit secrets to git:**
- Use Railway environment variables
- Use `.gitignore` for `.env` files
- Rotate secrets regularly
- Use strong, unique passwords

---

## Next Steps

### After Production Launch

1. **Monitor Performance**
   - Set up uptime monitoring (Pingdom, UptimeRobot)
   - Track error rates
   - Monitor response times

2. **User Feedback**
   - Add feedback form
   - Monitor support channels
   - Track user behavior

3. **Iterate**
   - Fix reported bugs
   - Add requested features
   - Optimize performance
   - Scale as needed

4. **Documentation**
   - Update API documentation
   - Document architecture decisions
   - Maintain change logs

---

## Support

### Resources

- **Railway Docs:** https://docs.railway.app
- **Railway Support:** support@railway.app
- **Community Discord:** https://discord.gg/railway

### Emergency Contacts

- **Railway Status:** https://status.railway.app
- **GitHub Issues:** https://github.com/railwayapp/railway/issues

---

## Appendix

### Environment Variables Reference

See `.env.production.example` for all available variables.

### Deployment Script

Use this script for automated deployments:

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Deploying to Production..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Must be on main branch"
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy
echo "📦 Pushing to GitHub..."
git push origin main

echo "✅ Deployment triggered!"
echo "⏳ Waiting for Railway to build..."
echo "📊 Check status at: https://railway.app"
```

Make it executable:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

---

**Last Updated:** 2026-02-20
**Version:** 1.0.0
