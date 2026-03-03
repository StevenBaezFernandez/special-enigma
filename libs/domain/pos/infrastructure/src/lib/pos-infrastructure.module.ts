import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PosSaleSchema, PosSaleItemSchema, PosShiftSchema } from './entities/pos.schema';
import { MikroOrmPosRepository } from './repositories/mikro-orm-pos.repository';
import { HardwareBridgeAdapter } from './adapters/hardware-bridge.adapter';
import { HARDWARE_BRIDGE_PORT } from '@virteex/domain-pos-domain';
import { InventoryInfrastructureModule } from '@virteex/domain-inventory-infrastructure';
import { BillingInfrastructureModule } from '@virteex/domain-billing-infrastructure';
import { DataQualityModule } from '@virteex/platform-data-quality';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([PosSaleSchema, PosSaleItemSchema, PosShiftSchema]),
    InventoryInfrastructureModule,
    BillingInfrastructureModule,
    DataQualityModule,
  ],
  providers: [
    { provide: 'PosRepository', useClass: MikroOrmPosRepository },
    { provide: HARDWARE_BRIDGE_PORT, useClass: HardwareBridgeAdapter },
  ],
  exports: ['PosRepository', HARDWARE_BRIDGE_PORT, InventoryInfrastructureModule, BillingInfrastructureModule],
})
export class PosInfrastructureModule {}
