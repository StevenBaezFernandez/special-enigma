import { Injectable } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';

@Injectable()
export class MockFiscalProvider implements FiscalProvider {
  constructor() {
    if (process.env['NODE_ENV'] === 'production' || process.env['RELEASE_STAGE'] === 'production') {
      throw new Error('FATAL: MockFiscalProvider attempt in PRODUCTION. Security gate violation.');
    }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    return typeof invoice === 'string' ? invoice : JSON.stringify(invoice);
  }

  async transmitInvoice(invoice: any): Promise<void> {
    return;
  }

  async send(document: any): Promise<any> {
    return { success: true, simulation: true };
  }
}
