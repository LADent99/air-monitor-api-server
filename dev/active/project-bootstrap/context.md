# Project Bootstrap – Context

## Key Files Created or Modified

| File | What it is |
|------|-----------|
| `CLAUDE.md` | Full project context — overwritten from thin scaffold |
| `docs/architecture.md` | System architecture, data flow, decision log |
| `jest.config.ts` | Two Jest projects: `unit` (src/**/*.spec.ts) and `integration` (test/integration/**) |
| `test/helpers/db.ts` | `resetDatabase()` — drops and re-migrates test DB before each integration suite |
| `test/integration/readings.spec.ts` | Placeholder integration test suite |
| `docker-compose.yml` | TimescaleDB (pg16) on port 5433 for local test runs |
| `.env.test.example` | Template for test DB connection — copy to `.env.test` |
| `Dockerfile` | Multi-stage Node 22 Alpine build |
| `VERSION` | Drives Docker image tag — `cat VERSION` at deploy time |
| `helm/air-monitor-api-server/` | Helm chart: Chart.yaml, values.yaml, deployment.yaml, service.yaml |
| `.claude/settings.json` | Hooks: block schema edits, migrations, helm deploys, force push; PostToolUse tsc check |
| `dev/decisions/template.md` | ADR template |
| `.gitignore` | Added `.env.test`, `dev/scratch/`, `*.tmp` |
| `package.json` | Added `test`, `test:integration`, `test:all` scripts |

## Important Decisions Made

- **No mocks** — integration tests hit real TimescaleDB only
- **Full DB reset between suites** — `prisma migrate reset --force`, not truncate
- **Guard rail in resetDatabase()** — URL must contain "test" or port 5433 or it refuses to run
- **Helm secret ref** — `existingSecret: air-monitor-db-credentials` in values.yaml; never put credentials in chart
- **PostToolUse hook** — runs `npm run build` (not `tsc --noEmit`) to catch errors fast

## Still Needs Manual Action

- Fill in ECR repo URL in `helm/air-monitor-api-server/values.yaml`
- Create `air-monitor` namespace in k3s
- Create `air-monitor-db-credentials` secret in cluster

## Gotchas Found

- `python3` not available in the nix shell — hooks use `node -e` instead
- `prisma generate` must run inside nix shell — documented in CLAUDE.md
- Helm readiness/liveness probes expect a `/health` endpoint — implemented
- **Prisma 7 breaking change**: `PrismaClient()` requires a driver adapter (`@prisma/adapter-pg`) — no longer reads `DATABASE_URL` from env at runtime. `prisma.config.ts` is CLI-only.
- Prisma 7 generator: use `provider = "prisma-client"` (not `"prisma-client-js"`), set explicit `output`, import from `../generated/prisma/client` (no barrel index)
- `@nestjs/platform-socket.io` must be installed separately — not included in `@nestjs/websockets`
- `dotenv` must use `override: true` in test setup — direnv loads `.env` first and blocks `.env.test` values otherwise
- `resetDatabase()` uses `execSync` (sync) — do not `await` it
- **`main.ts` must guard `bootstrap()` with `require.main === module`** — Jest imports `createApp` from `main.ts`, which executes the module top-level. Without the guard, `bootstrap()` fires a second full NestJS app that never gets closed, causing Jest to hang with open handles.
- **Raw `pg` Client (LISTEN/NOTIFY) requires careful teardown** — attach `.on("error", ...)` before calling `.connect()`, chain the LISTEN query inside the connect promise, and `await` the full connect+LISTEN promise in `onModuleDestroy` before calling `end()`. Without this, `end()` interrupts an in-flight query and throws `Connection terminated`.
