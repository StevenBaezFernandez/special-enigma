import { Module } from '@nestjs/common';
import { CreateSupplierUseCase } from './use-cases/create-supplier.use-case';
import { CreatePurchaseOrderUseCase } from './use-cases/create-purchase-order.use-case';
import { CreateRequisitionUseCase } from './use-cases/create-requisition.use-case';
import { GetRequisitionsUseCase } from './use-cases/get-requisitions.use-case';
import { ApproveRequisitionUseCase } from './use-cases/approve-requisition.use-case';
import { RejectRequisitionUseCase } from './use-cases/reject-requisition.use-case';
import { CreateVendorBillUseCase } from './use-cases/create-vendor-bill.use-case';
import { UpdateVendorBillUseCase } from './use-cases/update-vendor-bill.use-case';
import { GetVendorBillUseCase } from './use-cases/get-vendor-bill.use-case';
import { PurchasingInfrastructureModule } from '@virteex/domain-purchasing-infrastructure';

@Module({
  imports: [PurchasingInfrastructureModule],
  providers: [
    CreateSupplierUseCase,
    CreatePurchaseOrderUseCase,
    CreateRequisitionUseCase,
    GetRequisitionsUseCase,
    ApproveRequisitionUseCase,
    RejectRequisitionUseCase,
    CreateVendorBillUseCase,
    UpdateVendorBillUseCase,
    GetVendorBillUseCase,
  ],
  exports: [
    CreateSupplierUseCase,
    CreatePurchaseOrderUseCase,
    CreateRequisitionUseCase,
    GetRequisitionsUseCase,
    ApproveRequisitionUseCase,
    RejectRequisitionUseCase,
    CreateVendorBillUseCase,
    UpdateVendorBillUseCase,
    GetVendorBillUseCase,
  ],
})
export class PurchasingApplicationModule {}
