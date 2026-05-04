# [ADR-004] OpenAPI Documentation via swagger-jsdoc

## Status

Accepted

## Context

AstroVerse exposes approximately 80 REST endpoints across authentication, charts, transits, synastry, billing, and calendar modules. We need machine-readable API documentation that stays in sync with code and supports an interactive UI for manual testing during development.

Options considered:

- **Hand-written OpenAPI YAML** -- accurate but drifts from code.
- **tsoa / express-openapi** -- decorator-based, adds runtime overhead and couples routing to metadata.
- **swagger-jsdoc + swagger-ui-express** -- JSDoc annotations in route files, generated at startup.

## Decision

Use **swagger-jsdoc** to extract OpenAPI 3.0 specs from JSDoc annotations placed directly above route definitions. Serve the generated spec via **swagger-ui-express** at `/api-docs` in development. Annotations live in route files under `modules/{domain}/routes/`.

## Consequences

- **Positive**: Documentation lives next to the code it describes, reducing drift. No extra build step -- spec is generated at server startup. Interactive Swagger UI aids debugging. Zero runtime overhead beyond dev startup.
- **Negative**: Requires manual annotation discipline -- forgetting a JSDoc block means a silent gap in the spec. No compile-time guarantee that annotations match actual request/response types. Large route files can become noisy with annotation blocks.

*Last updated: 2026-04-05*
