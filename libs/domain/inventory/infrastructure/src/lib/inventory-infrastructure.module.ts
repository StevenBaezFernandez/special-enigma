import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import {
  INVENTORY_REPOSITORY,
  WAREHOUSE_REPOSITORY,
  PRODUCT_GATEWAY,
} from '@virteex/domain-inventory-domain';
import { MikroOrmInventoryRepository } from './repositories/mikro-orm-inventory.repository';
import { MikroOrmWarehouseRepository } from './repositories/mikro-orm-warehouse.repository';
import { CatalogProductReadGateway } from './adapters/catalog-product-read.gateway';
import { StockOrmEntity, StockBatchOrmEntity } from './persistence/entities/stock.orm-entity';
import { WarehouseOrmEntity } from './persistence/entities/warehouse.orm-entity';
import { LocationOrmEntity } from './persistence/entities/location.orm-entity';
import { InventoryMovementOrmEntity } from './persistence/entities/inventory-movement.orm-entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MikroOrmModule.forFeature([
      InventoryMovementOrmEntity,
      StockOrmEntity,
      StockBatchOrmEntity,
      WarehouseOrmEntity,
      LocationOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: MikroOrmInventoryRepository,
    },
    {
      provide: WAREHOUSE_REPOSITORY,
      useClass: MikroOrmWarehouseRepository,
    },
    {
      provide: PRODUCT_GATEWAY,
      useClass: CatalogProductReadGateway,
    },
  ],
  exports: [INVENTORY_REPOSITORY, WAREHOUSE_REPOSITORY, PRODUCT_GATEWAY],
})
export class InventoryInfrastructureModule {}
