export interface Kpi {
  title: string;
  value: string;
  comparisonValue: string;
  comparisonPeriod: string;
  isPositive: boolean;
  lastUpdated?: string | Date;
}
