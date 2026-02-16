import { Injectable } from '@nestjs/common';
import { TaxStrategyFactory } from '../../../../domain/src/lib/strategies/tax-strategy.factory';
import { TaxStrategy } from '../../../../domain/src/lib/strategies/tax-strategy.interface';
import { MxTaxStrategy } from '../strategies/mx-tax.strategy';
import { BrTaxStrategy } from '../strategies/br-tax.strategy';

@Injectable()
export class TaxStrategyFactoryImpl implements TaxStrategyFactory {
    constructor(
        private readonly mx: MxTaxStrategy,
        private readonly br: BrTaxStrategy
    ) {}

    getStrategy(country: string): TaxStrategy {
        if (!country) return this.mx;

        switch(country.toUpperCase()) {
            case 'MX':
            case 'MEXICO':
                return this.mx;
            case 'BR':
            case 'BRAZIL':
                return this.br;
            default:
                return this.mx;
        }
    }
}
