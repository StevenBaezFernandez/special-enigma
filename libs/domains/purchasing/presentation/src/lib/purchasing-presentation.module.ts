import { Module } from '@nestjs/common';
import { PurchasingController } from './controllers/purchasing.controller';
import { ApprovalsController } from './controllers/approvals.controller';
import { PurchasingResolver } from './resolvers/purchasing.resolver';
import {
  PurchasingApplicationModule,
  CreateSupplierUseCase,
  CreatePurchaseOrderUseCase,
  CreateRequisitionUseCase,
  GetRequisitionsUseCase,
  ApproveRequisitionUseCase,
  RejectRequisitionUseCase,
  CreateVendorBillUseCase,
  UpdateVendorBillUseCase,
  GetVendorBillUseCase
} from '@virteex/purchasing-application';
import { PurchasingInfrastructureModule } from '@virteex/purchasing-infrastructure';

@Module({
  imports: [PurchasingApplicationModule, PurchasingInfrastructureModule],
  controllers: [PurchasingController, ApprovalsController],
  providers: [
    CreateSupplierUseCase,
    CreatePurchaseOrderUseCase,
    CreateRequisitionUseCase,
    GetRequisitionsUseCase,
    ApproveRequisitionUseCase, // Added
    RejectRequisitionUseCase, // Added
    CreateVendorBillUseCase,
    UpdateVendorBillUseCase,
    GetVendorBillUseCase,
    PurchasingResolver
  ],
  exports: [PurchasingApplicationModule, PurchasingInfrastructureModule]
})
export class PurchasingPresentationModule {}
