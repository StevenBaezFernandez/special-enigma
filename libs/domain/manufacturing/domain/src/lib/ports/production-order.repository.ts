import { ProductionOrder } from '../entities/production-order.entity';

export const PRODUCTION_ORDER_REPOSITORY = 'PRODUCTION_ORDER_REPOSITORY';

export interface ProductionOrderRepository {
  save(order: ProductionOrder): Promise<void>;
  findAll(): Promise<ProductionOrder[]>;
}
