---
name: refactoring-patterns
description: Safe refactoring rules and patterns for the AstroVerse codebase
---

# Refactoring Patterns

## Safe Deletion Rules

1. **Verify zero imports** before deleting any export
   - Use `grep -r "from.*<module>" backend/src/` to find all consumers
   - Check both direct imports and re-exports
   - Check test files separately

2. **Delete proxy layers bottom-up**
   - First update all consumers to import from source
   - Then delete the proxy files
   - Finally delete the directory

3. **Barrel file consolidation**
   - When removing a barrel, ensure no external consumer imports from it
   - Routes are the primary consumers of controllers
   - Tests are the primary consumers of services

## Import Path Migration

### Controllers
- FROM: `../../controllers/<name>.controller`
- TO: `../../modules/<domain>/controllers/<name>.controller`

### Services
- FROM: `../../services/<name>.service`
- TO: `../../modules/<domain>/services/<name>.service` or `../../modules/shared/services/<name>.service`

### Mapping
- `auth.controller` → `modules/auth/controllers/auth.controller`
- `chart.controller` → `modules/charts/controllers/chart.controller`
- `user.controller` → `modules/users/controllers/user.controller`
- `analysis.controller` → `modules/analysis/controllers/analysis.controller`
- `calendar.controller` → `modules/calendar/controllers/calendar.controller`
- `solarReturn.controller` → `modules/solar/controllers/solarReturn.controller`
- `transit.controller` → `modules/transits/controllers/transit.controller`
- `swissEphemeris.service` → `modules/shared/services/swissEphemeris.service`
- `calendar.service` → `modules/calendar/services/calendar.service`
- `interpretation.service` → `modules/analysis/services/interpretation.service`
- `lunarReturn.service` → `modules/lunar/services/lunarReturn.service`
- `solarReturn.service` → `modules/solar/services/solarReturn.service`
- `synastry.service` → `modules/synastry/services/synastry.service`

## Controller Pattern

### Standard Pattern (target)
```typescript
export async function handlerName(req: Request, res: Response): Promise<void> {
  // ...
}
```

### Anti-patterns to fix
- Class-based controllers: convert to standalone functions
- Default export objects: convert to named exports
- Fat controllers (>200 lines): extract business logic to service layer

## Test Safety

- Controllers take `(req, res)` only — no `next` parameter
- Test imports should use module paths, not barrel paths
- Mock `console.*` is handled globally in setup.ts
- Swiss Ephemeris is always mocked in tests
- CSRF is skipped in test env unless `TEST_CSRF=true`