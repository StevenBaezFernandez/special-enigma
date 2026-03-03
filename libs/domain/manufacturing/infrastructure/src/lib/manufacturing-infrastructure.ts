import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  PRODUCTION_ORDER_REPOSITORY,
  INVENTORY_SERVICE,
  BILL_OF_MATERIALS_REPOSITORY
} from '@virteex/domain-manufacturing-domain';
import { MikroOrmProductionOrderRepository } from './repositories/mikro-orm-production-order.repository';
import { MikroOrmBillOfMaterialsRepository } from './repositories/mikro-orm-bill-of-materials.repository';
import { HttpInventoryAdapter } from './adapters/http-inventory.adapter';
import { ProductionOrderSchema, BillOfMaterialsSchema, BillOfMaterialsComponentSchema } from './persistence/manufacturing.schemas';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ProductionOrderSchema, BillOfMaterialsSchema, BillOfMaterialsComponentSchema]),
    HttpModule,
    ConfigModule
  ],
  providers: [
    {
      provide: PRODUCTION_ORDER_REPOSITORY,
      useClass: MikroOrmProductionOrderRepository
    },
    {
      provide: BILL_OF_MATERIALS_REPOSITORY,
      useClass: MikroOrmBillOfMaterialsRepository
    },
    {
      provide: INVENTORY_SERVICE,
      useClass: HttpInventoryAdapter
    }
  ],
  exports: [
    MikroOrmModule,
    PRODUCTION_ORDER_REPOSITORY,
    BILL_OF_MATERIALS_REPOSITORY,
    INVENTORY_SERVICE
  ]
})
export class ManufacturingInfrastructureModule {}
