# Backend Dockerfile for AstroVerse SaaS Platform
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (workspace root)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (workspace-aware)
RUN npm ci --workspaces --include-workspace-root

# Copy shared packages and build them first
COPY packages/ ./packages/
RUN cd packages/shared-types && npm run build 2>/dev/null || true
RUN cd packages/shared-utils && npm run build 2>/dev/null || true
RUN cd packages/shared-constants && npm run build 2>/dev/null || true

# Copy backend source
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Build backend TypeScript
RUN cd backend && npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libgcc tini

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm ci --omit=dev --workspaces --include-workspace-root

# Copy built files
COPY --from=builder /app/backend/dist ./backend/dist

# Copy shared packages (built)
COPY --from=builder /app/packages ./packages

# Copy knex config and migrations
COPY backend/knexfile.ts ./backend/
COPY backend/src/modules/*/migrations ./backend/migrations/ 2>/dev/null || true

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s   CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/dist/server.js"]
