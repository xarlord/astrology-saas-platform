# Deployment Guide

Deployment documentation for AstroVerse platform.

## Environments

| Guide | Purpose | Audience |
|-------|---------|----------|
| [local.md](local.md) | Docker + local dev setup, env vars, troubleshooting | Developers |
| [staging.md](staging.md) | Railway staging deploy, auto-deploy from `develop` branch | DevOps |
| [production.md](production.md) | Production deploy (Docker, PM2, cloud platforms), monitoring, rollback | DevOps / Leads |
| [checklist.md](checklist.md) | Pre-flight and post-deploy verification checklist | All |

## Quick Start

```bash
docker-compose -f docker-compose.dev.yml up -d   # PostgreSQL + Redis
npm install                                        # Install all workspaces
cd backend && npm run dev                          # API on :3001
cd frontend && npm run dev                         # App on :5173
```

See [local.md](local.md) for the full walkthrough.

## Architecture Summary

```
Frontend (React/Vite)  ->  Backend (Express/TS)  ->  PostgreSQL 15
    :5173                     :3001                     :5434 (dev)
```

*Last updated: 2026-04-05*
