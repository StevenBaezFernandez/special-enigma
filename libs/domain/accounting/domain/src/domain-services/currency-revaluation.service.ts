import { Money } from '../value-objects/money.vo';

export interface ExchangeRate {
    from: string;
    to: string;
    rate: string;
}

export class CurrencyRevaluationService {
  revalue(balance: string, oldRate: string, newRate: string): { newValue: string, gainLoss: string } {
    const amountInBase = new Money(balance).dividedBy(oldRate);
    const newVal = amountInBase.times(newRate);
    const gainLoss = newVal.minus(new Money(balance));

    return {
      newValue: newVal.toFixed(2),
      gainLoss: gainLoss.toFixed(2)
    };
  }
}
