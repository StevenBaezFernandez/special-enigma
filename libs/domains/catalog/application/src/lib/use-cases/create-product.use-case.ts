import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '@virteex/catalog-domain/lib/entities/product.entity';
import { ProductRepository } from '@virteex/catalog-domain/lib/repositories/product.repository';
import { ProductCreatedEvent } from '@virteex/catalog-domain';

export interface CreateProductDto {
  sku: string;
  name: string;
  price: number;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepo: ProductRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(command: CreateProductDto): Promise<Product> {
    // 1. Validate business uniqueness (if not done by DB)
    const existing = await this.productRepo.findBySku(command.sku);
    if (existing) {
      throw new Error('Product with this SKU already exists');
    }

    // 2. Create the Aggregate
    const product = new Product(command.sku, command.name, command.price.toString());

    // 3. Persist (TenantSubscriber will inject tenantId automatically)
    await this.productRepo.save(product);

    this.eventEmitter.emit(
      'catalog.product.created',
      new ProductCreatedEvent(
        product.id,
        product.tenantId,
        product.sku,
        product.name,
        product.price,
        product.isActive,
        new Date(),
        product.taxGroup,
        product.fiscalCode
      )
    );

    return product;
  }
}
