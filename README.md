# air-monitor-api-server

NestJS API server for the air monitor platform. Exposes REST endpoints for
historical time series data and a WebSocket gateway for live readings.

## Architecture

```
TimescaleDB
  ├── REST   — GET /readings/:location/:field?bucket=1m&range=24h
  └── NOTIFY — pushed to connected clients over WebSocket
```

The Prisma schema and migrations live in `prisma/` in this repo.

## Setup

```bash
direnv allow             # activates nix dev shell and loads .env
npm install
npm run generate         # must run inside nix shell
cp .env.example .env     # fill in DATABASE_URL
```

## DB Setup (after a reset)

1. Ensure TimescaleDB is installed on the server
2. Run `npx prisma migrate deploy` — the migration enables the TimescaleDB extension and creates the hypertable

## Running

```bash
npm run start:dev    # watch mode
npm run start:prod   # production
```


## Environment Variables

| Variable       | Example                              | Description            |
|----------------|--------------------------------------|------------------------|
| `DATABASE_URL` | `postgres://user:pw@localhost/airdb` | TimescaleDB connection |
| `PORT`         | `3000`                               | HTTP listen port       |

## API Reference

See `documentation/api-endpoints.md` and `documentation/websocket-events.md`.
