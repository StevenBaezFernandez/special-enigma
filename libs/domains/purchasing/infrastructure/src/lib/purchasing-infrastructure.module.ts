import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Supplier, PurchaseOrder, PurchaseOrderItem, Requisition, VendorBill,
  SUPPLIER_REPOSITORY, PURCHASE_ORDER_REPOSITORY, REQUISITION_REPOSITORY, VENDOR_BILL_REPOSITORY
} from '@virteex/domain-purchasing-domain';
import { MikroOrmSupplierRepository } from './repositories/mikro-orm-supplier.repository';
import { MikroOrmPurchaseOrderRepository } from './repositories/mikro-orm-purchase-order.repository';
import { MikroOrmRequisitionRepository } from './repositories/mikro-orm-requisition.repository';
import { MikroOrmVendorBillRepository } from './repositories/mikro-orm-vendor-bill.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Supplier, PurchaseOrder, PurchaseOrderItem, Requisition, VendorBill])
  ],
  providers: [
    {
      provide: 'SUPPLIER_REPOSITORY',
      useClass: MikroOrmSupplierRepository
    },
    {
      provide: 'PURCHASE_ORDER_REPOSITORY',
      useClass: MikroOrmPurchaseOrderRepository
    },
    {
      provide: 'REQUISITION_REPOSITORY',
      useClass: MikroOrmRequisitionRepository
    },
    {
      provide: 'VENDOR_BILL_REPOSITORY',
      useClass: MikroOrmVendorBillRepository
    }
  ],
  exports: [
    'SUPPLIER_REPOSITORY',
    'PURCHASE_ORDER_REPOSITORY',
    'REQUISITION_REPOSITORY',
    'VENDOR_BILL_REPOSITORY',
    MikroOrmModule
  ]
})
export class PurchasingInfrastructureModule {}
