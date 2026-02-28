import { Module } from '@nestjs/common';
import { CreateProductionOrderUseCase } from './use-cases/create-production-order.use-case';
import { GetProductionOrdersUseCase } from './use-cases/get-production-orders.use-case';

@Module({
  providers: [CreateProductionOrderUseCase, GetProductionOrdersUseCase],
  exports: [CreateProductionOrderUseCase, GetProductionOrdersUseCase]
})
export class ManufacturingApplicationModule {}
