import { ApiProperty } from '@nestjs/swagger';

export class GenerateFinancialReportDto {
  @ApiProperty({ enum: ['BALANCE_SHEET', 'PROFIT_AND_LOSS'] })
  type!: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS';

  @ApiProperty()
  endDate!: string;

  @ApiProperty({ required: false })
  dimensions?: Record<string, string>;
}

export class CloseFiscalPeriodDto {
  @ApiProperty()
  closingDate!: string;
}
