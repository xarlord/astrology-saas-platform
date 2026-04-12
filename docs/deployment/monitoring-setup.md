# Production Monitoring Setup Guide

This guide covers setting up monitoring and alerting for AstroVerse in production.

## Overview

Production monitoring should cover:

1. **Application Performance** (APM)
2. **Error Tracking** (Sentry)
3. **Uptime Monitoring** (external)
4. **Log Aggregation** (Winston + external)
5. **Database Health** (PostgreSQL metrics)
6. **Infrastructure Health** (Docker containers)

## 1. Error Tracking with Sentry

### Step 1: Create Sentry Project

1. Go to [Sentry.io](https://sentry.io) and create an account
2. Create a new project: **AstroVerse Backend** (Node.js)
3. Get your **DSN** (Data Source Name)

### Step 2: Configure Sentry in Backend

Add to `.env.production`:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

Add Sentry initialization to `src/server.ts`:

```typescript
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || "production",
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });
}
```

### Step 3: Add Error Middleware

Already configured in `src/middleware/errorHandler.ts`. Verify it logs to Sentry:

```typescript
if (process.env.SENTRY_DSN) {
  Sentry.captureException(err);
}
```

## 2. Uptime Monitoring

### Recommended Services

| Service | Free Tier | Check Interval | Features |
|---------|-----------|----------------|----------|
| **UptimeRobot** | 50 monitors | 5 minutes | Basic HTTP checks |
| **Pingdom** | 1 monitor | 1 minute | Advanced checks |
| **Better Uptime** | 10 monitors | 30 seconds | SMS alerts |

### Setup with UptimeRobot

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Add **New Monitor**:
   - Type: HTTPS
   - URL: `https://api.astroverse.com/health`
   - Interval: 5 minutes
   - Alert contacts: Your email + SMS
3. Add another monitor for frontend:
   - URL: `https://astroverse.com`

### Alerts to Configure

- Health endpoint returns non-200
- Response time > 5 seconds
- SSL certificate expiring soon
- Website down

## 3. Log Aggregation

### Winston Configuration

The backend already uses Winston. Verify production configuration in `src/utils/logger.ts`:

```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

### Optional: External Log Services

| Service | Pricing | Features |
|---------|---------|----------|
| **Logtail** (BetterStack) | Free tier available | Live tail, queries |
| **Papertrail** | $7/month | Simple log aggregation |
| **Datadog** | $15/host/month | Full observability |

## 4. Database Monitoring

### PostgreSQL Metrics to Track

```sql
-- Connection pool usage
SELECT count(*) FROM pg_stat_activity;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (requires pg_stat_statements)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Health Check Endpoint

The `/health/db` endpoint already exists. Verify it checks:

```bash
curl https://api.astroverse.com/health/db
# Expected: {"success":true,"data":{"status":"healthy",...}}
```

## 5. Container Health

### Docker Health Checks

The `docker-compose.prod.yml` includes health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Monitor Container Status

```bash
# Check all containers
docker-compose -f docker-compose.prod.yml ps

# Check container logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check resource usage
docker stats
```

## 6. Performance Monitoring

### Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 500ms | > 1s |
| API Response Time (p99) | < 2s | > 5s |
| Error Rate | < 1% | > 5% |
| Database Query Time | < 100ms | > 500ms |
| Uptime | > 99.5% | < 99% |

### Custom Performance Tracking

Add timing middleware in `src/server.ts`:

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

## 7. Alert Configuration

### Alert Severity Levels

| Severity | Condition | Response Time |
|----------|-----------|---------------|
| **Critical** | Service completely down | 15 minutes |
| **High** | Error rate > 5% | 1 hour |
| **Medium** | Performance degraded | 4 hours |
| **Low** | Minor issues | Next business day |

### Alert Channels

- **Email** - All alerts
- **SMS** - Critical only
- **Slack** - High and above
- **PagerDuty** (optional) - Critical only

## 8. Dashboard Setup

### Recommended Dashboards

1. **Overview Dashboard**
   - Current uptime
   - Request rate (req/min)
   - Error rate
   - Response time (p50, p95, p99)
   - Active users

2. **Database Dashboard**
   - Connection pool usage
   - Query performance
   - Table sizes
   - Replication lag

3. **Business Dashboard**
   - Active subscriptions
   - Revenue (MRR)
   - Conversion rate
   - Churn rate

### Tools for Dashboards

- **Grafana** + Prometheus (self-hosted)
- **Datadog** (paid)
- **New Relic** (paid)
- **Google Analytics** (free, user-facing only)

## 9. Security Monitoring

### Events to Monitor

- Failed login attempts (>10 per IP per hour)
- Rate limit triggers
- Unusual API usage patterns
- Payment failures
- Admin access attempts

### Security Alerts

```typescript
// Log security events
logger.warn('Security alert', {
  type: 'multiple_failed_logins',
  ip: req.ip,
  email: req.body.email,
  attempts: failedAttempts
});
```

## 10. Backup Monitoring

### Automated Backup Checks

Verify backups are running:

```bash
# Check database backups
ls -lh backend/db/backups/

# Verify backup can be restored
pg_restore --list backup.dump
```

### Backup Health Metrics

| Metric | Target |
|--------|--------|
| Backup frequency | Daily |
| Retention period | 30 days |
| Backup test restore | Monthly |
| Off-site storage | Yes |

## Quick Start Checklist

- [ ] Create Sentry account and get DSN
- [ ] Add SENTRY_DSN to environment variables
- [ ] Set up UptimeRobot monitors
- [ ] Configure alert email/SMS
- [ ] Verify log files are being written
- [ ] Test health check endpoints
- [ ] Set up database backup monitoring
- [ ] Create monitoring dashboard
- [ ] Document on-call procedures

## On-Call Procedures

1. **Incident Response**:
   - Check Sentry for errors
   - Verify UptimeRobot status
   - Check container logs: `docker-compose logs -f`
   - Restart services if needed

2. **Escalation Path**:
   - Level 1: CTO investigates
   - Level 2: Escalate to hosting provider
   - Level 3: Major incident - CEO notification
