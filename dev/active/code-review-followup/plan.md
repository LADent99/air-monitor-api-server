# Code Review Follow-up — Plan

## Context

Post-review of `task/init` branch. Two blockers were fixed inline (missing `await resetDatabase()`, and will address the exception filter). This doc tracks the remaining concerns and suggestions identified in the review.

## Items to Address

### CONCERN 1 — `HttpExceptionFilter` crashes on WebSocket exceptions

`src/filters/http-exception.filter.ts` — `@Catch()` with no arguments catches all contexts including WebSocket. Calling `host.switchToHttp()` on a WS exception yields a null response and throws at `response.status(...)`. This will surface once `ReadingsGateway` is re-enabled.

**Fix:** Add a context guard at the top of `catch()`:
```ts
if (host.getType() !== 'http') return;
```

### CONCERN 2 — `readings.controller.spec.ts` is a skeleton

`src/readings/readings.controller.spec.ts` — single test calls `controller.getHistory()` directly, bypassing HTTP routing and `ValidationPipe`. Missing: 400 for invalid field, 400 for bad `bucket`/`range`, param threading verification.

**Fix:** Expand tests using `@nestjs/testing` supertest-style or at minimum document as intentionally thin until integration tests cover it.

### CONCERN 3 — `PrismaService` uses `process.env` directly

`src/prisma/prisma.service.ts:12` — inconsistent with `ConfigService` usage elsewhere. Not a runtime bug today (startup guard exists), but will diverge if a `validationSchema` is added to `ConfigModule`.

**Fix:** Inject `ConfigService` and use `configService.getOrThrow<string>("DATABASE_URL")`. Requires making `PrismaModule` import `ConfigModule` or relying on its global registration.

### CONCERN 4 — `databaseUrlValidation` heuristic is brittle

`test/helpers/db.ts:24-26` — checks for `"test"` in URL or port `5433`. Could false-positive on a prod URL containing "test", or false-negative on a non-standard test port.

**Fix:** Add a dedicated `TEST_DATABASE_URL` env var and read it in `db.ts` instead of `DATABASE_URL`. Update `.env.test.example` and `docker-compose.yml` accordingly. Lower priority — acceptable to defer.

### SUGGESTION 1 — Service spec doesn't assert SQL arguments

`src/readings/readings.service.spec.ts` — stub always returns fixed value; a bad param order or field interpolation change wouldn't be caught.

**Fix:** Replace `fakePrisma` stub with a `jest.fn()` spy and assert the SQL string and params array.

### SUGGESTION 2 — Traefik v3 API deprecations in Helm

`helm/air-monitor-api-server/templates/middleware.yaml`:
- `traefik.containo.us/v1alpha1` → deprecated, use `traefik.io/v1alpha1`
- `ipWhiteList` → deprecated, use `ipAllowList`

Silently bypasses the whitelist if the cluster runs Traefik v3+.

**Fix:** Verify cluster Traefik version; update API version and field name if on v3+.

### SUGGESTION 3 — `PORT` read inline in `main.ts`

Minor inconsistency — `process.env.PORT` read inline rather than via `ConfigService`. No bug.

**Fix:** Read via app's `ConfigService` after `createApp()` for consistency. Low priority.
