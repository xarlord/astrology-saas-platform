# PWA Deployment Checklist

Use this checklist to verify PWA is ready for production deployment.

## Pre-Deployment Checks

### Environment Configuration

- [ ] VAPID keys generated (`npx web-push generate-vapid-keys`)
- [ ] VAPID_PUBLIC_KEY added to backend `.env`
- [ ] VAPID_PRIVATE_KEY added to backend `.env`
- [ ] VAPID_SUBJECT added to backend `.env` (e.g., mailto:contact@yourdomain.com)
- [ ] Frontend `.env` configured with API URLs

### PWA Assets

- [ ] PWA icons generated (`npm run generate-icons`)
- [ ] `public/pwa-192x192.png` exists
- [ ] `public/pwa-512x512.png` exists
- [ ] `public/apple-touch-icon.png` exists
- [ ] `public/favicon.ico` exists
- [ ] Icons display correctly in manifest

### Build Verification

Run these commands and verify results:

```bash
# Navigate to frontend
cd frontend

# Run unit tests
npm run test:run
# Expected: 88+ tests passing (PWA-related)

# Build for production
npm run build
# Expected: Build completes successfully, no errors

# Verify build output
ls -lh dist/
# Expected: sw.js, manifest.webmanifest, index.html, assets/

# Verify service worker
cat dist/sw.js | head -20
# Expected: Valid JavaScript code

# Verify manifest
cat dist/manifest.webmanifest
# Expected: Valid JSON with all required fields
```

- [ ] Unit tests pass
- [ ] Build completes without errors
- [ ] Service worker file generated
- [ ] Manifest file generated
- [ ] All assets present in dist/

### Service Worker Verification

Start the preview server and check:

```bash
# Start preview server
npm run preview
# Navigate to http://localhost:4173
```

In browser DevTools (F12):

**Application Tab > Service Workers:**
- [ ] Service worker registered: "sw.js"
- [ ] Status: "activated" or "activating"
- [ ] Script URL points to sw.js

**Application Tab > Cache Storage:**
- [ ] Cache names visible (api-cache-v1, images-cache-v1, static-cache-v1, workbox-precache-v2)
- [ ] At least one cache has entries

**Application Tab > Manifest:**
- [ ] Manifest loads successfully
- [ ] All fields populated (name, short_name, icons, theme_color, etc.)

### Offline Testing

1. [ ] Load app online: http://localhost:4173
2. [ ] Navigate to multiple pages (dashboard, charts, etc.)
3. [ ] Open DevTools > Network > Check "Offline" checkbox
4. [ ] Reload page (Ctrl+R)
5. [ ] Verify: Page loads from cache
6. [ ] Verify: Offline banner appears (if implemented)
7. [ ] Uncheck "Offline" to restore connection

### Push Notification Testing

**Note:** These require HTTPS or localhost

```bash
# Ensure backend is running with VAPID keys configured
cd ../backend
npm run dev
```

1. [ ] Grant notification permission in browser
2. [ ] Click "Enable Notifications" button (if visible)
3. [ ] Grant permission in browser dialog
4. [ ] Verify success message appears
5. [ ] Click "Send Test" button
6. [ ] Verify notification appears in system
7. [ ] Click notification
8. [ ] Verify app opens to correct URL

### Installability Testing

**Chrome/Edge Desktop:**
1. [ ] Visit site at least twice
2. [ ] Look for install icon (⊞ or +) in address bar
3. [ ] Click install icon
4. [ ] Verify install dialog appears
5. [ ] Click "Install"
6. [ ] Verify app opens in standalone window
7. [ ] Verify app has own icon in taskbar/dock

**Chrome Android:**
1. [ ] Visit site in mobile Chrome
2. [ ] Tap menu (three dots)
3. [ ] Look for "Add to Home Screen" or "Install App"
4. [ ] Tap and install
5. [ ] Verify icon appears on home screen
6. [ ] Launch app from home screen
7. [ ] Verify app opens in full-screen

