# Production Deployment Checklist
<!--
  WHAT: Comprehensive checklist for production deployment
  WHY: Ensure all steps are completed before going live
  WHEN: Use before deploying to production
-->

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All tests passing (591/612+ passing)
- [ ] Code pushed to GitHub
- [ ] No console.log or debug statements in production code
- [ ] Environment variables documented in `.env.production.example`
- [ ] Database migrations tested in staging
- [ ] Seed data reviewed and sanitized

### 2. Security Audit
- [ ] JWT_SECRET generated with `openssl rand -base64 32`
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection implemented

### 3. Performance Optimization
- [ ] Database queries optimized
- [ ] Indexes created on frequently queried fields
- [ ] Connection pooling configured (min: 2, max: 10)
- [ ] Compression middleware enabled
- [ ] Static assets optimized (images, CSS, JS)
- [ ] CDN configured (if applicable)
- [ ] Response caching implemented
- [ ] Lazy loading implemented

### 4. Monitoring & Logging
- [ ] Winston logger configured for production
- [ ] Log level set to 'info' or 'error'
- [ ] Log rotation configured
- [ ] Error tracking (Sentry) set up
- [ ] Uptime monitoring configured
- [ ] Performance monitoring set up
- [ ] Database query monitoring enabled

### 5. Backup & Recovery
- [ ] Database backup schedule configured
- [ ] Backup retention policy set (30 days)
- [ ] Disaster recovery plan documented
- [ ] Backup restoration tested
- [ ] Code backed up in GitHub

### 6. Documentation
- [ ] API documentation up to date
- [ ] Deployment guide completed
- [ ] Runbook created for common issues
- [ ] Architecture decisions documented
- [ ] Environment variables documented

---

## Railway Deployment Checklist

### 1. Account Setup
- [ ] Railway account created
- [ ] Payment method added (if not using free tier)
- [ ] Project created
- [ ] GitHub connected
- [ ] Repository linked

### 2. Database Setup
- [ ] PostgreSQL service added
- [ ] DATABASE_URL copied
- [ ] Connection tested
- [ ] Initial deployment verified
- [ ] Backup enabled

### 3. Backend Deployment
- [ ] Backend service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set:
  - [ ] NODE_ENV=production
  - [ ] PORT=3001
  - [ ] DATABASE_URL (from PostgreSQL)
  - [ ] JWT_SECRET (generated securely)
  - [ ] JWT_EXPIRES_IN=1h
  - [ ] JWT_REFRESH_EXPIRES_IN=7d
  - [ ] ALLOWED_ORIGINS (frontend domain)
  - [ ] EPHEMERIS_PATH=./ephemeris
  - [ ] LOG_LEVEL=info
  - [ ] RATE_LIMIT_WINDOW_MS=900000
  - [ ] RATE_LIMIT_MAX_REQUESTS=100
- [ ] Health check path: `/health`
- [ ] Deployment successful
- [ ] Migrations run
- [ ] Seeds run

