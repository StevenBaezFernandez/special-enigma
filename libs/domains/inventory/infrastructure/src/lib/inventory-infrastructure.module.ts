import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  InventoryMovement,
  Stock,
  Warehouse,
  Location,
  INVENTORY_REPOSITORY,
  WAREHOUSE_REPOSITORY,
  PRODUCT_GATEWAY
} from '@virteex/domain-inventory-domain';
import { MikroOrmInventoryRepository } from './repositories/mikro-orm-inventory.repository';
import { MikroOrmWarehouseRepository } from './repositories/mikro-orm-warehouse.repository';
import { CatalogProductAdapter } from './adapters/catalog-product.adapter';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([InventoryMovement, Stock, Warehouse, Location])
  ],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: MikroOrmInventoryRepository
    },
    {
      provide: WAREHOUSE_REPOSITORY,
      useClass: MikroOrmWarehouseRepository
    },
    {
      provide: PRODUCT_GATEWAY,
      useClass: CatalogProductAdapter
    }
  ],
  exports: [
    INVENTORY_REPOSITORY,
    WAREHOUSE_REPOSITORY,
    PRODUCT_GATEWAY
  ]
})
export class InventoryInfrastructureModule {}
