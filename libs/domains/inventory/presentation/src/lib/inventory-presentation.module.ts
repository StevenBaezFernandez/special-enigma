import { Module } from '@nestjs/common';
import {
  InventoryApplicationModule,
  CreateWarehouseUseCase,
  RegisterMovementUseCase,
  GetWarehousesUseCase,
  UpdateWarehouseUseCase,
  DeleteWarehouseUseCase,
  ReserveStockUseCase
} from '@virteex/application-inventory-application';
import { InventoryInfrastructureModule } from '@virteex/infra-inventory-infrastructure';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [InventoryApplicationModule, InventoryInfrastructureModule],
  controllers: [InventoryController],
  providers: [
    CreateWarehouseUseCase,
    RegisterMovementUseCase,
    GetWarehousesUseCase,
    UpdateWarehouseUseCase,
    DeleteWarehouseUseCase,
    ReserveStockUseCase
  ]
})
export class InventoryPresentationModule {}
