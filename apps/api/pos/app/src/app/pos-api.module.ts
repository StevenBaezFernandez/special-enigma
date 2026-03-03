import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { ProcessSaleUseCase } from '@virteex/domain-pos-application';
import { OpenShiftUseCase } from '@virteex/domain-pos-application';
import { PosInfrastructureModule } from '@virteex/domain-pos-infrastructure';
import { BillingApplicationModule } from '@virteex/domain-billing-application';
import { InventoryApplicationModule } from '@virteex/domain-inventory-application';

@Module({
  imports: [
    PosInfrastructureModule,
    BillingApplicationModule,
    InventoryApplicationModule
  ],
  controllers: [PosController],
  providers: [
    ProcessSaleUseCase,
    OpenShiftUseCase,
  ],
})
export class PosApiModule {}
