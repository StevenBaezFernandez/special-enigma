export interface TaxService {
  calculateTax(taxableIncome: number, date: Date): Promise<number>;
}

export const TAX_SERVICE = 'TAX_SERVICE';
