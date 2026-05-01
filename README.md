# air-monitor-api-server

NestJS API server for the air monitor platform. Exposes REST endpoints for
historical time series data and a WebSocket gateway for live readings.
Owns the Prisma schema and all database migrations.

## Architecture

```
TimescaleDB
  ├── REST   — GET /readings/:location/:field?bucket=1m&range=24h
  └── NOTIFY — pushed to connected clients over WebSocket
```

## Setup

```bash
direnv allow
npm install
cp .env.example .env   # fill in DATABASE_URL
npx prisma migrate dev
```

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