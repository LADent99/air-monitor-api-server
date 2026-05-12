# Code Review Follow-up — Context

## Source

These items come from the `task/init` branch code review. Two blockers were resolved immediately:
- `await resetDatabase()` missing in `test/integration/readings.spec.ts:38` — fixed
- `HttpExceptionFilter` WS crash path — tracked here as CONCERN 1

## Key Files

| File | Issue |
|---|---|
| `src/filters/http-exception.filter.ts` | No HTTP context guard — crashes on WS exceptions |
| `src/readings/readings.controller.spec.ts` | Skeleton test — no validation path coverage |
| `src/prisma/prisma.service.ts` | Uses `process.env` directly instead of `ConfigService` |
| `test/helpers/db.ts` | URL heuristic for prod-safety check is brittle |
| `src/readings/readings.service.spec.ts` | Stub doesn't verify SQL args |
| `helm/.../middleware.yaml` | Traefik v2 API names — may be no-ops on v3+ |
| `src/main.ts` | `PORT` read inline, not via `ConfigService` |

## Priority Order

1. **`HttpExceptionFilter` WS guard** — must be done before gateway is re-enabled (blocked on `gateway-listen-notify` dev doc anyway, but fix it now so it's ready)
2. **Controller spec expansion** — low effort, meaningfully improves confidence
3. **`PrismaService` ConfigService injection** — clean-up, do alongside gateway ConfigService work
4. **Service spec spy** — low effort improvement to catch param regressions
5. **Traefik API versions** — verify cluster version first, then update
6. **`databaseUrlValidation` / `TEST_DATABASE_URL`** — low priority, deferred until test infra review
7. **`PORT` via ConfigService** — cosmetic, lowest priority

## Relationship to `gateway-listen-notify`

Items 1 and 3 above are prerequisites or natural companions to the gateway work:
- The exception filter guard must be in place before the gateway is re-enabled
- `PrismaService` ConfigService injection can be done in the same pass as the gateway's ConfigService injection
