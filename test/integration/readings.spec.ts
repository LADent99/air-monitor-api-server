import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import {
  resetDatabase,
  clearReadings,
  closePool,
  randomInt,
  randomFloat,
  ReadingSchema,
  insertData,
} from "../helpers/db";

import { createApp } from "@/main";

type Reading = ReturnType<typeof ReadingSchema.parse>;

function buildReading(location: string, timestamp: string): Reading {
  return ReadingSchema.parse({
    time: timestamp,
    location,
    temperature: randomFloat(0, 25),
    humidity: randomFloat(0, 100),
    pm1_0: randomFloat(0, 100),
    pm2_5: randomFloat(0, 100),
    pm4_0: randomFloat(0, 100),
    pm10_0: randomFloat(0, 100),
    co2: randomInt(500, 1000),
    voc_index: randomInt(0, 500),
    nox_index: randomInt(0, 500),
  });
}

describe("Readings (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDatabase();
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closePool();
  });

  beforeEach(async () => {
    await clearReadings();
  });

  it("GET /health returns 200", async () => {
    await request(app.getHttpServer()).get("/health").expect(200);
  });

  it("GET /readings/:location/:field returns 200 with bucketed data", async () => {
    const base = new Date();
    const count = randomInt(180, 600);
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(base.getTime() - i * 5000).toISOString();
      await insertData(buildReading("test1", timestamp));
    }

    const res = await request(app.getHttpServer())
      .get("/readings/test1/humidity?bucket=5s&range=12h")
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      bucket: expect.any(String),
      value: expect.any(Number),
    });
  });

  it("GET /readings/:location/:field only returns data for the requested location", async () => {
    const base = new Date();
    const count = randomInt(180, 600);
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(base.getTime() - i * 5000).toISOString();
      await insertData(buildReading("test1", timestamp));
      await insertData(buildReading("test2", timestamp));
    }

    const res = await request(app.getHttpServer())
      .get("/readings/test2/humidity?bucket=5s&range=12h")
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThanOrEqual(count);
  });

  it("GET /readings/:location/:field returns 200 with empty array for unknown location", async () => {
    const base = new Date();
    const count = randomInt(180, 600);
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(base.getTime() - i * 5000).toISOString();
      await insertData(buildReading("test1", timestamp));
    }

    const res = await request(app.getHttpServer())
      .get("/readings/unknown/humidity?bucket=5s&range=12h")
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it("GET /readings/:location/:field with no query params returns 200 using defaults", async () => {
    const base = new Date();
    const count = randomInt(180, 600);
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(base.getTime() - i * 60000).toISOString();
      await insertData(buildReading("test1", timestamp));
    }

    const res = await request(app.getHttpServer())
      .get("/readings/test1/humidity")
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /readings/:location/:field returns 400 for invalid bucket", async () => {
    await request(app.getHttpServer())
      .get("/readings/test1/humidity?bucket=invalid&range=12h")
      .expect(400);
  });

  it("GET /readings/:location/:field returns 400 for invalid range", async () => {
    await request(app.getHttpServer())
      .get("/readings/test1/humidity?bucket=1m&range=fake")
      .expect(400);
  });

  it("GET /readings/:location/:field returns 400 for invalid field", async () => {
    await request(app.getHttpServer())
      .get("/readings/test1/notafield?bucket=1m&range=12h")
      .expect(400);
  });
});
