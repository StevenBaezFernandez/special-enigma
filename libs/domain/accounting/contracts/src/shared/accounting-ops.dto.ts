import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { FinancialReportType } from './enums/financial-report-type.enum';

export class GenerateFinancialReportDto {
  @ApiProperty({ enum: FinancialReportType })
  @IsEnum(FinancialReportType)
  type!: FinancialReportType;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  dimensions?: Record<string, string>;
}

export class CloseFiscalPeriodDto {
  @ApiProperty()
  @IsDateString()
  closingDate!: string;
}
