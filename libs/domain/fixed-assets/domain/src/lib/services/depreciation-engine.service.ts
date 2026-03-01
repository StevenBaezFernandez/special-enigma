import { Decimal } from 'decimal.js';

export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE',
  DOUBLE_DECLINING_BALANCE = 'DOUBLE_DECLINING_BALANCE'
}

export class DepreciationEngine {
  calculate(
    cost: string,
    salvageValue: string,
    usefulLifeYears: number,
    method: DepreciationMethod,
    elapsedYears: number
  ): string {
    const costDec = new Decimal(cost);
    const salvageDec = new Decimal(salvageValue);
    const depreciableBase = costDec.minus(salvageDec);

    if (method === DepreciationMethod.STRAIGHT_LINE) {
        return depreciableBase.dividedBy(usefulLifeYears).toFixed(2);
    }

    if (method === DepreciationMethod.DOUBLE_DECLINING_BALANCE) {
        const rate = new Decimal(2).dividedBy(usefulLifeYears);
        let bookValue = costDec;
        let yearlyDep = new Decimal(0);
        for (let i = 0; i < elapsedYears; i++) {
            yearlyDep = bookValue.times(rate);
            bookValue = bookValue.minus(yearlyDep);
        }
        return yearlyDep.toFixed(2);
    }

    return '0.00';
  }
}
