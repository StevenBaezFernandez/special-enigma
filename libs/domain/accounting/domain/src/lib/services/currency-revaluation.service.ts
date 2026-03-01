import { Decimal } from 'decimal.js';

export interface ExchangeRate {
    from: string;
    to: string;
    rate: string;
}

export class CurrencyRevaluationService {
  revalue(balance: string, oldRate: string, newRate: string): { newValue: string, gainLoss: string } {
    const amountInBase = new Decimal(balance).dividedBy(new Decimal(oldRate));
    const newVal = amountInBase.times(new Decimal(newRate));
    const gainLoss = newVal.minus(new Decimal(balance));

    return {
      newValue: newVal.toFixed(2),
      gainLoss: gainLoss.toFixed(2)
    };
  }
}
