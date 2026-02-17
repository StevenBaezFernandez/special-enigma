import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '@virteex/catalog-domain';
import { Product } from '@virteex/catalog-domain';

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
