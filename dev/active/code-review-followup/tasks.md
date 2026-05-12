# Code Review Follow-up Tasks

## In Progress

- [ ] **CONCERN 1** — Add `if (host.getType() !== 'http') return;` guard to `HttpExceptionFilter.catch()` (`src/filters/http-exception.filter.ts`)
- [ ] **CONCERN 2** — Expand `ReadingsController` unit tests: 400 for invalid field, 400 for bad `bucket`/`range` values, param threading to service
- [ ] **CONCERN 3** — Inject `ConfigService` into `PrismaService`; replace `process.env.DATABASE_URL` with `configService.getOrThrow<string>("DATABASE_URL")`
- [ ] **SUGGESTION 1** — Replace `fakePrisma` stub in `readings.service.spec.ts` with `jest.fn()` spy; assert SQL string and params
- [ ] **SUGGESTION 2** — Verify cluster Traefik version; if v3+, update `middleware.yaml`: `traefik.containo.us/v1alpha1` → `traefik.io/v1alpha1` and `ipWhiteList` → `ipAllowList`

## Deferred

- [ ] **CONCERN 4** — Replace `databaseUrlValidation` URL heuristic with a dedicated `TEST_DATABASE_URL` env var (low priority — deferred until test infra review)
- [ ] **SUGGESTION 3** — Read `PORT` via `ConfigService` in `main.ts` (cosmetic — lowest priority)

## Completed

- [x] Fix missing `await resetDatabase()` in `test/integration/readings.spec.ts:38`
- [x] Dev doc created
