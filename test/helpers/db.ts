import { execSync } from "child_process";

import { Pool } from "pg";
import * as z from "zod";

export const ReadingSchema = z.object({
  time: z.coerce.date(),
  location: z.string(),
  temperature: z.float32().nullable(),
  humidity: z.float32().nullable(),
  pm1_0: z.float32().nullable(),
  pm2_5: z.float32().nullable(),
  pm4_0: z.float32().nullable(),
  pm10_0: z.float32().nullable(),
  co2: z.int32().nullable(),
  voc_index: z.int32().nullable(),
  nox_index: z.int32().nullable(),
});

function databaseUrlValidation(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set before calling resetDatabase()");
  }
  if (!url.includes("test") && !url.includes("5433")) {
    throw new Error(
      `resetDatabase() refuses to run against a non-test DATABASE_URL. ` +
        `URL must contain "test" or use port 5433. Got: ${url}`,
    );
  }
}

/** Validate DB URL on import and configure PG pool */
databaseUrlValidation();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Drops and re-applies all migrations on the test database.
 * Call in beforeAll() of each integration test suite.
 *
 * Requires DATABASE_URL in env to point at the test DB (not production).
 * Recommended: load .env.test before running integration tests.
 */
export function resetDatabase(): void {
  execSync("npx prisma migrate reset --force", {
    stdio: "inherit",
    env: { ...process.env },
  });
}

export async function clearReadings(): Promise<void> {
  await pool.query("TRUNCATE TABLE readings");
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export async function insertData(
  reading: z.infer<typeof ReadingSchema>,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO readings (time, location, temperature, humidity, pm1_0, pm2_5, pm4_0, pm10_0, co2, voc_index, nox_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11)`,
      [
        reading.time,
        reading.location,
        reading.temperature,
        reading.humidity,
        reading.pm1_0,
        reading.pm2_5,
        reading.pm4_0,
        reading.pm10_0,
        reading.co2,
        reading.voc_index,
        reading.nox_index,
      ],
    );
  } catch (err) {
    throw new Error(`insertData failed: ${err}`);
  }
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
