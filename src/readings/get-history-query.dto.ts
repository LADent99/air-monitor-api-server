import { IsOptional, IsString, Matches } from "class-validator";

/** Validates bucket and range formats against what TimescaleDB accepts as interval literals */
export class GetHistoryQueryDto {
  /** Supported units: s, m, h, d, w */
  @IsOptional()
  @IsString()
  @Matches(/^\d+[smhdw]$/)
  bucket: string = "1m";

  /** Supported units: s, m, h, d, w */
  @IsOptional()
  @IsString()
  @Matches(/^\d+[smhdw]$/)
  range: string = "24h";
}
