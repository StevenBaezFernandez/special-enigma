import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  PRODUCT_READ_REPOSITORY,
  ProductReadRepository,
  PRODUCT_WRITE_REPOSITORY,
  ProductWriteRepository,
} from '@virteex/domain-catalog-domain';

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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productWriteRepository.delete(id);
  }
}