### 4. Frontend Deployment
- [ ] Frontend service created
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm run preview`
- [ ] Environment variables set:
  - [ ] VITE_API_URL (backend URL)
- [ ] Deployment successful
- [ ] Backend connectivity verified

### 5. Domain Configuration (Optional)
- [ ] Custom domain configured for frontend
- [ ] Custom domain configured for backend
- [ ] DNS records updated
- [ ] SSL certificates provisioned (automatic)
- [ ] ALLOWED_ORIGINS updated
- [ ] VITE_API_URL updated

---

## Post-Deployment Verification

### 1. Health Checks
- [ ] Backend health check: `GET /health` returns 200
- [ ] Database health check: `GET /health/db` returns 200
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] All assets loading correctly

### 2. Smoke Tests
- [ ] Run smoke tests: `npm run test:smoke`
- [ ] User registration works
- [ ] User login works
- [ ] Chart creation works
- [ ] Chart calculation works
- [ ] Get charts works
- [ ] All API endpoints respond

### 3. Functional Testing
- [ ] User can register new account
- [ ] User receives confirmation
- [ ] User can login
- [ ] User can create natal chart
- [ ] Chart calculation completes
- [ ] Chart displays correctly
- [ ] User can edit profile
- [ ] User can logout
- [ ] Password reset works (if implemented)

### 4. Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms (average)
- [ ] Database query time < 100ms (average)
- [ ] No memory leaks
- [ ] No CPU spikes
- [ ] Resource usage within limits

### 5. Security Testing
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting works
- [ ] Invalid tokens rejected
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] Input validation works

### 6. Monitoring Setup
- [ ] Error tracking (Sentry) receiving errors
- [ ] Uptime monitoring configured
- [ ] Log aggregation working
- [ ] Database metrics available
- [ ] Performance metrics available

---

## Production URLs

### Deployment URLs (Update After Deployment)

**Backend API:**
```
https://your-backend.up.railway.app
```

**Frontend:**
```
https://your-frontend.up.railway.app
```

**Custom Domains (if configured):**
```
API: https://api.yourdomain.com
Frontend: https://yourdomain.com
```

**Railway Dashboard:**
```
https://railway.app/project/<your-project-id>
```

---

## Environment Variables Summary

### Backend Production Variables

| Variable | Value | Required |
|----------|-------|----------|
| NODE_ENV | production | Yes |
| PORT | 3001 | Yes |
| DATABASE_URL | From Railway | Yes |
| JWT_SECRET | Generated secret | Yes |
| JWT_EXPIRES_IN | 1h | Yes |
| JWT_REFRESH_EXPIRES_IN | 7d | Yes |
| ALLOWED_ORIGINS | Frontend URL | Yes |
| EPHEMERIS_PATH | ./ephemeris | Yes |
| LOG_LEVEL | info | Yes |
| RATE_LIMIT_WINDOW_MS | 900000 | Yes |
| RATE_LIMIT_MAX_REQUESTS | 100 | Yes |

### Frontend Production Variables

| Variable | Value | Required |
|----------|-------|----------|
| VITE_API_URL | Backend URL | Yes |

---

## Cost Estimation

### Railway Pricing (Monthly)

**Free Tier (per service):**
- 512MB RAM
- 0.5 vCPU
- 1GB storage
- Sleeps after 15min inactivity

**Paid Plans:**
- Starter: $5/month (1GB RAM, 1 vCPU)
- Pro: $20/month (2GB RAM, 2 vCPUs)
- Business: Custom pricing

### Recommended Setup

**Production (Monthly):**
- Backend (Starter): $5
- Frontend (Free): $0
- PostgreSQL (Starter): $5
- **Total: $10/month**

**High Traffic (Monthly):**
- Backend (Pro): $20
- Frontend (Starter): $5
- PostgreSQL (Pro): $20
- **Total: $45/month**

---

## Rollback Plan

### Automatic Rollback
- Railway auto-rolls back on health check failure
- No action required if health checks fail

### Manual Rollback
1. Go to Railway dashboard
2. Navigate to service
3. Click "Deployments" tab
4. Select previous successful deployment
5. Click "Redeploy"

### Database Rollback
```bash
# Via Railway CLI
railway run "npm run db:rollback" --service backend
```

### Emergency Rollback
```bash
# Revert last commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor response times
- Verify health checks
- Review critical alerts

### Weekly
- Review database performance
- Check for security vulnerabilities
- Analyze slow queries
- Review user feedback

### Monthly
- Update dependencies
- Review and optimize queries
- Test disaster recovery
- Analyze usage metrics
- Review costs

### Quarterly
- Security audit
- Performance optimization review
- Documentation updates
- Architecture review
- Capacity planning

---

## Support & Resources

### Documentation
- Railway Docs: https://docs.railway.app
- Production Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- API Documentation: `docs/api.md`
- Architecture Docs: `docs/architecture.md`

### Tools
- Railway CLI: `npm install -g railway`
- Smoke Tests: `npm run test:smoke`
- Deployment Script: `./scripts/deploy-production.sh`

### Support
- Railway Support: support@railway.app
- Railway Discord: https://discord.gg/railway
- Status Page: https://status.railway.app

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | | |
| Backend Lead | | |
| Frontend Lead | | |
| Database Admin | | |

---

## Sign-Off

### Pre-Deployment Sign-Off

- [ ] **Developer:** Code reviewed and ready
- [ ] **Tech Lead:** Architecture approved
- [ ] **QA:** Tests passed
- [ ] **Security:** Security review complete
- [ ] **DevOps:** Deployment ready

### Post-Deployment Sign-Off

- [ ] **Developer:** Deployment verified
- [ ] **QA:** Smoke tests passed
- [ ] **DevOps:** Monitoring configured
- [ ] **Product Owner:** Ready for launch

---

**Last Updated:** 2026-02-20
**Version:** 1.0.0

## Quick Commands Reference

```bash
# Deploy to production
./scripts/deploy-production.sh

# Run smoke tests
API_BASE_URL=https://your-backend.up.railway.app npm run test:smoke

# View logs
railway logs --service backend -f
railway logs --service frontend -f

# Run migrations
railway run "npm run db:migrate" --service backend

# SSH into container
railway shell --service backend

# Check status
railway status

# Open dashboard
railway open
```
