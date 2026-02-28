import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';

@Injectable()
export class UsTaxPartnerFiscalAdapter implements FiscalProvider {
  private readonly logger = new Logger(UsTaxPartnerFiscalAdapter.name);
  private readonly partnerUrl: string;
  private readonly partnerApiKey: string;
  private readonly nodeEnv: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.partnerUrl = this.configService.get<string>('US_TAX_PARTNER_URL', '').trim();
    this.partnerApiKey = this.configService.get<string>('US_TAX_PARTNER_API_KEY', '').trim();
    this.nodeEnv = (this.configService.get<string>('NODE_ENV') ?? 'development').toLowerCase();

    if (this.nodeEnv === 'production' && (!this.partnerUrl || !this.partnerApiKey)) {
      throw new Error('US fiscal partner is required in production. Configure US_TAX_PARTNER_URL and US_TAX_PARTNER_API_KEY.');
    }
  }

  async validateInvoice(invoice: unknown): Promise<boolean> {
    const response = await this.callPartner('/sandbox/validate', invoice);
    return response?.valid === true;
  }

  async signInvoice(invoice: unknown): Promise<string> {
    const response = await this.callPartner('/sandbox/sign', invoice);
    if (!response?.signature) {
      throw new Error('US tax partner returned no signature.');
    }
    return String(response.signature);
  }

  async transmitInvoice(invoice: unknown): Promise<void> {
    await this.callPartner('/sandbox/transmit', invoice);
  }

  private async callPartner(endpoint: string, payload: unknown): Promise<any> {
    if (!this.partnerUrl || !this.partnerApiKey) {
      if (this.nodeEnv === 'production') {
        throw new Error('US tax partner integration is missing in production.');
      }

      this.logger.warn(`US tax partner not configured, returning development stub for ${endpoint}.`);
      return { valid: true, signature: `us-partner-dev-signature-${Date.now()}` };
    }

    const response = await firstValueFrom(
      this.httpService.post(`${this.partnerUrl.replace(/\/$/, '')}${endpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${this.partnerApiKey}`,
          'Content-Type': 'application/json',
        },
      })
    );

    return response.data;
  }
}
