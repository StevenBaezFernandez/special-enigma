import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository, Product } from '@virteex/catalog-domain';

@Injectable()
export class RemoteProductRepository implements ProductRepository {
  private readonly logger = new Logger(RemoteProductRepository.name);
  // In a real implementation, use ConfigService to get URL
  private readonly catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001/graphql';

  async findAll(tenantId: string): Promise<Product[]> {
    this.logger.warn(`Remote findAll for tenant ${tenantId} via RemoteProductRepository - returning empty`);
    return [];
  }

  async create(product: Product): Promise<Product> {
    this.logger.error('Creating remote product is not supported by RemoteProductRepository');
    throw new Error('RemoteProductRepository is read-only');
  }

  async findById(id: number): Promise<Product | null> {
    // Start of Strangler Fig: Remote call to Catalog Service
    this.logger.warn(`Remote lookup for Product ID ${id} via RemoteProductRepository`);

    if (id <= 0) return null;

    // Simulate a found product
    const product = Object.create(Product.prototype);
    product.id = id;
    product.tenantId = 'unknown';
    product.sku = `REMOTE-${id}`;
    product.name = 'Remote Product';
    product.price = '0.00';
    product.isActive = true;

    return product as Product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    this.logger.warn(`Remote lookup for Product SKU ${sku} - Not Implemented`);
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
