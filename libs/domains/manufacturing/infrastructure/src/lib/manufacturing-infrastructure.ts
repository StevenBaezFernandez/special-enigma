import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductionOrder, PRODUCTION_ORDER_REPOSITORY } from '@virteex/manufacturing-domain';
import { INVENTORY_SERVICE } from '@virteex/manufacturing-domain';
import { MikroOrmProductionOrderRepository } from './repositories/mikro-orm-production-order.repository';
import { HttpInventoryAdapter } from './adapters/http-inventory.adapter';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ProductionOrder]),
    HttpModule,
    ConfigModule
  ],
  providers: [
    {
      provide: PRODUCTION_ORDER_REPOSITORY,
      useClass: MikroOrmProductionOrderRepository
    },
    {
      provide: INVENTORY_SERVICE,
      useClass: HttpInventoryAdapter
    }
  ],
  exports: [
    MikroOrmModule,
    PRODUCTION_ORDER_REPOSITORY,
    INVENTORY_SERVICE
  ]
})
export class ManufacturingInfrastructureModule {}
