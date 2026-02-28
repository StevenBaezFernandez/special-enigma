import { PurchaseOrder } from '../entities/purchase-order.entity';

export interface IPurchaseOrderRepository {
  save(order: PurchaseOrder): Promise<void>;
  findById(id: string): Promise<PurchaseOrder | null>;
}
export const PURCHASE_ORDER_REPOSITORY = 'PURCHASE_ORDER_REPOSITORY';
