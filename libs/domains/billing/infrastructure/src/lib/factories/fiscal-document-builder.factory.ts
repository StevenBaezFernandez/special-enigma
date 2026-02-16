import { Injectable } from '@nestjs/common';
import { FiscalDocumentBuilderFactory, FiscalDocumentBuilder } from '../../../../domain/src/lib/ports/fiscal-document-builder.port';
import { MxFiscalDocumentBuilder } from '../strategies/mx-fiscal-document.builder';
import { UsFiscalDocumentBuilder } from '../strategies/us-fiscal-document.builder';

@Injectable()
export class FiscalDocumentBuilderFactoryImpl implements FiscalDocumentBuilderFactory {
    constructor(
        private readonly mx: MxFiscalDocumentBuilder,
        private readonly us: UsFiscalDocumentBuilder
    ) {}

    getBuilder(country: string): FiscalDocumentBuilder {
        if (!country) return this.mx;

        switch(country.toUpperCase()) {
            case 'US':
            case 'USA':
                return this.us;
            case 'MX':
            case 'MEXICO':
            default:
                return this.mx;
        }
    }
}
