-- CreateTable
CREATE TABLE "readings" (
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "pm1_0" DOUBLE PRECISION,
    "pm2_5" DOUBLE PRECISION,
    "pm4_0" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "co2" DOUBLE PRECISION,
    "voc" INTEGER,
    "nox" INTEGER,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("time","location")
);

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
SELECT create_hypertable('"readings"', 'time');