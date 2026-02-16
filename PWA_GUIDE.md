# Astrology SaaS Platform - PWA Features

## Overview

The Astrology SaaS Platform is a fully-featured Progressive Web App (PWA) that combines the best of web and native app experiences. Our PWA implementation provides users with offline functionality, push notifications, and an installable app-like experience across all devices.

### Key Features

- ✅ **Offline Functionality** - Access charts and data without internet
- ✅ **Installable** - Add to home screen on desktop and mobile
- ✅ **Push Notifications** - Receive reminders for astrological events
- ✅ **Automatic Updates** - Seamless background updates
- ✅ **Smart Caching** - Optimized caching strategies for fast performance
- ✅ **Cross-Platform** - Works on iOS, Android, Windows, macOS, and Linux

## Table of Contents

- [PWA Features](#pwa-features)
  - [1. Offline Support](#1-offline-support)
  - [2. Push Notifications](#2-push-notifications)
  - [3. App Installation](#3-app-installation)
  - [4. Automatic Updates](#4-automatic-updates)
- [Technical Implementation](#technical-implementation)
  - [Service Worker](#service-worker)
  - [Caching Strategies](#caching-strategies)
  - [Push Notification System](#push-notification-system)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [App Manifest](#app-manifest)
  - [Service Worker Configuration](#service-worker-configuration)
- [Performance](#performance)
  - [Target Metrics](#target-metrics)
  - [Optimization Techniques](#optimization-techniques)
- [Testing](#testing)
  - [Manual Testing](#manual-testing)
  - [Automated Testing](#automated-testing)
  - [Lighthouse Audit](#lighthouse-audit)
- [Deployment](#deployment)
  - [Environment Setup](#environment-setup)
  - [Platform-Specific Deployment](#platform-specific-deployment)
  - [Deployment Checklist](#deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## PWA Features

### 1. Offline Support

The application intelligently caches content to provide a seamless offline experience.

#### What Works Offline

- **Previously viewed charts** - Birth charts, synastry, transit charts
- **Cached pages** - Dashboard, readings, calendar
- **Static assets** - Images, icons, stylesheets, JavaScript
- **Navigation** - Move between cached pages

#### Caching Strategy

We use multiple caching strategies optimized for different content types:

**Static Assets (CacheFirst)**
- JavaScript, CSS, fonts, images
- Cached permanently until version update
- Instant loading, no network requests
- Example: `/assets/*.js`, `/assets/*.css`, `/images/*`

**API Calls (NetworkFirst)**
- Chart calculations, user data, readings
- Tries network first for fresh data
- Falls back to cache if offline
- Cache expires after 24 hours
- Example: `/api/v1/charts/*`, `/api/v1/readings/*`

**Navigation (StaleWhileRevalidate)**
- Application routes and pages
- Serves cached content immediately
- Updates cache in background
- Always fast, always fresh
- Example: `/dashboard`, `/charts`, `/calendar`

#### Offline Experience

When offline, users see:

1. **Offline Banner** - Disappears when connection returns
2. **Cached Content** - Previously loaded data is accessible
3. **Queue Actions** - Changes sync when reconnected
4. **Error Handling** - Clear messages for unavailable content

#### Cache Limits

To manage storage efficiently:

- **API Cache**: 50 entries, 24-hour expiry
- **Image Cache**: 60 entries, 30-day expiry
- **Static Cache**: Unlimited (version-controlled)

### 2. Push Notifications

Users can opt-in to receive timely notifications for important astrological events.

#### Notification Types

**🌙 Lunar Events**
- New moon and full moon reminders
- Lunar phases in your birth sign
- Moon void-of-course periods

**📅 Calendar Events**
- Daily planetary aspects
- Ingresses (planets changing signs)
- Retrograde and direct stations

**🔮 Major Transits**
- Saturn return (ages ~28-29, ~57-58)
- Jupiter return (every 12 years)
- Outer planet transits to personal planets
- Eclipses affecting your chart

**🎂 Personal Reminders**
- Birthday (solar return)
- Lunar return (monthly emotional cycle)
- Important dates from your chart

#### Enabling Notifications

1. **Visit the app** - Log in to your account
2. **Click prompt** - "Enable Notifications" banner appears
3. **Allow permission** - Browser asks for notification permission
4. **Confirmation** - Success message appears
5. **Customize** - Choose which notifications to receive

**To disable:**
- Browser settings > Site settings > Notifications > Block
- Or use notification preferences in the app

#### Notification Scheduling

Notifications are sent based on:
- User's birth chart data
- Timezone settings
- Notification preferences
- Event timing (calculated astrologically)

**Example schedules:**
- Daily aspects: 8:00 AM user's local time
- Lunar events: Day of event at 9:00 AM
- Birthday: Midnight on birthday (user's timezone)

#### Notification Content

Each notification includes:
- Title: Event type (e.g., "Full Moon in Leo")
- Body: Brief description and relevance
- Icon: App icon
- Badge: Small notification indicator
- Data: Link to relevant chart/reading
- Actions: "View Details" or "Dismiss"

### 3. App Installation

Users can install the app on their devices for a native-app-like experience.

#### Desktop Installation (Chrome/Edge)

1. **Visit the app** - Go to the app URL
2. **Look for install icon** - In address bar (⊞ or +)
3. **Click install** - "Install [App Name]" dialog appears
4. **Confirm** - Click "Install"
5. **App launches** - Opens in standalone window

**Features:**
- Separate window (no browser UI)
- Own taskbar/dock icon
- Works offline
- Auto-starts on login (optional)

#### Mobile Installation

**Android (Chrome)**

1. **Visit the app** - Go to the app URL
2. **Tap menu** - Three dots in top right
3. **Tap "Add to Home Screen"** or "Install App"
4. **Confirm** - Tap "Add"
5. **App appears** - On home screen with app icon

**iOS (Safari)**

1. **Visit the app** - Go to the app URL
2. **Tap share** - Square with arrow icon
3. **Scroll down** - Find "Add to Home Screen"
4. **Tap** - "Add to Home Screen"
5. **Customize** - Change name if desired
6. **Tap "Add"** - App appears on home screen

**iOS Limitations:**
- Push notifications require custom app (iOS limitation)
- Limited offline support compared to Android
- Service worker restrictions on iOS

#### App Behavior

Once installed, the app:

- Launches in **standalone mode** (full screen, no browser UI)
- Has its own **application icon**
- Opens as **separate window** on desktop
- **Integrated with OS** - Appears in app switcher, taskbar, etc.
- **Works offline** - Cached content available without internet
- **Receives notifications** - Push notifications delivered to system

### 4. Automatic Updates

The PWA seamlessly updates in the background without user intervention.

#### Update Flow

1. **New version deployed** - You push an update
2. **Service worker detects** - Checks for updates periodically
3. **Update downloads** - New assets cached in background
4. **User notified** - "New version available" banner appears
5. **User refreshes** - Clicks "Refresh to update"
6. **New version activates** - Old service worker replaced
7. **Cache updated** - Old cache purged, new cache populated

#### Update Timeline

- **Check interval**: Every 24 hours (browser-controlled)
- **Manual check**: User can force check via settings
- **Immediate update**: Available on page reload (after prompt)

#### User Experience

**Before update:**
- App continues to work normally
- Old version remains active
- No disruption to user workflow

**Update available:**
- Unobtrusive banner appears
- Non-blocking (can be dismissed)
- Clear call-to-action ("Refresh to update")

**After update:**
- App refreshes automatically
- User sees brief loading state
- New features available immediately

#### Developer Control

Control update behavior via `vite.config.ts`:

```typescript
VitePWA({
  // Force immediate update (not recommended)
  // registerType: 'autoUpdate',

  // Manual update (default, recommended)
  registerType: 'prompt',

  // Update check interval
  workbox: {
    navigateFallback: '/index.html',
  }
})
```

---

## Technical Implementation

### Service Worker

The service worker (`frontend/src/sw.ts`) is the heart of the PWA, managing caching, offline support, and push notifications.

#### Custom Service Worker Features

**1. Runtime Caching**
```typescript
// API calls - NetworkFirst strategy
registerRoute(
  /\/api\/v1\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Images - CacheFirst strategy
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'images-cache-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);
```

**2. Push Notification Handling**
```typescript
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

**3. Background Sync**
```typescript
// Queue failed requests for retry
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});
```

#### Service Worker Lifecycle

1. **Registration** - App registers `sw.js`
2. **Installation** - Service worker downloads and installs
3. **Activation** - Service worker becomes active
4. **Idle** - Waiting for events
5. **Fetch/Message/Push** - Handles events
6. **Update** - New version detected, repeats cycle

### Caching Strategies

We use three main caching strategies, each optimized for specific use cases.

#### CacheFirst

**Best for:** Static assets that rarely change

```typescript
new CacheFirst({
  cacheName: 'static-cache-v1',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
})
```

**How it works:**
1. Check cache
2. If cached: Return cached response (fast)
3. If not cached: Fetch from network, cache it, return response

**Used for:**
- JavaScript bundles
- CSS stylesheets
- Fonts
- Images

#### NetworkFirst

**Best for:** Data that should be fresh when possible

```typescript
new NetworkFirst({
  cacheName: 'api-cache-v1',
  networkTimeoutSeconds: 10,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60,
    }),
  ],
})
```

**How it works:**
1. Try network
2. If network succeeds: Cache response, return it
3. If network fails: Return cached response (if available)
4. If no cache: Return offline fallback

**Used for:**
- API calls (charts, readings, user data)
- HTML pages
- Dynamic content

#### StaleWhileRevalidate

**Best for:** Content where speed is critical

```typescript
new StaleWhileRevalidate({
  cacheName: 'pages-cache-v1',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60,
    }),
  ],
})
```

**How it works:**
1. Check cache
2. Return cached response immediately (fast)
3. Update cache from network in background
4. Next request gets fresh data

**Used for:**
- Application routes
- Navigation pages
- Frequently accessed content

### Push Notification System

Our push notification system uses the Web Push Protocol with VAPID authentication.

#### Architecture

```
Frontend (Browser)
    ↓ (request subscription)
Service Worker
    ↓ (send subscription object)
Backend API
    ↓ (save subscription to database)
Database
    ↓ (query subscriptions)
Scheduler/Cron Job
    ↓ (calculate events)
Notification Service
    ↓ (send push)
Web Push Service
    ↓ (deliver to device)
User Device
```

#### Subscription Flow

1. **User opts in** - Clicks "Enable Notifications"
2. **Permission requested** - Browser shows permission dialog
3. **User allows** - Permission granted
4. **Subscription created** - Service worker generates subscription
5. **Send to backend** - Subscription object saved to database
6. **Ready to receive** - User can now get push notifications

#### Sending Notifications

**Backend flow:**

```typescript
// Get subscriptions for user
const subscriptions = await notificationSubscriptions
  .find({ userId: user.id })
  .toArray();

// Send to each subscription
for (const subscription of subscriptions) {
  await webpush.sendNotification(subscription, payload, {
    vapidDetails: {
      subject: process.env.VAPID_SUBJECT,
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    },
    TTL: 86400, // 24 hours
    urgency: 'normal',
  });
}
```

**Payload structure:**

```typescript
{
  title: "Full Moon in Leo",
  body: "Today's full moon highlights your creative expression...",
  icon: "/pwa-192x192.png",
  badge: "/badge-72x72.png",
  data: {
    url: "/dashboard?event=full-moon-leo",
    eventId: "full-moon-2024-02-24",
    type: "lunar-event"
  }
}
```

#### Security

**VAPID Authentication:**
- Application server identity verified
- Prevents unauthorized push sending
- Keys generated once, reused for all notifications

**Subscription validation:**
- Each subscription tied to user ID
- Expired/invalid subscriptions removed
- Unsubscribe flow removes from database

**Rate limiting:**
- Max notifications per user per day
- Cooldown periods for batch events
- Respect user preferences

---

## Configuration

### Environment Variables

#### Backend Variables

Set in `backend/.env`:

```bash
# VAPID Keys (Required for push notifications)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:contact@astrology-saas.com

# Firebase Cloud Messaging (Optional - for mobile push)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Push Notification Configuration
PUSH_TTL=86400  # Time to live (seconds)
PUSH_URGENCY=normal  # very-low | low | normal | high
```

#### Frontend Variables

Set in `frontend/.env` (optional):

```bash
# Override backend-provided VAPID key (rarely needed)
VITE_VAPID_PUBLIC_KEY=your_public_key

# Enable PWA in development (default: false)
VITE_PWA_ENABLED=false

# API base URL (auto-detected in production)
VITE_API_URL=http://localhost:3000/api/v1
```

### App Manifest

The app manifest (`frontend/vite.config.ts`) defines how the app appears when installed.

```typescript
VitePWA({
  manifest: {
    name: 'Astrology SaaS Platform',
    short_name: 'Astrology',
    description: 'Your personal astrological insights and readings',
    theme_color: '#6366F1',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['lifestyle', 'education', 'productivity'],
    shortcuts: [
      {
        name: 'My Charts',
        short_name: 'Charts',
        description: 'View your birth charts',
        url: '/charts',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Daily Horoscope',
        short_name: 'Horoscope',
        description: 'Today\'s astrological forecast',
        url: '/horoscope',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
      }
    ]
  }
})
```

### Service Worker Configuration

Configure service worker behavior in `frontend/vite.config.ts`:

```typescript
VitePWA({
  registerType: 'prompt', // or 'autoUpdate'
  devOptions: {
    enabled: false, // PWA in development
  },
  workbox: {
    navigateFallback: '/index.html',
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
})
```

---

## Performance

### Target Metrics

We optimize for the Core Web Vitals to ensure an excellent user experience.

#### Core Web Vitals

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | < 4.0s |
| **FID** (First Input Delay) | < 100ms | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | < 0.25 |

#### Additional Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **FCP** (First Contentful Paint) | < 1.5s | First content rendered |
| **TTI** (Time to Interactive) | < 3.5s | Page fully interactive |
| **TBT** (Total Blocking Time) | < 300ms | Main thread blocking time |
| **SI** (Speed Index) | < 3.4s | Visual completeness |

### Optimization Techniques

#### Code Splitting

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Charts = lazy(() => import('./pages/Charts'));

// Component-based splitting
const ChartViewer = lazy(() => import('./components/ChartViewer'));
```

#### Lazy Loading

```typescript
// Lazy load images
<img
  src="placeholder.jpg"
  data-src="actual-image.jpg"
  loading="lazy"
  alt="Chart"
/>

// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));
```

#### Asset Optimization

- **Images**: WebP format, progressive JPEGs, SVG icons
- **Fonts**: WOFF2 format, font-display: swap
- **Code**: Minified, tree-shaken, compressed
- **Compression**: Gzip + Brotli

#### Preloading

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/images/logo.png" as="image">
```

#### Caching Strategy

- **Static assets**: CacheFirst (permanent cache)
- **API calls**: NetworkFirst (fresh data, cache fallback)
- **Images**: CacheFirst with expiration (30 days)
- **Fonts**: CacheFirst (permanent cache)

---

## Testing

### Manual Testing

Use this checklist to verify all PWA features work correctly.

#### Service Worker Tests

- [ ] Service worker installs successfully
  - DevTools > Application > Service Workers
  - Status: "activated"
- [ ] Service worker activates on reload
  - Hard refresh page
  - Worker remains active
- [ ] Service worker updates on new version
  - Deploy new version
  - Update banner appears

#### Offline Tests

- [ ] App works offline after first load
  - Load app, go offline
  - Navigate between pages
  - View cached content
- [ ] Offline banner appears
  - Disconnect network
  - "You're offline" message shows
- [ ] Online banner appears
  - Reconnect network
  - "Back online" message shows
- [ ] API requests fail gracefully offline
  - Try loading new content offline
  - Error message or cached data shown

#### Installation Tests

- [ ] Install prompt appears
  - Visit site twice
  - Install icon shows in address bar
- [ ] Desktop installation works
  - Click install icon
  - App launches in standalone window
- [ ] Mobile installation works
  - Add to home screen
  - App launches full screen
- [ ] App icon appears correct
  - Check home screen/taskbar
  - Icon matches manifest

#### Push Notification Tests

- [ ] Permission request works
  - Click "Enable Notifications"
  - Browser dialog appears
- [ ] Permission granted successfully
  - Allow permission
  - Success message shows
- [ ] Test notification sends
  - Use "Send Test Notification"
  - Notification appears in system
- [ ] Notification click opens app
  - Click notification
  - App opens to correct URL
- [ ] Notification payload correct
  - Title, body, icon all display
  - Data URL works correctly

#### Caching Tests

- [ ] Static assets cached
  - DevTools > Application > Cache Storage
  - `static-cache-v1` exists and has entries
- [ ] API responses cached
  - `api-cache-v1` exists
  - API calls show cached responses
- [ ] Images cached
  - `images-cache-v1` exists
  - Images loaded from cache on reload
- [ ] Cache expiration works
  - Wait for expiration period
  - Old entries removed
  - New entries cached

### Automated Testing

#### Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Run PWA-specific tests
npm test -- pwa

# Watch mode
npm test -- --watch
```

Test files:
- `src/sw/__tests__/caching.test.ts` - Caching strategies
- `src/sw/__tests__/push.test.ts` - Push notifications
- `src/components/__tests__/ServiceWorkerUpdateBanner.test.tsx` - UI components

#### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run PWA tests only
npm run test:e2e -- grep "PWA"

# Run with UI
npm run test:e2e -- --ui

# Run headed (see browser)
npm run test:e2e -- --headed
```

Test files:
- `e2e/pwa/sw.spec.ts` - Service worker registration
- `e2e/pwa/offline.spec.ts` - Offline functionality
- `e2e/pwa/install.spec.ts` - Installation flow
- `e2e/pwa/notifications.spec.ts` - Push notifications

#### Lighthouse CI

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun

# Collect custom URL
lhci collect --url=http://localhost:4173
```

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- PWA: 90+

### Lighthouse Audit

Manual Lighthouse testing for development.

#### Running Lighthouse

1. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

2. **Open Chrome DevTools**
   - Navigate to `http://localhost:4173`
   - Press F12 or right-click > Inspect

3. **Run Lighthouse**
   - Click "Lighthouse" tab
   - Select categories: PWA, Performance
   - Click "Analyze page load"

4. **Review results**
   - Target: 90+ in all categories
   - Address failing audits

#### Common Lighthouse Audits

| Audit | Description | Fix |
|-------|-------------|-----|
| Installable | App is installable | Ensure manifest valid, visit twice |
| Offline | Works offline | Verify caching, offline fallback |
| Service Worker | SW registered | Check sw.js exists, registers |
| HTTPS | Served over HTTPS | Use HTTPS in production |
| Manifest | Valid manifest | Validate manifest.webmanifest |
| Icons | Correct icon sizes | Generate icons with script |
| Splash screen | Splash screen configured | Add icons with purpose="maskable" |
| Theme Color | Theme color set | Add theme_color to manifest |
| Viewport | Viewport configured | Add viewport meta tag |
| Content length | Sufficient content | Ensure indexable content |

---

## Deployment

### Environment Setup

Before deploying, ensure your environment is configured correctly.

#### Step 1: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

#### Step 2: Configure Backend

Copy `.env.pwa.example` to `.env`:

```bash
cp backend/.env.pwa.example backend/.env
```

Fill in your actual VAPID keys:

```bash
VAPID_PUBLIC_KEY=your_actual_public_key
VAPID_PRIVATE_KEY=your_actual_private_key
VAPID_SUBJECT=mailto:contact@yourdomain.com
```

#### Step 3: Generate PWA Icons

```bash
cd frontend
npm run generate-icons
```

Verify icons exist:

```bash
ls -lh public/pwa*.png public/*icon*.png
```

#### Step 4: Build Frontend

```bash
cd frontend
npm run build
```

Verify build output:

```bash
ls -lh dist/
# Should see: sw.js, manifest.webmanifest, assets/, etc.
```

### Platform-Specific Deployment

#### Vercel

**Setup:**

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   vercel --prod
   ```

3. Environment variables in Vercel dashboard:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

**vercel.json** (auto-created):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "headers": {
        "Service-Worker-Allowed": "/"
      }
    }
  ]
}
```

#### Netlify

**Setup:**

1. Install Netlify CLI
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Environment variables in Netlify dashboard:
   - Add to "Site settings > Environment variables"

**netlify.toml**:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Service-Worker-Allowed = "/"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Cache-Control = "public, max-age=604800, immutable"
```

#### Railway

**Setup:**

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Add environment variables:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
4. Deploy automatically on push

**Procfile** (optional):

```
web: npm run preview
```

#### Docker

**Dockerfile**:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.vite ./dist/node_modules/.vite

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

**Build and run**:

```bash
docker build -t astrology-pwa .
docker run -p 3000:3000 astrology-pwa
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
      - VAPID_SUBJECT=${VAPID_SUBJECT}
```

### Deployment Checklist

Before deploying to production, verify all items:

#### Configuration

- [ ] VAPID keys generated and added to backend `.env`
- [ ] PWA icons generated (`pwa-192x192.png`, `pwa-512x512.png`)
- [ ] Environment variables set in hosting platform
- [ ] HTTPS enabled (required for PWA)
- [ ] Custom domain configured (if applicable)

#### Build

- [ ] Frontend builds without errors
- [ ] Service worker file (`sw.js`) generated
- [ ] Manifest file (`manifest.webmanifest`) generated
- [ ] All assets optimized and minified
- [ ] Build output size reasonable (< 5MB total)

#### Functionality

- [ ] Service worker registers successfully
- [ ] App is installable (install prompt appears)
- [ ] Offline mode works
- [ ] Push notifications work
- [ ] Update flow works
- [ ] All pages accessible
- [ ] No console errors
- [ ] No console warnings

#### Performance

- [ ] Lighthouse PWA score: 90+
- [ ] Lighthouse Performance score: 90+
- [ ] Lighthouse Accessibility score: 90+
- [ ] Lighthouse Best Practices score: 90+
- [ ] Core Web Vitals pass
- [ ] Page load time < 3s on 3G

#### Testing

- [ ] Manual testing completed
- [ ] E2E tests pass
- [ ] Unit tests pass
- [ ] Tested on multiple devices:
  - [ ] Desktop (Chrome, Edge, Firefox)
  - [ ] Android (Chrome)
  - [ ] iOS (Safari)
- [ ] Tested offline scenarios
- [ ] Tested push notifications
- [ ] Tested installation flow

#### Security

- [ ] `.env` not committed to git
- [ ] VAPID private key secure
- [ ] HTTPS configured with valid certificate
- [ ] Content Security Policy configured
- [ ] XSS protection enabled
- [ ] Dependencies scanned for vulnerabilities

#### Documentation

- [ ] PWA guide updated
- [ ] Setup instructions complete
- [ ] Troubleshooting guide available
- [ ] User-facing documentation updated

---

## Troubleshooting

### Service Worker Issues

#### Service Worker Not Registering

**Symptoms:**
- Service worker doesn't appear in DevTools
- Console shows registration errors
- App doesn't work offline

**Solutions:**

1. **Check browser support**
   ```javascript
   // Browser console
   console.log('Service Worker supported:', 'serviceWorker' in navigator);
   ```

2. **Verify service worker file**
   ```bash
   # Check sw.js exists
   ls -la dist/sw.js

   # Check file content
   cat dist/sw.js
   ```

3. **Check file paths**
   - Service worker must be served from root
   - Verify `vite.config.ts` base path
   - Check manifest URL is correct

4. **Clear site data**
   - DevTools > Application > Clear storage
   - "Clear site data" button
   - Hard refresh (Ctrl+Shift+R)

5. **Check for errors**
   ```javascript
   // Browser console
   navigator.serviceWorker.register('/sw.js')
     .then(reg => console.log('SW registered:', reg))
     .catch(err => console.error('SW error:', err));
   ```

#### Service Worker Not Updating

**Symptoms:**
- New version deployed but old SW persists
- Update banner doesn't appear
- Stale content shown

**Solutions:**

1. **Force update**
   ```javascript
   // Browser console
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.update());
   });
   ```

2. **Unregister and reload**
   - DevTools > Application > Service Workers
   - "Unregister" all workers
   - Hard refresh page

3. **Clear all caches**
   ```javascript
   // Browser console
   caches.keys().then(names => {
     names.forEach(name => caches.delete(name));
   });
   ```

4. **Wait for update cycle**
   - Service workers check for updates every 24 hours
   - Or force update with `reg.update()`

5. **Increment manifest version**
   - Change version in `vite.config.ts`
   - Forces service worker reinstall

### Push Notification Issues

#### Permission Dialog Not Showing

**Symptoms:**
- Click "Enable Notifications" but no dialog appears
- Permission denied automatically

**Solutions:**

1. **Check if previously blocked**
   - Browser settings > Privacy > Notifications
   - Remove site from blocked list
   - Reload page and try again

2. **Verify HTTPS**
   - Push notifications require HTTPS
   - Exception: localhost for development
   - Production must have valid SSL certificate

3. **Check browser support**
   - iOS Safari: limited support
   - Use Chrome on iOS for full support
   - Desktop browsers require user gesture

4. **Test on different browser**
   - Try Chrome, Firefox, Edge
   - Check browser notification settings
   - Verify OS-level permissions

#### Notifications Not Arriving

**Symptoms:**
- Permission granted but no notifications
- Test notification fails
- No error messages

**Solutions:**

1. **Verify VAPID keys**
   ```bash
   # Check backend .env
   grep VAPID backend/.env
   ```

2. **Check subscription**
   ```javascript
   // Browser console
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub);
     });
   });
   ```

3. **Test with backend endpoint**
   ```bash
   # Send test notification
   curl -X POST http://localhost:3000/api/v1/notifications/test \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Check backend logs**
   ```bash
   # Look for notification errors
   tail -f backend/logs/app.log | grep notification
   ```

5. **Verify browser focus**
   - Notifications may be delayed if browser in background
   - Some browsers suppress notifications when inactive
   - Check system notification settings

#### Invalid Subscription Error

**Symptoms:**
- "PushSubscription unsubscribed" error
- "Invalid subscription" in backend logs
- Notifications fail to send

**Solutions:**

1. **Clear expired subscriptions**
   ```bash
   # Backend should auto-cleanup expired subscriptions
   # Check cleanup logic in notification service
   ```

2. **Re-subscribe user**
   - User must re-enable notifications
   - Old subscription removed from database
   - New subscription created

3. **Check subscription endpoint**
   - Verify endpoint URL is correct
   - Check for expired keys
   - Ensure keys match between frontend and backend

4. **Monitor subscription health**
   ```typescript
   // Regular subscription validation
   setInterval(async () => {
     const subscription = await getSubscription();
     if (subscription) {
       try {
         await pushManager.permissionState(subscription.options);
       } catch {
         // Subscription expired, remove it
         await removeSubscription(subscription);
       }
     }
   }, 24 * 60 * 60 * 1000); // Daily
   ```

### Offline Issues

#### App Shows Offline Dinosaur Page

**Symptoms:**
- Going offline shows Chrome dinosaur
- Content doesn't load from cache
- "No Internet" page appears

**Solutions:**

1. **Verify service worker is active**
   ```javascript
   // Browser console
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('Active SW:', regs);
   });
   ```

2. **Check cache storage**
   - DevTools > Application > Cache Storage
   - Verify caches exist and have entries
   - Check cache names match service worker

3. **Test offline mode**
   - DevTools > Network > "Offline" checkbox
   - Reload page
   - Should load from cache

4. **Verify fallback page**
   ```typescript
   // Service worker should have offline fallback
   const offlineFallback = '/offline.html';
   ```

5. **Clear and reload**
   - DevTools > Application > Clear storage
   - "Clear site data"
   - Go online, reload, then go offline

#### Cache Not Updating

**Symptoms:**
- Stale content shown
- Old assets loaded
- Cache expiration not working

**Solutions:**

1. **Clear specific cache**
   ```javascript
   // Browser console
   caches.delete('api-cache-v1');
   caches.delete('images-cache-v1');
   ```

2. **Verify cache expiration**
   ```typescript
   // Check ExpirationPlugin configuration
   new ExpirationPlugin({
     maxEntries: 50,
     maxAgeSeconds: 24 * 60 * 60, // 24 hours
   })
   ```

3. **Force cache refresh**
   ```javascript
   // Browser console
   fetch('/api/v1/data', { cache: 'reload' });
   ```

4. **Check cache-control headers**
   ```bash
   # Verify server sends proper headers
   curl -I http://localhost:3000/api/v1/data
   ```

5. **Increment cache version**
   - Change cache name in service worker
   - Old cache deleted, new cache created
   - Example: `api-cache-v1` → `api-cache-v2`

### Installation Issues

#### Install Prompt Not Showing

**Symptoms:**
- No install icon in address bar
- "Add to Home Screen" not in menu
- App not recognized as installable

**Solutions:**

1. **Visit site at least twice**
   - Install prompt requires 2+ visits
   - Wait a few minutes between visits
   - Check different pages

2. **Verify service worker is active**
   ```javascript
   // Browser console
   navigator.serviceWorker.getRegistration().then(reg => {
     console.log('SW active:', reg && reg.active);
   });
   ```

3. **Check manifest validity**
   - DevTools > Application > Manifest
   - Verify all required fields present
   - Check for JSON errors

4. **Verify HTTPS**
   - Install prompt requires HTTPS
   - Exception: localhost for development
   - Production must have valid SSL

5. **Check browser support**
   - Desktop: Chrome, Edge (full support)
   - Mobile: Chrome Android, Safari iOS (limited)
   - Firefox: Supports but prompt differs

6. **Manual installation**
   - Android: Chrome menu > "Add to Home Screen"
   - iOS: Safari share > "Add to Home Screen"
   - Desktop: No manual option, must use prompt

#### App Not Opening in Standalone Mode

**Symptoms:**
- Installed app opens in browser
- Browser UI visible
- Not full-screen

**Solutions:**

1. **Verify manifest display mode**
   ```json
   {
     "display": "standalone",
     "display_override": ["window-controls-overlay", "standalone"]
   }
   ```

2. **Check for external links**
   - Links with `target="_blank"` open in browser
   - Use `<a href="/path">` for internal links
   - Add `target="_self"` to force in-app navigation

3. **Verify on mobile**
   - Desktop may still show minimal browser UI
   - Mobile should be full-screen
   - iOS Safari has limitations

4. **Test manifest**
   ```bash
   # Use manifest validator
   # https://manifest-validator.appspot.com/
   ```

### Performance Issues

#### Slow Load Times

**Symptoms:**
- Initial load > 5 seconds
- Slow time to interactive
- Poor Lighthouse performance score

**Solutions:**

1. **Optimize images**
   ```bash
   # Use WebP format
   # Compress images
   # Lazy load below-fold images
   ```

2. **Enable compression**
   ```nginx
   # Nginx config
   gzip on;
   gzip_types text/css application/javascript image/svg+xml;
   brotli on;
   ```

3. **Code splitting**
   ```typescript
   // Lazy load routes
   const Charts = lazy(() => import('./pages/Charts'));
   ```

4. **Reduce bundle size**
   ```bash
   # Analyze bundle
   npm run build -- --analyze

   # Remove unused dependencies
   npm uninstall unused-package
   ```

5. **Use CDN**
   - Serve assets from CDN
   - Use CDN for fonts and libraries
   - Configure asset URLs

#### High Memory Usage

**Symptoms:**
- Browser using > 1GB memory
- App becomes sluggish over time
- Tab crashes

**Solutions:**

1. **Monitor memory**
   ```javascript
   // Browser console
   console.log(performance.memory);
   ```

2. **Check for memory leaks**
   - Clean up event listeners
   - Unsubscribe from observables
   - Clear timers on unmount

3. **Limit cache size**
   ```typescript
   new ExpirationPlugin({
     maxEntries: 50,  // Reduce if needed
     maxAgeSeconds: 24 * 60 * 60,
   })
   ```

4. **Use virtualization**
   ```typescript
   // For large lists
   import { FixedSizeList } from 'react-window';
   ```

5. **Profile with DevTools**
   - Memory profiler
   - Heap snapshots
   - Allocation timeline

---

## Support

### Getting Help

If you encounter issues not covered in this guide:

**Documentation:**
- [PWA Best Practices](https://web.dev/pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

**Community:**
- [GitHub Issues](https://github.com/your-repo/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/pwa)

**Direct Support:**
- Email: support@astrology-saas.com
- Discord: [server-link]

### Contributing

We welcome contributions to improve our PWA implementation!

**Areas for contribution:**
- Additional caching strategies
- More notification types
- Offline features
- Performance optimizations
- Documentation improvements

**Contributing guide:**
- See `CONTRIBUTING.md` in repository
- Follow code of conduct
- Submit pull requests with tests

---

**Version:** 1.0.0
**Last Updated:** 2024-02-16
**Maintained By:** Astrology SaaS Platform Team

---

**Built with ❤️ using modern web technologies**

*Progressive Web App - Offline First - Performance Optimized - User Focused*
