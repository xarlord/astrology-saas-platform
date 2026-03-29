# Testing Quick Reference Card

**Quick commands for database setup and testing**

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Start Docker Desktop (manual - open from Start Menu)

# 2. Start PostgreSQL
cd C:\Users\plner\MVP_Projects
docker-compose -f docker-compose.dev.yml up -d postgres

# 3. Run migrations
cd backend
npm run db:migrate

# 4. Run tests
npm test -- --testPathPattern=integration
```

---

## 📋 Test Commands

### Run Tests
```bash
npm test                                    # All tests
npm test -- --testPathPattern=integration   # Integration only
npm test -- --testPathIgnorePatterns="integration|performance"  # Unit only
npm run test:coverage                       # With coverage
npm test -- --watch                         # Watch mode
```

### Database Commands
```bash
npm run db:migrate                          # Run migrations
npm run db:rollback                         # Rollback last migration
npm run db:reset                            # Full reset
npm run db:seed                             # Load seed data
```

---

## 🔍 Check Status

```bash
# Check if Docker is running
docker ps

# Check PostgreSQL container
docker-compose -f docker-compose.dev.yml ps

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test database connection
cd backend
npm run dev
# Look for: "Server running on port 3001"
```

---

## 🛠️ Troubleshooting

### Database connection refused
```bash
# Start Docker Desktop
# Then start container
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Port already in use
```bash
# Check what's using the port
netstat -ano | findstr :5434

# Stop PostgreSQL container
docker-compose -f docker-compose.dev.yml stop postgres
```

### Tests fail after database start
```bash
# Recreate database
cd backend
npm run db:reset
```

---

## 📊 Test Files

### Integration Tests (7 files)
- `auth.routes.test.ts` - Authentication endpoints
- `calendar.routes.test.ts` - Calendar API
- `chart.routes.test.ts` - Chart management
- `lunarReturn.routes.test.ts` - Lunar returns
- `user.routes.test.ts` - User management
- `analysis.routes.test.ts` - Chart analysis
- `ai/integration.test.ts` - AI features

### Unit Tests (28 files)
- Services, controllers, middleware, utils
- Tests run without database (use mocks)

---

## 📝 Key Files

### Configuration
- `.env` - Database credentials
- `knexfile.ts` - Database config
- `jest.config.js` - Test config
- `docker-compose.dev.yml` - PostgreSQL container

### Documentation
- `QUICKSTART_DATABASE_SETUP.md` - Detailed setup
- `TESTS_TO_RUN_ONCE_DATABASE_AVAILABLE.md` - Test inventory
- `DATABASE_AND_INTEGRATION_TEST_REPORT.md` - Full report
- `RUNTIME_TESTING_PLAN.md` - Runtime testing scenarios

---

## ⏱️ Time Estimates

- Start Docker Desktop: 2 min
- Start PostgreSQL: 3 min
- Run migrations: 1 min
- Run integration tests: 5 min
- **Total:** ~15 minutes

---

## 🎯 Success Criteria

✅ PostgreSQL container is running
✅ Migrations completed successfully
✅ Integration tests pass (95%+)
✅ Backend starts without errors
✅ Health check returns success

---

## 📞 Help

1. Check `QUICKSTART_DATABASE_SETUP.md` for detailed setup
2. Check `DATABASE_AND_INTEGRATION_TEST_REPORT.md` for full analysis
3. Check `TASK_COMPLETION_SUMMARY.md` for what was done

---

**Last Updated:** 2026-02-19
**Status:** Ready to run (just need database)
