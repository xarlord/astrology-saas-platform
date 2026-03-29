---
description: Run Playwright E2E tests
---

# Run E2E Tests
1. Check backend: `curl -s http://localhost:3001/health`
2. Check frontend: `curl -s http://localhost:5173`
3. If servers not running, ask user whether to start them
4. Run: `cd frontend && npx playwright test`
5. For failures: show output, analyze test code, suggest fixes