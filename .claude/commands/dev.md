---
description: Start the development environment
---

# Start Dev Environment
1. Check Docker PostgreSQL: `docker ps --filter "name=astrology"`
   - If not running: `docker compose -f docker-compose.dev.yml up -d postgres`
   - Wait: `pg_isready -h localhost -p 5434`
2. Run migrations: `cd backend && npx knex migrate:latest`
3. Start dev servers: `npm run dev`
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173
4. Report startup status for both services