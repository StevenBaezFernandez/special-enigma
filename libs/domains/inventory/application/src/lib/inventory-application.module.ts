import { Module } from '@nestjs/common';
import { CreateWarehouseUseCase } from './use-cases/create-warehouse.use-case';
import { RegisterMovementUseCase } from './use-cases/register-movement.use-case';
import { GetWarehousesUseCase } from './use-cases/get-warehouses.use-case';
import { GetWarehouseUseCase } from './use-cases/get-warehouse.use-case';
import { UpdateWarehouseUseCase } from './use-cases/update-warehouse.use-case';
import { DeleteWarehouseUseCase } from './use-cases/delete-warehouse.use-case';
import { ReserveStockUseCase } from './use-cases/reserve-stock.use-case';
import { CheckStockUseCase } from './use-cases/check-stock.use-case';
import { ReserveBatchStockUseCase } from './use-cases/reserve-batch-stock.use-case';
import { GenerateWarehouseCodeUseCase } from './use-cases/generate-warehouse-code.use-case';
import { RegisterInventoryMovementBatchUseCase } from './use-cases/register-inventory-movement-batch.use-case';

@Module({
  providers: [
    CreateWarehouseUseCase,
    RegisterMovementUseCase,
    GetWarehousesUseCase,
    GetWarehouseUseCase,
    UpdateWarehouseUseCase,
    DeleteWarehouseUseCase,
    ReserveStockUseCase,
    CheckStockUseCase,
    ReserveBatchStockUseCase,
    GenerateWarehouseCodeUseCase,
    RegisterInventoryMovementBatchUseCase,
  ],
  exports: [
    CreateWarehouseUseCase,
    RegisterMovementUseCase,
    GetWarehousesUseCase,
    GetWarehouseUseCase,
    UpdateWarehouseUseCase,
    DeleteWarehouseUseCase,
    ReserveStockUseCase,
    CheckStockUseCase,
    ReserveBatchStockUseCase,
    GenerateWarehouseCodeUseCase,
    RegisterInventoryMovementBatchUseCase,
  ],
})
export class InventoryApplicationModule {}
