import { Injectable, Scope, Inject } from '@nestjs/common';
import DataLoader from 'dataloader';
import { WAREHOUSE_REPOSITORY, type WarehouseRepository, Warehouse } from '@virteex/domain-inventory-domain';

@Injectable({ scope: Scope.REQUEST })
export class WarehouseLoader extends DataLoader<string, Warehouse | null> {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY) private readonly warehouseRepository: WarehouseRepository
  ) {
    super(async (ids: readonly string[]) => {
      const warehouses = await this.warehouseRepository.findByIds([...ids]);
      const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
      return ids.map((id) => warehouseMap.get(id) || null);
    });
  }
}
