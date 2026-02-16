export interface TaxService {
  calculateTax(taxableIncome: number, date: Date, frequency?: string): Promise<number>;
}

export const TAX_SERVICE = 'TAX_SERVICE';
