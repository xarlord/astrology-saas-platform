# Quick Start: Database Setup and Integration Testing

## Prerequisites

You need **ONE** of the following:
- Docker Desktop installed (recommended)
- PostgreSQL 15+ installed locally
- Access to a cloud PostgreSQL instance

---

## Option 1: Docker Desktop (RECOMMENDED - Fastest)

### Step 1: Start Docker Desktop
1. Open Docker Desktop from Windows Start Menu
2. Wait for the whale icon in system tray to show it's running
3. Verify: `docker ps` (should not error)

### Step 2: Start PostgreSQL Container
```bash
cd C:\Users\plner\MVP_Projects
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Step 3: Verify Database is Ready
```bash
# Check container is running
docker-compose -f docker-compose.dev.yml ps

# View logs (wait for "database system is ready to accept connections")
docker-compose -f docker-compose.dev.yml logs postgres
```

### Step 4: Run Migrations
```bash
cd backend
npm run db:migrate
```

### Step 5: Run Integration Tests
```bash
# Run all tests
npm test

# Run only integration tests
npm test -- --testPathPattern=integration

# Run with coverage
npm run test:coverage
```

---

## Option 2: Local PostgreSQL Installation

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set during installation

### Step 2: Create Test Database
Open SQL Shell (psql) from Start Menu:
```sql
CREATE DATABASE astrology_saas;
CREATE DATABASE astrology_saas_test;
\q
```

### Step 3: Update .env File
Edit `C:\Users\plner\MVP_Projects\backend\.env`:
```env
# If you're using port 5432 (default), change this:
DATABASE_PORT=5432

# Update these with your installation values:
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password-here
```

### Step 4: Run Migrations
```bash
cd backend
npm run db:migrate
```

### Step 5: Run Tests
```bash
npm test
```

---

## Option 3: Cloud PostgreSQL (AWS RDS, Google Cloud SQL, Azure, Supabase)

### Step 1: Get Cloud Database
- Set up a PostgreSQL instance on your preferred cloud platform
- Get connection details (host, port, username, password)

### Step 2: Update .env File
Edit `C:\Users\plner\MVP_Projects\backend\.env`:
```env
DATABASE_HOST=your-cloud-host.com
DATABASE_PORT=5432
DATABASE_NAME=astrology_saas
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
```

### Step 3: Run Migrations
```bash
cd backend
npm run db:migrate
```

### Step 4: Run Tests
```bash
npm test
```

---

## Verify Everything Works

### Check Database Connection
```bash
cd backend
npm run dev
```
Look for: `Server running on port 3001` and successful database connection message.

### Run Health Check
```bash
curl http://localhost:3001/health
```
Should return:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-19T..."
  }
}
```

### Run Database Health Check
```bash
curl http://localhost:3001/health/db
```
Should return:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

---

## Common Issues and Solutions

### Issue: "Database connection error"
**Solution:**
- Verify PostgreSQL is running: `docker ps` or check pgAdmin
- Check credentials in .env file
- Ensure port is correct (5434 for Docker, 5432 for local)

### Issue: "Migration failed"
**Solution:**
- Drop and recreate database:
  ```bash
  docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS astrology_saas;"
  docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE astrology_saas;"
  ```
- Run migrations again: `npm run db:migrate`

### Issue: "Tests timeout"
**Solution:**
- Increase test timeout in `jest.config.js`:
  ```javascript
  testTimeout: 30000, // Increase from 10000
  ```

### Issue: "Port already in use"
**Solution:**
- Check what's using port 5434:
  ```bash
  netstat -ano | findstr :5434
  ```
- Either stop the conflicting service or change port in .env

---

## Test Commands Reference

```bash
# Run all tests
npm test

# Run specific test file
npm test -- lunarReturn.routes.test.ts

# Run integration tests only
npm test -- --testPathPattern=integration

# Run unit tests only (skip integration and performance)
npm test -- --testPathIgnorePatterns="integration|performance"

# Run with verbose output
npm test -- --verbose

# Run with coverage
npm run test:coverage

# Watch mode (re-run on file changes)
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## Stopping the Database

### If using Docker:
```bash
# Stop PostgreSQL container
docker-compose -f docker-compose.dev.yml stop postgres

# Stop and remove container
docker-compose -f docker-compose.dev.yml down

# Remove volumes (deletes data!)
docker-compose -f docker-compose.dev.yml down -v
```

### If using local PostgreSQL:
The database continues running in the background. To stop:
- Open Services from Windows Control Panel
- Find "postgresql-x64-15" (version may vary)
- Stop the service

---

## Next Steps After Database Setup

1. **Review test results** - Check for any failing tests
2. **Fix failing tests** - Update test code or implementation
3. **Run full test suite** - Ensure all tests pass
4. **Check coverage** - Review `npm run test:coverage` results
5. **Test API endpoints** - Use Postman or curl as documented in RUNTIME_TESTING_PLAN.md
6. **Start frontend** - In a new terminal: `cd frontend && npm run dev`
7. **Manual testing** - Open http://localhost:5173 and test the application

---

## Database Schema Overview

After migrations run, you'll have these tables:

### Core Tables
- `users` - User accounts and profiles
- `charts` - Birth charts and astrological calculations
- `refresh_tokens` - JWT refresh tokens for authentication

### Analysis Tables
- `interpretations` - Cached chart interpretations
- `transit_readings` - Transit predictions and readings

### Calendar Tables
- `calendar_events` - Astrological events (new moons, full moons, retrogrades)
- `user_calendar_views` - User-specific calendar settings
- `user_reminders` - Personal reminders and notifications

### Lunar Return Tables
- `lunar_returns` - Calculated lunar return charts
- `monthly_forecasts` - Lunar month predictions and themes

### Solar Return Tables
- `solar_returns` - Solar return calculations
- `solar_return_settings` - User preferences for solar returns

### Synastry Tables
- `synastry_reports` - Relationship compatibility reports

### AI Tables
- `ai_cache` - Cached AI responses to save tokens
- `ai_usage` - Track AI API usage and costs

### Notification Tables
- `push_subscriptions` - Web push notification subscriptions

### Audit Tables
- `audit_log` - Track all changes for compliance

---

## Estimated Time to Complete

- **Option 1 (Docker):** 15 minutes
- **Option 2 (Local PostgreSQL):** 30 minutes
- **Option 3 (Cloud):** 45 minutes

Most time is spent downloading/installing PostgreSQL. Once database is running, setup takes less than 5 minutes.

---

**Need Help?** Check the full report: `DATABASE_AND_INTEGRATION_TEST_REPORT.md`
