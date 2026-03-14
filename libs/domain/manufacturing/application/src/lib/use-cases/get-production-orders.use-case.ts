import { Injectable, Inject } from '@nestjs/common';
import { ProductionOrder, type ProductionOrderRepository, PRODUCTION_ORDER_REPOSITORY } from '@virteex/domain-manufacturing-domain';

@Injectable()
export class GetProductionOrdersUseCase {
  constructor(
    @Inject(PRODUCTION_ORDER_REPOSITORY) private readonly repository: ProductionOrderRepository
  ) {}

  async execute(): Promise<ProductionOrder[]> {
    return this.repository.findAll();
  }
}
