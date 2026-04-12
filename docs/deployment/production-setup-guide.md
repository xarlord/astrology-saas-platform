# Production Environment Setup Guide

This guide walks through setting up the production environment for AstroVerse.

## Prerequisites

1. VPS provisioned with Docker and Docker Compose installed
2. Domain name pointing to the VPS IP address
3. Stripe account with live mode enabled
4. OpenAI API key
5. Resend API key (for transactional emails)

## Environment Variables

### Required Variables

Generate secure secrets for production:

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate CSRF secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 16
```

### Backend Environment Variables

Create `.env.production` with these values:

```bash
# Application
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Frontend URL
FRONTEND_URL=https://astroverse.com
ALLOWED_ORIGINS=https://astroverse.com,https://www.astroverse.com

# Database (PostgreSQL on VPS)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=astrology_prod
DATABASE_USER=astrology_admin
DATABASE_PASSWORD=<GENERATED_PASSWORD>
DATABASE_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=<GENERATED_32_CHAR_SECRET>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CSRF_SECRET=<GENERATED_CSRF_SECRET>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Swiss Ephemeris
EPHEMERIS_PATH=./ephemeris

# API Keys
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
GOOGLE_PLACES_API_KEY=<OPTIONAL>

# Stripe Live Mode
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...

# Email
EMAIL_FROM=noreply@astroverse.com
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<RESEND_API_KEY>
```

### Frontend Environment Variables

Create `.env.production` in the frontend directory:

```bash
VITE_API_URL=https://api.astroverse.com
```

**Note:** If using nginx reverse proxy, `VITE_API_URL` can be empty and all `/api/*` requests will be proxied to the backend.

## Docker Compose Configuration

The `docker-compose.prod.yml` file references these environment variables:

```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}

  backend:
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
      REDIS_URL: redis://redis:6379
      FRONTEND_URL: ${FRONTEND_URL}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
      JWT_SECRET: ${JWT_SECRET}
      CSRF_SECRET: ${CSRF_SECRET}
```

## SSL Certificates

### Option 1: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d astroverse.com -d www.astroverse.com

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/astroverse.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/astroverse.com/privkey.pem nginx/ssl/
```

### Option 2: Self-Signed (Testing Only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem
```

## Deployment Steps

1. **Prepare environment files:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Build and start containers:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
   ```

4. **Seed initial data:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
   ```

5. **Verify health check:**
   ```bash
   curl https://api.astroverse.com/health
   ```

## Security Checklist

- [ ] JWT_SECRET is 32+ random characters
- [ ] CSRF_SECRET is 32+ random characters
- [ ] DATABASE_PASSWORD is strong (16+ characters)
- [ ] Stripe keys are in LIVE mode (not test)
- [ ] FRONTEND_URL matches production domain
- [ ] ALLOWED_ORIGINS only includes production domains
- [ ] SSL certificates are valid and not expired
- [ ] Rate limiting is enabled
- [ ] CORS is restricted to production origins

## Post-Deployment Verification

Run these smoke tests:

```bash
# Health check
curl https://api.astroverse.com/health

# Database health
curl https://api.astroverse.com/health/db

# Test registration
curl -X POST https://api.astroverse.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test User"}'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL format, verify PostgreSQL container is running |
| JWT errors | Verify JWT_SECRET matches between backend and any services |
| CORS errors | Check ALLOWED_ORIGINS includes the frontend domain |
| Stripe webhook failing | Verify STRIPE_WEBHOOK_SECRET matches webhook signing secret in Stripe dashboard |

## Monitoring Setup

After deployment, configure:

1. **Sentry** for error tracking:
   ```bash
   SENTRY_DSN=https://...
   SENTRY_ENVIRONMENT=production
   ```

2. **Uptime monitoring** (UptimeRobot, Pingdom)

3. **Log aggregation** (configure Winston to output to files or service)
