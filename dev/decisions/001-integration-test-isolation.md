# ADR-001: Integration Test Isolation Strategy

Date: 2026-05-11
Status: Accepted

## Context

Integration tests hit a real TimescaleDB instance. We need a way to keep tests isolated from each other (no data bleed between tests) without making the suite too slow or fragile.

Options considered:
- Full `prisma migrate reset` before every test — authoritative but very slow (~2-3s per test)
- Full reset once per suite, no per-test cleanup — fast but tests can bleed into each other
- Full reset once per suite + `TRUNCATE` between tests — clean schema guaranteed upfront, cheap isolation between tests

## Decision

Run `resetDatabase()` (`prisma migrate reset --force`) once in `beforeAll` to establish a clean schema. Run `clearReadings()` (`TRUNCATE TABLE readings`) in `beforeEach` to isolate data between tests. Close the `pg` pool in `afterAll` via `closePool()` to prevent Jest open handle hangs.

## Consequences

- Test suite is fast — migration overhead paid once, not per test
- Tests are fully isolated — no data from one test can affect another
- Adding new tables requires updating `clearReadings()` to truncate them too
- `resetDatabase()` must never be called in `beforeEach` — too slow and occasionally fails under timing pressure
