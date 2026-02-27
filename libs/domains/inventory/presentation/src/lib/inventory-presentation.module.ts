import { Module } from '@nestjs/common';
import { InventoryApplicationModule } from '@virteex/application-inventory-application';
import { InventoryInfrastructureModule } from '@virteex/infra-inventory-infrastructure';
import { WarehousesController } from './controllers/warehouses.controller';
import { MovementsController } from './controllers/movements.controller';
import { StockController } from './controllers/stock.controller';
import { ReservationsController } from './controllers/reservations.controller';

@Module({
  imports: [InventoryApplicationModule, InventoryInfrastructureModule],
  controllers: [WarehousesController, MovementsController, StockController, ReservationsController],
})
export class InventoryPresentationModule {}
