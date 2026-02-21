import { Injectable } from '@nestjs/common';
import { FiscalDocumentBuilderFactory, FiscalDocumentBuilder } from '../../../../domain/src/lib/ports/fiscal-document-builder.port';
import { MxFiscalDocumentBuilder } from '../strategies/mx-fiscal-document.builder';
import { UsFiscalDocumentBuilder } from '../strategies/us-fiscal-document.builder';
import { CoFiscalDocumentBuilder } from '../strategies/co-fiscal-document.builder';
import { BrFiscalDocumentBuilder } from '../strategies/br-fiscal-document.builder';

@Injectable()
export class FiscalDocumentBuilderFactoryImpl implements FiscalDocumentBuilderFactory {
    constructor(
        private readonly mx: MxFiscalDocumentBuilder,
        private readonly us: UsFiscalDocumentBuilder,
        private readonly co: CoFiscalDocumentBuilder,
        private readonly br: BrFiscalDocumentBuilder
    ) {}

    getBuilder(country: string): FiscalDocumentBuilder {
        if (!country) return this.mx;

        switch(country.toUpperCase()) {
            case 'US':
            case 'USA':
                return this.us;
            case 'CO':
            case 'COLOMBIA':
                return this.co;
            case 'BR':
            case 'BRAZIL':
                return this.br;
            case 'MX':
            case 'MEXICO':
            default:
                return this.mx;
        }
    }
}
