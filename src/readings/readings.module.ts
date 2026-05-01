import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { ReadingsGateway } from './readings.gateway';

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService, ReadingsGateway],
})
export class ReadingsModule {}
