# Production URLs

**Deployment Date:** YYYY-MM-DD
**Version:** 1.0.0

---

## Application URLs

### Frontend
**Production URL:**
```
https://your-frontend.up.railway.app
```

**Custom Domain (if configured):**
```
https://yourdomain.com
```

### Backend API
**Production URL:**
```
https://your-backend.up.railway.app
```

**Custom Domain (if configured):**
```
https://api.yourdomain.com
```

### Railway Dashboard
**Project URL:**
```
https://railway.app/project/<your-project-id>
```

---

## Health Check URLs

### Backend Health
```bash
curl https://your-backend.up.railway.app/health
```

### Database Health
```bash
curl https://your-backend.up.railway.app/health/db
```

---

## API Endpoints

### Authentication
- Register: `POST https://your-backend.up.railway.app/api/auth/register`
- Login: `POST https://your-backend.up.railway.app/api/auth/login`
- Logout: `POST https://your-backend.up.railway.app/api/auth/logout`

### Charts
- Create Chart: `POST https://your-backend.up.railway.app/api/charts`
- Get Charts: `GET https://your-backend.up.railway.app/api/charts`
- Get Chart: `GET https://your-backend.up.railway.app/api/charts/:id`
- Update Chart: `PUT https://your-backend.up.railway.app/api/charts/:id`
- Delete Chart: `DELETE https://your-backend.up.railway.app/api/charts/:id`

### Analysis
- Get Analysis: `GET https://your-backend.up.railway.app/api/analysis/:chartId`
- Personality: `GET https://your-backend.up.railway.app/api/analysis/:chartId/personality`
- Transits: `GET https://your-backend.up.railway.app/api/analysis/:chartId/transits`

---

## Environment Configuration

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=<from-railway-postgresql>
JWT_SECRET=<your-generated-secret>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://your-frontend.up.railway.app,https://yourdomain.com
EPHEMERIS_PATH=./ephemeris
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
```bash
VITE_API_URL=https://your-backend.up.railway.app
```

---

## Monitoring URLs

### Railway Monitoring
- Metrics: https://railway.app/project/<your-project-id>/metrics
- Logs: https://railway.app/project/<your-project-id>/logs
- Deployments: https://railway.app/project/<your-project-id>/deployments

### Error Tracking (if configured)
- Sentry Dashboard: https://sentry.io/organizations/<your-org>/

### Uptime Monitoring (if configured)
- UptimeRobot: https://uptimerobot.com/dashboard
- Pingdom: https://my.pingdom.com/

---

## DNS Records (if using custom domain)

### Frontend
```
Type: CNAME
Name: astrology (or @)
Value: cname.railway.app
TTL: 3600
```

### Backend API
```
Type: CNAME
Name: api
Value: cname.railway.app
TTL: 3600
```

---

## SSL Certificates

Railway automatically provisions SSL certificates via Let's Encrypt:
- Frontend: Automatic
- Backend: Automatic
- Custom domains: Automatic after DNS propagation

---

## Deployment Commands

### View Logs
```bash
# Backend logs
railway logs --service backend -f

# Frontend logs
railway logs --service frontend -f
```

### Run Migrations
```bash
railway run "npm run db:migrate" --service backend
```

### Access Container
```bash
railway shell --service backend
```

### Restart Services
```bash
railway up --service backend
railway up --service frontend
```

---

## Smoke Tests

### Run Smoke Tests
```bash
API_BASE_URL=https://your-backend.up.railway.app npm run test:smoke
```

### Manual Health Check
```bash
curl https://your-backend.up.railway.app/health
```

---

## Cost Summary

### Monthly Costs (Railway)
- Backend (Starter): $5
- Frontend (Free): $0
- PostgreSQL (Starter): $5
- **Total: $10/month**

### Cost Optimization Tips
- Frontend can stay on free tier
- Enable "Sleep" mode for development/staging
- Monitor usage and scale as needed
- Use Railway pricing calculator for estimates

---

## Support

### Railway Support
- Documentation: https://docs.railway.app
- Support Email: support@railway.app
- Discord: https://discord.gg/railway
- Status Page: https://status.railway.app

### Internal Support
- DevOps: [devops@yourcompany.com]
- Backend Lead: [backend-lead@yourcompany.com]
- Frontend Lead: [frontend-lead@yourcompany.com]

---

## Rollback Plan

### Automatic Rollback
Railway automatically rolls back if health checks fail.

### Manual Rollback
1. Go to Railway dashboard
2. Select service
3. Click "Deployments" tab
4. Select previous deployment
5. Click "Redeploy"

### Emergency Rollback
```bash
git revert HEAD
git push origin main
```

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor response times
- Verify health checks

### Weekly
- Review database performance
- Check security vulnerabilities
- Analyze slow queries

### Monthly
- Update dependencies
- Test disaster recovery
- Review costs and usage

---

## Notes

- All services are containerized with Docker
- Multi-stage builds for optimal image size
- Health checks configured for all services
- Automatic SSL via Let's Encrypt
- Database backups enabled
- Logs aggregated in Railway dashboard

---

**Last Updated:** YYYY-MM-DD
**Updated By:** Your Name
**Version:** 1.0.0
