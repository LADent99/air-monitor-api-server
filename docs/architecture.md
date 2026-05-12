# air-monitor-api-server – Architecture

*Created: 2026-05-09. Last updated: 2026-05-11.*
*Update this document whenever a significant architectural decision changes.*

## Overview

REST + WebSocket API server for an air quality monitoring platform. Reads sensor time-series data from TimescaleDB and exposes it to a frontend via:
- REST endpoints for querying historical data (latest readings, time-bucketed aggregations, filtered by location/time range)
- A socket.io WebSocket gateway for live sensor updates pushed via PostgreSQL LISTEN/NOTIFY

## Components

| Component | What it does | Talks to |
|-----------|-------------|----------|
| `ReadingsController` | REST endpoints for querying sensor data | ReadingsService |
| `ReadingsGateway` | socket.io WebSocket, pushes live readings to subscribed clients | ReadingsService, pg LISTEN/NOTIFY |
| `ReadingsService` | Business logic; Prisma queries for standard reads, raw SQL for TimescaleDB features | PrismaService, pg client |
| `PrismaService` | Thin wrapper extending PrismaClient; handles lifecycle | TimescaleDB |
| `HttpExceptionFilter` | Global exception filter; consistent JSON error shape, logs all errors with context | — |
| pg NOTIFY listener | Dedicated `pg` client that LISTENs on a channel; emits events to the gateway | TimescaleDB, ReadingsGateway |

## Data Flow

### Historical queries (REST)
```
Client → HTTP → ReadingsController → ReadingsService → PrismaService → TimescaleDB
                                                     ↓ (time_bucket queries)
                                              $queryRawUnsafe → TimescaleDB
```

### Live updates (WebSocket)
```
Ingestor → TimescaleDB (INSERT + NOTIFY) → pg LISTEN client → ReadingsGateway → socket.io → Client
```

The ingestor writes to TimescaleDB and triggers a PostgreSQL NOTIFY. The API server's dedicated `pg` client receives the notification and the gateway broadcasts it to connected socket.io clients.

## External Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| TimescaleDB (PostgreSQL 16) | Primary data store for all sensor readings | Existing k3s/Helm instance, `airdb` database |
| PostgreSQL LISTEN/NOTIFY | Live push mechanism | Separate `pg` client; Prisma doesn't support it |
| AWS ECR | Container image registry | Repository URL is a placeholder — fill in before first deploy |
| k3s cluster | Production runtime | Same cluster as TimescaleDB and ingestor |

## Architectural Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Prisma for ORM | TypeORM, Drizzle, raw pg | Team familiarity; Prisma 7 supports TimescaleDB via `$queryRawUnsafe` for time_bucket queries |
| socket.io for WebSocket | native ws, SSE | NestJS first-class support; handles reconnection and rooms out of the box |
| PostgreSQL LISTEN/NOTIFY for live push | Polling, Redis pub/sub | Reuses existing DB infrastructure; no additional broker needed |
| Schema/migrations owned by this repo | Shared `@air-monitor/db` package | Shared package caused version-pinning friction and cross-repo coupling; eliminated in favour of direct ownership |
| Ingestor uses Zod only (no Prisma) | Shared Prisma client | Keeps ingestor lightweight; only needs payload validation, not DB access patterns |
| Node 22 LTS Alpine | Node 20, Debian | Current LTS; Alpine minimises image size; no native addon requirements |
| Hand-deploy via Helm | GitHub Actions CD | Solo project; automation overhead not justified yet |
| Jest + real TimescaleDB for integration tests | Mocks, SQLite | Mocks diverge from production behaviour; TimescaleDB hypertable semantics must be tested against real instance |
| Full DB drop + migrate reset once per suite, TRUNCATE between tests | Truncate only, or reset between every test | Migration reset is authoritative and clean; per-test truncate is fast enough for isolation without the overhead of full reset each time |
| Traefik ingress with IP whitelist middleware | No ingress, nginx | Traefik already in cluster; IP whitelist via CRD middleware keeps the service private without application-level auth |

## Known Gaps & Future Decisions

- **Observability:** No structured logging destination, metrics, or alerting defined. NestJS Logger is in use. Must be addressed before production traffic.
- **Authentication/Authorization:** No auth on REST or WebSocket endpoints yet. TBD — depends on frontend requirements.
- **Rate limiting:** No rate limiting on REST endpoints. Needed before public exposure.
- **CI pipeline:** Currently hand-deployed. GitHub Actions pipeline is a future consideration.
- **ECR repository URL:** Configured in Helm values and Dockerfile. ✓ Done.
- **Ingress:** Traefik ingress with TLS (cert-manager) and IP whitelist middleware deployed. ✓ Done.

## Deployment Architecture

Single-replica Deployment in the `air-monitor` namespace of an existing k3s cluster. Shares the namespace with the ingestor service and references existing Kubernetes secrets for database credentials.

```
k3s cluster
└── air-monitor namespace
    ├── ingestor (existing)
    ├── air-monitor-api-server (this service)
    │   ├── Deployment (1 replica)
    │   ├── Service (ClusterIP :3000)
    │   ├── Ingress (Traefik, TLS via cert-manager)
    │   └── Middleware (IP whitelist + HTTPS redirect)

postgres namespace
    └── TimescaleDB (existing, accessed via cluster-internal DNS)
```

Image tagging: `VERSION` file in repo root is `cat`-ed to produce the Docker image tag. Bump `VERSION` before each deploy.
