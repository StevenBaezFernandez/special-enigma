import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_READ_REPOSITORY, type ProductReadRepository, PRODUCT_WRITE_REPOSITORY, type ProductWriteRepository, type Product, ProductUpdatedEvent } from '@virteex/domain-catalog-domain';
import { DomainException } from '@virteex/shared-util-server-server-config';

export interface UpdateProductDto {
  id: number;
  sku?: string;
  name?: string;
  price?: string;
  fiscalCode?: string;
  taxGroup?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly productReadRepository: ProductReadRepository,
    @Inject(PRODUCT_WRITE_REPOSITORY)
    private readonly productWriteRepository: ProductWriteRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: UpdateProductDto): Promise<Product> {
    const product = await this.productReadRepository.findById(dto.id);
    if (!product) {
      throw new DomainException(`Product with ID ${dto.id} not found`, 'ENTITY_NOT_FOUND');
    }

    if (dto.sku) product.sku = dto.sku;
    if (dto.name) product.name = dto.name;
    if (dto.price) product.changePrice(dto.price);
    if (dto.fiscalCode !== undefined) product.fiscalCode = dto.fiscalCode;
    if (dto.taxGroup !== undefined) product.taxGroup = dto.taxGroup;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    await this.productWriteRepository.save(product);

    this.eventEmitter.emit(
      'catalog.product.updated',
      new ProductUpdatedEvent(
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
