# Frontend Dockerfile for AstroVerse SaaS Platform
# Multi-stage build: build with Node, serve with Nginx

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (workspace root)
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY frontend/ ./frontend/
COPY packages/ ./packages/

# Build shared packages first
RUN cd packages/shared-types && npm run build 2>/dev/null || true
RUN cd packages/shared-utils && npm run build 2>/dev/null || true
RUN cd packages/shared-constants && npm run build 2>/dev/null || true

# Build frontend
RUN cd frontend && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/production.conf /etc/nginx/conf.d/default.conf

# Copy built SPA from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Security headers and caching
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
