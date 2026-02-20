# Railway Quick Start Guide - Frontend Deployment

## Quick Start (5-10 minutes)

### 1. Login to Railway
Go to: https://railway.app

### 2. Create/Select Project
- Click "New Project" or select existing project
- Choose "Deploy from GitHub repo"
- Select your repository

### 3. Add Frontend Service
- Click "New Service"
- Select "Deploy from GitHub repo"
- Configure:
  - **Root Directory:** `frontend`
  - **Build Command:** `npm run build`
  - **Start Command:** `npm run preview`

### 4. Set Environment Variables
- Click "Variables" tab
- Add: `VITE_API_URL=https://your-backend.up.railway.app`

### 5. Deploy
- Click "Deploy" button
- Wait 3-5 minutes for build

### 6. Verify
- Get frontend URL from "Settings" tab
- Open in browser
- Test functionality

---

## Detailed Screenshots Guide

### Step 1: Railway Dashboard
```
┌─────────────────────────────────────┐
│  Railway Dashboard                  │
│                                     │
│  [New Project] [New Service]        │
│                                     │
│  Existing Projects:                 │
│  ☐ astrology-saas                  │
└─────────────────────────────────────┘
```

### Step 2: New Service Configuration
```
┌─────────────────────────────────────┐
│  Deploy New Service                 │
│                                     │
│  Source:                            │
│  ☑ Deploy from GitHub repo          │
│                                     │
│  Repository:                        │
│  astrology-saas                     │
│                                     │
│  Root Directory:                    │
│  [frontend          ]               │
│                                     │
│  Build Command:                     │
│  [npm run build    ]               │
│                                     │
│  Start Command:                     │
│  [npm run preview  ]               │
│                                     │
│  [Deploy]                           │
└─────────────────────────────────────┘
```

### Step 3: Environment Variables
```
┌─────────────────────────────────────┐
│  Variables - Frontend               │
│                                     │
│  [New Variable]                     │
│                                     │
│  VITE_API_URL                       │
│  https://your-backend.up.railway.app│
│                                     │
│  Reference Variables:               │
│  {{Postgres.DATABASE_URL}}          │
└─────────────────────────────────────┘
```

---

## Environment Variables Reference

### Required Variables

| Variable | Value | Example |
|----------|-------|---------|
| VITE_API_URL | Backend URL | https://astrology-backend-abc.up.railway.app |

### Important Notes

⚠️ **VITE_ prefix is required**
- Frontend env vars MUST start with `VITE_`
- Only variables with `VITE_` prefix are available in frontend code

⚠️ **Rebuild required**
- Changing env vars requires redeployment
- Click "Deploy" after changing variables

⚠️ **URL format**
- Must include `https://`
- Don't include trailing slash
- Use backend Railway domain

---

## Troubleshooting Quick Reference

### Build Fails

**Check:**
1. Build logs in "Deployments" tab
2. Node.js version compatibility
3. Package.json scripts

**Common fixes:**
- Ensure `npm run build` works locally
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies are installed

### Frontend Can't Reach API

**Check:**
1. VITE_API_URL is set correctly
2. Backend is running
3. CORS includes frontend domain

**Test:**
```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Check browser console for CORS errors
# F12 → Console tab
```

### Blank Page

**Check:**
1. Build completed successfully
2. No JavaScript errors in console
3. Nginx is serving files correctly

**Fixes:**
- Check vite.config.ts base path
- Verify nginx configuration
- Check browser console for errors

---

## Verification Checklist

After deployment, verify:

### Basic Functionality
- [ ] Homepage loads
- [ ] Can navigate to different pages
- [ ] No console errors
- [ ] All assets load (CSS, JS, images)

### User Features
- [ ] Can register new account
- [ ] Can login
- [ ] Can create chart
- [ ] Can view charts
- [ ] Can edit profile

### API Connectivity
- [ ] API calls succeed
- [ ] No CORS errors
- [ ] Auth tokens work
- [ ] Data loads correctly

---

## Getting URLs

### Backend URL
1. Go to backend service
2. Click "Settings" tab
3. Copy "Generated Domain"

### Frontend URL
1. Go to frontend service
2. Click "Settings" tab
3. Copy "Generated Domain"

### Example URLs
```
Backend: https://astrology-backend-abc123.up.railway.app
Frontend: https://astrology-frontend-xyz789.up.railway.app
```

---

## Next Steps After Deployment

### 1. Update Documentation
Edit `PRODUCTION_URLS.md`:
```markdown
### Frontend
**Production URL:**
```
https://your-frontend.up.railway.app
```

### Backend API
**Production URL:**
```
https://your-backend.up.railway.app
```
```

### 2. Run Smoke Tests
```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test frontend
curl https://your-frontend.up.railway.app
```

### 3. Test in Browser
1. Open frontend URL
2. Register test user
3. Create test chart
4. Verify all features

### 4. Configure Custom Domain (Optional)
1. Go to service → Settings
2. Click "Custom Domain"
3. Enter your domain
4. Update DNS records

---

## Useful Railway Commands

### CLI Commands (after manual login)
```bash
railway login              # Login
railway init               # Initialize project
railway up                 # Deploy
railway logs               # View logs
railway open               # Open dashboard
railway status             # Check status
railway variables          # Manage env vars
railway domain             # Get domain URL
```

### Dashboard Actions
- **View Logs:** Service → Metrics → View Logs
- **Restart:** Service → Settings → Restart
- **Redeploy:** Service → Deployments → Redeploy
- **Scale:** Service → Settings → Change Plan

---

## Cost Information

### Free Tier
- 512MB RAM
- 0.5 vCPU
- 1GB storage
- Sleeps after 15min inactivity

### Starter Plan ($5/month)
- 1GB RAM
- 1 vCPU
- No sleep
- Better performance

### Recommendation
Frontend can stay on free tier initially, upgrade to Starter if performance issues occur.

---

## Support Resources

### Documentation
- Railway Docs: https://docs.railway.app
- Deploying: https://docs.railway.app/deploying
- Variables: https://docs.railway.app/develop/variables

### Help
- Railway Discord: https://discord.gg/railway
- Support: support@railway.app
- Status: https://status.railway.app

### Internal Docs
- Full Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Checklist: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Instructions: `FRONTEND_DEPLOYMENT_INSTRUCTIONS.md`

---

## Success Criteria

✅ Deployment is successful when:

1. Frontend builds without errors
2. Frontend URL is accessible
3. Homepage loads correctly
4. No console errors
5. Can connect to backend API
6. User authentication works
7. Chart creation works
8. All features functional

---

**Quick Start Time:** 5-10 minutes
**Total Deployment Time:** 10-15 minutes
**Difficulty:** Easy - No CLI required
**Status:** Ready to deploy via web dashboard
