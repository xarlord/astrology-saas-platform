# AstroVerse production promotion runbook

Issue: #517

This is an approval-gated procedure. It is intentionally not a deployment script and must not be executed without an explicit production approval immediately before the deploy step.

## Release record

Before starting, create a release record containing:

- intended repository: `xarlord/astrology-saas-platform`
- intended branch: `master`
- intended commit SHA: capture with `git rev-parse origin/master`; the current planning baseline is `15fe402322d1e8448fd0289b0dfcbdd732c17af3`
- operator and approver
- UTC start time
- last known-good Fly release and its image/deployment identifier

Do not substitute a moving branch name for the recorded SHA. If `master` advances after the record is created, stop and recapture the release candidate and its test evidence.

## Preconditions

1. Confirm the GitHub PR for the selected SHA is ordinarily mergeable and all required branch-protection checks and reviews are current and green. Do not use an administrator or forced merge.
2. Confirm Fly identity without printing credentials:

   ```bash
   flyctl apps list
   flyctl status --app astroverse
   ```

   The target must be the expected `astroverse` application in the expected organization/region.
3. Inspect configured secret names only. Never print secret values:

   ```bash
   flyctl secrets list --app astroverse
   ```

   Confirm the release's required names are present as applicable: `DATABASE_URL` (or the configured `DATABASE_*` set), `JWT_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `PASSWORD_RESET_HASH_SECRET`, `CSRF_SECRET`, `FRONTEND_URL`, `REDIS_URL` or the configured `REDIS_*` set, `EPHEMERIS_PATH`, `SENTRY_DSN`, and any enabled integration names such as `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`, and VAPID keys. Compare names against the application configuration and the release record; do not add or rotate production secrets in this procedure.
4. Validate database reachability using the application's non-destructive health check. Review pending migrations from the selected SHA and classify each migration as backward-compatible or requiring a maintenance/rollback plan. Take or verify a current backup before any migration.
5. Build and run release-required tests from the recorded SHA. Save links and exact commands in the release record.
6. Verify the rollback target is known and still available. Record the exact Fly command/target for the last known-good release.

## Explicit approval gate

Immediately before deployment, obtain explicit human approval naming the recorded SHA, target app, migration plan, and rollback target. If approval is absent, the release is blocked. Do not deploy from a local uncommitted tree or from a different SHA.

## Promotion

From a clean checkout at the recorded SHA, use the repository's verified Fly deployment path. The access token must be supplied by the operator's existing secure environment and must never be placed in shell history, chat, issues, or logs:

```bash
git checkout --detach <RECORDED_SHA>
FLY_ACCESS_TOKEN="$FLY_ACCESS_TOKEN" flyctl deploy --remote-only --app astroverse
```

If the project-specific operator environment requires a token file, read it only into the process environment using the local secure procedure; do not print it. Do not deploy while #525 account rotation/revocation remains unconfirmed unless the user explicitly accepts that risk in the release record.

## Post-deploy smoke and observability

Record the deployment identifier and deployed SHA from Fly, then verify:

```bash
flyctl status --app astroverse
curl --fail --silent --show-error https://astroverse.fly.dev/health
```

The health response must report `success: true`, `status: healthy`, and the expected runtime version/release SHA. The current endpoint reports a static application version rather than a commit SHA; until a SHA-backed version field is implemented, the operator must verify the deployed image/release identity through Fly and record that limitation as an observation gap.

Run non-destructive smoke checks against production:

- home/login page loads over HTTPS;
- authentication reaches the expected success/failure boundary without using a real user password in automation;
- one authenticated, read-only chart flow completes;
- `/health`, database health, and Redis health are healthy as applicable;
- logs and error monitoring show no new startup, migration, authentication, or elevated 5xx errors;
- the observed application behavior corresponds to the recorded SHA.

Record UTC time, deployed SHA/image, migration version, health output summary, smoke results, and monitoring links. Never record cookies, tokens, passwords, or secret values.

## Stop and rollback criteria

Stop promotion and page the approver if any of these occur: missing secret name, failed or unverified migration, database/Redis health failure, startup failure, authentication regression, failed smoke check, unexpected 5xx/error-rate increase, wrong deployed SHA, or inability to identify the rollback target.

Rollback to the recorded last known-good Fly release using the normal Fly release mechanism, then rerun health and smoke checks. Do not roll back a database migration unless its compatibility and data-loss impact have been reviewed and approved. Record the rollback release, time, reason, migration state, health result, and follow-up issue.

This runbook does not authorize production deployment, secret changes, account changes, or a history rewrite.
