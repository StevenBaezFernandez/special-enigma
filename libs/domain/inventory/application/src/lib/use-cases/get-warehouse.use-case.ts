import { Inject, Injectable } from '@nestjs/common';
import { WAREHOUSE_REPOSITORY, type WarehouseRepository, WarehouseNotFoundError } from '@virteex/domain-inventory-domain';

@Injectable()
export class GetWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: WarehouseRepository,
  ) {}

  async execute(id: string) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new WarehouseNotFoundError(id);
    }
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.address || '',
      tenantId: warehouse.tenantId,
    };
  }
}
