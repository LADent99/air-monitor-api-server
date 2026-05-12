# Milestone 1 — Project Scaffold & Database Setup

## Goal

Establish the NestJS project skeleton, define the shared Prisma schema, and prepare the TimescaleDB database so the ingestor can be built and start populating data.

## Architecture decided

```
ESP32
  └── MQTT → Mosquitto
                └── ingestor (TypeScript)
                      └── TimescaleDB (PostgreSQL 16, k3s/Helm)
                            └── this API server (NestJS + Prisma)
                                  └── frontend
```

**Schema sharing:** A third repo `air-monitor-db` owns `prisma/schema.prisma` and all migrations. Both the API server and the ingestor install it as an npm git-dependency (`@air-monitor/db`). The API server runs `prisma migrate deploy`; the ingestor only imports the generated client.

**Database:** Reuse the existing k3s PostgreSQL 16 instance. Add TimescaleDB via `shared_preload_libraries` in Helm `values.yaml`, then create a new `airdb` database and run `CREATE EXTENSION timescaledb CASCADE` inside it only.

## Files created

```
.gitignore                          — Node.js version (replaced Python template)
package.json                        — NestJS + Prisma + pg + socket.io deps
tsconfig.json
nest-cli.json
.env.example
prisma/schema.prisma                — Reading model (copy to air-monitor-db)
src/main.ts                         — app bootstrap, global ValidationPipe
src/app.module.ts
src/prisma/prisma.module.ts         — @Global PrismaModule
src/prisma/prisma.service.ts        — PrismaClient wrapper (OnModuleInit/Destroy)
src/readings/readings.module.ts
src/readings/readings.controller.ts — GET /readings/:location/:field
src/readings/readings.service.ts    — time_bucket() via $queryRawUnsafe
src/readings/readings.gateway.ts    — WebSocket gateway + LISTEN/NOTIFY via pg
```

## Schema

```prisma
model Reading {
  time        DateTime @default(now())
  location    String
  temperature Float?   // °C
  humidity    Float?   // %RH
  pm1_0       Float?   // µg/m³
  pm2_5       Float?   // µg/m³
  pm4_0       Float?   // µg/m³
  pm10        Float?   // µg/m³
  co2         Float?   // ppm
  voc         Int?     // index 1–500
  nox         Int?     // index 1–500

  @@id([time, location])
  @@map("readings")
}
```

MQTT topic pattern: `<location>/air-monitor/<field>` — one topic per sensor field per location.

## Stack decisions

| Concern | Package | Why |
|---|---|---|
| ORM | Prisma | Best DX; TimescaleDB queries via `$queryRawUnsafe` |
| WebSockets | @nestjs/websockets + socket.io | Official NestJS integration |
| LISTEN/NOTIFY | `pg` (node-postgres) | Prisma does not support it |
| Validation | class-validator + class-transformer | NestJS standard |
| Config | @nestjs/config | env/dotenv integration |

## Remaining setup steps (to complete before ingestor work)

1. **Create `air-monitor-db` repo** — copy `prisma/schema.prisma`, run `prisma migrate dev --name init`, then append to the generated migration file:
   ```sql
   CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
   SELECT create_hypertable('"readings"', 'time');
   ```
   Run `prisma migrate deploy` to apply.

2. **Enable TimescaleDB on k3s Postgres** — add to Helm `values.yaml`:
   ```yaml
   primary:
     extendedConfiguration: |
       shared_preload_libraries = 'timescaledb'
   ```
   After `helm upgrade` and pod restart:
   ```sql
   CREATE DATABASE airdb;
   \c airdb
   CREATE EXTENSION timescaledb CASCADE;
   ```

3. **Install deps and verify** — `npm install`, set `DATABASE_URL` in `.env`, run `npm run start:dev`.
