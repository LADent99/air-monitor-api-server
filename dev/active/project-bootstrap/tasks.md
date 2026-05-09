# Project Bootstrap Tasks

## In Progress

- [ ] Fill in ECR repo URL in `helm/air-monitor-api-server/values.yaml`
- [ ] Copy `.env.test.example` → `.env.test` and verify docker-compose DB connects
- [ ] Confirm existing k8s secret name matches `air-monitor-db-credentials`
- [ ] Add `/health` endpoint to AppController (required by Helm probes)
- [ ] Create `air-monitor` namespace in k3s cluster
- [ ] Create `air-monitor-db-credentials` secret in cluster

## Completed

- [x] CLAUDE.md — full project context written
- [x] docs/architecture.md — architecture, data flow, decision log
- [x] Jest configured — unit and integration projects, test scripts in package.json
- [x] test/helpers/db.ts — resetDatabase() with guard rails
- [x] test/integration/readings.spec.ts — placeholder suite
- [x] docker-compose.yml — TimescaleDB on port 5433 for local tests
- [x] .env.test.example — connection template
- [x] Dockerfile — multi-stage Node 22 Alpine
- [x] VERSION file — initial 0.1.0
- [x] Helm chart scaffold — Chart.yaml, values.yaml, deployment.yaml, service.yaml
- [x] .claude/settings.json — hooks for schema, migration, helm, force push protection
- [x] dev/ directory structure and ADR template
- [x] .gitignore updated
