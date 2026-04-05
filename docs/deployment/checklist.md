# Production Deployment Checklist

## Pre-Deployment

### Code
- [ ] All tests passing
- [ ] No `console.log` or debug statements in production code
- [ ] Database migrations tested on staging
- [ ] Seed data reviewed and sanitized
- [ ] Environment variables documented in `.env.production.example`

### Security
- [ ] JWT_SECRET generated with `openssl rand -base64 32`
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection implemented

### Performance
- [ ] Database indexes on frequently queried fields
- [ ] Connection pooling configured (min: 2, max: 10)
- [ ] Compression middleware enabled
- [ ] Static assets optimized
- [ ] CDN configured (if applicable)

### Infrastructure
- [ ] SSL certificates obtained and valid
- [ ] DNS records updated
- [ ] Monitoring and alerting configured
- [ ] Log aggregation set up
- [ ] Error tracking (Sentry) initialized
- [ ] Database backup schedule configured (daily, 30-day retention)
- [ ] Backup restoration tested

---

## Deployment

### Backend
- [ ] `NODE_ENV=production` set
- [ ] `DATABASE_URL` points to production database
- [ ] `JWT_SECRET` set (secure, unique)
- [ ] `ALLOWED_ORIGINS` includes frontend domain
- [ ] Migrations run: `npx knex migrate:latest`
- [ ] Seeds run (if applicable)
- [ ] Health check responds: `GET /health` returns 200

### Frontend
- [ ] `VITE_API_URL` points to production backend
- [ ] Build succeeds: `npm run build`
- [ ] Static assets served (nginx, Vercel, or CDN)
- [ ] No console errors in browser

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Backend health: `GET /health` returns 200
- [ ] Database health: `GET /health/db` returns 200
- [ ] User registration works
- [ ] User login works
- [ ] Chart creation completes
- [ ] Chart calculation produces valid results

### Security
- [ ] HTTPS enforced
- [ ] CORS properly configured (check browser DevTools)
- [ ] Rate limiting works (test with rapid requests)
- [ ] Invalid tokens rejected

### Performance
- [ ] Page load < 3 seconds
- [ ] API response time < 500ms (average)
- [ ] No memory leaks or CPU spikes

---

## Sign-Off

- [ ] **Developer**: Code reviewed and deployment verified
- [ ] **QA**: Smoke tests passed
- [ ] **DevOps**: Monitoring configured and confirmed
- [ ] **Product Owner**: Ready for launch

*Last updated: 2026-04-05*
