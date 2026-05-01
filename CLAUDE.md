## Overview
- NestJS REST + WebSocket API; owns the Prisma schema and migrations
- TimescaleDB via Prisma for standard queries; raw SQL for time_bucket() aggregations
- Uses direnv and Nix flakes for dependency management

## Project Architecture
- `src/readings/`         — NestJS module (controller, gateway, service)
- `src/prisma/`           — PrismaService wrapper
- `prisma/schema.prisma`  — schema definition
- `prisma/migrations/`    — migration history
- `documentation/`        — API and WebSocket reference; only read when asked

## Commands
- Tail the last 20 lines of any command output to save context space
- Run dev:  `npm run start:dev`
- Migrate:  `npx prisma migrate dev`
- Lint:     `npm run lint`
- Format:   `npm run format`

## Notes
- TimescaleDB-specific queries (time_bucket, continuous aggregates) must be raw SQL
- LISTEN/NOTIFY uses a dedicated `pg` client — Prisma does not support it
- Schema changes: edit schema.prisma, then run `npx prisma migrate dev --name <name>`