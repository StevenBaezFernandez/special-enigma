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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculateTax(taxableIncome: number, date: Date, frequency?: string, options?: Record<string, any>): Promise<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculatePayrollTaxes(taxableIncome: number, date: Date, frequency?: string, options?: Record<string, any>): Promise<PayrollTaxesResult>;
}

export const TAX_SERVICE = 'TAX_SERVICE';
