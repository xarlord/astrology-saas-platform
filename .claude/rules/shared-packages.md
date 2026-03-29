---
paths:
  - "packages/**"
---

## Shared Packages
- Build: `cd packages/shared-types && npm run build`
- Build: `cd packages/shared-utils && npm run build`
- Build: `cd packages/shared-constants && npm run build`
- Changes to shared packages require rebuilding consuming packages
- Import from shared packages by their published names:
  - `@astrology-saas/shared-types`
  - `@astrology-saas/shared-utils`
  - `@mooncalender/shared-constants`