## Overview
- NestJS REST + WebSocket API; uses `@prisma/client` directly, `@air-monitor/db` for shared types
- TimescaleDB via Prisma for standard queries; raw SQL for time_bucket() aggregations
- Uses direnv and Nix flakes for dependency management

## Project Architecture
- `src/readings/`         — NestJS module (controller, gateway, service)
- `src/prisma/`           — PrismaService wrapper (extends PrismaClient from @prisma/client)
- `documentation/`        — API and WebSocket reference; only read when asked

## Commands
- Tail the last 20 lines of any command output to save context space
- Run dev:  `npm run start:dev`
- Generate: `npm run generate` (must run inside nix shell)
- Lint:     `npm run lint`
- Format:   `npm run format`

## Notes
- Schema and migrations live in `@air-monitor/db` — do not add a local schema.prisma
- `@prisma/client` is pinned exact (no `^`) to match `@air-monitor/db`'s Prisma version
- TimescaleDB-specific queries (time_bucket, continuous aggregates) must be raw SQL
- LISTEN/NOTIFY uses a dedicated `pg` client — Prisma does not support it
