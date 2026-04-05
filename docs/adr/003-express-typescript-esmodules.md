# [ADR-003] Express 4 + TypeScript with ES Modules

## Status

Accepted

## Context

The backend API server needs a mature, well-documented framework with strong TypeScript support. Express remains the most widely adopted Node.js web framework with the largest middleware ecosystem. The team chose ES2022/NodeNext module resolution to align frontend and backend on native ES modules and avoid CommonJS/ESM interop pitfalls.

## Decision

Build the backend on **Express 4** with **TypeScript 5** compiled in ES2022/NodeNext mode. Key conventions:

- All source uses `import`/`export` -- no `require()` or `module.exports`.
- `tsconfig.json` sets `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`.
- Controllers are standalone async functions `(req, res) => void`, not class methods.
- Route files export named `router` instances: `export { router as XRoutes }`.

## Consequences

- **Positive**: Largest middleware ecosystem. Plentiful hiring pool and Stack Overflow coverage. ES modules enable tree-shaking and top-level await. Consistent import style across frontend and backend.
- **Negative**: Express 4 lacks native async error handling -- errors in async controllers must be caught and forwarded to `next` or the global error handler. NodeNext requires `.js` extensions in relative imports (handled by `tsx` in dev, `tsc` in build). No built-in OpenAPI validation like Fastify or Hono provide out of the box.

*Last updated: 2026-04-05*
