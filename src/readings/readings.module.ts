import { Module } from "@nestjs/common";

import { ReadingsController } from "./readings.controller";
import { ReadingsGateway } from "./readings.gateway";
import { ReadingsService } from "./readings.service";

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService, ReadingsGateway],
})
export class ReadingsModule {}
