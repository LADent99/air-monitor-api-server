# Project Bootstrap – Plan

## Goal

Set up the air-monitor-api-server repo for long-term development with Claude Code.
The API endpoints are all left to build. This bootstrap covers tooling, docs, and
deployment scaffolding so future feature work starts from a solid foundation.

## Scope

- CLAUDE.md with full project context
- Architecture document
- Jest + @nestjs/testing for TDD (unit + integration)
- docker-compose.yml for local TimescaleDB test instance
- DB reset helper for integration tests (drop + migrate between suites)
- Dockerfile (Node 22 Alpine, multi-stage)
- Helm chart scaffold (references existing cluster secrets)
- VERSION file for image tagging
- .claude/settings.json with hooks blocking schema edits, migrations, force push, and helm deploys
- dev/ directory structure and ADR template

## Key Decisions

- Integration tests reset via `prisma migrate reset --force` between suites (not truncate) — TimescaleDB hypertable truncation has edge cases
- `resetDatabase()` guard rails: refuses to run if DATABASE_URL doesn't contain "test" or port 5433
- PostToolUse hook runs `npm run build` after any `.ts` edit to catch type errors immediately
- Helm chart uses `existingSecret` reference — no credentials in values.yaml
- ECR repo URL is a placeholder to be filled in manually
