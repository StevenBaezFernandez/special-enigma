import { FinancialReportType } from '../shared/enums/financial-report-type.enum';

export interface IGenerateFinancialReport {
  type: FinancialReportType;
  endDate: string;
  dimensions?: Record<string, string>;
}

export interface ICloseFiscalPeriod {
  closingDate: string;
}
