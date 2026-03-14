import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { type Product, ProductCreatedEvent, PRODUCT_READ_REPOSITORY, type ProductReadRepository, PRODUCT_WRITE_REPOSITORY, type ProductWriteRepository } from '@virteex/domain-catalog-domain';

export interface CreateProductDto {
  sku: string;
  name: string;
  price: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly productReadRepository: ProductReadRepository,
    @Inject(PRODUCT_WRITE_REPOSITORY)
    private readonly productWriteRepository: ProductWriteRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(command: CreateProductDto): Promise<Product> {
    const existing = await this.productReadRepository.findBySku(command.sku);
    if (existing) {
      throw new Error('Product with this SKU already exists');
    }

    const product = new Product(command.sku, command.name, command.price);
    await this.productWriteRepository.save(product);

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
