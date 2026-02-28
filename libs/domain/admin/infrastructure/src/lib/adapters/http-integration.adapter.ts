import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { INTEGRATION_GATEWAY, IntegrationGateway, ProductDto, CustomerDto, SupplierDto } from '@virteex/domain-admin-domain';

@Injectable()
export class HttpIntegrationAdapter implements IntegrationGateway {
  private readonly logger = new Logger(HttpIntegrationAdapter.name);
  private readonly catalogUrl: string;
  private readonly crmUrl: string;
  private readonly purchasingUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.catalogUrl = this.configService.get<string>('CATALOG_SERVICE_URL', 'http://virteex-catalog-service:3000');
    this.crmUrl = this.configService.get<string>('CRM_SERVICE_URL', 'http://virteex-crm-service:3000');
    this.purchasingUrl = this.configService.get<string>('PURCHASING_SERVICE_URL', 'http://virteex-purchasing-service:3000');
  }

  async createProduct(dto: ProductDto): Promise<void> {
    const url = `${this.catalogUrl}/catalog/products`;
    try {
      await firstValueFrom(this.httpService.post(url, dto));
    } catch (error: any) {
      this.handleError('Product', error);
    }
  }

  async createCustomer(dto: CustomerDto): Promise<void> {
    const url = `${this.crmUrl}/crm/customers`;
    try {
      await firstValueFrom(this.httpService.post(url, dto));
    } catch (error: any) {
      this.handleError('Customer', error);
    }
  }

  async createSupplier(dto: SupplierDto): Promise<void> {
    const url = `${this.purchasingUrl}/purchasing/suppliers`;
    try {
      await firstValueFrom(this.httpService.post(url, dto));
    } catch (error: any) {
      this.handleError('Supplier', error);
    }
  }

  private handleError(type: string, error: any) {
    this.logger.error(`Failed to create ${type}: ${error.message}`, error.stack);
    throw new Error(`Failed to import ${type}: ${error.response?.data?.message || error.message}`);
  }
}
