# PWA Setup Guide

This guide walks you through setting up Progressive Web App features for the Astrology SaaS Platform frontend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Generate VAPID Keys](#generate-vapid-keys)
- [Generate PWA Icons](#generate-pwa-icons)
- [Development Setup](#development-setup)
- [Production Build](#production-build)
- [Testing PWA](#testing-pwa)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## Prerequisites

Before setting up PWA features, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm or yarn** package manager
   ```bash
   npm --version
   ```

3. **Source logo file** at `public/logo.svg`
   - This will be used to generate all PWA icons
   - Recommended size: 512x512px or larger
   - Format: SVG with transparent background

4. **Backend access** for VAPID key configuration

## Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notification functionality.

### Step 1: Install web-push

```bash
npm install -g web-push
```

### Step 2: Generate keys

```bash
npx web-push generate-vapid-keys
```

You'll see output like:

```
======================================
VAPID Keys Generated
======================================
Public Key:
BK_3LcJ7Fn7pKk8v9bNcJxM9dRqF3nP...

Private Key:
xH9_nK2J8Mn5gLqV7bNcJxM9dRqF3n...

Subject:
mailto:contact@yourdomain.com
======================================
```

### Step 3: Add to backend environment

Add the generated keys to `backend/.env`:

```bash
# Copy the entire key (including padding)
VAPID_PUBLIC_KEY=BK_3LcJ7Fn7pKk8v9bNcJxM9dRqF3nP...
VAPID_PRIVATE_KEY=xH9_nK2J8Mn5gLqV7bNcJxM9dRqF3n...
VAPID_SUBJECT=mailto:contact@astrology-saas.com
```

### Step 4: Add to frontend (for registration)

In production, the public key is served by the backend. For development, you can add it to `frontend/.env`:

```bash
VITE_VAPID_PUBLIC_KEY=BK_3LcJ7Fn7pKk8v9bNcJxM9dRqF3nP...
```

**Security Note:** Never commit private keys to version control!

## Generate PWA Icons

The PWA requires multiple icon sizes for different devices and contexts.

### Step 1: Verify source icon

Ensure you have a source icon at `public/logo.svg`:

```bash
ls -la public/logo.svg
```

If not present, create one with:
- Minimum 512x512px viewBox
- Simple design (scales better)
- Transparent background
- Single color or gradient

### Step 2: Install icon generation dependencies

```bash
cd frontend
npm install --save-dev sharp
```

### Step 3: Run icon generation script

```bash
npm run generate-icons
```

This will create:

```
public/
├── pwa-192x192.png          # Android adaptive icon (192x192)
├── pwa-512x512.png          # Android adaptive icon (512x512)
├── favicon.svg              # Scalable favicon
├── apple-touch-icon.png     # iOS icon (180x180)
└── mask-icon.svg            # Safari mask icon
```

### Step 4: Verify icons

Check that all icons were generated:

```bash
ls -lh public/pwa*.png public/*icon*.png public/favicon.svg
```

## Development Setup

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Important:** Service worker registration is disabled in development mode by default. PWA features (service worker, push notifications) only work in production builds or when explicitly enabled via environment variable:

```bash
# Enable PWA in development (optional)
VITE_PWA_ENABLED=true npm run dev
```

### Development workflow

1. Make changes to source code
2. Hot module reload updates the app
3. Test PWA features using production build
4. Run `npm run build && npm run preview` for PWA testing

## Production Build

### Step 1: Build the application

```bash
npm run build
```

This creates:
- `dist/` folder with optimized assets
- Generated service worker (`sw.js`)
- Manifest file (`manifest.webmanifest`)
- Optimized and minified code

### Step 2: Test production build locally

```bash
npm run preview
```

The app will be available at `http://localhost:4173`

**Test PWA features:**
- Service worker registration
- Offline functionality
- Install prompt
- Push notifications

### Step 3: Deploy to hosting

Deploy the `dist/` folder to your hosting service:

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Railway
```bash
# Connect GitHub repository
# Railway auto-builds on push
```

#### Docker
```bash
docker build -t astrology-pwa .
docker run -p 3000:3000 astrology-pwa
```

## Testing PWA

### Manual Testing Checklist

Use this checklist to verify all PWA features work:

#### Service Worker
- [ ] Service worker installs successfully
  - Open DevTools > Application > Service Workers
  - Verify status is "activated"
- [ ] Service worker updates on new version
  - Make a change, rebuild, reload
  - Update banner should appear

#### Offline Functionality
- [ ] App works offline
  - Load app, go offline (DevTools > Network > Offline)
  - Navigate between pages
  - Content should be cached
- [ ] Offline banner appears
  - Disconnect network
  - "You're offline" banner should show
- [ ] Online banner appears
  - Reconnect network
  - "Back online" banner should show

#### Installation
- [ ] Install prompt appears
  - Visit site at least twice
  - Click install icon in address bar (Chrome/Edge)
  - Or "Add to Home Screen" (mobile)
- [ ] App launches in standalone mode
  - After install, app opens in own window
  - No browser UI elements visible

#### Push Notifications
- [ ] Permission request works
  - Click "Enable Notifications" button
  - Browser permission dialog appears
  - Allow or deny permission
- [ ] Test notification sends
  - Use "Send Test Notification" button
  - Notification appears in system
  - Clicking notification opens app

#### Caching
- [ ] Static assets are cached
  - DevTools > Application > Cache Storage
  - Verify `static-cache-v1` exists
  - Contains JS, CSS files
- [ ] API responses are cached
  - Verify `api-cache-v1` exists
  - Contains API responses
- [ ] Images are cached
  - Verify `images-cache-v1` exists
  - Contains image assets

### Lighthouse Testing

Google Lighthouse is the gold standard for PWA validation.

#### Run Lighthouse

1. **Open Chrome DevTools**
   - Right-click > Inspect
   - Or press F12

2. **Go to Lighthouse tab**
   - Click "Lighthouse" in DevTools

3. **Configure audit**
   - Select "Progressive Web App" category
   - Select "Performance" (optional)
   - Device: Desktop (or Mobile)
   - Throttling: Simulated fast 4G

4. **Run audit**
   - Click "Analyze page load"
   - Wait for completion

5. **Review results**
   - Target: **90+ score** in PWA category
   - Address any failing audits

#### Common Lighthouse Issues

| Issue | Solution |
|-------|----------|
| Installable mini-infobar not shown | Visit site twice, check manifest |
| Does not register a service worker | Check build output, verify sw.js |
| Responds with a 200 when offline | Check caching strategies |
| Contains some content when JavaScript is not available | Add noscript tags or fallback content |
| Manifest not JSON | Validate manifest.webmanifest |
| Icons have incorrect sizes | Regenerate icons with correct sizes |

### Playwright Testing

Automated end-to-end tests verify PWA functionality.

```bash
# Run all E2E tests
npm run test:e2e

# Run PWA-specific tests
npm run test:e2e -- grep "PWA"

# Run with UI
npm run test:e2e -- --ui
```

Test files are located in `e2e/pwa/`:
- `sw.spec.ts` - Service worker tests
- `offline.spec.ts` - Offline functionality tests
- `install.spec.ts` - Installation flow tests
- `notifications.spec.ts` - Push notification tests

## Troubleshooting

### Service Worker Not Registering

**Symptoms:**
- Service worker doesn't appear in DevTools
- "Service worker not supported" error in console

**Solutions:**

1. **Check browser support**
   ```javascript
   // In browser console
   console.log('Service Worker supported:', 'serviceWorker' in navigator)
   ```

2. **Verify service worker file is served**
   ```bash
   # Check sw.js exists in build output
   ls -la dist/sw.js
   ```

3. **Check file paths**
   - Service worker must be served from root
   - Verify `vite.config.ts` has correct base path

4. **Clear site data**
   - DevTools > Application > Clear storage
   - "Clear site data" button
   - Hard refresh (Ctrl+Shift+R)

5. **Check for errors**
   ```javascript
   // In browser console
   navigator.serviceWorker.ready.then(reg => {
     console.log('Service Worker active:', reg.active)
   }).catch(err => {
     console.error('Service Worker error:', err)
   })
   ```

### Push Notifications Not Working

**Symptoms:**
- Permission dialog doesn't appear
- Notifications don't arrive
- "Subscription failed" error

**Solutions:**

1. **Verify VAPID keys**
   ```bash
   # Check backend .env
   grep VAPID backend/.env
   ```

2. **Check browser permission**
   - Browser settings > Site settings > Notifications
   - Ensure permission is "Allow"
   - Check if site is in blocked list

3. **Test subscription**
   ```javascript
   // In browser console
   navigator.serviceWorker.ready.then(reg => {
     return reg.pushManager.getSubscription()
   }).then(sub => {
     console.log('Subscription:', sub)
   })
   ```

4. **Check backend logs**
   ```bash
   # Backend should show subscription requests
   grep "notification" backend/logs/*
   ```

5. **Verify HTTPS**
   - Push notifications require HTTPS
   - Localhost is exception for development
   - Production must use valid certificate

### Icons Not Displaying

**Symptoms:**
- Icons appear as broken images
- Default browser icons shown
- Favicon missing

**Solutions:**

1. **Regenerate icons**
   ```bash
   npm run generate-icons
   ```

2. **Verify icon files exist**
   ```bash
   ls -lh public/pwa*.png public/*icon*.png
   ```

3. **Check manifest paths**
   - Verify icon paths in `vite.config.ts`
   - Should be relative to public folder
   - Example: `/pwa-192x192.png`

4. **Clear browser cache**
   - DevTools > Application > Storage
   - "Clear site data"
   - Or Ctrl+Shift+Delete

5. **Hard refresh**
   - Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Edge: Ctrl+F5
   - Firefox: Ctrl+F5

### Offline Mode Not Working

**Symptoms:**
- Site shows offline dinosaur page
- Content doesn't load without internet
- Cache errors in console

**Solutions:**

1. **Verify service worker is active**
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('Registrations:', regs)
   })
   ```

2. **Check cache storage**
   - DevTools > Application > Cache Storage
   - Verify caches exist and have entries

3. **Review caching strategies**
   - Check `src/sw.ts` for route patterns
   - Ensure API routes are matched correctly

4. **Test offline mode**
   - DevTools > Network > "Offline" checkbox
   - Reload page
   - Should load from cache

5. **Check for cache-first routes**
   - Static assets should use CacheFirst
   - API calls should use NetworkFirst
   - Navigation should use StaleWhileRevalidate

### Update Banner Not Showing

**Symptoms:**
- New version deployed but no update prompt
- Service worker doesn't update
- Old version persists

**Solutions:**

1. **Check for updates**
   ```javascript
   // In browser console
   navigator.serviceWorker.ready.then(reg => {
     reg.update()  // Force check for updates
   })
   ```

2. **Verify update component**
   - Ensure `ServiceWorkerUpdateBanner` is rendered
   - Check `App.tsx` includes component
   - No console errors from component

3. **Check version in manifest**
   - Increment version in `vite.config.ts`
   - Triggers service worker update

4. **Wait for update cycle**
   - Service worker checks every 24 hours
   - Or force update with `reg.update()`

5. **Unregister and reload**
   - DevTools > Application > Service Workers
   - "Unregister" button
   - Reload page

## Deployment

### Environment Variables

Set these environment variables in your hosting platform:

**Backend:**
```bash
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:contact@astrology-saas.com
```

**Frontend:**
```bash
# Optional: Override public key in frontend
VITE_VAPID_PUBLIC_KEY=your_public_key

# Optional: Enable PWA in development
VITE_PWA_ENABLED=false
```

### Platform-Specific Deployment

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json** (auto-created):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Service-Worker-Allowed = "/"
```

#### Railway

1. Connect GitHub repository
2. Configure build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy on push

**Procfile** (optional):
```
web: npm run preview
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t astrology-pwa .
docker run -p 3000:3000 astrology-pwa
```

### Post-Deployment Checklist

After deployment, verify:

- [ ] HTTPS is enabled (required for PWA)
- [ ] Service worker registers successfully
- [ ] Manifest loads at `/manifest.webmanifest`
- [ ] Icons load correctly
- [ ] Install prompt appears
- [ ] Push notifications work (if enabled)
- [ ] Offline mode works
- [ ] Lighthouse score is 90+
- [ ] No console errors
- [ ] Environment variables are set

### Performance Monitoring

Monitor your PWA in production:

1. **Lighthouse CI**
   ```bash
   npm install -g @lhci/cli
   lhci autorun --collect.url=https://your-domain.com
   ```

2. **Web Vitals**
   ```javascript
   // Add to analytics
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

   getCLS(console.log)
   getFID(console.log)
   getFCP(console.log)
   getLCP(console.log)
   getTTFB(console.log)
   ```

3. **Service Worker Analytics**
   - Track update events
   - Monitor offline usage
   - Measure cache hit rates

## Additional Resources

- [PWA Best Practices](https://web.dev/pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol)
- [Workbox Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [Lighthouse PWA Checklist](https://web.dev/lighthouse-pwa/)

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@astrology-saas.com
- Documentation: [docs-url]

---

**Built with modern web technologies for the best user experience**
