import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@virteex/domain-catalog-domain/lib/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository
  ) {}

  async execute(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.delete(id);
  }
}
