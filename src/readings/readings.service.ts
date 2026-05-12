import { Injectable, BadRequestException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

const ALLOWED_FIELDS = new Set([
  "temperature",
  "humidity",
  "pm1_0",
  "pm2_5",
  "pm4_0",
  "pm10_0",
  "co2",
  "voc_index",
  "nox_index",
]);

type HistoryRow = {
  bucket: Date;
  value: number | null;
};

@Injectable()
export class ReadingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(
    location: string,
    field: string,
    bucket: string,
    range: string,
  ): Promise<HistoryRow[]> {
    if (!ALLOWED_FIELDS.has(field)) {
      throw new BadRequestException(`Unknown field: ${field}`);
    }
    // Raw SQL required for time_bucket() — Prisma does not generate these
    return this.prisma.$queryRawUnsafe<HistoryRow[]>(
      `SELECT time_bucket($1::interval, time) AS bucket,
              avg(${field}) AS value
       FROM readings
       WHERE location = $2
         AND time > now() - $3::interval
       GROUP BY bucket
       ORDER BY bucket ASC`,
      bucket,
      location,
      range,
    );
  }
}
