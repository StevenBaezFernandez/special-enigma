import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository, Product } from '@virteex/catalog-domain';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RemoteProductRepository implements ProductRepository {
  private readonly logger = new Logger(RemoteProductRepository.name);
  private readonly catalogServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.catalogServiceUrl = this.configService.get<string>('CATALOG_SERVICE_URL') || 'http://virteex-catalog-service:3000/api';
  }

  async findAll(tenantId: string): Promise<Product[]> {
    this.logger.log(`Remote findAll for tenant ${tenantId} via RemoteProductRepository`);
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Product[]>(`${this.catalogServiceUrl}/catalog/products`, {
          params: { tenantId }
        })
      );
      return data;
    } catch (error: any) {
      this.logger.error(`Error fetching products from Catalog Service: ${error.message}`);
      return [];
    }
  }

  async create(product: Product): Promise<Product> {
    this.logger.error('Creating remote product is not supported by RemoteProductRepository');
    throw new Error('RemoteProductRepository is read-only');
  }

  async findById(id: number): Promise<Product | null> {
    this.logger.log(`Remote lookup for Product ID ${id} via RemoteProductRepository`);

    if (id <= 0) return null;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Product>(`${this.catalogServiceUrl}/catalog/products/${id}`)
      );
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching product ${id} from Catalog Service: ${error.message}`);
      return null;
    }
  }

  async findBySku(sku: string): Promise<Product | null> {
    this.logger.warn(`Remote lookup for Product SKU ${sku} - Not Implemented via REST yet`);
    return null;
  }

  async save(product: Product): Promise<void> {
    this.logger.error('Saving remote product is not supported by RemoteProductRepository');
    throw new Error('RemoteProductRepository is read-only');
  }

  async delete(id: number): Promise<void> {
    this.logger.error('Deleting remote product is not supported by RemoteProductRepository');
    throw new Error('RemoteProductRepository is read-only');
  }
}
