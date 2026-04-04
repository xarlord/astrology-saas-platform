## Summary

<!-- Brief description of what this PR does and why -->

## Related Issues

<!-- Link to Paperclip/CHI task, e.g. Closes #123 or CHI-XX -->

## Changes

<!-- Bullet list of key changes -->

-

## Test Plan

<!-- How to verify these changes work -->

- [ ] Backend tests pass: `cd backend && npx jest`
- [ ] Frontend tests pass: `cd frontend && npx vitest run`
- [ ] Type checks clean: `cd backend && npx tsc --noEmit` / `cd frontend && npx tsc --noEmit`
- [ ] Lint clean: `npm run lint`

## Checklist

- [ ] Review against [Code Review Checklist](../docs/CODE_REVIEW_CHECKLIST.md)
- [ ] No `console.log` in backend code (use `logger`)
- [ ] No `require()` in backend source (use `import`)
- [ ] Frontend uses `import api from '../services/api'` (not raw axios)
- [ ] Frontend uses `<Link>` or `useNavigate()` (not raw `<a href>`)
- [ ] Controllers use `AuthenticatedRequest` where applicable
