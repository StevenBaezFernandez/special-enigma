import { Injectable, Logger } from '@nestjs/common';
import { FiscalProvider } from '@virteex/fiscal-domain';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SatFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(SatFiscalAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async validateInvoice(invoice: any): Promise<boolean> {
    this.logger.log(`Validating invoice ${invoice?.id} with SAT (Mexico)...`);
    try {
      // SAT usually involves a more complex SOAP interaction, but for REST simulation:
      const response = await firstValueFrom(this.httpService.post('https://api.sat.gob.mx/validate', invoice));
      return response.data.valid;
    } catch (error) {
      this.logger.error(`Error validating with SAT`, error);
      return false;
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    this.logger.log(`Signing invoice ${invoice?.id} with SAT Digital Certificate...`);
    // Simulated signature
    const signature = `sat-signature-${Date.now()}`;
    this.logger.log(`Invoice ${invoice?.id} signed: ${signature}`);
    return signature;
  }

  async transmitInvoice(invoice: any): Promise<void> {
    this.logger.log(`Transmitting invoice ${invoice?.id} to SAT...`);
    try {
      await firstValueFrom(this.httpService.post('https://api.sat.gob.mx/transmit', invoice));
      this.logger.log(`Invoice ${invoice?.id} transmitted successfully to SAT.`);
    } catch (error) {
      this.logger.error(`Error transmitting to SAT`, error);
      throw error;
    }
  }
}
