# Database Setup Guide

## Quick Start

### Start PostgreSQL Docker Container

```bash
docker start astrology-postgres
```

### Stop PostgreSQL Docker Container

```bash
docker stop astrology-postgres
```

### Restart PostgreSQL Docker Container

```bash
docker restart astrology-postgres
```

### Check PostgreSQL Status

```bash
docker ps --filter "name=astrology-postgres"
```

### View PostgreSQL Logs

```bash
docker logs astrology-postgres
```

## Database Configuration

### Connection Details

- **Host:** localhost
- **Port:** 5433
- **Database:** astrology_saas
- **User:** postgres
- **Password:** astrology123
- **Connection String:** `postgresql://postgres:astrology123@localhost:5433/astrology_saas`

### Environment Variables

The `.env` file is configured with:

```bash
DATABASE_URL=postgresql://postgres:astrology123@localhost:5433/astrology_saas
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=astrology_saas
DATABASE_USER=postgres
DATABASE_PASSWORD=astrology123
```

## Database Migrations

### Run All Pending Migrations

```bash
cd backend
npm run db:migrate
```

### Rollback Last Migration

```bash
cd backend
npm run db:rollback
```

### Reset Database (Drop and Recreate)

```bash
docker exec astrology-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS astrology_saas;"
docker exec astrology-postgres psql -U postgres -d postgres -c "CREATE DATABASE astrology_saas;"
cd backend
npm run db:migrate
```

### View Migration Status

```bash
docker exec astrology-postgres psql -U postgres -d astrology_saas -c "SELECT * FROM knex_migrations ORDER BY name;"
```

## Database Access

### Connect to PostgreSQL CLI

```bash
docker exec -it astrology-postgres psql -U postgres -d astrology_saas
```

### List All Tables

```bash
docker exec astrology-postgres psql -U postgres -d astrology_saas -c "\dt"
```

### Describe Table Structure

```bash
docker exec astrology-postgres psql -U postgres -d astrology_saas -c "\d table_name"
```

### Run SQL Query

```bash
docker exec astrology-postgres psql -U postgres -d astrology_saas -c "SELECT * FROM users LIMIT 10;"
```

## Database Schema

### Core Tables

- `users` - User accounts and authentication
- `refresh_tokens` - JWT refresh tokens
- `charts` - Natal charts
- `interpretations` - Chart interpretations
- `transit_readings` - Transit forecasts
- `audit_log` - System audit logs

### Calendar Feature Tables

- `calendar_events` - Global astrological events (retrogrades, moon phases, eclipses)
- `user_reminders` - User notification preferences
- `user_calendar_views` - Calendar view settings

### Lunar Return Feature Tables

- `lunar_returns` - Lunar return calculations
- `monthly_forecasts` - Monthly forecasts based on lunar returns

### Synastry Feature Tables

- `synastry_reports` - Compatibility reports between two charts

### Additional Tables

- `solar_returns` - Solar return (birthday) charts
- `solar_return_settings` - User preferences for solar returns
- `push_subscriptions` - Push notification subscriptions
- `ai_cache` - AI calculation cache
- `ai_usage` - AI usage tracking

## Troubleshooting

### Port Already in Use

If you get an error about port 5432 being in use, the container is configured to use port 5433 to avoid conflicts with other PostgreSQL instances.

### Can't Connect to Database

1. Check if Docker container is running:
   ```bash
   docker ps --filter "name=astrology-postgres"
   ```

2. Check if database exists:
   ```bash
   docker exec astrology-postgres psql -U postgres -d postgres -c "\l" | grep astrology_saas
   ```

3. Restart the container:
   ```bash
   docker restart astrology-postgres
   ```

### Migration Errors

If migrations fail:

1. Drop and recreate the database
2. Check for duplicate migration files
3. Verify foreign key references are correct
4. Check migration file syntax

### View Database Logs

```bash
docker logs astrology-postgres --tail 100 -f
```

## Backup and Restore

### Backup Database

```bash
docker exec astrology-postgres pg_dump -U postgres astrology_saas > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i astrology-postgres psql -U postgres -d astrology_saas
```

## Production Deployment

For production, you should:

1. Change the default password
2. Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
3. Enable SSL connections
4. Set up regular backups
5. Configure connection pooling
6. Monitor database performance

---

*Last updated: February 2026*
