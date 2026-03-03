import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timer, throwError } from 'rxjs';
import { retry, catchError, timeout } from 'rxjs/operators';
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

    const isProduction = this.nodeEnv === 'production' || process.env['RELEASE_STAGE'] === 'production';

    if (isProduction && (!this.partnerUrl || !this.partnerApiKey || this.partnerUrl.includes('placeholder') || this.partnerApiKey.includes('test'))) {
      this.logger.error('FATAL: US Tax Partner is NOT properly configured for production.');
      throw new Error('US fiscal partner is required in production with REAL credentials. Configure US_TAX_PARTNER_URL and US_TAX_PARTNER_API_KEY.');
    }
  }

  async validateInvoice(invoice: any): Promise<boolean> {
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_VALIDATE_PATH', '/v1/tax/validate');

    if (!invoice.shippingAddress?.zipCode || !invoice.shippingAddress?.country) {
        this.logger.error('Validation failed: Missing destination ZIP code or country for US tax calculation.');
        return false;
    }

    try {
      const response = await this.callPartner(endpoint, invoice);
      return response?.valid === true;
    } catch (error: any) {
      this.logger.error(`Validation failed for US invoice: ${error.message}`);
      return false;
    }
  }

  async signInvoice(invoice: any): Promise<string> {
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_CALCULATE_PATH', '/v1/tax/calculate');

    this.logger.log(`Requesting tax calculation for US invoice ${invoice.id || 'N/A'}`);

    const response = await this.callPartner(endpoint, {
        ...invoice,
        commit: true,
    });

    if (!response?.transactionId) {
      this.logger.error('US tax partner returned no transactionId/signature.');
      throw new InternalServerErrorException('US tax partner failed to generate a valid fiscal record.');
    }

    return JSON.stringify({
        transactionId: response.transactionId,
        totalTax: response.totalTax,
        summary: response.summary,
        stampedAt: new Date().toISOString()
    });
  }

  async transmitInvoice(invoice: any): Promise<void> {
    const endpoint = this.configService.get<string>('US_TAX_PARTNER_TRANSMIT_PATH', '/v1/tax/transmit');
    await this.callPartner(endpoint, invoice);
    this.logger.log(`US fiscal transaction successfully transmitted for invoice ${invoice.id}`);
  }

  private async callPartner(endpoint: string, payload: unknown): Promise<any> {
    if (!this.partnerUrl || !this.partnerApiKey) {
      this.logger.error(`CRITICAL: US tax partner integration is not configured! Endpoint: ${endpoint}`);
      throw new ServiceUnavailableException('US tax partner integration is missing. US fiscal operations are blocked.');
    }

    const fullUrl = `${this.partnerUrl.replace(/\/$/, '')}${endpoint}`;

    try {
      this.logger.debug(`Calling US tax partner endpoint: ${endpoint}`);
      const response = await firstValueFrom(
        this.httpService.post(fullUrl, payload, {
          headers: {
            'Authorization': `Bearer ${this.partnerApiKey}`,
            'Content-Type': 'application/json',
            'X-Virteex-Region': 'US',
            'X-Virteex-Tenant': payload && (payload as any).tenantId ? (payload as any).tenantId : 'unknown',
            'X-Request-ID': crypto.randomUUID(),
          }
        }).pipe(
          timeout(10000),
          retry({
            count: 3,
            delay: (error, retryCount) => {
              this.logger.warn(`Retrying US tax partner call (${retryCount}/3) due to: ${error.message}`);
              return timer(retryCount * 2000);
            },
            resetOnSuccess: true
          }),
          catchError(err => {
            return throwError(() => err);
          })
        )
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Partner communication error at ${endpoint}: ${error.message}`);

      if (error.response?.status === 401 || error.response?.status === 403) {
          throw new ServiceUnavailableException('US tax partner authentication failed. Check credentials.');
      }

      if (error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
         throw new ServiceUnavailableException('US tax partner timed out. Fiscal consistency cannot be guaranteed.');
      }

      throw new InternalServerErrorException(`US tax partner communication failed: ${error.message}`);
    }
  }
}
