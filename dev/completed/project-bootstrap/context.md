# Project Bootstrap – Context

## Key Files Created or Modified

| File | What it is |
|------|-----------|
| `CLAUDE.md` | Full project context — overwritten from thin scaffold |
| `docs/architecture.md` | System architecture, data flow, decision log |
| `jest.config.ts` | Two Jest projects: `unit` (src/**/*.spec.ts) and `integration` (test/integration/**) |
| `test/helpers/db.ts` | `resetDatabase()`, `clearReadings()`, `closePool()`, `insertData()`, `randomInt()`, `randomFloat()`, `ReadingSchema` |
| `test/integration/readings.spec.ts` | Full integration suite — happy path, location isolation, empty result, defaults, validation 400s |
| `docker-compose.yml` | TimescaleDB (pg16) on port 5433 for local test runs |
| `.env.test.example` | Template for test DB connection — copy to `.env.test` |
| `Dockerfile` | Multi-stage Node 22 Alpine; runs `prisma generate` in builder stage; CMD is `node dist/src/main` |
| `VERSION` | Drives Docker image tag — `cat VERSION` at deploy time |
| `helm/air-monitor-api-server/` | Helm chart: Chart.yaml, values.yaml, deployment.yaml, service.yaml, ingress.yaml, middleware.yaml |
| `.claude/settings.json` | Hooks: block schema edits, migrations, helm deploys, force push; PostToolUse build + lint on .ts edits |
| `dev/decisions/template.md` | ADR template |
| `.gitignore` | Added `.env.test`, `dev/scratch/`, `*.tmp` |
| `package.json` | Added `test`, `test:integration`, `test:all` scripts |
| `src/filters/http-exception.filter.ts` | Global exception filter — consistent JSON error shape, warn log for HTTP errors, error log for unexpected |

## Important Decisions Made

- **No mocks** — integration tests hit real TimescaleDB only
- **Full DB reset once in `beforeAll`** — `prisma migrate reset --force`; `clearReadings()` (TRUNCATE) between tests via `beforeEach`
- **Guard rail in resetDatabase()** — URL must contain "test" or port 5433 or it refuses to run
- **Helm secret ref** — `existingSecret` in values.yaml; never put credentials in chart
- **PostToolUse hook** — runs `npm run build` (not `tsc --noEmit`) to catch errors fast
- **Traefik middleware per namespace** — `wireguard-and-home-ip-whitelist` and `redirect` middleware CRDs created in the `air-monitor` namespace via the Helm chart
- **`tsconfig.json` excludes test files** — prevents `nest build` from compiling `test/` and `*.spec.ts` into `dist/`

## Gotchas Found

- `python3` not available in the nix shell — hooks use `node -e` instead
- `prisma generate` must run inside nix shell locally, and explicitly in the Dockerfile builder stage
- **`nest build` output is `dist/src/main.js`**, not `dist/main.js` — because `sourceRoot: "src"` in `nest-cli.json` preserves the `src/` prefix. CMD must be `node dist/src/main`.
- Helm readiness/liveness probes expect a `/health` endpoint — implemented
- **Prisma 7 breaking change**: `PrismaClient()` requires a driver adapter (`@prisma/adapter-pg`) — no longer reads `DATABASE_URL` from env at runtime. `prisma.config.ts` is CLI-only.
- Prisma 7 generator: use `provider = "prisma-client"` (not `"prisma-client-js"`), set explicit `output`, import from `../generated/prisma/client` (no barrel index)
- `@nestjs/platform-socket.io` must be installed separately — not included in `@nestjs/websockets`
- `dotenv` must use `override: true` in test setup — direnv loads `.env` first and blocks `.env.test` values otherwise
- `resetDatabase()` uses `execSync` (sync) — do not `await` it
- **`main.ts` must guard `bootstrap()` with `require.main === module`** — Jest imports `createApp` from `main.ts`, which executes the module top-level. Without the guard, `bootstrap()` fires a second full NestJS app that never gets closed, causing Jest to hang with open handles.
- **Raw `pg` Client (LISTEN/NOTIFY) requires careful teardown** — attach `.on("error", ...)` before calling `.connect()`, chain the LISTEN query inside the connect promise, and `await` the full connect+LISTEN promise in `onModuleDestroy` before calling `end()`. Without this, `end()` interrupts an in-flight query and throws `Connection terminated`.
- **`pg` Pool in test helpers must be closed in `afterAll`** — call `closePool()` after `app.close()`, otherwise Jest hangs on the open pool connection.
- **TypeScript language server false positives on test files** — excluding `test/` from `tsconfig.json` causes the LSP to lose the `@/*` alias for test files. Tests still compile and run correctly via `jest.config.ts` `moduleNameMapper`.
