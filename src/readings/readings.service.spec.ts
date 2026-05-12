import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { PrismaService } from "../prisma/prisma.service";

import { ReadingsService } from "./readings.service";


/** Set up a fake prisma service for use in unit tests */
const fakePrisma = {
  $queryRawUnsafe: async () => [{ bucket: "2024-01-01", value: 22.5 }],
};

describe("ReadingsService", () => {
  let service: ReadingsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReadingsService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    }).compile();

    service = module.get(ReadingsService);
  });

  it("returns data for a valid field", async () => {
    const response = await service.getHistory(
      "living-room",
      "temperature",
      "1m",
      "24h",
    );
    expect(response).toEqual([{ bucket: "2024-01-01", value: 22.5 }]);
  });

  it("throws BadRequestException for an invalid field", async () => {
    await expect(
      service.getHistory("living-room", "not-real", "1m", "24h"),
    ).rejects.toThrow(BadRequestException);
  });
});
