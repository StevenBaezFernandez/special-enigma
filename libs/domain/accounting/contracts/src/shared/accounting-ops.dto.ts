import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
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
  @IsObject()
  dimensions?: Record<string, string>;
}

export class CloseFiscalPeriodDto {
  @ApiProperty()
  @IsDateString()
  closingDate!: string;
}
