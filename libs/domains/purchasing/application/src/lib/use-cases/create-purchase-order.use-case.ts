import { Injectable, Inject } from '@nestjs/common';
import { CreatePurchaseOrderDto } from '@virteex/contracts-purchasing-contracts';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY,
  ISupplierRepository,
  SUPPLIER_REPOSITORY
} from '@virteex/domain-purchasing-domain';

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY) private readonly orderRepo: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY) private readonly supplierRepo: ISupplierRepository
  ) {}

  async execute(dto: CreatePurchaseOrderDto, tenantId: string): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepo.findById(dto.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Strict tenant check
    if (supplier.tenantId !== tenantId) {
       throw new Error('Supplier belongs to another tenant');
    }

    const order = new PurchaseOrder(tenantId, supplier, new Date(dto.expectedDate));

    for (const itemDto of dto.items) {
      const item = new PurchaseOrderItem(itemDto.productId, itemDto.quantity, itemDto.unitPrice);
      order.addItem(item);
    }

    await this.orderRepo.save(order);
    return order;
  }
}
