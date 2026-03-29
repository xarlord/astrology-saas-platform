---
description: Run database migrations and seeds
---

# Database Management

1. Check migration status: `cd backend && npx knex migrate:status`
2. Run pending migrations: `cd backend && npx knex migrate:latest`
3. Verify status: `cd backend && npx knex migrate:status`
4. If seed data needed: `cd backend && npx knex seed:run`