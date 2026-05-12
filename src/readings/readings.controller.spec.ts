import { Test } from "@nestjs/testing";

import { ReadingsController } from "./readings.controller";
import { ReadingsService } from "./readings.service";

const fakeReadingsService = {
  getHistory: async () => [{ bucket: "2024-01-01", value: 22.5 }],
};

describe("ReadingsController", () => {
  let controller: ReadingsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [{ provide: ReadingsService, useValue: fakeReadingsService }],
    }).compile();

    controller = module.get(ReadingsController);
  });

  it("returns data for a valid field", async () => {
    const response = await controller.getHistory("living-room", "temperature", {
      bucket: "1m",
      range: "24h",
    });
    expect(response).toEqual([{ bucket: "2024-01-01", value: 22.5 }]);
  });
});
