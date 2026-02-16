import { Injectable } from '@nestjs/common';
import { TaxStrategyFactory, TaxService } from '@virteex/payroll-domain';
import { MexicanTaxStrategy } from '../strategies/mexican-tax.strategy';
import { USPayrollStrategy } from '../strategies/us-payroll.strategy';

@Injectable()
export class TaxStrategyFactoryImpl implements TaxStrategyFactory {
  constructor(
    private readonly mexican: MexicanTaxStrategy,
    private readonly us: USPayrollStrategy
  ) {}

  getStrategy(country: string): TaxService {
    if (!country) return this.mexican;

    switch(country.toUpperCase()) {
      case 'US':
      case 'USA':
        return this.us;
      case 'MX':
      case 'MEXICO':
      default:
        return this.mexican;
    }
  }
}
