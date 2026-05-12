# air-monitor-api-server

NestJS API server for the air monitor platform. Exposes REST endpoints for
historical time series data and a WebSocket gateway for live readings.

## Architecture

```
TimescaleDB
  ├── REST   — GET /readings/:location/:field?bucket=1m&range=24h
  └── NOTIFY — pushed to connected clients over WebSocket
```

The Prisma schema and migrations live in `prisma/` in this repo.

## Setup

```bash
direnv allow             # activates nix dev shell and loads .env
npm install
npm run generate         # must run inside nix shell
cp .env.example .env     # fill in DATABASE_URL
```

## DB Setup (after a reset)

1. Ensure TimescaleDB is installed on the server
2. Run `npx prisma migrate deploy` — the migration enables the TimescaleDB extension and creates the hypertable

## Running

```bash
npm run start:dev    # watch mode
npm run start:prod   # production
```

## Environment Variables

| Variable       | Example                              | Description            |
| -------------- | ------------------------------------ | ---------------------- |
| `DATABASE_URL` | `postgres://user:pw@localhost/airdb` | TimescaleDB connection |
| `PORT`         | `3000`                               | HTTP listen port       |

## Testing

```bash
docker compose up -d          # start TimescaleDB test container
cp .env.test.example .env.test  # fill in test DATABASE_URL (first time only)
npm run test                  # unit tests
npm run test:integration      # integration tests (requires docker compose)
npm run test:all              # unit + integration
docker compose down           # tear down when done
```

## Docker Build

The `VERSION` file drives the image tag.

```bash
VERSION=$(cat VERSION)
export ECR_REPO='public.ecr.aws/a4k2o7c7/air-monitor-api-server'
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/a4k2o7c7
docker build -t $ECR_REPO:$VERSION .
docker push $ECR_REPO:$VERSION
```

## Deployment

```bash
VERSION=$(cat VERSION)
helm upgrade --install air-monitor-api-server helm/air-monitor-api-server \
  --namespace air-monitor \
  --set image.tag=$VERSION
```

The Helm chart references an existing cluster secret `air-monitor-db-credentials` for database credentials.

## API Reference

See `docs/architecture.md` for the full data flow and decision log.
