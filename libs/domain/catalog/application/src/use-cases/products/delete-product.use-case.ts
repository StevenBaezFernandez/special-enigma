import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_READ_REPOSITORY, type ProductReadRepository, PRODUCT_WRITE_REPOSITORY, type ProductWriteRepository } from '@virteex/domain-catalog-domain';
import { DomainException } from '@virteex/shared-util-server-server-config';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly productReadRepository: ProductReadRepository,
    @Inject(PRODUCT_WRITE_REPOSITORY)
    private readonly productWriteRepository: ProductWriteRepository
  ) {}

  async execute(id: number): Promise<void> {
    const product = await this.productReadRepository.findById(id);
    if (!product) {
      throw new DomainException(`Product with ID ${id} not found`, 'ENTITY_NOT_FOUND');
    }
    await this.productWriteRepository.delete(id);
  }
}
