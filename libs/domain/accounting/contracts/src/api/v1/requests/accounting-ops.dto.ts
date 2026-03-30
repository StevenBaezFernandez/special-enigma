import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { FinancialReportType } from '../../../shared/enums/financial-report-type.enum';
import { IGenerateFinancialReport, ICloseFiscalPeriod } from '../../../core/accounting-ops.interface';

export class GenerateFinancialReportDto implements IGenerateFinancialReport {
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

export class CloseFiscalPeriodDto implements ICloseFiscalPeriod {
  @ApiProperty()
  @IsDateString()
  closingDate!: string;
}
