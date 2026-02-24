import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  WAREHOUSE_REPOSITORY,
  WarehouseRepository,
} from '@virteex/domain-inventory-domain';

@Injectable()
export class GetWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: WarehouseRepository,
  ) {}

  async execute(id: string) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.address || '',
      tenantId: warehouse.tenantId,
    };
  }
}
