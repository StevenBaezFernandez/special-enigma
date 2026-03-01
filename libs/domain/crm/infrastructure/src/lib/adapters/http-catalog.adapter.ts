import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CatalogService, Product } from '@virteex/domain-crm-domain/ports/catalog.service';

@Injectable()
export class HttpCatalogAdapter implements CatalogService {
  private readonly logger = new Logger(HttpCatalogAdapter.name);
  private readonly catalogServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.catalogServiceUrl = this.configService.get<string>('CATALOG_SERVICE_URL', 'http://virteex-catalog-service:3000');
  }

  async getProductById(id: number): Promise<Product | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.catalogServiceUrl}/catalog/products/${id}`)
      );
      if (!data) return null;
      return {
          id: data.id,
          name: data.name,
          sku: data.sku,
          price: data.price
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
          return null;
      }
      this.logger.error(`Failed to fetch product ${id}: ${error.message}`);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }
}
