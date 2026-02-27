import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { ProductGateway } from '@virteex/domain-inventory-domain';

interface CatalogProductResponse {
  id: number;
  tenantId: string;
}

@Injectable()
export class CatalogProductReadGateway implements ProductGateway {
  private readonly logger = new Logger(CatalogProductReadGateway.name);
  private readonly catalogServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const serviceUrl = this.configService.get<string>('CATALOG_SERVICE_URL');
    if (!serviceUrl) {
      throw new Error('CATALOG_SERVICE_URL is required for inventory-to-catalog integration');
    }
    this.catalogServiceUrl = serviceUrl;
  }

  async exists(productId: string): Promise<boolean> {
    const product = await this.fetchProduct(productId);
    return Boolean(product);
  }

  async getTenantId(productId: string): Promise<string | null> {
    const product = await this.fetchProduct(productId);
    return product?.tenantId ?? null;
  }

  private async fetchProduct(productId: string): Promise<CatalogProductResponse | null> {
    const parsedId = Number(productId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return null;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<CatalogProductResponse>(`${this.catalogServiceUrl}/catalog/products/${parsedId}`)
          .pipe(timeout(3000))
      );
      return data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }

      this.logger.error(
        `Catalog lookup failed for product ${productId}: ${error?.message ?? 'unknown error'}`
      );
      return null;
    }
  }
}
