-- Enable TimescaleDB extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- CreateTable
CREATE TABLE "readings" (
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "pm1_0" DOUBLE PRECISION,
    "pm2_5" DOUBLE PRECISION,
    "pm4_0" DOUBLE PRECISION,
    "pm10_0" DOUBLE PRECISION,
    "co2" INTEGER,
    "voc_index" INTEGER,
    "nox_index" INTEGER,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("time","location")
);

-- Convert to TimescaleDB hypertable, partitioned by time
SELECT create_hypertable('readings', by_range('time'));
