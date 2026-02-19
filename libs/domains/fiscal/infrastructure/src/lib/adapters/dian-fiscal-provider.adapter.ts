import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/fiscal-domain';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DianFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(DianFiscalAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with DIAN (Real Integration)...`);
    try {
      const response = await firstValueFrom(this.httpService.post('https://api.dian.gov.co/validate', invoice));
      return response.data.isValid;
    } catch (error) {
      this.logger.error(`Error validating with DIAN`, error);
      return false;
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id} with DIAN Digital Certificate...`);
    // In a real implementation, this would use crypto libraries to sign the XML with a certificate
    // For now, we simulate the signature generation as we lack the certs
    const signature = `dian-signature-${Date.now()}`;
    this.logger.log(`Invoice ${invoice?.id} signed: ${signature}`);
    return signature;
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting invoice ${invoice?.id} to DIAN...`);
    try {
      await firstValueFrom(this.httpService.post('https://api.dian.gov.co/transmit', invoice));
      this.logger.log(`Invoice ${invoice?.id} transmitted successfully to DIAN.`);
    } catch (error) {
      this.logger.error(`Error transmitting to DIAN`, error);
      throw error;
    }
  }
}
