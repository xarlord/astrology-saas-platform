# Frontend Deployment Checklist - Railway (Step-by-Step)

## 📋 Pre-Deployment Preparation

### Phase 1: Account Setup (5 minutes)

- [ ] **Step 1.1:** Create Railway account
  - Go to: https://railway.app
  - Click "Sign Up" or login with GitHub/Google

- [ ] **Step 1.2:** Verify email address
  - Check email inbox
  - Click verification link

- [ ] **Step 1.3:** Add payment method (optional for free tier)
  - Free tier available: $5 credit/month
  - Add card for production use

---

### Phase 2: Repository Setup (2 minutes)

- [ ] **Step 2.1:** Push code to GitHub
  ```bash
  cd /c/Users/plner/MVP_Projects
  git add .
  git commit -m "chore: prepare for production deployment"
  git push origin master
  ```

- [ ] **Step 2.2:** Verify repository is accessible
  - Go to GitHub
  - Confirm repo is visible

---

## 🚀 Deployment Steps

### Phase 3: Create Railway Project (3 minutes)

- [ ] **Step 3.1:** Login to Railway dashboard
  - URL: https://railway.app
  - Click "Login"

- [ ] **Step 3.2:** Create new project
  - Click "New Project" button
  - Select "Deploy from GitHub repo"

- [ ] **Step 3.3:** Connect GitHub
  - Authorize Railway to access GitHub
  - Select your `astrology-saas` repository
  - Click "Import"

---

### Phase 4: Deploy Backend (if not already done) (10 minutes)

- [ ] **Step 4.1:** Add PostgreSQL database
  - In project, click "New Service"
  - Select "Database"
  - Choose "PostgreSQL"
  - Click "Add PostgreSQL"

- [ ] **Step 4.2:** Add backend service
  - Click "New Service"
  - Select "Deploy from GitHub repo"
  - Select same repository

- [ ] **Step 4.3:** Configure backend settings
  - Root Directory: `backend`
  - Build Command: `npm run build`
  - Start Command: `npm start`
  - Click "Deploy"

- [ ] **Step 4.4:** Set backend environment variables
  - Go to backend service → Variables
  - Add required variables (see below)
  - Click "Add Variable" for each

  **Backend Variables:**
  ```bash
  NODE_ENV=production
  PORT=3001
  DATABASE_URL={{Postgres.DATABASE_URL}}
  JWT_SECRET=your-secure-secret-here
  JWT_EXPIRES_IN=1h
  JWT_REFRESH_EXPIRES_IN=7d
  ALLOWED_ORIGINS=https://your-frontend.up.railway.app
  EPHEMERIS_PATH=./ephemeris
  LOG_LEVEL=info
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100
  ```

- [ ] **Step 4.5:** Wait for backend deployment
  - Check "Deployments" tab
  - Wait for "Success" status (3-5 minutes)
  - View logs if errors occur

- [ ] **Step 4.6:** Get backend URL
  - Go to backend service → Settings
  - Copy "Generated Domain"
  - Save for later: `https://xxx.up.railway.app`

---

### Phase 5: Deploy Frontend (10 minutes)

- [ ] **Step 5.1:** Add frontend service
  - In same project, click "New Service"
  - Select "Deploy from GitHub repo"
  - Select same repository

- [ ] **Step 5.2:** Configure frontend settings
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Start Command: `npm run preview`
  - Click "Deploy"

- [ ] **Step 5.3:** Set frontend environment variable
  - Go to frontend service → Variables
  - Click "New Variable"
  - Name: `VITE_API_URL`
  - Value: `https://your-backend-url.up.railway.app` (from Step 4.6)
  - Click "Add Variable"

- [ ] **Step 5.4:** Redeploy to apply env var
  - Click "Deployments" tab
  - Click "Redeploy" button
  - Wait for deployment to complete

- [ ] **Step 5.5:** Get frontend URL
  - Go to frontend service → Settings
  - Copy "Generated Domain"
  - Save: `https://xxx.up.railway.app`

---

## ✅ Verification & Testing

### Phase 6: Verify Deployment (5 minutes)

- [ ] **Step 6.1:** Test backend health
  ```bash
  curl https://your-backend.up.railway.app/health
  ```
  Expected: `{"status":"healthy","timestamp":"...","uptime":...}`

- [ ] **Step 6.2:** Test frontend loads
  - Open frontend URL in browser
  - Verify homepage loads
  - Check no console errors (F12 → Console)

- [ ] **Step 6.3:** Test user registration
  - Click "Sign Up"
  - Enter test user details
  - Submit form
  - Verify registration succeeds

- [ ] **Step 6.4:** Test user login
  - Click "Login"
  - Enter credentials
  - Submit form
  - Verify login succeeds

- [ ] **Step 6.5:** Test chart creation
  - Navigate to "Create Chart"
  - Enter birth data
  - Submit form
  - Verify chart calculates

- [ ] **Step 6.6:** Test chart viewing
  - Navigate to "My Charts"
  - Click on a chart
  - Verify chart displays

---

