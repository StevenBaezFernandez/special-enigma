import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '@virteex/domain-catalog-domain';
import { Product } from '@virteex/domain-catalog-domain';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly repository: ProductRepository,
  ) {}

  async execute(id: number): Promise<Product | null> {
    return this.repository.findById(id);
  }
}