**Safari iOS:**
1. [ ] Visit site in Safari
2. [ ] Tap share button (square with arrow)
3. [ ] Scroll to "Add to Home Screen"
4. [ ] Tap and add
5. [ ] Verify icon appears on home screen
6. [ ] Launch from home screen
7. [ ] Verify opens in standalone mode

### Lighthouse Audit

Run Lighthouse audit and verify scores:

```bash
# In Chrome DevTools
# 1. Open DevTools (F12)
# 2. Click "Lighthouse" tab
# 3. Select: PWA, Performance, Accessibility, Best Practices
# 4. Click "Analyze page load"
```

Target scores:
- [ ] PWA: 90+
- [ ] Performance: 90+
- [ ] accessibility: 90+
- [ ] Best Practices: 90+

If scores below 90:
1. Review failing audits
2. Fix issues
3. Re-run audit
4. Document any acceptable deviations

### Performance Verification

**Network Tab > Throttling > Fast 3G:**
1. [ ] Clear cache
2. [ ] Set throttling to "Fast 3G"
3. [ ] Reload page
4. [ ] Measure time to interactive
5. [ ] Verify: < 5 seconds (acceptable), < 3 seconds (good)

**Bundle Size:**
- [ ] Total bundle size < 500 KB (gzipped)
- [ ] Service worker < 100 KB
- [ ] Largest chunk < 200 KB (gzipped)

### Cross-Browser Testing

Test on multiple browsers:

**Desktop:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)

**Mobile:**
- [ ] Chrome Android (latest)
- [ ] Safari iOS (latest)
- [ ] Samsung Internet (if available)

### Security Verification

- [ ] HTTPS enabled in production (required for PWA)
- [ ] SSL certificate valid
- [ ] `.env` files NOT committed to git
- [ ] VAPID private key secure
- [ ] Content Security Policy configured
- [ ] No console errors in production build

### Documentation Verification

- [ ] PWA_GUIDE.md is comprehensive
- [ ] PWA_SETUP.md has clear instructions
- [ ] PWA_DEPLOYMENT_CHECKLIST.md is complete
- [ ] README.md mentions PWA features
- [ ] User-facing documentation updated

## Production Deployment

### Staging Deployment (First)

1. [ ] Deploy to staging environment
2. [ ] Verify all checks above in staging
3. [ ] Test with real VAPID keys
4. [ ] Test push notifications end-to-end
5. [ ] Gather feedback from test users
6. [ ] Fix any issues found

### Production Deployment

1. [ ] Create deployment backup
2. [ ] Deploy frontend to production
3. [ ] Deploy backend with VAPID keys
4. [ ] Verify HTTPS is enabled
5. [ ] Run smoke tests (critical user flows)
6. [ ] Test push notifications
7. [ ] Test offline mode
8. [ ] Test installation
9. [ ] Monitor error logs for 24 hours

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error logs
- [ ] Check service worker registration rate
- [ ] Track push notification delivery
- [ ] Monitor install rate
- [ ] Check performance metrics
- [ ] Review user feedback

### First Week

- [ ] Analyze offline usage statistics
- [ ] Review notification engagement
- [ ] Monitor cache hit rates
- [ ] Check update adoption rate
- [ ] Gather user feedback

### Ongoing

- [ ] Regular performance audits
- [ ] Monitor bundle size
- [ ] Update dependencies
- [ ] Review and optimize caching strategies
- [ ] Plan feature enhancements

## Rollback Plan

If critical issues are found:

1. [ ] Identify the issue
2. [ ] Determine if rollback is necessary
3. [ ] Rollback to previous version
4. [ ] Document the issue
5. [ ] Fix in staging
6. [ ] Test thoroughly
7. [ ] Redeploy to production

## Support Contacts

- **Technical Lead:** [Contact info]
- **DevOps:** [Contact info]
- **PWA Documentation:** `PWA_GUIDE.md`
- **Troubleshooting:** `PWA_GUIDE.md#troubleshooting`

---

**Checklist Version:** 1.0.0
**Last Updated:** 2026-02-17
**Status:** Ready for Use
