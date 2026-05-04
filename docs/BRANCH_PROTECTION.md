# Branch Protection Recommendations

Recommended GitHub branch protection rules for `master` (production) and `develop` (staging) branches.

## Settings for `master`

1. **Require a pull request before merging**
   - Require approvals: 1 (from a team lead or CTO)
   - Dismiss stale reviews on push: yes

2. **Require status checks to pass**
   - `backend-test` (from CI workflow)
   - `frontend-test` (from CI workflow)
   - Require branches to be up to date before merging: yes

3. **Require conversation resolution before merging** — yes

4. **Do not allow force pushes** — yes

5. **Do not allow deletions** — yes

## Settings for `develop`

Same as `master`, but:
- Require approvals: 1 (any team member)
- Status checks: same CI jobs

## Branch Naming Convention

| Pattern | Example | Purpose |
|---------|---------|---------|
| `feature/<ticket>-<description>` | `feature/CHI-42-daily-briefing` | New features |
| `fix/<ticket>-<description>` | `fix/CHI-99-auth-redirect` | Bug fixes |
| `chore/<description>` | `chore/update-deps` | Maintenance |
| `docs/<description>` | `docs/api-reference` | Documentation |

## How to Configure

GitHub repo → Settings → Branches → Branch protection rules → Add rule for `master` and `develop`.
