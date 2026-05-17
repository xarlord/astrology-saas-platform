## Summary

<!-- Brief description of what this PR does and why -->

## Related Issues

<!-- Link to Paperclip/CHI task, e.g. Closes #123 or CHI-XX -->

## Changes

<!-- Bullet list of key changes -->

-

## Test Plan

<!-- How to verify these changes work -->

- [ ] **✅ Tests added/updated for this change** (REQUIRED — CI will block merge without tests)
- [ ] Backend tests pass: `cd backend && npx jest`
- [ ] Frontend tests pass: `cd frontend && npx vitest run`
- [ ] Type checks clean: `cd backend && npx tsc --noEmit` / `cd frontend && npx tsc --noEmit`
- [ ] Lint clean: `npm run lint`

### New Features / Bug Fixes
- [ ] Unit tests added for new logic (services, utils, parsers)
- [ ] Integration tests added for new API endpoints (if any)
- [ ] E2E test scenario updated (if user-facing change)

## Checklist

- [ ] Review against [Code Review Checklist](../docs/CODE_REVIEW_CHECKLIST.md)
- [ ] No `console.log` in backend code (use `logger`)
- [ ] No `require()` in backend source (use `import`)
- [ ] Frontend uses `import api from '../services/api'` (not raw axios)
- [ ] Frontend uses `<Link>` or `useNavigate()` (not raw `<a href>`)
- [ ] Controllers use `AuthenticatedRequest` where applicable

---

> ⚠️ **Test Enforcement**: This PR will be blocked from merging if changed source files don't have corresponding test changes. See [test enforcement workflow](.github/workflows/test-enforcement.yml).
