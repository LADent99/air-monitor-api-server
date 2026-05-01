import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReadingsService } from './readings.service';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readings: ReadingsService) {}

  // GET /readings/:location/:field?bucket=1m&range=24h
  @Get(':location/:field')
  getHistory(
    @Param('location') location: string,
    @Param('field') field: string,
    @Query('bucket') bucket = '1m',
    @Query('range') range = '24h',
  ) {
    return this.readings.getHistory(location, field, bucket, range);
  }
}
