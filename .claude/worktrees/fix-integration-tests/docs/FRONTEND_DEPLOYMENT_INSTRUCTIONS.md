# Frontend Deployment Instructions - Railway Production

## Mission: Deploy Frontend to Railway Production

**Status:** Ready for Deployment
**Date:** 2026-02-20
**Deployment Method:** Railway Web Dashboard (CLI requires interactive auth)

---

## Prerequisites Verification

Before proceeding, verify:

- [x] Frontend code is ready and built successfully
- [x] Railway.json configuration exists
- [x] Production Dockerfile is ready
- [x] Backend is deployed (or deploying simultaneously)
- [ ] Railway account is created
- [ ] Backend API URL is available

---

## Step-by-Step Deployment Guide

### Step 1: Access Railway Dashboard

1. Open browser and go to: https://railway.app
2. Login with your credentials (GitHub, Google, etc.)
3. If you don't have an account, click "Sign Up" first

### Step 2: Create or Select Project

**Option A: Create New Project**
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Choose your `astrology-saas` repository (or whatever you named it)

**Option B: Use Existing Project**
1. If backend is already deployed, select that project
2. Click "New Service" to add frontend

### Step 3: Configure Frontend Service

1. Click "New Service" button
2. Select "Deploy from GitHub repo"
3. Select the same repository as backend
4. Configure the service settings:

   **Settings:**
   - **Root Directory:** `frontend`
   - **Builder:** Nixpacks (default)
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview`

   Or if using Docker:
   - **Builder:** Dockerfile
   - **Dockerfile Path:** `Dockerfile.production`

### Step 4: Configure Environment Variables

1. Go to the frontend service
2. Click "Variables" tab
3. Click "New Variable" button
4. Add the following environment variable:

```bash
VITE_API_URL=https://your-backend-domain.up.railway.app
```

**Important:** Replace `your-backend-domain.up.railway.app` with your actual backend URL from the backend deployment.

**To get your backend URL:**
- Go to backend service in Railway
- Click on "Settings" tab
- Copy the "Public URL" or "Generated Domain"
- It should look like: `https://astrology-backend-xyz.up.railway.app`

### Step 5: Deploy Frontend

1. Click "Deploy" button
2. Wait for Railway to:
   - Build the frontend application
   - Install dependencies
   - Run the build command
   - Start the preview server
3. Monitor the deployment in the "Deployments" tab
4. Wait for "Success" status

**Build Process:**
- The build typically takes 2-5 minutes
- You can watch the logs in real-time
- Check for any errors in the build output

### Step 6: Verify Deployment

**Get Frontend URL:**
1. Go to frontend service
2. Click "Settings" tab
3. Copy the "Generated Domain"
4. It should look like: `https://astrology-frontend-xyz.up.railway.app`

**Health Check:**
1. Open the frontend URL in your browser
2. Verify the homepage loads correctly
3. Check browser console for errors (F12 → Console tab)
4. Verify you can navigate to different pages

**API Connectivity Test:**
1. Try to register a new user
2. Try to login
3. Create a test chart
4. Verify all API calls are successful

---

## Verification Checklist

After deployment, verify the following:

### Frontend Health
- [ ] Frontend URL is accessible
- [ ] Homepage loads without errors
- [ ] No console errors in browser
- [ ] All static assets load (CSS, JS, images)
- [ ] Navigation works correctly
- [ ] Responsive design works on mobile

### API Connectivity
- [ ] VITE_API_URL is correctly set
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Can create natal chart
- [ ] Chart calculation works
- [ ] Can view charts list
- [ ] Can view chart details

### Performance
- [ ] Page load time < 3 seconds
- [ ] Time to First Byte (TTFB) < 500ms
- [ ] No layout shifts
- [ ] Images are optimized

### Security
- [ ] HTTPS is enforced
- [ ] No mixed content warnings
- [ ] API URL uses HTTPS
- [ ] No sensitive data in console logs

---

## Troubleshooting

### Issue: Build Fails

**Solution:**
1. Check build logs for specific errors
2. Verify `package.json` has correct build script
3. Ensure all dependencies are in `package.json`
4. Check TypeScript compilation errors
5. Verify build command: `npm run build`

### Issue: Frontend Can't Connect to API

**Solution:**
1. Verify VITE_API_URL is set correctly
2. Check backend is running and accessible
3. Verify CORS settings on backend include frontend URL
4. Check browser console for CORS errors
5. Test backend health endpoint directly

### Issue: Blank Page After Deployment

**Solution:**
1. Check build logs for errors
2. Verify build completed successfully
3. Check browser console for JavaScript errors
4. Verify index.html is being served
5. Check nginx configuration (if using Docker)

