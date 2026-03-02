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
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_VALIDATE_PATH', '/v1/validate');
    const response = await this.callPartner(endpoint, invoice);
    return response?.valid === true;
  }

  async signInvoice(invoice: unknown): Promise<string> {
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_SIGN_PATH', '/v1/sign');
    const response = await this.callPartner(endpoint, invoice);
    if (!response?.signature) {
      throw new Error('US tax partner returned no signature.');
    }
    return String(response.signature);
  }

  async transmitInvoice(invoice: unknown): Promise<void> {
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_TRANSMIT_PATH', '/v1/transmit');
    await this.callPartner(endpoint, invoice);
  }

  private async callPartner(endpoint: string, payload: unknown): Promise<any> {
    if (!this.partnerUrl || !this.partnerApiKey) {
      this.logger.error(`CRITICAL: US tax partner integration is not configured! Endpoint: ${endpoint}`);
      throw new Error('US tax partner integration is missing. US fiscal operations are blocked until US_TAX_PARTNER_URL and US_TAX_PARTNER_API_KEY are configured.');
    }

    try {
      this.logger.log(`Calling US tax partner endpoint: ${endpoint}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.partnerUrl.replace(/\/$/, '')}${endpoint}`, payload, {
          headers: {
            Authorization: `Bearer ${this.partnerApiKey}`,
            'Content-Type': 'application/json',
            'X-Virteex-Region': 'US',
          },
          timeout: 5000, // 5s timeout for fiscal partner
        })
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error calling US tax partner at ${endpoint}: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(`Partner response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`US tax partner communication failed: ${error.message}`);
    }
  }
}
