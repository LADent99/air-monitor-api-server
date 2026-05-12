# air-monitor-api-server – Claude Context

## What This Project Is

NestJS REST + WebSocket API server for an air quality monitoring platform. Receives time-series sensor data (temperature, humidity, particulates, CO2, VOC, NOx) written by a separate ingestor service into TimescaleDB, and serves that data to a frontend via REST endpoints and a socket.io WebSocket for live updates.

Full data path: ESP32 → Mosquitto MQTT → ingestor → TimescaleDB → **this server** → frontend (separate repo).

## Team & Ownership

Solo developer (Lucas). Long-term personal ownership, no handoff planned.

## Key Commands

```bash
npm run dev              # Start with hot reload (nest start --watch)
npm run build            # Compile to dist/
npm run lint             # ESLint
npm run format           # Prettier
npm run generate         # prisma generate — must run inside nix shell
npm run test             # Unit tests (Jest)
npm run test:integration # Integration tests — requires test DB (see docker-compose.yml)
npm run test:all         # Unit + integration
```

### DB commands (run manually — do not ask Claude to run these)
```bash
npm run db:migrate:deploy   # Apply pending migrations
npm run db:migrate           # Create new migration (dev only)
```

### Docker image tagging
The `VERSION` file in the repo root drives the image tag:
```bash
VERSION=$(cat VERSION)
docker build -t <ECR_REPO>:$VERSION .
docker push <ECR_REPO>:$VERSION
```

## Stack

- **Language:** TypeScript 5, Node 22 LTS
- **Framework:** NestJS 11
- **ORM:** Prisma 7.7 (`@prisma/client` directly, no shared package)
- **Database:** TimescaleDB (PostgreSQL 16) — TimescaleDB-specific queries use `$queryRawUnsafe`
- **WebSockets:** `@nestjs/websockets` + socket.io; live push via PostgreSQL LISTEN/NOTIFY (`pg` client)
- **Validation:** class-validator + class-transformer
- **Config:** @nestjs/config
- **Runtime target:** k3s (Kubernetes), deployed via Helm
- **Container:** Node 22 Alpine, pushed to AWS ECR
- **Dev environment:** Nix flakes + direnv

## Testing Instructions

**Approach:** TDD. Write the test first, then implement.

**Frameworks:** Jest + `@nestjs/testing`, supertest for HTTP integration tests.

**Unit tests** (`test/unit/` or colocated `*.spec.ts`):
- Test service logic in isolation using `@nestjs/testing` `TestingModule`
- No mocks for database — if you need DB, write an integration test instead

**Integration tests** (`test/integration/`):
- Hit a real TimescaleDB instance
- The test DB is reset (drop + migrate) between each test suite via `test/helpers/db.ts`
- Requires the test DB to be running: `docker compose up -d` before running

**Running integration tests locally:**
```bash
docker compose up -d          # Start TimescaleDB test container
npm run test:integration      # Run integration suite (resets DB per suite)
docker compose down           # Tear down when done
```

**Test DB env:** Set `DATABASE_URL` and `SHADOW_DATABASE_URL` in `.env.test` pointing at the docker-compose DB.

## Architecture

NestJS modules under `src/`:
- `src/readings/` — controller, gateway, service for sensor readings
- `src/prisma/` — PrismaService wrapper (extends PrismaClient)

See: `./docs/architecture.md`

## Deployment

Hand-deployed via Helm to k3s. No CI pipeline.

```bash
VERSION=$(cat VERSION)
docker build -t <ECR_REPO>:$VERSION .
docker push <ECR_REPO>:$VERSION
helm upgrade --install air-monitor-api-server helm/air-monitor-api-server \
  --namespace air-monitor \
  --set image.tag=$VERSION
```

The Helm chart references existing cluster secrets for database credentials — do not duplicate secrets into values.yaml.

## Observability

**Gap — not yet defined.** NestJS built-in Logger is in use. Structured logging destination (Loki, CloudWatch, etc.) and alerting are TBD.

As a minimum, all request errors and unhandled exceptions must be logged with context before this goes to production.

## Compliance & Security

No formal compliance requirements. Standard security hygiene:
- Never log sensor data payloads in full at INFO level (privacy/noise)
- Database credentials come from Kubernetes secrets only — never hardcoded or in values.yaml

## What Claude Should Never Do Without Explicit Confirmation

- **Touch `prisma/schema.prisma`** — schema changes are made manually
- **Run any `prisma migrate` command** — migrations are applied manually
- **Run `helm upgrade` or `helm install`** — deployments are manual
- **Push to any git remote** — never `git push` without being asked
- **Modify `.env` files** — environment is managed manually
- **Delete or truncate database data** outside of the test reset helper

## Common Gotchas

- TimescaleDB `time_bucket()` and continuous aggregates require raw SQL — Prisma cannot generate these queries. Use `prisma.$queryRawUnsafe()`.
- LISTEN/NOTIFY is handled by a dedicated `pg` client instance, not PrismaService. Prisma does not support PostgreSQL notifications.
- `prisma generate` must run inside the nix shell — it will fail outside it on NixOS.
- The ingestor has **no Prisma dependency** — it validates with Zod only. Do not add Prisma to the ingestor.
- **`main.ts` bootstrap guard** — `bootstrap()` must be wrapped in `if (require.main === module)`. Jest imports `createApp` from `main.ts`; without the guard it fires a second NestJS app that never closes, hanging Jest.
- **Raw `pg` Client teardown (LISTEN/NOTIFY)** — always attach `.on("error", ...)` before `.connect()`, chain the LISTEN query inside the connect promise, and `await` the full promise in `onModuleDestroy` before calling `end()`. Skipping any step causes either unhandled rejections or a Jest open handle.

## Context Management

- Clear context at 60k tokens or when quality degrades.
- Run `/catchup` at the start of each session on an in-progress branch.
- Dev docs for active features: `dev/active/[feature-name]/`
- Archive completed feature docs: `mv dev/active/[feature] dev/completed/`
