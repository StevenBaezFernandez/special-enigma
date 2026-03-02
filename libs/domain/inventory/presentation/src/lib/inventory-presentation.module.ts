import { Module } from '@nestjs/common';
import { InventoryApplicationModule } from '@virteex/domain-inventory-application';
import { InventoryInfrastructureModule } from '@virteex/domain-inventory-infrastructure';
import { WarehousesController } from './controllers/warehouses.controller';
import { MovementsController } from './controllers/movements.controller';
import { StockController } from './controllers/stock.controller';
import { ReservationsController } from './controllers/reservations.controller';
import { InventoryResolver } from './graphql/inventory.resolver';

@Module({
  imports: [InventoryApplicationModule, InventoryInfrastructureModule],
  controllers: [WarehousesController, MovementsController, StockController, ReservationsController],
  providers: [InventoryResolver],
})
export class InventoryPresentationModule {}
