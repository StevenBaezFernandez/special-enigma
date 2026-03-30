export interface FinancialReportLineDto {
  accountName: string;
  accountCode: string;
  balance: string;
}

export interface FinancialReportDto {
  tenantId: string;
  type: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS' | 'TRIAL_BALANCE';
  generatedAt: string;
  lines: FinancialReportLineDto[];
  dimensions?: Record<string, string>;
}

