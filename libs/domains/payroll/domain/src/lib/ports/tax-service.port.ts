export interface PayrollTaxDetail {
  name: string;
  amount: number;
  rate?: number;
}

export interface PayrollTaxesResult {
  totalTax: number;
  details: PayrollTaxDetail[];
}

export interface TaxService {
  calculateTax(taxableIncome: number, date: Date, frequency?: string): Promise<number>;
  calculatePayrollTaxes(taxableIncome: number, date: Date, frequency?: string): Promise<PayrollTaxesResult>;
}

export const TAX_SERVICE = 'TAX_SERVICE';
