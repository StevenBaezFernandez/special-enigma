import { Injectable } from '@nestjs/common';
import { TaxStrategyFactory } from '@virteex/domain-billing-domain';
import { TaxStrategy } from '@virteex/domain-billing-domain';
import { MxTaxStrategy } from '../strategies/mx-tax.strategy';
import { BrTaxStrategy } from '../strategies/br-tax.strategy';
import { UsTaxStrategy } from '../strategies/us-tax.strategy';

@Injectable()
export class TaxStrategyFactoryImpl implements TaxStrategyFactory {
    constructor(
        private readonly mx: MxTaxStrategy,
        private readonly br: BrTaxStrategy,
        private readonly us: UsTaxStrategy
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
            case 'US':
            case 'USA':
            case 'UNITED STATES':
                return this.us;
            default:
                return this.mx;
        }
    }
}
