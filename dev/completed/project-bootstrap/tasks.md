# Project Bootstrap Tasks

## In Progress

- [ ] Fill in ECR repo URL in `helm/air-monitor-api-server/values.yaml`
- [ ] Confirm existing k8s secret name matches `air-monitor-db-credentials`
- [ ] Create `air-monitor` namespace in k3s cluster
- [ ] Create `air-monitor-db-credentials` secret in cluster

## Completed

- [x] CLAUDE.md — full project context written
- [x] docs/architecture.md — architecture, data flow, decision log
- [x] Jest configured — unit and integration projects, test scripts in package.json
- [x] test/helpers/db.ts — resetDatabase(), clearReadings(), closePool(), insertData(), randomInt(), randomFloat(), ReadingSchema
- [x] test/integration/readings.spec.ts — full integration suite (happy path, location isolation, empty result, defaults, validation 400s)
- [x] docker-compose.yml — TimescaleDB on port 5433 for local tests
- [x] .env.test.example — connection template
- [x] Dockerfile — multi-stage Node 22 Alpine
- [x] VERSION file — initial 0.1.0
- [x] Helm chart scaffold — Chart.yaml, values.yaml, deployment.yaml, service.yaml
- [x] .claude/settings.json — hooks for schema, migration, helm, force push protection; PostToolUse build + lint on .ts edits
- [x] dev/ directory structure and ADR template
- [x] .gitignore updated
- [x] .claudeignore — excludes node_modules, lock files, .env*, dist, .direnv
- [x] `/health` endpoint — `AppController` at root, returns `{ status, timestamp }`
- [x] Input validation — `GetHistoryQueryDto` with `@Matches` on `bucket`/`range`; `ValidationPipe` in `main.ts`
- [x] `BadRequestException` for invalid field in `ReadingsService`
- [x] `HistoryRow` return type on `ReadingsService.getHistory()` with `$queryRawUnsafe<HistoryRow[]>`
- [x] Unit tests — `readings.service.spec.ts`, `readings.controller.spec.ts`
- [x] `createApp()` exported from `main.ts` for test reuse; guarded with `require.main === module`
- [x] `test/helpers/env.ts` — loads `.env.test` with `override: true` via Jest `setupFiles`
- [x] `@nestjs/platform-socket.io` installed (required by WebSocket gateway at runtime)
- [x] `OnModuleDestroy` on gateway — awaits connect+LISTEN promise before `end()`; error listener attached before connect
- [x] Prisma 7 migration — `@prisma/adapter-pg`, `provider = "prisma-client"`, `output = "../src/generated/prisma"`, import from `../generated/prisma/client`
- [x] ESLint import ordering — `eslint-plugin-import-x` with auto-fix hook on `.ts` edits
- [x] `@/*` path alias in `tsconfig.json` + `jest.config.ts` `moduleNameMapper`
- [x] `.env.test` copied and docker-compose DB confirmed working
- [x] Fix integration test Jest hang — gateway `pg` LISTEN client race condition + `bootstrap()` guard in `main.ts`
- [x] Global `HttpExceptionFilter` — catches all exceptions, logs warn for HTTP errors + error for unexpected, consistent JSON response shape
