# Production Deployment

## Environment Variables

### Backend (.env)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Enables optimizations |
| `PORT` | Yes | `3001` | Backend listen port |
| `FRONTEND_URL` | Yes | `https://yourdomain.com` | CORS allowed origin |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/astrology_db` | Full connection string |
| `DB_POOL_MIN` | No | `2` | Min pool connections |
| `DB_POOL_MAX` | No | `10` | Max pool connections |
| `JWT_SECRET` | Yes | *(32+ chars)* | Generate: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | No | `1h` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `EPHEMERIS_PATH` | No | `./ephemeris` | Swiss Ephemeris data files |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | 15 min window |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Requests per window |

### Frontend (.env.production)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `https://api.yourdomain.com` |

## Deployment Options

### Option A: Docker Compose (Recommended for VPS)

```bash
docker-compose -f docker-compose.staging.yml up -d --build
# Scale backend:
docker-compose -f docker-compose.staging.yml up -d --scale backend=3
```

### Option B: VPS with PM2

```bash
# Backend
cd backend && npm ci --production && npm run build
npx knex migrate:latest
pm2 start npm --name "astrology-api" -- start
pm2 startup && pm2 save

# Frontend
cd frontend && npm ci && npm run build
# Serve dist/ with nginx or deploy to Vercel/Netlify
```

### Option C: Cloud Platforms

| Platform | Steps |
|----------|-------|
| **Render** | Connect GitHub repo, set root dirs, configure env vars |
| **Fly.io** | `fly launch`, `fly postgres create`, `fly deploy` |
| **AWS ECS** | Push images to ECR, create task definition, configure ALB + RDS |

## Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    ssl_certificate     /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Migrations

```bash
npx knex migrate:latest      # Apply new migrations
npx knex seed:run             # Optional: seed data
npx knex migrate:rollback     # Rollback last batch if issues occur
```

## Health Checks

```bash
curl https://api.yourdomain.com/health
# Expected: {"success":true,"data":{"status":"healthy",...}}
```

## Monitoring

| Category | Tools | Track |
|----------|-------|-------|
| APM | New Relic, DataDog, AWS X-Ray | Response time, error rate, throughput |
| Logging | Winston + CloudWatch/Papertrail | Application logs |
| Errors | Sentry | Unhandled exceptions |
| Uptime | UptimeRobot, Pingdom | Endpoint availability |

## Rollback

```bash
# Docker
docker-compose -f docker-compose.staging.yml down
git checkout <previous-tag>
docker-compose -f docker-compose.staging.yml up -d --build

# PM2
git revert HEAD~1 && pm2 restart astrology-api

# Database only
npx knex migrate:rollback
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DB connection failed | Check DATABASE_URL format, verify PostgreSQL running, check firewall |
| JWT errors | Verify JWT_SECRET matches across instances, check expiration config |
| Rate limiting too aggressive | Increase `RATE_LIMIT_MAX_REQUESTS` or adjust window |
| Chart calculation errors | Confirm Swiss Ephemeris `.se1` files at `EPHEMERIS_PATH` |
| Build failures | Clear `node_modules`, verify Node.js 18+, rebuild shared packages |

*Last updated: 2026-04-05*
