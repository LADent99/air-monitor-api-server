import { IsOptional, IsString, Matches } from "class-validator";

/** Validates bucket and range formats against what TimescaleDB accepts as interval literals */
export class GetHistoryQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+[smh]$/)
  bucket: string = "1m";

  @IsOptional()
  @IsString()
  @Matches(/^\d+[smh]$/)
  range: string = "24h";
}
