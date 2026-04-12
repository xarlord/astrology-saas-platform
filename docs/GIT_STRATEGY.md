# Git Strategy — AstroVerse

## Overview

Trunk-based development with two long-lived branches and short-lived feature branches.

```
master (production)
  └── develop (integration)
        ├── feature/CHI-XX-description
        ├── fix/CHI-XX-description
        └── hotfix/CHI-XX-description
```

## Branches

### Long-lived branches

| Branch | Purpose | Protection | Deploy |
|--------|---------|------------|--------|
| `master` | Production-ready code | Require PR, 1 approval, CI pass | Manual deploy |
| `develop` | Integration / staging | Require PR, CI pass | Staging auto-deploy |

### Short-lived branches

Created from `develop`, merged back via PR. Deleted after merge.

| Type | Naming | Source | Target |
|------|--------|--------|--------|
| Feature | `feature/CHI-XX-desc` | `develop` | `develop` |
| Bug fix | `fix/CHI-XX-desc` | `develop` | `develop` |
| Hotfix | `hotfix/CHI-XX-desc` | `master` | `master` → `develop` |

## Branch Protection Rules (GitHub)

### `master`
- Require pull request (1 approval)
- Require status checks: `backend-test`, `frontend-test`
- Require branches to be up to date
- No force pushes
- No deletions

### `develop`
- Require pull request (0 approvals for speed)
- Require status checks: `backend-test`, `frontend-test`
- Allow force pushes: no
- Allow deletions: no

## Commit Convention

```
type(scope): imperative description
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- **Scope**: module name (auth, charts, users, calendar, ai, billing, etc.)
- **Reference**: include CHI-XX task ID in commit body when applicable

Examples:
```
feat(auth): add password reset flow
fix(charts): resolve timezone offset in natal chart calculation
ci: add E2E test job to CI pipeline
```

## Merge Strategy

- **Squash merge** for feature branches (clean history, one commit per feature)
- **Merge commit** for `develop` → `master` (preserve integration history)
- **Rebase** not used (avoids force-push complications)

## Release Flow

1. `develop` reaches stable state
2. Create PR: `develop` → `master`
3. Review, CI passes
4. Merge with merge commit
5. Tag release: `vX.Y.Z`
6. Deploy from `master`

## CI/CD

See `.github/workflows/`:
- **ci.yml** — Runs on push to `master`/`develop` and all PRs. Backend lint + typecheck + unit tests, frontend lint + typecheck + unit tests, E2E tests.
- **deploy.yml** — Manual trigger for staging/production deploys.
