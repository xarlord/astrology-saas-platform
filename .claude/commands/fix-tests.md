---
description: Diagnose and fix failing backend tests
---

# Fix Failing Tests
1. Run: `cd backend && npx jest --verbose 2>&1`
2. For each failing test:
   - Read the test file and the source file being tested
   - Determine root cause: test bug, source bug, or env/config issue
3. Common issues to check:
   - Import paths and @ alias resolution
   - Mock setup (Winston logger globally mocked in setup.ts)
   - CSRF middleware (skipped in test env)
   - Config env leakage (env vars read at import time)
4. Fix and verify: `cd backend && npx jest <file> --verbose`
5. Do NOT modify expectations to make tests pass unless the test itself is wrong