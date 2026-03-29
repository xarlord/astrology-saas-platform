# AstroVerse Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- PostgreSQL 15+ (or use Docker)

### Local Development

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d postgres

# Install dependencies
npm install

# Start backend
cd backend && npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

---

## Deployment Options

### Option 1: Railway (Recommended)

**Backend:**
1. Connect GitHub repository
2. Set root directory: `backend`
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

**Frontend:**
1. Connect GitHub repository
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Static files: `dist`

### Option 2: Docker

```bash
# Build and start all services
docker-compose -f docker-compose.staging.yml up -d --build

# Scale backend
docker-compose -f docker-compose.staging.yml up -d --scale backend=3
```

### Option 3: Manual Deployment

**Backend (Node.js):**
```bash
cd backend
npm install --production
npm run build
NODE_ENV=production npm start
```

**Frontend (Static):**
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx/Apache
```

---

## Environment Variables

### Backend (Required)

```env
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (Required)

```env
VITE_API_URL=https://api.your-frontend.com
```

---

## Database Setup

```bash
# Run migrations
cd backend
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

---

## Health Checks

```bash
# Backend health
curl https://api.your-domain.com/api/v1/health

# Expected response
{"success":true,"data":{"status":"healthy",...}}
```

---

## Monitoring

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# Railway logs
railway logs
```

### Metrics
- Uptime monitoring: Use Railway dashboard or external service
- Error tracking: Integrate Sentry
- Performance: Enable APM in production

---

## Rollback

```bash
# Railway
railway rollback

# Docker
docker-compose -f docker-compose.staging.yml down
git checkout <previous-version>
docker-compose -f docker-compose.staging.yml up -d --build
```

---

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall rules

2. **JWT errors**
   - Verify JWT_SECRET matches across instances
   - Check token expiration settings

3. **Rate limiting too aggressive**
   - Increase RATE_LIMIT_MAX_REQUESTS
   - Adjust RATE_LIMIT_WINDOW_MS

4. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

---

## Support

- GitHub Issues: https://github.com/xarlord/astrology-saas-platform/issues
- Documentation: `/docs` folder
