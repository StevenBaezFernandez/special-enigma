export interface TaxResult {
  totalTax: number;
  details: TaxDetail[];
}

export interface TaxDetail {
  taxType: string;
  rate: number;
  amount: number;
}

export interface TaxStrategy {
  calculate(amount: number): Promise<TaxResult>;
}
