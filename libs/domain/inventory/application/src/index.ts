export * from './lib/inventory-application.module';
export * from './lib/use-cases/create-warehouse.use-case';
export * from './lib/use-cases/get-warehouses.use-case';
export * from './lib/use-cases/get-warehouse.use-case';
export * from './lib/use-cases/register-movement.use-case';
export * from './lib/use-cases/update-warehouse.use-case';
export * from './lib/use-cases/delete-warehouse.use-case';
export * from './lib/use-cases/reserve-stock.use-case';
export * from './lib/use-cases/check-stock.use-case';
export * from './lib/use-cases/reserve-batch-stock.use-case';
export * from './lib/use-cases/generate-warehouse-code.use-case';
export * from './lib/use-cases/register-inventory-movement-batch.use-case';
// Explicit exports to help resolution
export { CreateWarehouseDto } from './lib/use-cases/create-warehouse.use-case';
export { RegisterMovementInput } from './lib/use-cases/register-movement.use-case';
export { InventoryMovementType } from '@virteex/domain-inventory-domain';