## 📝 Post-Deployment

### Phase 7: Documentation (5 minutes)

- [ ] **Step 7.1:** Update PRODUCTION_URLS.md
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

- [ ] **Step 7.2:** Update deployment date
  - Change YYYY-MM-DD to today's date
  - Add version number if needed

- [ ] **Step 7.3:** Share URLs with team
  - Email frontend URL
  - Email backend URL
  - Include Railway dashboard link

---

## 🔧 Optional: Custom Domain (20 minutes)

- [ ] **Step 8.1:** Configure frontend custom domain
  - Go to frontend service → Settings
  - Click "Custom Domain"
  - Enter domain: `astrology.yourdomain.com`
  - Click "Add Domain"

- [ ] **Step 8.2:** Update DNS records
  - Go to domain registrar
  - Add CNAME record:
    - Type: CNAME
    - Name: astrology
    - Value: cname.railway.app
    - TTL: 3600

- [ ] **Step 8.3:** Wait for DNS propagation
  - Wait 5-30 minutes
  - Railway will auto-provision SSL

- [ ] **Step 8.4:** Update ALLOWED_ORIGINS in backend
  - Go to backend service → Variables
  - Edit ALLOWED_ORIGINS
  - Add custom domain: `https://astrology.yourdomain.com`
  - Click "Save"

- [ ] **Step 8.5:** Redeploy backend
  - Click "Deploy" button
  - Wait for deployment

- [ ] **Step 8.6:** Update VITE_API_URL in frontend
  - Go to frontend service → Variables
  - Edit VITE_API_URL (if using custom backend domain)
  - Click "Save"

- [ ] **Step 8.7:** Redeploy frontend
  - Click "Deploy" button
  - Wait for deployment

- [ ] **Step 8.8:** Verify custom domain works
  - Open custom domain in browser
  - Verify SSL certificate is valid
  - Test all functionality

---

## 🎯 Success Criteria

Deployment is successful when ALL of these are true:

- [x] Frontend URL is accessible
- [x] Backend health check returns 200
- [x] Homepage loads without errors
- [x] No console errors in browser
- [x] User registration works
- [x] User login works
- [x] Chart creation works
- [x] Chart viewing works
- [x] All API endpoints respond
- [x] Documentation updated

---

## 📊 Time Estimates

| Phase | Time | Cumulative |
|-------|------|------------|
| Account Setup | 5 min | 5 min |
| Repository Setup | 2 min | 7 min |
| Create Project | 3 min | 10 min |
| Deploy Backend | 10 min | 20 min |
| Deploy Frontend | 10 min | 30 min |
| Verification | 5 min | 35 min |
| Documentation | 5 min | 40 min |
| Custom Domain (optional) | 20 min | 60 min |

**Total Time:** 40-60 minutes

---

## 🆘 Troubleshooting

### Issue: Build fails

**Check:**
1. View build logs in "Deployments" tab
2. Look for specific error messages
3. Verify package.json has correct scripts
4. Check TypeScript errors: `npm run type-check`

**Fix:**
- Fix errors in code
- Push to GitHub
- Railway will auto-redeploy

### Issue: Frontend can't connect to API

**Check:**
1. Verify VITE_API_URL is set correctly
2. Check backend is running
3. Test backend health: `curl https://backend-url/health`
4. Check browser console for CORS errors

**Fix:**
- Update VITE_API_URL
- Add frontend URL to backend ALLOWED_ORIGINS
- Redeploy both services

### Issue: Blank page

**Check:**
1. View browser console (F12)
2. Check for JavaScript errors
3. Verify build completed successfully
4. Check nginx configuration

**Fix:**
- Fix JavaScript errors
- Verify vite.config.ts base path
- Check nginx is serving files correctly

### Issue: 404 on assets

**Check:**
1. Verify assets are in dist folder
2. Check nginx configuration
3. Verify build command ran successfully

**Fix:**
- Ensure .dockerignore doesn't exclude assets
- Check base path in vite.config.ts
- Verify nginx root path

---

## 📞 Support Resources

### Railway Documentation
- Getting Started: https://docs.railway.app/getting-started
- Deploying: https://docs.railway.app/deploying
- Variables: https://docs.railway.app/develop/variables
- Custom Domains: https://docs.railway.app/deploying/custom-domains

### Help
- Railway Discord: https://discord.gg/railway
- Support Email: support@railway.app
- Status Page: https://status.railway.app

### Internal Documentation
- Full Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Quick Start: `RAILWAY_QUICK_START.md`
- Detailed Instructions: `FRONTEND_DEPLOYMENT_INSTRUCTIONS.md`

---

## 📝 Notes

- Free tier is sufficient for initial deployment
- Railway auto-provisions SSL certificates
- Backend and frontend should be in same project
- Environment variables with VITE_ prefix are available in frontend
- Redeploy after changing environment variables
- Monitor logs in "Metrics" tab
- Set up alerts for errors and downtime

---

**Checklist Version:** 1.0.0
**Last Updated:** 2026-02-20
**Status:** Ready for Deployment
