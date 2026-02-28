import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';

@Injectable()
export class MockFiscalProvider implements FiscalProvider {
  private readonly logger = new Logger(MockFiscalProvider.name);

  constructor() {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('MockFiscalProvider is NOT allowed in PRODUCTION environment. Please configure a real PAC provider.');
    }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.warn(`Validating invoice ${invoice?.id} with Mock PAC. THIS IS NOT LEGAL FOR PRODUCTION.`);
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 500));
    this.logger.log(`Invoice ${invoice?.id} is valid.`);
    return true;
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id} with Mock PAC...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const signature = `mock-signature-${Date.now()}`;
    this.logger.log(`Invoice ${invoice?.id} signed: ${signature}`);
    return signature;
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting invoice ${invoice?.id} to Tax Authority (Mock)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.logger.log(`Invoice ${invoice?.id} transmitted successfully.`);
  }
}
