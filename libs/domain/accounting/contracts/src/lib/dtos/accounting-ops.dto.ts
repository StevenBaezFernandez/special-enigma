import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';

export class GenerateFinancialReportDto {
  @ApiProperty({ enum: ['BALANCE_SHEET', 'PROFIT_AND_LOSS', 'TRIAL_BALANCE'] })
  @IsEnum(['BALANCE_SHEET', 'PROFIT_AND_LOSS', 'TRIAL_BALANCE'])
  type!: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS' | 'TRIAL_BALANCE';

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