### Issue: Assets Not Loading (404)

**Solution:**
1. Verify assets are in dist folder
2. Check base path in vite.config.ts
3. Verify nginx configuration
4. Check asset paths in HTML
5. Ensure .dockerignore doesn't exclude assets

### Issue: Environment Variables Not Working

**Solution:**
1. Remember VITE_ prefix is required for frontend env vars
2. Verify variable name is exactly `VITE_API_URL`
3. Rebuild and redeploy after changing env vars
4. Check Railway Variables tab for typos
5. Variable must be set before deployment

---

## Production URL Configuration

### Default Railway URLs

Frontend will be deployed to:
```
https://<service-name>.up.railway.app
```

Backend should be at:
```
https://<backend-service>.up.railway.app
```

### Custom Domain (Optional)

**Step 1: Add Custom Domain**
1. Go to frontend service → Settings
2. Click "Custom Domain"
3. Enter your domain: `astrology.yourdomain.com`
4. Click "Add Domain"

**Step 2: Update DNS**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add CNAME record:
   - **Type:** CNAME
   - **Name:** astrology (or @ for root domain)
   - **Value:** cname.railway.app
   - **TTL:** 3600

**Step 3: Verify**
1. Wait for DNS propagation (5-30 minutes)
2. Railway will auto-provision SSL certificate
3. Verify custom domain works

**Step 4: Update Environment Variables**
1. Update backend ALLOWED_ORIGINS to include custom domain
2. Update frontend VITE_API_URL if using custom backend domain
3. Redeploy both services

---

## Post-Deployment Configuration

### Update Production URLs Document

After successful deployment, update `PRODUCTION_URLS.md`:

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

### Update Documentation

1. Update `PRODUCTION_URLS.md` with actual URLs
2. Update `PRODUCTION_DEPLOYMENT_SUMMARY.md`
3. Update any README files with production links
4. Share URLs with team/stakeholders

---

## Monitoring

### View Logs

**Via Railway Dashboard:**
1. Go to frontend service
2. Click "Metrics" tab
3. Click "View Logs"

**Check for:**
- Error messages
- Failed requests
- Performance issues
- API call failures

### View Metrics

**Available Metrics:**
- CPU usage
- Memory usage
- Network traffic
- Response times
- Request counts

**Access:**
1. Go to frontend service
2. Click "Metrics" tab
3. View real-time graphs

---

## Deployment Confirmation

Once deployment is complete and verified:

1. **Frontend URL:** [Fill in after deployment]
   ```
   https://your-frontend.up.railway.app
   ```

2. **Backend URL:** [Fill in after deployment]
   ```
   https://your-backend.up.railway.app
   ```

3. **Health Check:**
   ```bash
   # Test frontend
   curl https://your-frontend.up.railway.app

   # Test backend
   curl https://your-backend.up.railway.app/health
   ```

4. **Smoke Test:**
   - Open frontend URL in browser
   - Register a new user
   - Create a test chart
   - Verify all features work

---

## Next Steps

After frontend deployment:

1. [ ] Run production smoke tests
2. [ ] Update documentation with production URLs
3. [ ] Configure custom domain (optional)
4. [ ] Set up monitoring and alerts
5. [ ] Configure backup strategy
6. [ ] Test disaster recovery
7. [ ] Share URLs with stakeholders

---

## Support Resources

### Railway Documentation
- Getting Started: https://docs.railway.app/getting-started
- Deploying: https://docs.railway.app/deploying
- Environment Variables: https://docs.railway.app/develop/variables
- Custom Domains: https://docs.railway.app/deploying/custom-domains

### Troubleshooting
- Railway Status: https://status.railway.app
- Railway Support: support@railway.app
- Railway Discord: https://discord.gg/railway

### Internal Documentation
- Production Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Production Checklist: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Production URLs: `PRODUCTION_URLS.md`

---

## Quick Reference Commands

```bash
# If using Railway CLI (after manual authentication)
railway login                    # Login to Railway
railway init                     # Initialize project
railway up                       # Deploy frontend
railway logs                     # View logs
railway open                     # Open dashboard
railway variables                # Manage environment variables
```

---

## Deployment Success Criteria

Frontend deployment is considered successful when:

- [x] Frontend builds without errors
- [x] Frontend service is running
- [x] Frontend URL is accessible
- [x] Homepage loads correctly
- [x] No console errors
- [x] Can connect to backend API
- [x] User authentication works
- [x] Chart creation works
- [x] All features functional
- [x] Performance is acceptable

---

**Prepared By:** Claude Code
**Date:** 2026-02-20
**Status:** Ready for Deployment via Railway Web Dashboard
