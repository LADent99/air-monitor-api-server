# air-monitor-api-server

NestJS API server for the air monitor platform. Exposes REST endpoints for
historical time series data and a WebSocket gateway for live readings.

## Architecture

```
TimescaleDB
  ├── REST   — GET /readings/:location/:field?bucket=1m&range=24h
  └── NOTIFY — pushed to connected clients over WebSocket
```

The Prisma schema and migrations live in [`@air-monitor/db`](https://github.com/LADent99/air-monitor-db).
This service installs its own `@prisma/client` (pinned to match the db package's version) and
generates the client pointing at the db package's schema.

## Setup

```bash
direnv allow             # activates nix dev shell and loads .env
npm install
npm run generate         # must run inside nix shell
cp .env.example .env     # fill in DATABASE_URL
```

## Running

```bash
npm run start:dev    # watch mode
npm run start:prod   # production
```

## After updating @air-monitor/db

When the db package is updated (schema changes, Prisma version bumps), re-run from within the nix shell:

```bash
npm install && npm run generate && npm run build
```

`npm run generate` uses `node_modules/@air-monitor/db/prisma/schema.prisma` since this repo
has no local schema. It must run inside the nix shell — Prisma needs the engine binaries set
via env vars in `flake.nix`.

If the db package upgrades its Prisma version, update `@prisma/client` in `package.json` to
match exactly (no `^`) or the generated types will diverge.

## Environment Variables

| Variable       | Example                              | Description            |
|----------------|--------------------------------------|------------------------|
| `DATABASE_URL` | `postgres://user:pw@localhost/airdb` | TimescaleDB connection |
| `PORT`         | `3000`                               | HTTP listen port       |

## API Reference

See `documentation/api-endpoints.md` and `documentation/websocket-events.md`.
